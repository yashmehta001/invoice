import 'dotenv/config';

//Port
export const port = process.env.PORT;

export const database = {
  dbHost: process.env.DATABASE_HOST,
  dbPort: Number(process.env.DATABASE_PORT),
  dbUsername: process.env.DATABASE_USER,
  dbPassword: String(process.env.DATABASE_PASSWORD),
  databaseName: process.env.DATABASE_NAME,
};

export const userConstants = {
  otpExpiryTime: +process.env.CODE_EXPIRY_TIME * 60 * 1000,
  saltRounds: +process.env.SALTROUND,
  jwtSecret: process.env.JWTSECRET,
};

export const mailConfig = {
  email: process.env.USER_EMAIL,
  password: process.env.EMAIL_PASSWORD,
  emailService: process.env.EMAIL_SERVICE,
};
