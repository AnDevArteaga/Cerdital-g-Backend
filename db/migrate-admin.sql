-- Para la base que ya está en uso. Agrega el rol del panel web.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'usuario';
UPDATE usuarios SET rol = 'usuario' WHERE rol IS NULL OR rol = '';
ALTER TABLE usuarios ALTER COLUMN rol SET NOT NULL;
