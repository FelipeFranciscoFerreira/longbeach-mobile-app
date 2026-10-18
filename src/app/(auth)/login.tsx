import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bus,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { Palette } from '@/constants/colors';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('motorista@longbeach.com');
  const [password, setPassword] = useState('driver123');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (targetEmail = email, targetPass = password) => {
    setErrorMessage('');
    if (!targetEmail || !targetPass) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    const success = await login(targetEmail, targetPass);
    if (success) {
      // Redirect handled by index router or manually based on target
      if (targetEmail.includes('motorista')) {
        router.replace('/(driver)');
      } else {
        router.replace('/(client)');
      }
    } else {
      setErrorMessage('E-mail ou senha inválidos. Tente novamente.');
    }
  };

  const handleQuickSelect = (role: 'DRIVER' | 'CLIENT') => {
    if (role === 'DRIVER') {
      setEmail('motorista@longbeach.com');
      setPassword('driver123');
      handleLogin('motorista@longbeach.com', 'driver123');
    } else {
      setEmail('cliente@longbeach.com');
      setPassword('client123');
      handleLogin('cliente@longbeach.com', 'client123');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Bus size={32} color={Palette.white} />
          </View>
          <Text style={styles.brandTitle}>LongBeach Transport</Text>
          <Text style={styles.brandSubtitle}>
            Gestão de rotas e confirmação de presença para vans
          </Text>
          <Badge
            variant="default"
            style={styles.versionBadge}
            icon={<Sparkles size={12} color={Palette.primary} />}
          >
            Plataforma Integrada v2.0
          </Badge>
        </View>

        {/* Demo Fast Login Buttons */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.quickAccessLabel}>Acesso rápido para demonstração:</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[
                styles.quickCard,
                email === 'motorista@longbeach.com' && styles.quickCardActive,
              ]}
              onPress={() => handleQuickSelect('DRIVER')}
              activeOpacity={0.8}
            >
              <View style={styles.quickIconCircleDriver}>
                <UserCheck size={20} color={Palette.primary} />
              </View>
              <View style={styles.quickCardTexts}>
                <Text style={styles.quickCardTitle}>Carlos Motorista</Text>
                <Text style={styles.quickCardRole}>Van Sprinter ABC-1D23</Text>
              </View>
              <ArrowRight size={16} color={Palette.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickCard,
                email === 'cliente@longbeach.com' && styles.quickCardActive,
              ]}
              onPress={() => handleQuickSelect('CLIENT')}
              activeOpacity={0.8}
            >
              <View style={styles.quickIconCircleClient}>
                <GraduationCap size={20} color={Palette.success} />
              </View>
              <View style={styles.quickCardTexts}>
                <Text style={styles.quickCardTitle}>Maria Estudante</Text>
                <Text style={styles.quickCardRole}>Passageira USP Butantã</Text>
              </View>
              <ArrowRight size={16} color={Palette.slate400} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Form */}
        <Card style={styles.formCard}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.formTitle}>Acesse sua conta</Text>
            <Text style={styles.formSubtitle}>
              Digite suas credenciais cadastradas na cooperativa
            </Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label="E-mail"
              placeholder="ex: motorista@longbeach.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color={Palette.slate400} />}
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={18} color={Palette.slate400} />}
            />

            <Button
              variant="default"
              size="lg"
              loading={isLoading}
              onPress={() => handleLogin()}
              style={styles.submitButton}
              icon={<ShieldCheck size={20} color={Palette.white} />}
            >
              Entrar no Sistema
            </Button>
          </CardContent>
        </Card>

        {/* Security & Feature Footer */}
        <View style={styles.footerFeatures}>
          <Text style={styles.footerNote}>
            🔒 Roteamento inteligente com otimização TSP e check-in diário de presença.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.slate900,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: Palette.slate500,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  versionBadge: {
    marginTop: 10,
  },
  quickAccessSection: {
    marginBottom: 20,
  },
  quickAccessLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate600,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickRow: {
    gap: 10,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickCardActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.slate50,
  },
  quickIconCircleDriver: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickIconCircleClient: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Palette.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickCardTexts: {
    flex: 1,
  },
  quickCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate800,
  },
  quickCardRole: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  formCard: {
    marginBottom: 20,
  },
  cardContent: {
    padding: 18,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.slate900,
  },
  formSubtitle: {
    fontSize: 13,
    color: Palette.slate500,
    marginTop: 2,
    marginBottom: 14,
  },
  errorBox: {
    backgroundColor: Palette.destructiveLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorBoxText: {
    color: Palette.destructiveForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 14,
  },
  footerFeatures: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  footerNote: {
    fontSize: 12,
    color: Palette.slate400,
    textAlign: 'center',
    lineHeight: 18,
  },
});
