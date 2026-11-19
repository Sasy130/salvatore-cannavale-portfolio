CREATE TABLE payment_receipts (
 id TEXT PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES bookings(id),
 stripe_session TEXT NOT NULL UNIQUE, payment_intent TEXT UNIQUE,
 amount INTEGER NOT NULL CHECK(amount>0), currency TEXT NOT NULL CHECK(currency='eur'),
 mode TEXT NOT NULL CHECK(mode IN ('test','live')), issued TEXT NOT NULL, snapshot TEXT NOT NULL
);
CREATE TABLE email_outbox (
 id TEXT PRIMARY KEY, dedupe_key TEXT UNIQUE NOT NULL, booking_id TEXT NOT NULL REFERENCES bookings(id),
 receipt_id TEXT REFERENCES payment_receipts(id), kind TEXT NOT NULL CHECK(kind IN ('confirmation','receipt')),
 recipient TEXT NOT NULL, payload TEXT NOT NULL, envelope TEXT,
 status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sending','sent','review','superseded')),
 attempts INTEGER NOT NULL DEFAULT 0, next_attempt BIGINT NOT NULL DEFAULT 0, locked_until BIGINT,
 first_attempt BIGINT, provider_id TEXT, last_error TEXT, created TEXT NOT NULL, sent_at TEXT
);
CREATE INDEX email_outbox_due ON email_outbox(status,next_attempt);
CREATE INDEX email_outbox_booking ON email_outbox(booking_id);
INSERT INTO schema_migrations(version) VALUES(4);
