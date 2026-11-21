CREATE TABLE native_auth_devices (
 id TEXT PRIMARY KEY, credential_hash TEXT UNIQUE NOT NULL, password_fingerprint TEXT NOT NULL,
 label TEXT NOT NULL, expires BIGINT NOT NULL, revoked BOOLEAN NOT NULL DEFAULT FALSE,
 created TEXT NOT NULL,last_used TEXT,session_hash TEXT
);
ALTER TABLE sessions ADD COLUMN native_auth_id TEXT REFERENCES native_auth_devices(id);
CREATE INDEX sessions_native_auth ON sessions(native_auth_id);
CREATE INDEX native_auth_expiry ON native_auth_devices(expires,revoked);
INSERT INTO schema_migrations(version) VALUES(7);
