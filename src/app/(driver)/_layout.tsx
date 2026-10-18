import React from 'react';
import { Tabs, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Compass,
  PlusCircle,
  History,
  LogOut,
  RefreshCw,
  Bus,
} from 'lucide-react-native';
import { Palette } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { Avatar, Badge } from '@/components/ui';

export default function DriverLayout() {
  const { user, driverProfile, logout, switchRole } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSwitchToClient = async () => {
    await switchRole('CLIENT');
    router.replace('/(client)');
  };

  return (
    <View style={styles.container}>
      {/* Top Driver Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar name={user?.full_name || 'Carlos Motorista'} size={42} isOnline />
          <View style={styles.headerTexts}>
            <Text style={styles.driverName}>{user?.full_name || 'Carlos Motorista'}</Text>
            <View style={styles.vehicleRow}>
              <Bus size={12} color={Palette.slate500} />
              <Text style={styles.vehicleInfo}>
                {driverProfile?.vehicle_model || 'Mercedes Sprinter'} • {driverProfile?.vehicle_plate || 'ABC-1D23'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={handleSwitchToClient}
            activeOpacity={0.7}
          >
            <RefreshCw size={13} color={Palette.primary} />
            <Text style={styles.switchText}>Ver Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={16} color={Palette.slate500} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Palette.primary,
          tabBarInactiveTintColor: Palette.slate400,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Minhas Rotas',
            tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="new-route"
          options={{
            title: 'Nova Rota',
            tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTexts: {
    marginLeft: 10,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  vehicleInfo: {
    fontSize: 12,
    color: Palette.slate500,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  switchText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.primary,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Palette.slate100,
  },
  tabBar: {
    backgroundColor: Palette.white,
    borderTopColor: Palette.slate200,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
