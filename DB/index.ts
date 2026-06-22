import { drizzle } from "drizzle-orm/neon-http";

const connectionString =
  process.env.liftingdairycourse_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("No database connection string found");
}

const DB = drizzle(connectionString);

export { DB };