import * as fs from 'fs';
import { OrderItem, PaymentStatus, currency } from './user.dto';
import { FindManyOptions, FindOperator } from 'typeorm';
import { Invoice } from 'src/entities/invoice';

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
  code: string;
};

export type resendEmailParams = {
  email: string;
};

export type getInvoiceParams = {
  user: string;
};

export type createInvoiceParams = {
  sellerName: string;

  invoiceName: string;

  sellerEmail: string;

  sellerAddress1: string;

  sellerAddress2: string;

  sellerAddress3: string;

  sellerMobile: string;

  sellerGst: string;

  logo: string;

  clientName: string;

  clientEmail: string;

  clientAddress1: string;

  clientAddress2: string;

  clientAddress3: string;

  clientMobile: string;

  tax: number;

  currency: currency;

  status: PaymentStatus;

  billingDate: number;

  orderItem: OrderItem[];
};

export type updateInvoiceParams = {
  sellerName?: string;

  invoiceName?: string;

  sellerEmail?: string;

  sellerAddress1?: string;

  sellerAddress2?: string;

  sellerAddress3?: string;

  sellerMobile?: string;

  sellerGst?: string;

  logo?: string;

  clientName?: string;

  clientEmail?: string;

  clientAddress1?: string;

  clientAddress2?: string;

  clientAddress3?: string;

  clientMobile?: string;

  tax?: number;

  currency?: currency;

  status?: PaymentStatus;

  billingDate?: number;

  orderItem?: OrderItem[];
};

export type typeGetDbSeach = {
  seller_id: string;
  status?: PaymentStatus;
  client_name?: FindOperator<string>;
};

export type createPdfParams = {
  seller_name: string;
  invoice_name: string;
  seller_id: string;
  seller_email: string;
  billing_date: Date; // Assuming the date will be represented as a string
  seller_address_1: string;
  seller_address_2: string;
  seller_address_3: string;
  seller_mobile: string;
  seller_gst: string;
  logo: string;
  client_name: string;
  client_email: string;
  client_address_1: string;
  client_address_2: string;
  client_address_3: string;
  client_mobile: string;
  order_items: OrderItem[];
  tax: number;
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
