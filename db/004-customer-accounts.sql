-- Additive and rerunnable. Execute explicitly against an approved database only.
CREATE INDEX IF NOT EXISTS woya_rate_limits_expiry ON woya_rate_limits(expires_at);
CREATE TABLE IF NOT EXISTS woya_customers (
 id uuid PRIMARY KEY, email text UNIQUE NOT NULL CHECK (email=lower(email)),
 password_hash text NOT NULL, first_name text NOT NULL, last_name text NOT NULL, phone text NOT NULL DEFAULT '',
 verified_at timestamptz, credential_version integer NOT NULL DEFAULT 1,
 closure_requested_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS woya_customer_sessions (
 token_hash text PRIMARY KEY, customer_id uuid NOT NULL REFERENCES woya_customers(id) ON DELETE CASCADE,
 credential_version integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS woya_customer_sessions_owner ON woya_customer_sessions(customer_id,expires_at);
CREATE TABLE IF NOT EXISTS woya_addresses (
 id uuid PRIMARY KEY, customer_id uuid NOT NULL REFERENCES woya_customers(id) ON DELETE CASCADE,
 data jsonb NOT NULL, delivery_default boolean NOT NULL DEFAULT false, billing_default boolean NOT NULL DEFAULT false,
 version integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS woya_addresses_owner ON woya_addresses(customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS woya_addresses_delivery ON woya_addresses(customer_id) WHERE delivery_default;
CREATE UNIQUE INDEX IF NOT EXISTS woya_addresses_billing ON woya_addresses(customer_id) WHERE billing_default;
ALTER TABLE woya_orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES woya_customers(id) ON DELETE RESTRICT;
ALTER TABLE woya_orders ADD COLUMN IF NOT EXISTS billing jsonb;
ALTER TABLE woya_orders ADD COLUMN IF NOT EXISTS shipment jsonb;
CREATE INDEX IF NOT EXISTS woya_orders_customer ON woya_orders(customer_id,created_at DESC,id);
CREATE TABLE IF NOT EXISTS woya_customer_tokens (
 token_hash text PRIMARY KEY, purpose text NOT NULL CHECK(purpose IN ('verify','reset','email','guest')),
 customer_id uuid REFERENCES woya_customers(id) ON DELETE CASCADE,
 order_id uuid REFERENCES woya_orders(id) ON DELETE CASCADE,
 email text NOT NULL, credential_version integer, expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((purpose='guest' AND order_id IS NOT NULL AND customer_id IS NULL) OR (purpose<>'guest' AND customer_id IS NOT NULL AND order_id IS NULL))
);
CREATE INDEX IF NOT EXISTS woya_customer_tokens_owner ON woya_customer_tokens(customer_id,purpose);
CREATE INDEX IF NOT EXISTS woya_customer_tokens_expiry ON woya_customer_tokens(expires_at);
CREATE TABLE IF NOT EXISTS woya_guest_sessions (
 token_hash text PRIMARY KEY, order_id uuid NOT NULL REFERENCES woya_orders(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS woya_guest_sessions_order ON woya_guest_sessions(order_id);
CREATE TABLE IF NOT EXISTS woya_customer_carts (
 customer_id uuid PRIMARY KEY REFERENCES woya_customers(id) ON DELETE CASCADE,
 items jsonb NOT NULL DEFAULT '[]', version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS woya_cart_merges (
 merge_id uuid PRIMARY KEY, customer_id uuid NOT NULL REFERENCES woya_customers(id) ON DELETE CASCADE,
 input_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS woya_order_requests (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES woya_orders(id) ON DELETE RESTRICT,
 request_id uuid UNIQUE NOT NULL, kind text NOT NULL CHECK(kind IN ('cancel','return','support')),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewing','approved','rejected','closed')),
 version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(),
 history jsonb NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS woya_order_requests_order ON woya_order_requests(order_id,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS woya_order_requests_active ON woya_order_requests(order_id,kind) WHERE status IN ('open','reviewing','approved');
CREATE TABLE IF NOT EXISTS woya_order_messages (
 id uuid PRIMARY KEY, request_id uuid NOT NULL REFERENCES woya_order_requests(id) ON DELETE RESTRICT,
 submission_id uuid UNIQUE NOT NULL, operation_hash text, author text NOT NULL CHECK(author IN ('customer','admin')),
 body text NOT NULL CHECK(length(body) BETWEEN 1 AND 3000), created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE woya_order_messages ADD COLUMN IF NOT EXISTS operation_hash text;
CREATE INDEX IF NOT EXISTS woya_order_messages_request ON woya_order_messages(request_id,created_at,id);
-- Snapshot fields cannot be changed by customer/admin edits or later catalog changes.
CREATE OR REPLACE FUNCTION woya_protect_order_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.customer IS DISTINCT FROM OLD.customer OR NEW.items IS DISTINCT FROM OLD.items
 OR NEW.billing IS DISTINCT FROM OLD.billing OR NEW.reference IS DISTINCT FROM OLD.reference
 OR NEW.request_id IS DISTINCT FROM OLD.request_id OR NEW.created_at IS DISTINCT FROM OLD.created_at
 OR NEW.note IS DISTINCT FROM OLD.note
 OR (OLD.payment IS NOT NULL AND (NEW.payment IS NULL OR NEW.payment->'amount' IS DISTINCT FROM OLD.payment->'amount'
 OR NEW.payment->'shipping' IS DISTINCT FROM OLD.payment->'shipping' OR NEW.payment->'merchantOid' IS DISTINCT FROM OLD.payment->'merchantOid'))
 THEN RAISE EXCEPTION 'Order snapshot is immutable' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS woya_order_snapshot_guard ON woya_orders;
CREATE TRIGGER woya_order_snapshot_guard BEFORE UPDATE ON woya_orders FOR EACH ROW EXECUTE FUNCTION woya_protect_order_snapshot();
