export type InspectionStatus = "pending" | "confirmed" | "cancelled";

// Befaring booked from the website: we come out, measure the lawn and plan the
// installation.
export type Inspection = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
  postal_code: string | null;
  lawn_area: number | null;
  service: string;
  date: string;
  time: string;
  message: string | null;
  status: InspectionStatus;
  cancel_token: string;
  confirm_token: string | null;
  confirmed_at: string | null;
  created_at: string;
  cancelled_at: string | null;
};

export type AvailabilityDay = {
  id: string;
  date: string;
  is_closed: boolean;
  slots: string[];
  /** Tidene som allerede er bestilt fra nettsiden. Ligger ikke i tabellen, men
   *  hentes sammen med dagen så oversikten viser hva som faktisk er ledig. */
  booked?: string[];
};

export const BOOKING_TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;
