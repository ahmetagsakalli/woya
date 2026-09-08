ALTER TABLE woya_orders ADD COLUMN IF NOT EXISTS payment jsonb;

CREATE TABLE IF NOT EXISTS woya_payments (
  merchant_oid text PRIMARY KEY CHECK (merchant_oid ~ '^[A-Za-z0-9]{1,64}$'),
  order_id uuid NOT NULL UNIQUE REFERENCES woya_orders(id),
  request_id uuid NOT NULL UNIQUE,
  owner_hash text NOT NULL,
  input_hash text NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  test_mode boolean NOT NULL,
  state text NOT NULL CHECK (state IN ('creating','ready','pending','paid','failed','review','token_failed')),
  iframe_token text,
  callback_hash text,
  received_amount bigint,
  consent_version text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 minutes'
);
CREATE INDEX IF NOT EXISTS woya_payments_owner ON woya_payments(owner_hash, created_at DESC);
