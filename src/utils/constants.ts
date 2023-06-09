import 'dotenv/config';
import * as path from 'path';

export const createUserSubject = 'Welcome to Invoicing';
export const createUserText = 'Welcome to Invoicing. Your OTP is ';

export const emailInvoiceSubject = 'Invoice';
export const emailInvoiceText = 'PFA Invoice';

//Error Responses
export const errorMessage = {
  dbError: {
    isError: true,
    message: 'An Error occured while storing in Database',
  },
  emailExists: { isError: true, message: 'Email already Exists' },
  login: { isError: true, message: 'Incorrect Email or Password' },
  emailNotFound: { isError: true, message: 'Email Not Found' },
  emailNotVerified: {
    isError: true,
    message: 'Email Not Verified. Resent Email',
  },
  otpExpired: { isError: true, message: 'Code Expired. Email Resent' },
  isVerified: { isError: true, message: 'Email already verified' },
  isNotVerified: { isError: true, message: 'Invalid OTP' },
  invalidJwt: { isError: true, message: 'JWT failed. Re-login' },
  emailPDF: { isError: true, message: 'PDF not Found' },
  invoiceExists: { isError: true, message: 'Invoice Number should be Unique' },
  invalidLogoFileType: {
    isError: true,
    message: 'File type should be JPG or PNG',
  },
  invalidLogoFileSize: {
    isError: true,
    message: 'File size should not exceed 2MB',
  },
  invalidLogoFileNull: {
    isError: true,
    message: 'File not found',
  },
};

//Success Responses
export const responseMessage = {
  userCreation: { isError: false, message: 'User Creation Successful' },
  userLogin: { isError: false, message: 'User Login Successful' },
  userVerification: { isError: false, message: 'User Verification Successful' },
  resendEmail: { isError: false, message: 'OTP Sent Successfully' },
  noInvoice: { isError: false, message: 'No invoices stored yet!' },
  emailInvoice: { isError: false, message: 'Invoice Emailed to Client!' },
  invoiceSaved: { isError: false, message: 'Invoice saved as PDF' },
  deleteInvoice: { isError: false, message: 'Invoice Deleted' },
  invoicePaid: { isError: false, message: 'Invoice status turned Paid' },
  validLogoFile: { isError: false, message: 'Ok' },
  validLogoSaved: { isError: false, message: 'Logo Saved' },
  getInvoice: { isError: false, message: 'Invoice Found' },
};

//PDF
export const filename = path.join(__dirname, '..', '..', 'files');
export const pdfFolder = path.join(__dirname, '..', '..', 'files', 'pdf/');
export const logoFolder = path.join(__dirname, '..', '..', 'files', 'logos/');

//Database
export const limit = 10;
