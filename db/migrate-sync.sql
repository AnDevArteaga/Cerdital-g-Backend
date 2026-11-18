-- Para la base que ya está en uso. No borra filas.
-- En una base nueva basta db/schema.sql.

ALTER TABLE lotes ADD COLUMN IF NOT EXISTS client_id UUID DEFAULT gen_random_uuid();
ALTER TABLE lotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE lotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE lotes SET client_id = gen_random_uuid() WHERE client_id IS NULL;
UPDATE lotes SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE lotes ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE lotes ALTER COLUMN updated_at SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS lotes_client_id_uidx ON lotes (client_id);
CREATE INDEX IF NOT EXISTS lotes_usuario_updated_idx ON lotes (id_usuario, updated_at);

ALTER TABLE costos ADD COLUMN IF NOT EXISTS client_id UUID DEFAULT gen_random_uuid();
ALTER TABLE costos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE costos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE costos SET client_id = gen_random_uuid() WHERE client_id IS NULL;
UPDATE costos SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE costos ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE costos ALTER COLUMN updated_at SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS costos_client_id_uidx ON costos (client_id);
CREATE INDEX IF NOT EXISTS costos_usuario_updated_idx ON costos (id_usuario, updated_at);

ALTER TABLE alimentacion ADD COLUMN IF NOT EXISTS client_id UUID DEFAULT gen_random_uuid();
ALTER TABLE alimentacion ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE alimentacion ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE alimentacion SET client_id = gen_random_uuid() WHERE client_id IS NULL;
UPDATE alimentacion SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE alimentacion ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE alimentacion ALTER COLUMN updated_at SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS alimentacion_client_id_uidx ON alimentacion (client_id);
CREATE INDEX IF NOT EXISTS alimentacion_usuario_updated_idx ON alimentacion (id_usuario, updated_at);

ALTER TABLE salud_tratamiento ADD COLUMN IF NOT EXISTS client_id UUID DEFAULT gen_random_uuid();
ALTER TABLE salud_tratamiento ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE salud_tratamiento ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE salud_tratamiento SET client_id = gen_random_uuid() WHERE client_id IS NULL;
UPDATE salud_tratamiento SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE salud_tratamiento ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE salud_tratamiento ALTER COLUMN updated_at SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS salud_client_id_uidx ON salud_tratamiento (client_id);
CREATE INDEX IF NOT EXISTS salud_usuario_updated_idx ON salud_tratamiento (id_usuario, updated_at);

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS client_id UUID DEFAULT gen_random_uuid();
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE ventas SET client_id = gen_random_uuid() WHERE client_id IS NULL;
UPDATE ventas SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE ventas ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE ventas ALTER COLUMN updated_at SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ventas_client_id_uidx ON ventas (client_id);
CREATE INDEX IF NOT EXISTS ventas_usuario_updated_idx ON ventas (id_usuario, updated_at);

ALTER TABLE progreso ADD COLUMN IF NOT EXISTS client_id UUID DEFAULT gen_random_uuid();
ALTER TABLE progreso ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE progreso ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE progreso SET client_id = gen_random_uuid() WHERE client_id IS NULL;
UPDATE progreso SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE progreso ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE progreso ALTER COLUMN updated_at SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS progreso_client_id_uidx ON progreso (client_id);
CREATE INDEX IF NOT EXISTS progreso_usuario_updated_idx ON progreso (id_usuario, updated_at);

ALTER TABLE agenda ADD COLUMN IF NOT EXISTS client_id UUID DEFAULT gen_random_uuid();
ALTER TABLE agenda ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE agenda ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
UPDATE agenda SET client_id = gen_random_uuid() WHERE client_id IS NULL;
UPDATE agenda SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE agenda ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE agenda ALTER COLUMN updated_at SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS agenda_client_id_uidx ON agenda (client_id);
CREATE INDEX IF NOT EXISTS agenda_usuario_updated_idx ON agenda (id_usuario, updated_at);
