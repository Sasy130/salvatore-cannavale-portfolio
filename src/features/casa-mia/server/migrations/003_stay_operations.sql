ALTER TABLE bookings ADD COLUMN operations TEXT NOT NULL DEFAULT '{}';
WITH updated AS (
 UPDATE bookings SET status='confirmed',revision=revision+1 WHERE status='pending' AND payment='arrival' RETURNING id
) INSERT INTO owner_activity(id,booking_id,event,details,created)
 SELECT 'auto-confirm-' || id,id,'reservation_confirmed','{"reason":"owner_policy_v3"}',to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') FROM updated;
UPDATE settings SET value=(value::jsonb || '{"manualConfirmation":false}'::jsonb)::text;
INSERT INTO schema_migrations(version) VALUES(3);
