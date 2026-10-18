import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Trip,
  DailyAttendance,
  ClientProfile,
  AttendanceStatus,
  RouteCalculationResponse,
  RouteStop,
  Shift,
  DayOfWeek,
} from '@/types';
import {
  INITIAL_TRIPS,
  INITIAL_ATTENDANCES,
  MOCK_ALL_CLIENTS,
  MOCK_TRIP_HISTORY,
  MOCK_DRIVER_USER,
  MOCK_DRIVER_PROFILE,
  MOCK_CLIENT_USER,
  MOCK_CLIENT_PROFILE,
} from './mockData';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// In-memory / storage sync state
let localTrips: Trip[] = [...INITIAL_TRIPS];
let localAttendances: DailyAttendance[] = [...INITIAL_ATTENDANCES];

// Helper to attempt fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 1500
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const ApiService = {
  /**
   * Login user
   */
  async login(email: string, password: string) {
    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        2000
      );

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback to local authentication
    }

    // Local fallback check
    if (email === 'motorista@longbeach.com' || email.includes('motorista')) {
      return {
        access_token: 'mock-jwt-driver-token',
        token_type: 'bearer',
        user_id: MOCK_DRIVER_USER.id,
        email: MOCK_DRIVER_USER.email,
        full_name: MOCK_DRIVER_USER.full_name,
        role: 'DRIVER' as const,
        driver_id: MOCK_DRIVER_PROFILE.id,
        client_id: null,
      };
    } else {
      return {
        access_token: 'mock-jwt-client-token',
        token_type: 'bearer',
        user_id: MOCK_CLIENT_USER.id,
        email: MOCK_CLIENT_USER.email,
        full_name: MOCK_CLIENT_USER.full_name,
        role: 'CLIENT' as const,
        driver_id: null,
        client_id: MOCK_CLIENT_PROFILE.id,
      };
    }
  },

  /**
   * Get all trips (for driver or client)
   */
  async getTrips(): Promise<Trip[]> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const response = await fetchWithTimeout(`${BASE_URL}/trips`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Offline fallback
    }
    return localTrips;
  },

  /**
   * Get single trip
   */
  async getTrip(tripId: string): Promise<Trip | undefined> {
    const trips = await this.getTrips();
    return trips.find((t) => t.id === tripId);
  },

  /**
   * Create new trip
   */
  async createTrip(data: {
    name: string;
    shift: Shift;
    origin_address: string;
    origin_latitude?: number;
    origin_longitude?: number;
    destinations: Array<{
      destination_name: string;
      address: string;
      latitude?: number;
      longitude?: number;
      drop_order: number;
    }>;
    clients?: Array<{
      client_id: string;
      days_of_week: DayOfWeek[];
      destination_id?: string;
    }>;
  }): Promise<Trip> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const response = await fetchWithTimeout(`${BASE_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const newTrip = await response.json();
        localTrips.unshift(newTrip);
        return newTrip;
      }
    } catch {
      // Offline fallback
    }

    const tripId = `trip-${Date.now()}`;
    const mappedDestinations = data.destinations.map((d, index) => ({
      id: `dest-${Date.now()}-${index}`,
      trip_id: tripId,
      destination_name: d.destination_name,
      address: d.address,
      latitude: d.latitude || -23.55 + index * 0.01,
      longitude: d.longitude || -46.65 + index * 0.01,
      drop_order: d.drop_order,
    }));

    const mappedClients = (data.clients || []).map((c, index) => {
      const clientProfile = MOCK_ALL_CLIENTS.find(
        (cli) => cli.id === c.client_id
      );
      return {
        id: `tc-${Date.now()}-${index}`,
        trip_id: tripId,
        client_id: c.client_id,
        client: clientProfile,
        days_of_week: c.days_of_week,
        destination_id: c.destination_id || mappedDestinations[0]?.id,
      };
    });

    const newTrip: Trip = {
      id: tripId,
      driver_id: MOCK_DRIVER_PROFILE.id,
      company_id: 'cmp-1',
      name: data.name,
      shift: data.shift,
      origin_address: data.origin_address,
      origin_latitude: data.origin_latitude || -23.567,
      origin_longitude: data.origin_longitude || -46.68,
      is_active: true,
      destinations: mappedDestinations,
      clients: mappedClients,
      created_at: new Date().toISOString(),
    };

    localTrips = [newTrip, ...localTrips];
    return newTrip;
  },

  /**
   * List available clients in company
   */
  async getAvailableClients(): Promise<ClientProfile[]> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const response = await fetchWithTimeout(`${BASE_URL}/clients`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Offline
    }
    return MOCK_ALL_CLIENTS;
  },

  /**
   * Get attendance for a trip and specific date
   */
  async getTripAttendance(
    tripId: string,
    tripDate: string
  ): Promise<DailyAttendance[]> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const response = await fetchWithTimeout(
        `${BASE_URL}/trips/${tripId}/attendance?trip_date=${tripDate}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Offline
    }

    return localAttendances.filter(
      (a) => a.trip_id === tripId && a.trip_date === tripDate
    );
  },

  /**
   * Submit daily attendance (Check-in: CONFIRMED or ABSENT)
   */
  async submitDailyAttendance(
    tripId: string,
    tripDate: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<DailyAttendance> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const response = await fetchWithTimeout(
        `${BASE_URL}/trips/${tripId}/attendance?trip_date=${tripDate}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status, notes }),
        }
      );
      if (response.ok) {
        const result = await response.json();
        // Update local
        const index = localAttendances.findIndex(
          (a) => a.trip_id === tripId && a.trip_date === tripDate
        );
        if (index >= 0) localAttendances[index] = result;
        else localAttendances.push(result);
        return result;
      }
    } catch {
      // Offline fallback
    }

    // Local state update
    const existingIndex = localAttendances.findIndex(
      (a) =>
        a.trip_id === tripId &&
        a.trip_date === tripDate &&
        a.client_id === MOCK_CLIENT_PROFILE.id
    );

    const record: DailyAttendance = {
      id:
        existingIndex >= 0
          ? localAttendances[existingIndex].id
          : `att-${Date.now()}`,
      trip_id: tripId,
      client_id: MOCK_CLIENT_PROFILE.id,
      trip_date: tripDate,
      status,
      notes: notes || '',
      confirmed_at: new Date().toISOString(),
      client_name: MOCK_CLIENT_USER.full_name,
      pickup_address: MOCK_CLIENT_PROFILE.pickup_address,
    };

    if (existingIndex >= 0) {
      localAttendances[existingIndex] = record;
    } else {
      localAttendances.push(record);
    }

    return record;
  },

  /**
   * Calculate optimized route (TSP) for confirmed clients on a date
   */
  async calculateRoute(
    tripId: string,
    tripDate: string
  ): Promise<RouteCalculationResponse> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const response = await fetchWithTimeout(
        `${BASE_URL}/trips/${tripId}/calculate-route?trip_date=${tripDate}`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Offline calculation simulation
    }

    const trip = localTrips.find((t) => t.id === tripId) || localTrips[0];
    const attendances = localAttendances.filter(
      (a) =>
        a.trip_id === tripId &&
        a.trip_date === tripDate &&
        a.status === 'CONFIRMED'
    );

    const stops: RouteStop[] = [
      {
        stop_type: 'ORIGIN',
        name: 'Ponto de Partida (Garagem)',
        address: trip.origin_address,
        latitude: trip.origin_latitude,
        longitude: trip.origin_longitude,
        eta_time: '06:15',
        passengers_count: 0,
      },
    ];

    // Add confirmed clients
    const confirmedClients = attendances.length > 0
      ? attendances
      : [
          {
            client_name: 'Maria Estudante',
            pickup_address: 'Av. Paulista, 1000 - Bela Vista',
          },
          {
            client_name: 'Lucas Aluno',
            pickup_address: 'Rua Oscar Freire, 800 - Jardins',
          },
        ];

    confirmedClients.forEach((c, idx) => {
      stops.push({
        stop_type: 'PICKUP',
        client_id: `cli-${idx}`,
        name: `Embarque: ${c.client_name}`,
        address: c.pickup_address || 'Endereço cadastrado',
        latitude: -23.56 + idx * 0.005,
        longitude: -46.66 + idx * 0.005,
        eta_time: `06:${35 + idx * 12}`,
        passengers_count: 1,
      });
    });

    // Add destinations in drop order
    trip.destinations
      .sort((a, b) => a.drop_order - b.drop_order)
      .forEach((d, idx) => {
        stops.push({
          stop_type: 'DESTINATION',
          name: `Desembarque: ${d.destination_name}`,
          address: d.address,
          latitude: d.latitude,
          longitude: d.longitude,
          eta_time: `07:${20 + idx * 15}`,
        });
      });

    return {
      trip_id: tripId,
      target_date: tripDate,
      total_distance_km: 19.5,
      estimated_duration_minutes: 55,
      confirmed_passengers_count: confirmedClients.length,
      ordered_stops: stops,
    };
  },

  /**
   * Get trip history
   */
  async getTripHistory(role: 'DRIVER' | 'CLIENT') {
    return MOCK_TRIP_HISTORY.filter((item) => {
      if (role === 'CLIENT') {
        return Boolean(item.user_attendance);
      }
      return true;
    });
  },
};
