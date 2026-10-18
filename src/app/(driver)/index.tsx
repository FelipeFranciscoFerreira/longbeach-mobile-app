import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  MapPin,
  Users,
  Route,
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Building2,
  Calendar,
} from 'lucide-react-native';
import { Palette } from '@/constants/colors';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@/components/ui';
import { ApiService } from '@/services/api';
import { Trip, DailyAttendance, RouteCalculationResponse } from '@/types';

export default function DriverDashboardScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [attendances, setAttendances] = useState<DailyAttendance[]>([]);
  const [routeResult, setRouteResult] = useState<RouteCalculationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const todayIso = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const tripList = await ApiService.getTrips();
      setTrips(tripList);
      if (tripList.length > 0) {
        setSelectedTrip(tripList[0]);
        const atts = await ApiService.getTripAttendance(tripList[0].id, todayIso);
        setAttendances(atts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    setRouteResult(null);
    const atts = await ApiService.getTripAttendance(trip.id, todayIso);
    setAttendances(atts);
  };

  const handleCalculateRoute = async () => {
    if (!selectedTrip) return;
    setCalculating(true);
    try {
      const res = await ApiService.calculateRoute(selectedTrip.id, todayIso);
      setRouteResult(res);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Carregando viagens do dia...</Text>
      </View>
    );
  }

  const confirmedCount = attendances.filter((a) => a.status === 'CONFIRMED').length;
  const absentCount = attendances.filter((a) => a.status === 'ABSENT').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Date Banner */}
      <View style={styles.dateBanner}>
        <View style={styles.dateLeft}>
          <Calendar size={18} color={Palette.primary} />
          <Text style={styles.dateText}>
            Hoje, {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
          </Text>
        </View>
        <Badge variant="success">Serviço Ativo</Badge>
      </View>

      {/* Trip Switcher / Selector */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Selecione a Rota em Execução</Text>
        <TouchableOpacity
          onPress={() => router.push('/(driver)/new-route')}
          style={styles.newRouteShortcut}
        >
          <Plus size={14} color={Palette.primary} />
          <Text style={styles.newRouteShortcutText}>Nova Rota</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tripChipsContainer}
      >
        {trips.map((t) => {
          const isSelected = selectedTrip?.id === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tripChip, isSelected && styles.tripChipSelected]}
              onPress={() => handleSelectTrip(t)}
            >
              <Text
                style={[
                  styles.tripChipTitle,
                  isSelected && styles.tripChipTitleSelected,
                ]}
              >
                {t.name}
              </Text>
              <Text
                style={[
                  styles.tripChipShift,
                  isSelected && styles.tripChipShiftSelected,
                ]}
              >
                Turno: {t.shift === 'MORNING' ? 'Manhã' : t.shift === 'NIGHT' ? 'Noite' : 'Tarde'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedTrip ? (
        <>
          {/* Main Selected Trip Card */}
          <Card style={styles.mainCard}>
            <CardHeader>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgeWrapper}>
                  <Badge variant="info">
                    {selectedTrip.shift === 'MORNING'
                      ? 'Manhã'
                      : selectedTrip.shift === 'NIGHT'
                      ? 'Noite'
                      : 'Tarde'}
                  </Badge>
                </View>
                <Text style={styles.capacityText}>
                  {selectedTrip.clients.length} alunos cadastrados
                </Text>
              </View>
              <CardTitle style={styles.tripTitle}>{selectedTrip.name}</CardTitle>
              <CardDescription style={styles.tripOrigin}>
                Origem: {selectedTrip.origin_address}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Destinations List */}
              <View style={styles.destinationsBox}>
                <Text style={styles.subsectionTitle}>
                  Destinos Finais Cadastrados ({selectedTrip.destinations.length})
                </Text>
                {selectedTrip.destinations.map((d, index) => (
                  <View key={d.id} style={styles.destItem}>
                    <View style={styles.destOrderBadge}>
                      <Text style={styles.destOrderNumber}>{d.drop_order || index + 1}</Text>
                    </View>
                    <View style={styles.destInfo}>
                      <Text style={styles.destName}>{d.destination_name}</Text>
                      <Text style={styles.destAddress}>{d.address}</Text>
                    </View>
                    <Building2 size={16} color={Palette.slate400} />
                  </View>
                ))}
              </View>

              {/* Attendance Status of the Day */}
              <View style={styles.attendanceStatsRow}>
                <View style={styles.statBoxConfirmed}>
                  <CheckCircle2 size={18} color={Palette.success} />
                  <Text style={styles.statNumber}>{confirmedCount}</Text>
                  <Text style={styles.statLabel}>Vão hoje</Text>
                </View>
                <View style={styles.statBoxAbsent}>
                  <XCircle size={18} color={Palette.destructive} />
                  <Text style={styles.statNumber}>{absentCount}</Text>
                  <Text style={styles.statLabel}>Faltam hoje</Text>
                </View>
                <View style={styles.statBoxTotal}>
                  <Users size={18} color={Palette.primary} />
                  <Text style={styles.statNumber}>{selectedTrip.clients.length}</Text>
                  <Text style={styles.statLabel}>Total inscritos</Text>
                </View>
              </View>

              {/* Passengers Daily Check-in Details */}
              <View style={styles.passengersSection}>
                <Text style={styles.subsectionTitle}>Check-in de Presença Hoje</Text>
                {attendances.length === 0 ? (
                  <Text style={styles.noAttendanceText}>
                    Nenhum passageiro confirmou ou recusou ainda hoje.
                  </Text>
                ) : (
                  attendances.map((att) => (
                    <View key={att.id} style={styles.passengerRow}>
                      <View style={styles.passengerLeft}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                att.status === 'CONFIRMED'
                                  ? Palette.success
                                  : Palette.destructive,
                            },
                          ]}
                        />
                        <View>
                          <Text style={styles.passengerName}>
                            {att.client_name || 'Aluno Cadastrado'}
                          </Text>
                          <Text style={styles.passengerAddress}>
                            {att.pickup_address}
                          </Text>
                          {att.notes ? (
                            <Text style={styles.passengerNotes}>
                              💬 &quot;{att.notes}&quot;
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Badge
                        variant={att.status === 'CONFIRMED' ? 'success' : 'destructive'}
                      >
                        {att.status === 'CONFIRMED' ? 'Confirmado' : 'Ausente'}
                      </Badge>
                    </View>
                  ))
                )}
              </View>

              {/* Optimize Route CTA */}
              <Button
                variant="default"
                size="lg"
                loading={calculating}
                onPress={handleCalculateRoute}
                style={styles.calcButton}
                icon={<Navigation size={18} color={Palette.white} />}
              >
                Calcular Rota Inteligente (TSP)
              </Button>
            </CardContent>
          </Card>

          {/* Route Result Card */}
          {routeResult ? (
            <Card style={styles.resultCard}>
              <CardHeader>
                <Badge variant="success" style={styles.resultBadge}>
                  Itinerário Otimizado
                </Badge>
                <CardTitle style={styles.resultTitle}>
                  Ordem de Paradas para Hoje
                </CardTitle>
                <CardDescription>
                  Apenas passageiros confirmados foram incluídos na rota
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Stats metrics */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Clock size={16} color={Palette.slate500} />
                    <Text style={styles.metricValue}>
                      {routeResult.estimated_duration_minutes} min
                    </Text>
                    <Text style={styles.metricLabel}>Duração est.</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Route size={16} color={Palette.slate500} />
                    <Text style={styles.metricValue}>
                      {routeResult.total_distance_km} km
                    </Text>
                    <Text style={styles.metricLabel}>Distância total</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Users size={16} color={Palette.slate500} />
                    <Text style={styles.metricValue}>
                      {routeResult.confirmed_passengers_count}
                    </Text>
                    <Text style={styles.metricLabel}>Passageiros</Text>
                  </View>
                </View>

                {/* Ordered Stops */}
                <View style={styles.stopsTimeline}>
                  {routeResult.ordered_stops.map((stop, index) => {
                    const isOrigin = stop.stop_type === 'ORIGIN';
                    const isDest = stop.stop_type === 'DESTINATION';

                    return (
                      <View key={index} style={styles.stopTimelineItem}>
                        <View style={styles.timelineLeft}>
                          <View
                            style={[
                              styles.timelineCircle,
                              isOrigin
                                ? styles.circleOrigin
                                : isDest
                                ? styles.circleDest
                                : styles.circlePickup,
                            ]}
                          >
                            <Text style={styles.timelineIndex}>{index + 1}</Text>
                          </View>
                          {index < routeResult.ordered_stops.length - 1 ? (
                            <View style={styles.timelineLine} />
                          ) : null}
                        </View>

                        <View style={styles.timelineRight}>
                          <View style={styles.stopHeaderRow}>
                            <Text style={styles.stopName}>{stop.name}</Text>
                            <Badge
                              variant={
                                isOrigin ? 'secondary' : isDest ? 'default' : 'success'
                              }
                            >
                              {stop.eta_time}
                            </Badge>
                          </View>
                          <Text style={styles.stopAddress}>{stop.address}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
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
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: 16,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate700,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newRouteShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newRouteShortcutText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.primary,
  },
  tripChipsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  tripChip: {
    backgroundColor: Palette.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
  },
  tripChipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  tripChipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
  },
  tripChipTitleSelected: {
    color: Palette.white,
  },
  tripChipShift: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
  },
  tripChipShiftSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  mainCard: {
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.slate500,
  },
  tripTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Palette.slate900,
  },
  tripOrigin: {
    fontSize: 13,
    color: Palette.slate500,
    marginTop: 4,
  },
  destinationsBox: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate700,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  destItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.slate50,
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  destOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  destOrderNumber: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  destInfo: {
    flex: 1,
  },
  destName: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.slate800,
  },
  destAddress: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 1,
  },
  attendanceStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14,
  },
  statBoxConfirmed: {
    flex: 1,
    backgroundColor: Palette.successLight,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statBoxAbsent: {
    flex: 1,
    backgroundColor: Palette.destructiveLight,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statBoxTotal: {
    flex: 1,
    backgroundColor: Palette.slate100,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Palette.slate600,
    fontWeight: '600',
  },
  passengersSection: {
    marginBottom: 16,
  },
  noAttendanceText: {
    fontSize: 13,
    color: Palette.slate400,
    fontStyle: 'italic',
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  passengerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.slate800,
  },
  passengerAddress: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  passengerNotes: {
    fontSize: 11,
    color: Palette.primary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  calcButton: {
    marginTop: 8,
  },
  resultCard: {
    borderColor: '#BFDBFE',
    backgroundColor: Palette.white,
    marginBottom: 24,
  },
  resultBadge: {
    marginBottom: 6,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Palette.slate50,
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate800,
  },
  metricLabel: {
    fontSize: 11,
    color: Palette.slate500,
  },
  stopsTimeline: {
    paddingLeft: 6,
  },
  stopTimelineItem: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: 10,
  },
  timelineCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOrigin: {
    backgroundColor: Palette.slate700,
  },
  circlePickup: {
    backgroundColor: Palette.success,
  },
  circleDest: {
    backgroundColor: Palette.primary,
  },
  timelineIndex: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Palette.slate200,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 16,
  },
  stopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stopName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
    flex: 1,
    marginRight: 8,
  },
  stopAddress: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
});
