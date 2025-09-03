import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./auth-schema";
export const db = drizzle(process.env.DATABASE_URL!);

export { authSchema };
