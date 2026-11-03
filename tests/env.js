function setDefault(name, value) {
    if (!process.env[name]) process.env[name] = value;
}

setDefault("DB_HOST", "127.0.0.1");
setDefault("DB_PORT", "5432");
setDefault("DB_USER", "cerdital");
setDefault("DB_PASSWORD", "cerdital");
setDefault("DB_NAME", "cerdital");
setDefault("RD_HOST", "127.0.0.1");
setDefault("RD_PORT", "6379");
delete process.env.RD_PASSWORD;
setDefault("JWT_SECRET", "test-secret-test-secret-test-secret");
setDefault("PUBLIC_URL", "http://127.0.0.1:5000");
