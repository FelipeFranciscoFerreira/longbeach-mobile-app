import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Bus,
  Award,
  Sparkles,
} from 'lucide-react-native';
import { Palette } from '@/constants/colors';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@/components/ui';
import { ApiService } from '@/services/api';

export default function ClientHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await ApiService.getTripHistory('CLIENT');
        setHistory(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Carregando seu histórico de viagens...</Text>
      </View>
    );
  }

  const confirmedTotal = history.filter(
    (h) => h.user_attendance === 'CONFIRMED'
  ).length;
  const absentTotal = history.filter((h) => h.user_attendance === 'ABSENT').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Meu Histórico</Text>
        <Text style={styles.subtitle}>
          Registro de viagens realizadas e ausências justificadas
        </Text>
      </View>

      {/* Aggregate Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Award size={20} color={Palette.primary} />
          <Text style={styles.statVal}>{history.length}</Text>
          <Text style={styles.statLab}>Viagens no Mês</Text>
        </View>

        <View style={styles.statCard}>
          <CheckCircle2 size={20} color={Palette.success} />
          <Text style={styles.statVal}>{confirmedTotal}</Text>
          <Text style={styles.statLab}>Confirmadas</Text>
        </View>

        <View style={styles.statCard}>
          <XCircle size={20} color={Palette.destructive} />
          <Text style={styles.statVal}>{absentTotal}</Text>
          <Text style={styles.statLab}>Faltas Avisadas</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Últimas Viagens</Text>

      {history.map((item) => {
        const isConfirmed = item.user_attendance === 'CONFIRMED';
        return (
          <Card key={item.id} style={styles.historyCard}>
            <CardHeader>
              <View style={styles.cardHeaderRow}>
                <View style={styles.dateRow}>
                  <Calendar size={14} color={Palette.primary} />
                  <Text style={styles.dateText}>
                    {item.day_name}, {item.date}
                  </Text>
                </View>
                <Badge variant={isConfirmed ? 'success' : 'destructive'}>
                  {isConfirmed ? 'Você Compareceu' : 'Ausência Avisada'}
                </Badge>
              </View>

              <CardTitle style={styles.tripTitle}>{item.trip_name}</CardTitle>
              <CardDescription>
                Turno: {item.shift === 'MORNING' ? 'Manhã' : 'Noite'} • Motorista:{' '}
                {item.driver_name}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <View style={styles.cardFooterDetails}>
                <View style={styles.detailCol}>
                  <Clock size={13} color={Palette.slate500} />
                  <Text style={styles.detailText}>Embarque: 06:45</Text>
                </View>

                <View style={styles.detailCol}>
                  <Bus size={13} color={Palette.slate500} />
                  <Text style={styles.detailText}>{item.vehicle}</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        );
      })}
    </ScrollView>
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
  header: {
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Palette.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.slate200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 6,
    marginBottom: 2,
  },
  statLab: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.slate500,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate700,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  historyCard: {
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate600,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
  },
  cardFooterDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.slate50,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  detailCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: Palette.slate600,
    fontWeight: '500',
  },
});
