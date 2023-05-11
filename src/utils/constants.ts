import 'dotenv/config';

//Database
export const dbHost = process.env.DATABASE_HOST;
export const dbPort = Number(process.env.DATABASE_PORT);
export const dbUsername = process.env.DATABASE_USER;
export const dbPassword = String(process.env.DATABASE_PASSWORD);
export const database = process.env.DATABASE_NAME;

//User Constants
export const codeExpiryTime = +process.env.CODE_EXPIRY_TIME * 60 * 1000;
export const saltRounds = +process.env.SALTROUND;
export const jwtSecret = process.env.JWTSECRET;

//Email
export const email = process.env.USER_EMAIL;
export const password = process.env.EMAIL_PASSWORD;
export const emailService = process.env.EMAIL_SERVICE;
export const createUserSubject = 'Welcome to Invoicing';
export const createUserText = 'Welcome to Invoicing. Your OTP is ';

//Error Responses
export const errorMessage = {
  emailExists: { success: false, message: 'Email already Exists' },
  login: { success: false, message: 'Incorrect Email or Password' },
  emailNotFound: { success: false, message: 'Email Not Found' },
  emailNotVerified: {
    success: false,
    message: 'Email Not Verified. Resent Email',
  },
  codeExpired: { success: false, message: 'Code Expired. Email Resent' },
  isVerified: { success: false, message: 'Email already verified' },
  isNotVerified: { success: false, message: 'Invalid OTP' },
};

//Success Responses
export const responseMessage = {
  userCreation: { success: true, message: 'User Creation Successful' },
  userLogin: { success: true, message: 'User Login Successful' },
  userVerification: { success: true, message: 'User Verification Successful' },
  resendEmail: { success: true, message: 'Email Sent Successfully' },
};
