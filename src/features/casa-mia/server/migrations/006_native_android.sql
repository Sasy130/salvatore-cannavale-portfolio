CREATE TABLE native_devices (
 id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, token TEXT NOT NULL,
 label TEXT NOT NULL, project_id TEXT NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
 created TEXT NOT NULL,last_seen TEXT NOT NULL
);
CREATE TABLE native_push_outbox (
 id TEXT PRIMARY KEY,dedupe_key TEXT UNIQUE NOT NULL,device_id TEXT NOT NULL REFERENCES native_devices(id),
 booking_id TEXT REFERENCES bookings(id),kind TEXT NOT NULL CHECK(kind IN ('booking','test')),
 status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sending','accepted','review','superseded','expired')),
 attempts INTEGER NOT NULL DEFAULT 0,next_attempt BIGINT NOT NULL DEFAULT 0,locked_until BIGINT,deadline BIGINT NOT NULL,
 created TEXT NOT NULL,accepted_at TEXT,last_error TEXT
);
CREATE INDEX native_push_due ON native_push_outbox(status,next_attempt);
INSERT INTO schema_migrations(version) VALUES(6);
