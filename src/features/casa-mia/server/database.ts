import "server-only";
import { Pool } from "pg";
import { postgresAdapter } from "./postgres-adapter.mjs";
const globalDb = globalThis as typeof globalThis & { casaMiaPool?: Pool };
export function getDatabase() {
  if (!process.env.CASA_MIA_DATABASE_URL) return null;
  const pool =
    globalDb.casaMiaPool ??
    new Pool({
      connectionString: process.env.CASA_MIA_DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      query_timeout: 10000,
    });
  globalDb.casaMiaPool = pool;
  return postgresAdapter(pool);
}
export function bookingEnvironment() {
  return {
    DB: getDatabase(),
    ADMIN_PASSWORD: process.env.CASA_MIA_ADMIN_PASSWORD,
    STRIPE_SECRET_KEY: process.env.CASA_MIA_STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.CASA_MIA_STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.CASA_MIA_RESEND_API_KEY,
    MAIL_FROM: process.env.CASA_MIA_MAIL_FROM,
    MAIL_JOB_SECRET: process.env.CASA_MIA_MAIL_JOB_SECRET,
    PUSH_PUBLIC_KEY: process.env.CASA_MIA_PUSH_PUBLIC_KEY,
    PUSH_PRIVATE_KEY: process.env.CASA_MIA_PUSH_PRIVATE_KEY,
    PUSH_SUBJECT: process.env.CASA_MIA_PUSH_SUBJECT,
    PUSH_JOB_SECRET: process.env.CASA_MIA_PUSH_JOB_SECRET,
  };
}
