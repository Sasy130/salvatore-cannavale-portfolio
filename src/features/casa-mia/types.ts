export type Booking = {
  id: string;
  checkin: string;
  checkout: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  source: string;
  total: number;
  due: number;
  payment: string;
  status: string;
  created: string;
  revision: number;
};
export type Payment = {
  id: string;
  booking_id: string;
  kind: "receipt" | "refund";
  amount: number;
  method: string;
  note: string;
  created: string;
  idempotency: string;
};
export type Activity = {
  id: string;
  booking_id: string;
  event: string;
  details: string;
  created: string;
};
export type Settings = {
  baseRate: number;
  summerRate: number;
  cleaning: number;
  minStay: number;
  summerMinStay: number;
  depositPercent: number;
  payOnArrival: boolean;
  fullOnline: boolean;
  depositOnline: boolean;
  manualConfirmation: boolean;
  blockedDates: string[];
  assets: Record<string, string>;
};
export type OwnerData = {
  bookings: Booking[];
  payments: Payment[];
  activity: Activity[];
  settings: Settings;
  stripeReady: boolean;
  emailReady: boolean;
  schemaVersion: number;
  actions?: Record<string, { fingerprint: string; response: unknown }>;
};
export type Service = {
  configured: boolean;
  enabled: boolean;
  unavailable?: boolean;
  schemaVersion?: number;
};
export type ReservationInput = {
  bookingId?: string;
  revision?: number;
  kind: "booking" | "block";
  checkin: string;
  checkout: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  source: string;
  amount?: number;
  idempotency: string;
};
export type Preview = {
  ok: boolean;
  conflicts: Pick<Booking, "id" | "name" | "checkin" | "checkout" | "status">[];
  ruleBlocks: string[];
  nights: number;
  checkin: string;
  checkout: string;
  lastNight: string;
  total: number;
  subtotal: number;
  cleaning: number;
  registered: number;
  financialConflict: boolean;
};
export type PaymentInput = {
  bookingId: string;
  kind: "receipt" | "refund";
  amount: number;
  method: string;
  note: string;
  idempotency: string;
};
export type Tab =
  | "overview"
  | "calendar"
  | "reservations"
  | "finance"
  | "settings";
