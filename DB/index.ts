import { drizzle } from "drizzle-orm/neon-http";

let _db: ReturnType<typeof drizzle> | null = null;

function getDB() {
  if (_db) return _db;

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.liftingdairycourse_DATABASE_URL ||
    process.env.liftingdiarycourse_DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  _db = drizzle(connectionString);
  return _db;
}

export const DB = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDB() as any)[prop];
  },
});
