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
  Route,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
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

export default function DriverHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await ApiService.getTripHistory('DRIVER');
        setHistory(data);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Carregando histórico de viagens...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Viagens</Text>
        <Text style={styles.subtitle}>
          Relatório de rotas executadas e taxa de presença
        </Text>
      </View>

      {/* Aggregate Performance Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Award size={20} color={Palette.primary} />
          <Text style={styles.metricVal}>42</Text>
          <Text style={styles.metricLab}>Viagens no Mês</Text>
        </View>

        <View style={styles.metricCard}>
          <TrendingUp size={20} color={Palette.success} />
          <Text style={styles.metricVal}>94%</Text>
          <Text style={styles.metricLab}>Taxa de Ocupação</Text>
        </View>

        <View style={styles.metricCard}>
          <Route size={20} color={Palette.accent} />
          <Text style={styles.metricVal}>864 km</Text>
          <Text style={styles.metricLab}>Rodados</Text>
        </View>
      </View>

      {/* History Items */}
      <Text style={styles.sectionTitle}>Últimas Viagens Realizadas</Text>

      {history.map((item) => (
        <Card key={item.id} style={styles.historyCard}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <View style={styles.dateRow}>
                <Calendar size={14} color={Palette.primary} />
                <Text style={styles.dateText}>
                  {item.day_name}, {item.date}
                </Text>
              </View>
              <Badge variant="success">Finalizada</Badge>
            </View>
            <CardTitle style={styles.tripTitle}>{item.trip_name}</CardTitle>
            <CardDescription>
              Turno: {item.shift === 'MORNING' ? 'Manhã' : 'Noite'} • Veículo:{' '}
              {item.vehicle}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Users size={14} color={Palette.slate500} />
                <Text style={styles.statVal}>
                  {item.confirmed_clients}/{item.total_clients}
                </Text>
                <Text style={styles.statLab}>Passageiros</Text>
              </View>

              <View style={styles.statCol}>
                <Route size={14} color={Palette.slate500} />
                <Text style={styles.statVal}>{item.distance_km} km</Text>
                <Text style={styles.statLab}>Distância</Text>
              </View>

              <View style={styles.statCol}>
                <Clock size={14} color={Palette.slate500} />
                <Text style={styles.statVal}>{item.duration_minutes} min</Text>
                <Text style={styles.statLab}>Tempo total</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      ))}
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
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
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 6,
    marginBottom: 2,
  },
  metricLab: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Palette.slate50,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  statCol: {
    alignItems: 'center',
    gap: 3,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
  },
  statLab: {
    fontSize: 11,
    color: Palette.slate500,
  },
});
