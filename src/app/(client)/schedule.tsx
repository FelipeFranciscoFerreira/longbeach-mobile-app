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
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Bus,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react-native';
import { Palette } from '@/constants/colors';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CalendarStrip,
  Input,
  Badge,
} from '@/components/ui';
import { ApiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Trip, AttendanceStatus } from '@/types';

export default function ClientScheduleScreen() {
  const { clientProfile } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);

  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayIso);

  // Status mapping for dates
  const [statusMap, setStatusMap] = useState<
    Record<string, AttendanceStatus>
  >({
    [todayIso]: 'CONFIRMED',
  });

  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [currentNote, setCurrentNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const trips = await ApiService.getTrips();
        if (trips.length > 0) {
          setTrip(trips[0]);

          // Preload today and next few days
          const initialStatus: Record<string, AttendanceStatus> = {
            [todayIso]: 'CONFIRMED',
          };

          // Generate next days with some sample confirmations
          const d = new Date();
          for (let i = 1; i <= 7; i++) {
            const next = new Date();
            next.setDate(d.getDate() + i);
            const iso = next.toISOString().split('T')[0];
            const dayOfWeek = next.getDay();

            // Default weekdays to pending or confirmed
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              initialStatus[iso] = i === 1 ? 'CONFIRMED' : 'PENDING';
            }
          }

          setStatusMap(initialStatus);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSelectDate = (dateIso: string) => {
    setSelectedDate(dateIso);
    setCurrentNote(notesMap[dateIso] || '');
  };

  const handleSetAttendance = async (status: AttendanceStatus) => {
    if (!trip) return;
    setSaving(true);
    try {
      await ApiService.submitDailyAttendance(
        trip.id,
        selectedDate,
        status,
        currentNote
      );

      setStatusMap((prev) => ({
        ...prev,
        [selectedDate]: status,
      }));

      if (currentNote) {
        setNotesMap((prev) => ({
          ...prev,
          [selectedDate]: currentNote,
        }));
      }

      Alert.alert(
        'Decisão Salva!',
        status === 'CONFIRMED'
          ? `Presença confirmada para o dia ${formatDisplayDate(selectedDate)}.`
          : `Ausência comunicada para o dia ${formatDisplayDate(selectedDate)}.`
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar sua decisão.');
    } finally {
      setSaving(false);
    }
  };

  const currentStatus = statusMap[selectedDate] || 'PENDING';

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
        <View style={styles.header}>
          <Text style={styles.title}>Programação e Dias Posteriores</Text>
          <Text style={styles.subtitle}>
            Selecione uma data para planejar sua semana e avisar o motorista
          </Text>
        </View>

        {/* Horizontal Calendar Strip */}
        <View style={styles.calendarContainer}>
          <Text style={styles.calendarLabel}>Próximos 14 dias:</Text>
          <CalendarStrip
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            tripStatusMap={statusMap as any}
            daysCount={14}
          />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Palette.success }]} />
              <Text style={styles.legendText}>Confirmado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Palette.destructive }]} />
              <Text style={styles.legendText}>Ausente</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Palette.warning }]} />
              <Text style={styles.legendText}>Pendente</Text>
            </View>
          </View>
        </View>

        {/* Selected Day Details */}
        <Card style={styles.dayCard}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.dayCardDay}>
                  {formatDisplayDate(selectedDate)}
                </Text>
                <CardTitle style={styles.dayCardTitle}>
                  {trip?.name || 'Rota Universitária - Butantã'}
                </CardTitle>
              </View>
              <Badge
                variant={
                  currentStatus === 'CONFIRMED'
                    ? 'success'
                    : currentStatus === 'ABSENT'
                    ? 'destructive'
                    : 'warning'
                }
              >
                {currentStatus === 'CONFIRMED'
                  ? 'Vou Nesse Dia'
                  : currentStatus === 'ABSENT'
                  ? 'Não Vou'
                  : 'Pendente'}
              </Badge>
            </View>
          </CardHeader>

          <CardContent>
            {/* Quick Trip Summary */}
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Clock size={16} color={Palette.primary} />
                <Text style={styles.infoVal}>06:45</Text>
                <Text style={styles.infoLab}>Embarque est.</Text>
              </View>

              <View style={styles.infoBox}>
                <Bus size={16} color={Palette.slate700} />
                <Text style={styles.infoVal}>Sprinter</Text>
                <Text style={styles.infoLab}>ABC-1D23</Text>
              </View>

              <View style={styles.infoBox}>
                <MapPin size={16} color={Palette.success} />
                <Text style={styles.infoVal}>USP Butantã</Text>
                <Text style={styles.infoLab}>Destino final</Text>
              </View>
            </View>

            {/* Attendance Choice Buttons */}
            <Text style={styles.decisionLabel}>
              Você vai precisar de transporte neste dia?
            </Text>

            <View style={styles.decisionButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.decisionButton,
                  currentStatus === 'CONFIRMED' && styles.decisionButtonActiveConfirmed,
                ]}
                onPress={() => handleSetAttendance('CONFIRMED')}
                activeOpacity={0.8}
              >
                <CheckCircle2
                  size={22}
                  color={
                    currentStatus === 'CONFIRMED'
                      ? Palette.success
                      : Palette.slate400
                  }
                />
                <Text
                  style={[
                    styles.decisionTitle,
                    currentStatus === 'CONFIRMED' &&
                      styles.decisionTitleConfirmed,
                  ]}
                >
                  Confirmar Ida
                </Text>
                <Text style={styles.decisionSubtitle}>
                  Contar com o motorista
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.decisionButton,
                  currentStatus === 'ABSENT' && styles.decisionButtonActiveAbsent,
                ]}
                onPress={() => handleSetAttendance('ABSENT')}
                activeOpacity={0.8}
              >
                <XCircle
                  size={22}
                  color={
                    currentStatus === 'ABSENT'
                      ? Palette.destructive
                      : Palette.slate400
                  }
                />
                <Text
                  style={[
                    styles.decisionTitle,
                    currentStatus === 'ABSENT' && styles.decisionTitleAbsent,
                  ]}
                >
                  Informar Ausência
                </Text>
                <Text style={styles.decisionSubtitle}>
                  Liberar vaga para o dia
                </Text>
              </TouchableOpacity>
            </View>

            {/* Notes input */}
            <Input
              label="Observação antecipada para o motorista (opcional)"
              placeholder="Ex: Levarei trabalho acadêmico ou sairei mais cedo"
              value={currentNote}
              onChangeText={setCurrentNote}
              icon={<MessageSquare size={16} color={Palette.slate400} />}
            />

            <Button
              variant="outline"
              size="default"
              loading={saving}
              onPress={() => handleSetAttendance(currentStatus)}
              style={styles.saveBtn}
            >
              Atualizar Recado do Dia
            </Button>
          </CardContent>
        </Card>

        {/* Tip Box */}
        <View style={styles.tipBox}>
          <Info size={16} color={Palette.info} />
          <Text style={styles.tipText}>
            Dica: Ao comunicar sua ausência com antecedência, você ajuda seu
            motorista a otimizar a rota, economizando combustível e tempo para
            todos os passageiros!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function formatDisplayDate(iso: string) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
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
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.slate900,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.slate500,
    marginTop: 2,
  },
  calendarContainer: {
    backgroundColor: Palette.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: 16,
  },
  calendarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: Palette.slate500,
    fontWeight: '500',
  },
  dayCard: {
    marginBottom: 16,
    borderColor: Palette.slate200,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dayCardDay: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primary,
    textTransform: 'capitalize',
  },
  dayCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Palette.slate50,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
    marginTop: 2,
  },
  infoLab: {
    fontSize: 10,
    color: Palette.slate500,
  },
  decisionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: 10,
  },
  decisionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  decisionButton: {
    flex: 1,
    backgroundColor: Palette.slate50,
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.slate200,
    alignItems: 'center',
  },
  decisionButtonActiveConfirmed: {
    backgroundColor: Palette.successLight,
    borderColor: Palette.success,
  },
  decisionButtonActiveAbsent: {
    backgroundColor: Palette.destructiveLight,
    borderColor: Palette.destructive,
  },
  decisionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate700,
    marginTop: 6,
  },
  decisionTitleConfirmed: {
    color: Palette.successForeground,
  },
  decisionTitleAbsent: {
    color: Palette.destructiveForeground,
  },
  decisionSubtitle: {
    fontSize: 10,
    color: Palette.slate500,
    marginTop: 1,
  },
  saveBtn: {
    marginTop: 4,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Palette.infoLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: Palette.infoForeground,
    lineHeight: 18,
  },
});
