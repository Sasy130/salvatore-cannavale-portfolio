ALTER TABLE bookings ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
CREATE TABLE owner_payments (
 id TEXT PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES bookings(id),
 kind TEXT NOT NULL CHECK(kind IN ('receipt','refund')), amount INTEGER NOT NULL CHECK(amount>0),
 method TEXT NOT NULL CHECK(method IN ('cash','bank','pos','other')),
 note TEXT NOT NULL DEFAULT '', created TEXT NOT NULL, idempotency TEXT UNIQUE NOT NULL
);
CREATE INDEX owner_payments_booking ON owner_payments(booking_id);
CREATE TABLE owner_activity (
 id TEXT PRIMARY KEY, booking_id TEXT REFERENCES bookings(id), event TEXT NOT NULL,
 details TEXT NOT NULL DEFAULT '{}', created TEXT NOT NULL
);
CREATE INDEX owner_activity_created ON owner_activity(created);
CREATE TABLE owner_actions (
 idempotency TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, booking_id TEXT NOT NULL REFERENCES bookings(id),
 response TEXT NOT NULL, created TEXT NOT NULL
);
INSERT INTO schema_migrations(version) VALUES(2);
