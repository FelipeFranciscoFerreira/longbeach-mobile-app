import React from 'react';
import { Tabs, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  CalendarCheck,
  Calendar,
  History,
  LogOut,
  RefreshCw,
  GraduationCap,
} from 'lucide-react-native';
import { Palette } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';

export default function ClientLayout() {
  const { user, clientProfile, logout, switchRole } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSwitchToDriver = async () => {
    await switchRole('DRIVER');
    router.replace('/(driver)');
  };

  return (
    <View style={styles.container}>
      {/* Top Client Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar name={user?.full_name || 'Maria Estudante'} size={42} isOnline />
          <View style={styles.headerTexts}>
            <Text style={styles.clientName}>{user?.full_name || 'Maria Estudante'}</Text>
            <View style={styles.destRow}>
              <GraduationCap size={12} color={Palette.success} />
              <Text style={styles.destInfo}>
                {clientProfile?.destination_address || 'Faculdade A - USP Butantã'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={handleSwitchToDriver}
            activeOpacity={0.7}
          >
            <RefreshCw size={13} color={Palette.slate700} />
            <Text style={styles.switchText}>Ver Motorista</Text>
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
            title: 'Viagem de Hoje',
            tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Próximos Dias',
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
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
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  destInfo: {
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
    backgroundColor: Palette.slate100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  switchText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate700,
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
