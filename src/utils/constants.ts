import 'dotenv/config';

export const dbHost = process.env.DATABASE_HOST;
export const dbPort = Number(process.env.DATABASE_PORT);
export const dbUsername = process.env.DATABASE_USER;
export const dbPassword = String(process.env.DATABASE_PASSWORD);
export const database = process.env.DATABASE_NAME;
