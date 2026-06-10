INSERT INTO "User" (id, name, email) VALUES ('dev-user-bypass', 'Dev User', 'dev@pulsetrack.local') ON CONFLICT (id) DO NOTHING;
