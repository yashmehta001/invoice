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

export enum AuthType {
  Bearer,
  None,
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
  fromId: string;
  status?: PaymentStatus;
  toName?: FindOperator<string>;
};

export type createPdfParams = {
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
  invoiceNumber: string;
  issueDate: Date; // Assuming the date will be represented as a string
  orderItems: OrderItem[];
  taxRate: number;
  taxAmount: number;
  currency: string;
  status: string;
  subTotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

export type attachmentParams = {
  filename: string;
  content: fs.ReadStream;
};

export type Order = {
  sortOrder: 'ASC' | 'DESC';
};

export type Query = FindManyOptions<Invoice>;

export type responseObject = {
  isError: boolean;
  message: string;
};
