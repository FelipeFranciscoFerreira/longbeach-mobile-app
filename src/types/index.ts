export type UserRole = 'DRIVER' | 'CLIENT' | 'ADMIN';

export type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'
  | 'ALL';

export type AttendanceStatus = 'CONFIRMED' | 'ABSENT' | 'PENDING';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  company_id: string;
  cnh: string;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_capacity: number;
  is_available: boolean;
  current_latitude?: number;
  current_longitude?: number;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  company_id: string;
  full_name?: string;
  phone?: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_address?: string;
  destination_latitude?: number;
  destination_longitude?: number;
  notes?: string;
  is_active: boolean;
}

export interface TripDestination {
  id: string;
  trip_id?: string;
  destination_name: string;
  address: string;
  latitude: number;
  longitude: number;
  drop_order: number;
}

export interface TripClient {
  id: string;
  trip_id: string;
  client_id: string;
  client?: ClientProfile;
  days_of_week: DayOfWeek[];
  destination_id?: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  company_id: string;
  name: string;
  shift: Shift;
  origin_address: string;
  origin_latitude: number;
  origin_longitude: number;
  is_active: boolean;
  destinations: TripDestination[];
  clients: TripClient[];
  created_at?: string;
}

export interface DailyAttendance {
  id: string;
  trip_id: string;
  client_id: string;
  trip_date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  confirmed_at?: string;
  client_name?: string;
  pickup_address?: string;
}

export interface RouteStop {
  stop_type: 'ORIGIN' | 'PICKUP' | 'DESTINATION';
  client_id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  eta_time: string;
  passengers_count?: number;
}

export interface RouteCalculationResponse {
  trip_id: string;
  target_date: string;
  total_distance_km: number;
  estimated_duration_minutes: number;
  confirmed_passengers_count: number;
  ordered_stops: RouteStop[];
}

export interface AuthSession {
  token: string;
  user: User;
  driverProfile?: DriverProfile;
  clientProfile?: ClientProfile;
}
