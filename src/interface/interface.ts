// interface.ts

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// ========== Parking Histories ==========
export interface ParkingHistory {
  id: string;
  status: string;
  parked_at: FirestoreTimestamp;
  exited_at: FirestoreTimestamp;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
}

// ========== Parking Activities ==========
export interface ParkingActivity {
  id: string;
  student_id: string;
  parking_history_id: string;
  parking_lot_id: string;
  vehicle_in_count: number;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
}

// ========== Parking Attendants ==========
export interface ParkingAttendant {
  id: string;
  name: string;
  email: string;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
  deleted_at: FirestoreTimestamp | null;
}

// ========== Parking Lots ==========
export interface ParkingLot {
  id: string;
  name: string;
  max_capacity: number;
  latitude: number;
  longitude: number;
  is_active: boolean;
  inactive_description: string;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
  deleted_at: FirestoreTimestamp | null;
}

// ========== Parking Assignments ==========
export interface ParkingAssignment {
  id: string;
  parking_lot_id: string;
  parking_schedule_id: string;
  parking_attendant_id: string;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
  deleted_at: FirestoreTimestamp | null;
}

// ========== Parking Schedules ==========
export interface ParkingSchedule {
  id: string;
  day_of_week: string;
  open_time: string;
  closed_time: string;
  is_closed: boolean;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
  deleted_at: FirestoreTimestamp | null;
}

// ========== Students ==========
export interface Student {
  id: string;
  qr_code_id: string;
  name: string;
  nim: string;
  email: string;
  password: string;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
  deleted_at: FirestoreTimestamp | null;
}

// ========== Vehicles ==========
export interface Vehicle {
  id: string;
  student_id: string;
  plate: string;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
  deleted_at: FirestoreTimestamp | null;
}

// ========== Admins ==========
export interface Admin {
  id: string;
  name: string;
  email: string;
  created_at: FirestoreTimestamp;
  updated_at: FirestoreTimestamp;
  deleted_at: FirestoreTimestamp | null;
}


export const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
export const dayLabels: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};
