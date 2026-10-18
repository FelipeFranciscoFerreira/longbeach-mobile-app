import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bus } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Palette } from '@/constants/colors';

export default function IndexGateway() {
  const { isAuthenticated, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !role) {
      router.replace('/(auth)/login');
    } else if (role === 'DRIVER') {
      router.replace('/(driver)');
    } else if (role === 'CLIENT') {
      router.replace('/(client)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, role, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.brandBox}>
        <View style={styles.logoCircle}>
          <Bus size={36} color={Palette.white} />
        </View>
        <Text style={styles.brandText}>LongBeach Transport</Text>
        <Text style={styles.tagline}>Carregando itinerários e preferências...</Text>
        <ActivityIndicator size="large" color={Palette.primary} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.slate900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: Palette.slate400,
    marginTop: 6,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
