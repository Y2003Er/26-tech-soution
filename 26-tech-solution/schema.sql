-- ============================================
-- 26 Tech Solution — Database Schema
-- ============================================

-- Jedwali la programu (apps)
CREATE TABLE IF NOT EXISTS apps (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200)  NOT NULL,
  slug          VARCHAR(200)  NOT NULL UNIQUE,
  category      VARCHAR(80)   NOT NULL,
  icon          VARCHAR(10)   NOT NULL DEFAULT '📦',
  description   TEXT          NOT NULL,
  version       VARCHAR(50)   NOT NULL,
  file_size     VARCHAR(30)   NOT NULL,
  os            VARCHAR(30)   NOT NULL DEFAULT 'Windows',
  is_free       BOOLEAN       NOT NULL DEFAULT true,
  download_url  TEXT          NOT NULL,
  views         INTEGER       NOT NULL DEFAULT 0,
  downloads     INTEGER       NOT NULL DEFAULT 0,
  is_featured   BOOLEAN       NOT NULL DEFAULT false,
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Jedwali la admin users
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Jedwali la download tokens (siri za link)
CREATE TABLE IF NOT EXISTS download_tokens (
  id         SERIAL PRIMARY KEY,
  token      VARCHAR(64)   NOT NULL UNIQUE,
  app_id     INTEGER       NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ   NOT NULL,
  used       BOOLEAN       NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index za kasi
CREATE INDEX IF NOT EXISTS idx_apps_category  ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_slug      ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_active    ON apps(is_active);
CREATE INDEX IF NOT EXISTS idx_tokens_token   ON download_tokens(token);

-- Trigger ya updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sample data
INSERT INTO apps (name, slug, category, icon, description, version, file_size, os, is_free, download_url, is_featured) VALUES
('Adobe Photoshop 2025', 'adobe-photoshop-2025', 'Design', '🎨',
 'Mhariri wa picha wa kitaalamu duniani — retouching, graphic design, digital art, na zaidi. Toleo kamili likiwa na plugins zote.',
 'v26.5', '3.2 GB', 'Windows', true, 'https://example.com/photoshop', true),

('Adobe Premiere Pro 2024', 'adobe-premiere-pro-2024', 'Design', '🎬',
 'Video editing ya kitaalamu na timeline za hali ya juu. Inajumuisha After Effects na Media Encoder.',
 'v24.4', '4.1 GB', 'Windows', true, 'https://example.com/premiere', false),

('Microsoft Office 2024', 'microsoft-office-2024', 'Office', '📄',
 'Word, Excel, PowerPoint, Outlook — pakiti kamili ya ofisi. Inafanya kazi bila internet.',
 '2024', '6.7 GB', 'Windows', true, 'https://example.com/office', true),

('NordVPN Premium', 'nordvpn-premium', 'Security', '🌐',
 'VPN ya kasi na servers zaidi ya 5,000 — fificha IP yako na ufikie maudhui yote duniani.',
 'v8.12', '180 MB', 'Windows', false, 'https://example.com/nordvpn', false),

('GTA V Premium Edition', 'gta-v-premium', 'Games', '🎮',
 'Mchezo maarufu zaidi duniani — Los Santos, missions nyingi, na online multiplayer.',
 'v1.68', '95 GB', 'Windows', true, 'https://example.com/gtav', true),

('Spotify Premium APK', 'spotify-premium-apk', 'Android', '🎵',
 'Sikiliza muziki wowote bila ads — offline mode imewezeshwa. Toleo la hivi karibuni.',
 'v8.9.12', '95 MB', 'Android', true, 'https://example.com/spotify', false),

('Windows 11 Pro ISO', 'windows-11-pro-iso', 'Windows', '🖥️',
 'Mfumo wa uendeshaji wa kisasa zaidi wa Microsoft — Intel na AMD. Tayari activated.',
 '23H2', '5.5 GB', 'Windows', true, 'https://example.com/win11', false),

('CCleaner Professional', 'ccleaner-professional', 'Windows', '🔧',
 'Safisha kompyuta yako, ongeza kasi, na linda faragha yako. Serial key imejumuishwa.',
 'v6.24', '45 MB', 'Windows', false, 'https://example.com/ccleaner', false)

ON CONFLICT (slug) DO NOTHING;
