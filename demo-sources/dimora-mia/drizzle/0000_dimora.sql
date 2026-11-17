CREATE TABLE settings (id INTEGER PRIMARY KEY, value TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE bookings (id TEXT PRIMARY KEY, checkin TEXT NOT NULL, checkout TEXT NOT NULL, guests INTEGER NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, total INTEGER NOT NULL, due INTEGER NOT NULL, payment TEXT NOT NULL, status TEXT NOT NULL, created TEXT NOT NULL, expires INTEGER, stripe_session TEXT, idempotency TEXT UNIQUE NOT NULL);
--> statement-breakpoint
CREATE TABLE nights (date TEXT PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES bookings(id));
--> statement-breakpoint
CREATE TABLE sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX bookings_status ON bookings(status);
