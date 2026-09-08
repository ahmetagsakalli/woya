CREATE TABLE IF NOT EXISTS woya_admin_credentials (
 identity text PRIMARY KEY CHECK (identity = 'woya-admin'),
 password_hash text NOT NULL,
 version integer NOT NULL DEFAULT 1 CHECK (version > 0),
 changed_at timestamptz
);
ALTER TABLE woya_sessions ADD COLUMN IF NOT EXISTS credential_version integer NOT NULL DEFAULT 1;

-- Older deployments insert version 1. Once the password changes, reject those sessions too.
CREATE OR REPLACE FUNCTION woya_check_session_credential_version() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM identity FROM woya_admin_credentials
 WHERE identity=NEW.identity AND version=NEW.credential_version FOR SHARE;
 IF NOT FOUND THEN
  RAISE EXCEPTION 'STALE_ADMIN_CREDENTIAL' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS woya_session_credential_guard ON woya_sessions;
CREATE TRIGGER woya_session_credential_guard BEFORE INSERT OR UPDATE OF identity,credential_version ON woya_sessions
 FOR EACH ROW EXECUTE FUNCTION woya_check_session_credential_version();
