CREATE TABLE push_devices (
 id TEXT PRIMARY KEY, endpoint_hash TEXT UNIQUE NOT NULL, endpoint TEXT NOT NULL,
 p256dh TEXT NOT NULL, auth TEXT NOT NULL, key_fingerprint TEXT NOT NULL,
 label TEXT NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
 created TEXT NOT NULL, last_seen TEXT NOT NULL
);
CREATE TABLE push_outbox (
 id TEXT PRIMARY KEY, dedupe_key TEXT UNIQUE NOT NULL,
 device_id TEXT NOT NULL REFERENCES push_devices(id), booking_id TEXT REFERENCES bookings(id),
 kind TEXT NOT NULL CHECK(kind IN ('booking','test')),
 status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sending','accepted','review','superseded','expired')),
 attempts INTEGER NOT NULL DEFAULT 0, next_attempt BIGINT NOT NULL DEFAULT 0,
 locked_until BIGINT, deadline BIGINT NOT NULL, created TEXT NOT NULL, accepted_at TEXT, last_error TEXT
);
CREATE INDEX push_outbox_due ON push_outbox(status,next_attempt);
CREATE INDEX push_outbox_device ON push_outbox(device_id);
INSERT INTO schema_migrations(version) VALUES(5);
