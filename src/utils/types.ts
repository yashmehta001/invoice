import * as fs from 'fs';
import { FindManyOptions, FindOperator } from 'typeorm';
import { Invoice } from 'src/entities/invoice';
import { OrderItem } from './dto/invoice.dto';

export enum PaymentStatus {
  Outstanding = 'outstanding',
  Paid = 'paid',
}

export enum Action {
  Save = 'save',
  Email = 'email',
}

export enum Currency {
  IND = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

export enum sortBy {
  invoiceName = 'invoice_name',
  toName = 'to_name',
  invoiceNumber = 'invoice_number',
  status = 'status',
}

export type CreateUserParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UserLoginParams = {
  email: string;
  password: string;
};

export type verifyUserParams = {
  email: string;
  otp: string;
};

export type resendEmailParams = {
  email: string;
};

export type getInvoiceParams = {
  user: string;
};

export type createInvoiceParams = {
  logo: string;

  invoiceName: string;

  fromName: string;

  fromEmail: string;

  fromAddress: string;

  fromMobile: string;

  fromBusinessId: string;

  toName: string;

  toEmail: string;

  toAddress: string;

  toMobile: string;

  tax: number;

  currency: Currency;

  status: PaymentStatus;

  invoiceNumber: string;

  issueDate: number;

  orderItem: [];
};

export type updateInvoiceParams = {
  logo?: string;

  invoiceName?: string;

  fromName?: string;

  fromEmail?: string;

  fromAddress?: string;

  fromMobile?: string;

  fromBusinessId?: string;

  toName?: string;

  toEmail?: string;

  toAddress?: string;

  toMobile?: string;

  tax?: number;

  currency?: Currency;

  status?: PaymentStatus;

  invoiceNumber?: string;

  issueDate?: number | Date;

  orderItem?: [];
};

export type typeGetDbSeach = {
  from_id: string;
  status?: PaymentStatus;
  to_name?: FindOperator<string>;
};

export type createPdfParams = {
  logo: string;
  invoice_name: string;
  from_name: string;
  from_email: string;
  from_address: string;
  from_mobile: string;
  from_business_id: string;
  to_name: string;
  to_email: string;
  to_address: string;
  to_mobile: string;
  invoice_number: string;
  issue_date: Date; // Assuming the date will be represented as a string
  order_items: OrderItem[];
  tax_rate: number;
  tax_amount: number;
  currency: string;
  status: string;
  sub_total: number;
  total: number;
  created_at: Date;
  updated_at: Date;
};

export type attachmentParams = {
  filename: string;
  content: fs.ReadStream;
};

export type Order = {
  sortOrder: 'ASC' | 'DESC';
};

export type Query = FindManyOptions<Invoice>;
