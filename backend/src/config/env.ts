import process from "node:process";

// Chargement natif du fichier .env sans bibliothèque tierce (Node.js 20.6+ / 21+)
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
    // Si le fichier .env n'est pas présent, on ignore silencieusement
  }
}

export const config = {
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "coworkin_user",
    password: process.env.PGPASSWORD || "coworkin_password",
    database: process.env.PGDATABASE || "coworkin_db",
  },
  jwtSecret: process.env.JWT_SECRET || "coworkin-super-secret-key-development",
};
