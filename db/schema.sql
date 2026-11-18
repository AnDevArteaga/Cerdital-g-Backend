CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    contrasena TEXT NOT NULL,
    token TEXT,
    rol TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'superadmin'))
);

CREATE TABLE IF NOT EXISTS fases (
    id_fase SERIAL PRIMARY KEY,
    nombre_fase TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tipo_raza (
    id SERIAL PRIMARY KEY,
    tipo_raza TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS raza (
    id SERIAL PRIMARY KEY,
    nombre_raza TEXT NOT NULL UNIQUE,
    id_tipo_raza INTEGER NOT NULL REFERENCES tipo_raza(id)
);

CREATE TABLE IF NOT EXISTS tipo_alimento (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS marca_alimento (
    id SERIAL PRIMARY KEY,
    nombre_marca TEXT NOT NULL,
    id_tipo_alimento INTEGER NOT NULL REFERENCES tipo_alimento(id)
);

CREATE TABLE IF NOT EXISTS enfermedades (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lotes (
    id_lote SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_lote TEXT NOT NULL,
    numero_cerdos_registrado INTEGER NOT NULL,
    numeros_cerdos_actuales INTEGER NOT NULL,
    raza TEXT NOT NULL,
    peso_promedio NUMERIC(12, 2) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL,
    fase INTEGER NOT NULL REFERENCES fases(id_fase),
    mortalidad NUMERIC(12, 2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    client_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS costos (
    id_costo SERIAL PRIMARY KEY,
    id_lote INTEGER NOT NULL REFERENCES lotes(id_lote) ON DELETE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    compra_cerdos NUMERIC(14, 2) NOT NULL DEFAULT 0,
    alimentacion NUMERIC(14, 2) NOT NULL DEFAULT 0,
    medicamentos NUMERIC(14, 2) NOT NULL DEFAULT 0,
    mano_obra NUMERIC(14, 2) NOT NULL DEFAULT 0,
    transporte NUMERIC(14, 2) NOT NULL DEFAULT 0,
    otros NUMERIC(14, 2) NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMPTZ NOT NULL,
    client_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS alimentacion (
    id_alimentacion SERIAL PRIMARY KEY,
    id_lote INTEGER NOT NULL REFERENCES lotes(id_lote) ON DELETE CASCADE,
    tipo_alimento TEXT NOT NULL,
    marca_alimento TEXT NOT NULL,
    cantidad_kg NUMERIC(12, 2) NOT NULL,
    costo_unitario NUMERIC(14, 2) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    client_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS salud_tratamiento (
    id_tratamiento SERIAL PRIMARY KEY,
    id_lote INTEGER NOT NULL REFERENCES lotes(id_lote) ON DELETE CASCADE,
    enfermedad TEXT NOT NULL,
    tratamiento TEXT NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    client_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ventas (
    id_venta SERIAL PRIMARY KEY,
    id_lote INTEGER NOT NULL REFERENCES lotes(id_lote) ON DELETE CASCADE,
    cerdos_vendidos INTEGER NOT NULL,
    peso_promedio NUMERIC(12, 2) NOT NULL,
    precio_kg NUMERIC(14, 2) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    client_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS progreso (
    id_progreso SERIAL PRIMARY KEY,
    id_lote INTEGER NOT NULL REFERENCES lotes(id_lote) ON DELETE CASCADE,
    fecha_pesaje DATE NOT NULL,
    record_peso_promedio NUMERIC(12, 2) NOT NULL,
    mortalidad NUMERIC(12, 2) NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fase INTEGER NOT NULL REFERENCES fases(id_fase),
    client_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS agenda (
    id_agenda SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_evento TIMESTAMPTZ NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    client_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

INSERT INTO fases (id_fase, nombre_fase) VALUES
    (1, 'Lactancia'),
    (2, 'Precebo'),
    (3, 'Levante'),
    (4, 'Ceba')
ON CONFLICT (id_fase) DO NOTHING;

INSERT INTO tipo_raza (id, tipo_raza) VALUES
    (1, 'Materna'),
    (2, 'Paterna')
ON CONFLICT (id) DO NOTHING;

INSERT INTO raza (id, nombre_raza, id_tipo_raza) VALUES
    (1, 'Landrace', 1),
    (2, 'Yorkshire', 1),
    (3, 'Duroc', 2),
    (4, 'Pietrain', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tipo_alimento (id, nombre) VALUES
    (1, 'Preiniciador'),
    (2, 'Levante'),
    (3, 'Finalizador')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marca_alimento (id, nombre_marca, id_tipo_alimento) VALUES
    (1, 'Concentrado local', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO enfermedades (id, nombre) VALUES
    (1, 'Diarrea'),
    (2, 'Problemas respiratorios')
ON CONFLICT (id) DO NOTHING;

SELECT setval('fases_id_fase_seq', (SELECT MAX(id_fase) FROM fases));
SELECT setval('tipo_raza_id_seq', (SELECT MAX(id) FROM tipo_raza));
SELECT setval('raza_id_seq', (SELECT MAX(id) FROM raza));
SELECT setval('tipo_alimento_id_seq', (SELECT MAX(id) FROM tipo_alimento));
SELECT setval('marca_alimento_id_seq', (SELECT MAX(id) FROM marca_alimento));
SELECT setval('enfermedades_id_seq', (SELECT MAX(id) FROM enfermedades));

CREATE INDEX IF NOT EXISTS lotes_usuario_updated_idx ON lotes (id_usuario, updated_at);
CREATE INDEX IF NOT EXISTS costos_usuario_updated_idx ON costos (id_usuario, updated_at);
CREATE INDEX IF NOT EXISTS alimentacion_usuario_updated_idx ON alimentacion (id_usuario, updated_at);
CREATE INDEX IF NOT EXISTS salud_usuario_updated_idx ON salud_tratamiento (id_usuario, updated_at);
CREATE INDEX IF NOT EXISTS ventas_usuario_updated_idx ON ventas (id_usuario, updated_at);
CREATE INDEX IF NOT EXISTS progreso_usuario_updated_idx ON progreso (id_usuario, updated_at);
CREATE INDEX IF NOT EXISTS agenda_usuario_updated_idx ON agenda (id_usuario, updated_at);
