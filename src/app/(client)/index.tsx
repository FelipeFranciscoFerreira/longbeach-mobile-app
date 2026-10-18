import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  Clock,
  MapPin,
  Bus,
  User,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react-native';
import { Palette } from '@/constants/colors';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Badge,
} from '@/components/ui';
import { ApiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Trip, DailyAttendance, AttendanceStatus } from '@/types';

export default function ClientTodayScreen() {
  const { user, clientProfile } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [attendance, setAttendance] = useState<DailyAttendance | null>(null);
  const [statusChoice, setStatusChoice] = useState<AttendanceStatus>('CONFIRMED');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const todayIso = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    setLoading(true);
    try {
      const trips = await ApiService.getTrips();
      if (trips.length > 0) {
        setTrip(trips[0]);
        const attList = await ApiService.getTripAttendance(trips[0].id, todayIso);
        const myAtt = attList.find(
          (a) => a.client_id === (clientProfile?.id || 'cli-profile-1')
        );

        if (myAtt) {
          setAttendance(myAtt);
          setStatusChoice(myAtt.status);
          setNotes(myAtt.notes || '');
        } else {
          // Default to confirmed
          setStatusChoice('CONFIRMED');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async (chosenStatus = statusChoice) => {
    if (!trip) return;
    setSaving(true);
    try {
      const updated = await ApiService.submitDailyAttendance(
        trip.id,
        todayIso,
        chosenStatus,
        notes
      );
      setAttendance(updated);
      setStatusChoice(updated.status);
      Alert.alert(
        'Check-in Atualizado!',
        chosenStatus === 'CONFIRMED'
          ? 'Você confirmou sua presença na van de hoje. Tenha uma excelente viagem!'
          : 'Sua ausência foi informada ao motorista. O itinerário foi recalculado.'
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar seu check-in.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Carregando informações da sua viagem...</Text>
      </View>
    );
  }

  const isConfirmed = attendance?.status === 'CONFIRMED';
  const isAbsent = attendance?.status === 'ABSENT';

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
        {/* Banner with date & status */}
        <View style={styles.todayBanner}>
          <View>
            <Text style={styles.bannerDayName}>
              Hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
            </Text>
            <Text style={styles.bannerDate}>
              {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
            </Text>
          </View>

          <Badge variant={isConfirmed ? 'success' : isAbsent ? 'destructive' : 'warning'}>
            {isConfirmed
              ? 'Presença Confirmada'
              : isAbsent
              ? 'Ausência Informada'
              : 'Pendente de Resposta'}
          </Badge>
        </View>

        {/* 1. Interactive Check-in Card (Vou / Não Vou) */}
        <Card style={styles.checkinCard}>
          <CardHeader>
            <CardTitle>Você vai na van hoje?</CardTitle>
            <CardDescription>
              Confirme ou cancele para que o motorista otimize as paradas
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Status toggle choices */}
            <View style={styles.choiceRow}>
              <TouchableOpacity
                style={[
                  styles.choiceButton,
                  statusChoice === 'CONFIRMED' && styles.choiceButtonConfirmed,
                ]}
                onPress={() => {
                  setStatusChoice('CONFIRMED');
                  handleSaveAttendance('CONFIRMED');
                }}
                activeOpacity={0.8}
              >
                <CheckCircle2
                  size={24}
                  color={
                    statusChoice === 'CONFIRMED'
                      ? Palette.success
                      : Palette.slate400
                  }
                />
                <Text
                  style={[
                    styles.choiceTitle,
                    statusChoice === 'CONFIRMED' && styles.choiceTitleConfirmed,
                  ]}
                >
                  Sim, vou hoje!
                </Text>
                <Text style={styles.choiceDesc}>Manter meu embarque na rota</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.choiceButton,
                  statusChoice === 'ABSENT' && styles.choiceButtonAbsent,
                ]}
                onPress={() => {
                  setStatusChoice('ABSENT');
                  handleSaveAttendance('ABSENT');
                }}
                activeOpacity={0.8}
              >
                <XCircle
                  size={24}
                  color={
                    statusChoice === 'ABSENT'
                      ? Palette.destructive
                      : Palette.slate400
                  }
                />
                <Text
                  style={[
                    styles.choiceTitle,
                    statusChoice === 'ABSENT' && styles.choiceTitleAbsent,
                  ]}
                >
                  Não vou hoje
                </Text>
                <Text style={styles.choiceDesc}>Liberar vaga e pular parada</Text>
              </TouchableOpacity>
            </View>

            {/* Note to driver input */}
            <Input
              label="Recado rápido para o motorista (opcional)"
              placeholder="Ex: Estarei na calçada às 06:40 com mochila de maquete"
              value={notes}
              onChangeText={setNotes}
              icon={<MessageSquare size={16} color={Palette.slate400} />}
            />

            <Button
              variant="outline"
              size="default"
              loading={saving}
              onPress={() => handleSaveAttendance()}
              style={styles.saveNoteButton}
            >
              Salvar Recado
            </Button>
          </CardContent>
        </Card>

        {/* 2. Van & Driver Details */}
        <Card style={styles.tripDetailsCard}>
          <CardHeader>
            <View style={styles.sectionHeaderRow}>
              <View>
                <CardTitle>Detalhes do Seu Transporte</CardTitle>
                <CardDescription>{trip?.name || 'Rota Universitária'}</CardDescription>
              </View>
              <Badge variant="info">Turno Manhã</Badge>
            </View>
          </CardHeader>

          <CardContent>
            {/* ETA Box */}
            <View style={styles.etaBox}>
              <Clock size={24} color={Palette.primary} />
              <View style={styles.etaTexts}>
                <Text style={styles.etaLabel}>Horário Estimado no Seu Embarque</Text>
                <Text style={styles.etaTime}>06:45 pontual</Text>
              </View>
            </View>

            {/* Stops */}
            <View style={styles.pointsList}>
              <View style={styles.pointRow}>
                <View style={styles.pointIconOrigin}>
                  <MapPin size={16} color={Palette.primary} />
                </View>
                <View style={styles.pointInfo}>
                  <Text style={styles.pointLabel}>Seu Ponto de Embarque</Text>
                  <Text style={styles.pointAddress}>
                    {clientProfile?.pickup_address ||
                      'Av. Paulista, 1000 - Bela Vista'}
                  </Text>
                </View>
              </View>

              <View style={styles.pointConnector} />

              <View style={styles.pointRow}>
                <View style={styles.pointIconDest}>
                  <MapPin size={16} color={Palette.success} />
                </View>
                <View style={styles.pointInfo}>
                  <Text style={styles.pointLabel}>Seu Destino Final</Text>
                  <Text style={styles.pointAddress}>
                    {clientProfile?.destination_address ||
                      'Faculdade A - USP Butantã'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Driver Contact Box */}
            <View style={styles.driverBox}>
              <View style={styles.driverAvatar}>
                <User size={20} color={Palette.primary} />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>Carlos Motorista</Text>
                <Text style={styles.vanModel}>Mercedes Sprinter • ABC-1D23</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() =>
                  Alert.alert(
                    'Contato do Motorista',
                    'Telefone: (11) 97777-1111\nVan: Mercedes Sprinter 2023 (ABC-1D23)'
                  )
                }
              >
                <Phone size={16} color={Palette.primary} />
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* 3. Link to future schedule */}
        <TouchableOpacity
          style={styles.nextDaysShortcut}
          onPress={() => router.push('/(client)/schedule')}
          activeOpacity={0.8}
        >
          <View style={styles.shortcutLeft}>
            <Text style={styles.shortcutTitle}>Programar próximos dias</Text>
            <Text style={styles.shortcutSubtitle}>
              Veja as viagens da semana e confirme presença antecipada
            </Text>
          </View>
          <ArrowRight size={20} color={Palette.primary} />
        </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    fontSize: 14,
    color: Palette.slate500,
    marginTop: 10,
  },
  todayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: 16,
  },
  bannerDayName: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerDate: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 2,
  },
  checkinCard: {
    marginBottom: 16,
    borderColor: '#BFDBFE',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: Palette.slate50,
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.slate200,
    alignItems: 'center',
  },
  choiceButtonConfirmed: {
    backgroundColor: Palette.successLight,
    borderColor: Palette.success,
  },
  choiceButtonAbsent: {
    backgroundColor: Palette.destructiveLight,
    borderColor: Palette.destructive,
  },
  choiceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate700,
    marginTop: 6,
  },
  choiceTitleConfirmed: {
    color: Palette.successForeground,
  },
  choiceTitleAbsent: {
    color: Palette.destructiveForeground,
  },
  choiceDesc: {
    fontSize: 11,
    color: Palette.slate500,
    textAlign: 'center',
    marginTop: 2,
  },
  saveNoteButton: {
    marginTop: 6,
  },
  tripDetailsCard: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primaryLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  etaTexts: {
    marginLeft: 12,
  },
  etaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primary,
  },
  etaTime: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 1,
  },
  pointsList: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pointIconOrigin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pointIconDest: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pointInfo: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate500,
    textTransform: 'uppercase',
  },
  pointAddress: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
    marginTop: 1,
  },
  pointConnector: {
    width: 2,
    height: 20,
    backgroundColor: Palette.slate300,
    marginLeft: 13,
    marginVertical: 4,
  },
  driverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.slate50,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  driverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
  },
  vanModel: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextDaysShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
  },
  shortcutLeft: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  shortcutSubtitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
});
