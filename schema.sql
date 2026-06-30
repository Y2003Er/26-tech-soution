-- ============================================
-- 26 Tech Solution - Database Schema (v2)
-- ============================================

-- Jedwali la programu (apps)
CREATE TABLE IF NOT EXISTS apps (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(200)  NOT NULL,
  slug               VARCHAR(200)  NOT NULL UNIQUE,
  category           VARCHAR(80)   NOT NULL,
  icon_file_id       VARCHAR(500),
  description        TEXT          NOT NULL,
  version            VARCHAR(50)   NOT NULL,
  file_size          VARCHAR(30)   NOT NULL,
  os                 VARCHAR(30)   NOT NULL DEFAULT 'Windows',
  is_free            BOOLEAN       NOT NULL DEFAULT true,
  download_url       TEXT          NOT NULL,
  views              INTEGER       NOT NULL DEFAULT 0,
  downloads          INTEGER       NOT NULL DEFAULT 0,
  is_featured        BOOLEAN       NOT NULL DEFAULT false,
  is_active          BOOLEAN       NOT NULL DEFAULT true,

  -- Fields mpya (LiteAPKs-style)
  developer          VARCHAR(150)  DEFAULT 'Verified Publisher',
  package_name       VARCHAR(150),
  rating             NUMERIC(2,1)  DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  mod_info           VARCHAR(200),
  badges             TEXT[]        DEFAULT '{}',
  screenshots        TEXT[]        DEFAULT '{}',
  is_editors_choice  BOOLEAN       NOT NULL DEFAULT false,

  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Jedwali la categories (kwa collections / background images)
CREATE TABLE IF NOT EXISTS categories (
  category            VARCHAR(80) PRIMARY KEY,
  category_image_url  TEXT
);

-- Jedwali la admin users (email-based auth)
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255)  UNIQUE,
  username      VARCHAR(100),
  password      VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index za kasi
CREATE INDEX IF NOT EXISTS idx_apps_category  ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_slug      ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_active    ON apps(is_active);
CREATE INDEX IF NOT EXISTS idx_apps_rating    ON apps(rating DESC);

-- Trigger ya updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Hakuna sample data ya apps hapa kwa makusudi.
-- Ongeza apps zako halali kupitia /admin/apps/new baada ya kuanzisha seva.