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
} from 'react-native';
import { router } from 'expo-router';
import {
  MapPin,
  Building,
  Users,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
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
import { Shift, DayOfWeek, ClientProfile } from '@/types';

interface DestinationInput {
  destination_name: string;
  address: string;
  drop_order: number;
}

interface SelectedClientState {
  client_id: string;
  days_of_week: DayOfWeek[];
}

const ALL_DAYS: Array<{ label: string; value: DayOfWeek }> = [
  { label: 'Seg', value: 'MONDAY' },
  { label: 'Ter', value: 'TUESDAY' },
  { label: 'Qua', value: 'WEDNESDAY' },
  { label: 'Qui', value: 'THURSDAY' },
  { label: 'Sex', value: 'FRIDAY' },
];

export default function NewRouteScreen() {
  const [name, setName] = useState('');
  const [shift, setShift] = useState<Shift>('MORNING');
  const [originAddress, setOriginAddress] = useState(
    'Garagem Central - Av. Rebouças, 1500'
  );

  // Destinations list
  const [destinations, setDestinations] = useState<DestinationInput[]>([
    {
      destination_name: 'Faculdade A - USP Butantã',
      address: 'Av. Prof. Luciano Gualberto, 300 - Butantã',
      drop_order: 1,
    },
  ]);

  // Clients available for assignment
  const [availableClients, setAvailableClients] = useState<ClientProfile[]>([]);
  const [selectedClients, setSelectedClients] = useState<
    Record<string, SelectedClientState>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadClients() {
      const clients = await ApiService.getAvailableClients();
      setAvailableClients(clients);

      // Pre-select first 2 clients by default with all days for convenience
      const initialMap: Record<string, SelectedClientState> = {};
      if (clients.length > 0) {
        initialMap[clients[0].id] = {
          client_id: clients[0].id,
          days_of_week: [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
          ],
        };
      }
      setSelectedClients(initialMap);
    }
    loadClients();
  }, []);

  const handleAddDestination = () => {
    setDestinations((prev) => [
      ...prev,
      {
        destination_name: '',
        address: '',
        drop_order: prev.length + 1,
      },
    ]);
  };

  const handleRemoveDestination = (index: number) => {
    if (destinations.length <= 1) {
      Alert.alert('Aviso', 'A rota deve conter pelo menos um destino final.');
      return;
    }
    setDestinations((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((d, i) => ({ ...d, drop_order: i + 1 }))
    );
  };

  const handleUpdateDestination = (
    index: number,
    field: keyof DestinationInput,
    value: string
  ) => {
    setDestinations((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients((prev) => {
      const copy = { ...prev };
      if (copy[clientId]) {
        delete copy[clientId];
      } else {
        copy[clientId] = {
          client_id: clientId,
          days_of_week: [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
          ],
        };
      }
      return copy;
    });
  };

  const toggleClientDay = (clientId: string, day: DayOfWeek) => {
    setSelectedClients((prev) => {
      const client = prev[clientId];
      if (!client) return prev;

      const currentDays = client.days_of_week;
      const hasDay = currentDays.includes(day);

      const nextDays = hasDay
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];

      return {
        ...prev,
        [clientId]: {
          ...client,
          days_of_week: nextDays.length > 0 ? nextDays : [day], // Keep at least one
        },
      };
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe o nome descritivo da nova rota.');
      return;
    }

    if (!originAddress.trim()) {
      Alert.alert(
        'Campo Obrigatório',
        'Informe o ponto de partida / garagem da van.'
      );
      return;
    }

    const invalidDest = destinations.some(
      (d) => !d.destination_name.trim() || !d.address.trim()
    );
    if (invalidDest) {
      Alert.alert(
        'Destinos Incompletos',
        'Preencha o nome e o endereço de todos os destinos finais.'
      );
      return;
    }

    setLoading(true);
    try {
      const clientPayload = Object.values(selectedClients).map((c) => ({
        client_id: c.client_id,
        days_of_week: c.days_of_week,
      }));

      await ApiService.createTrip({
        name,
        shift,
        origin_address: originAddress,
        destinations,
        clients: clientPayload,
      });

      Alert.alert(
        'Rota Criada com Sucesso!',
        `A rota "${name}" foi cadastrada com ${destinations.length} destino(s) e ${clientPayload.length} passageiro(s) vinculados.`,
        [
          {
            text: 'Ver Rotas',
            onPress: () => router.replace('/(driver)'),
          },
        ]
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar a rota. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color={Palette.slate700} />
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>Criar Nova Rota</Text>
            <Text style={styles.pageSubtitle}>
              Defina itinerário, faculdades e vincule passageiros
            </Text>
          </View>
        </View>

        {/* 1. Basic Trip Info */}
        <Card style={styles.sectionCard}>
          <CardHeader>
            <CardTitle>1. Dados Gerais da Viagem</CardTitle>
            <CardDescription>
              Nome de identificação e turno da operação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              label="Nome da Rota"
              placeholder="Ex: Rota Tarde - Região Butantã & Pinheiros"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Turno da Rota</Text>
            <View style={styles.shiftSelector}>
              {(['MORNING', 'AFTERNOON', 'NIGHT'] as Shift[]).map((s) => {
                const isSelected = shift === s;
                const label =
                  s === 'MORNING'
                    ? 'Manhã (Ida)'
                    : s === 'AFTERNOON'
                    ? 'Tarde (Intermediário)'
                    : 'Noite (Volta)';
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.shiftChip,
                      isSelected && styles.shiftChipSelected,
                    ]}
                    onPress={() => setShift(s)}
                  >
                    <Text
                      style={[
                        styles.shiftChipText,
                        isSelected && styles.shiftChipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Ponto de Partida (Garagem / Base)"
              placeholder="Ex: Garagem Central - Av. Rebouças, 1500"
              value={originAddress}
              onChangeText={setOriginAddress}
              icon={<MapPin size={18} color={Palette.slate400} />}
            />
          </CardContent>
        </Card>

        {/* 2. Multiple Final Destinations */}
        <Card style={styles.sectionCard}>
          <CardHeader>
            <View style={styles.sectionHeaderRow}>
              <View>
                <CardTitle>2. Destinos Finais (Faculdades/Polos)</CardTitle>
                <CardDescription>
                  Adicione todos os pontos de entrega desta rota
                </CardDescription>
              </View>
              <Badge variant="default">{destinations.length} destino(s)</Badge>
            </View>
          </CardHeader>
          <CardContent>
            {destinations.map((dest, index) => (
              <View key={index} style={styles.destinationCardItem}>
                <View style={styles.destCardHeader}>
                  <View style={styles.destBadgeRow}>
                    <View style={styles.orderPill}>
                      <Text style={styles.orderPillText}>
                        Parada {dest.drop_order}
                      </Text>
                    </View>
                    <Text style={styles.destHeaderTitle}>
                      {dest.destination_name || `Destino #${index + 1}`}
                    </Text>
                  </View>

                  {destinations.length > 1 ? (
                    <TouchableOpacity
                      onPress={() => handleRemoveDestination(index)}
                      style={styles.deleteDestButton}
                    >
                      <Trash2 size={16} color={Palette.destructive} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Input
                  label="Nome da Instituição ou Ponto"
                  placeholder="Ex: Faculdade B - Mackenzie Higienópolis"
                  value={dest.destination_name}
                  onChangeText={(val) =>
                    handleUpdateDestination(index, 'destination_name', val)
                  }
                  icon={<Building size={16} color={Palette.slate400} />}
                />

                <Input
                  label="Endereço Completo de Desembarque"
                  placeholder="Ex: Rua da Consolação, 930 - Higienópolis"
                  value={dest.address}
                  onChangeText={(val) =>
                    handleUpdateDestination(index, 'address', val)
                  }
                  icon={<MapPin size={16} color={Palette.slate400} />}
                />
              </View>
            ))}

            <Button
              variant="outline"
              size="default"
              onPress={handleAddDestination}
              style={styles.addDestButton}
              icon={<Plus size={16} color={Palette.primary} />}
            >
              Adicionar Outro Destino Final
            </Button>
          </CardContent>
        </Card>

        {/* 3. Attach Existing Clients */}
        <Card style={styles.sectionCard}>
          <CardHeader>
            <View style={styles.sectionHeaderRow}>
              <View>
                <CardTitle>3. Vincular Alunos Cadastrados</CardTitle>
                <CardDescription>
                  Selecione quem participa e os dias da semana
                </CardDescription>
              </View>
              <Badge variant="info">
                {Object.keys(selectedClients).length} selecionado(s)
              </Badge>
            </View>
          </CardHeader>
          <CardContent>
            {availableClients.map((client) => {
              const isSelected = Boolean(selectedClients[client.id]);
              const clientState = selectedClients[client.id];

              return (
                <View
                  key={client.id}
                  style={[
                    styles.clientAssignCard,
                    isSelected && styles.clientAssignCardSelected,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.clientTopToggle}
                    onPress={() => toggleClientSelection(client.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxActive,
                      ]}
                    >
                      {isSelected ? (
                        <Check size={14} color={Palette.white} />
                      ) : null}
                    </View>

                    <View style={styles.clientInfoCol}>
                      <Text style={styles.clientName}>
                        {client.full_name || 'Aluno Cadastrado'}
                      </Text>
                      <Text style={styles.clientAddress}>
                        Embarque: {client.pickup_address}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Day of Week Selector when client is checked */}
                  {isSelected ? (
                    <View style={styles.daysContainer}>
                      <Text style={styles.daysLabel}>Dias da semana:</Text>
                      <View style={styles.daysRow}>
                        {ALL_DAYS.map((dayItem) => {
                          const isDayActive =
                            clientState?.days_of_week.includes(dayItem.value);
                          return (
                            <TouchableOpacity
                              key={dayItem.value}
                              style={[
                                styles.dayPill,
                                isDayActive && styles.dayPillActive,
                              ]}
                              onPress={() =>
                                toggleClientDay(client.id, dayItem.value)
                              }
                            >
                              <Text
                                style={[
                                  styles.dayPillText,
                                  isDayActive && styles.dayPillTextActive,
                                ]}
                              >
                                {dayItem.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          variant="default"
          size="lg"
          loading={loading}
          onPress={handleSubmit}
          style={styles.submitButton}
          icon={<CheckCircle2 size={20} color={Palette.white} />}
        >
          Salvar e Ativar Rota
        </Button>
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.slate900,
  },
  pageSubtitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  sectionCard: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate700,
    marginTop: 8,
    marginBottom: 6,
  },
  shiftSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  shiftChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: Palette.slate100,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
    alignItems: 'center',
  },
  shiftChipSelected: {
    backgroundColor: Palette.primaryLight,
    borderColor: Palette.primary,
  },
  shiftChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  shiftChipTextSelected: {
    color: Palette.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destinationCardItem: {
    backgroundColor: Palette.slate50,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: 12,
  },
  destCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  destBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderPill: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderPillText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  destHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
  },
  deleteDestButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: Palette.destructiveLight,
  },
  addDestButton: {
    marginTop: 4,
  },
  clientAssignCard: {
    backgroundColor: Palette.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
    marginBottom: 10,
  },
  clientAssignCardSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.slate50,
  },
  clientTopToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Palette.slate300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  clientInfoCol: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate800,
  },
  clientAddress: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  daysContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.slate200,
  },
  daysLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate600,
    marginBottom: 6,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate300,
  },
  dayPillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  dayPillTextActive: {
    color: Palette.white,
  },
  submitButton: {
    marginVertical: 12,
  },
});
