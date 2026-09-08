CREATE TABLE IF NOT EXISTS woya_categories (
 id text PRIMARY KEY, data jsonb NOT NULL, version integer NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS woya_products (
 id uuid PRIMARY KEY, slug text UNIQUE NOT NULL, code text NOT NULL,
 category_id text NOT NULL REFERENCES woya_categories(id), data jsonb NOT NULL,
 version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS woya_products_category ON woya_products(category_id);
CREATE TABLE IF NOT EXISTS woya_content (id text PRIMARY KEY, data jsonb NOT NULL, version integer NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS woya_orders (
 id uuid PRIMARY KEY, request_id uuid UNIQUE NOT NULL, reference text UNIQUE NOT NULL,
 status text NOT NULL DEFAULT 'yeni' CHECK(status IN ('yeni','gorusuluyor','onaylandi','hazirlaniyor','kargoda','tamamlandi','iptal')),
 customer jsonb NOT NULL, items jsonb NOT NULL, note text NOT NULL, internal_note text NOT NULL DEFAULT '',
 history jsonb NOT NULL DEFAULT '[]', version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS woya_orders_recent ON woya_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS woya_orders_status ON woya_orders(status);
CREATE TABLE IF NOT EXISTS woya_sessions (token_hash text PRIMARY KEY, identity text NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS woya_rate_limits (key text PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS woya_media (url text PRIMARY KEY, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS woya_audit (id bigserial PRIMARY KEY, actor text NOT NULL, action text NOT NULL, entity text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
