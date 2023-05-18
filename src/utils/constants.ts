import 'dotenv/config';
import * as path from 'path';

export const createUserSubject = 'Welcome to Invoicing';
export const createUserText = 'Welcome to Invoicing. Your OTP is ';

export const emailInvoiceSubject = 'Invoice';
export const emailInvoiceText = 'PFA Invoice';

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
  invalidJwt: { success: false, message: 'JWT failed. Re-login' },
};

//Success Responses
export const responseMessage = {
  userCreation: { success: true, message: 'User Creation Successful' },
  userLogin: { success: true, message: 'User Login Successful' },
  userVerification: { success: true, message: 'User Verification Successful' },
  resendEmail: { success: true, message: 'Email Sent Successfully' },
  noInvoice: { success: true, message: 'No invoices stored yet!' },
  emailInvoice: { success: true, message: 'Invoice Emailed to Client!' },
  invoiceSaved: { success: true, message: 'Invoice saved as PDF' },
  deleteInvoice: { success: true, message: 'Invoice Deleted' },
};

//PDF
export const filename = path.join(__dirname, '..', '..', 'files');
export const pdfFolder = path.join(__dirname, '..', '..', 'files', 'pdf');
export const logoFolder = path.join(__dirname, '..', '..', 'files', 'logos');
