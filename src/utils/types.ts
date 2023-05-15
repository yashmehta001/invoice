import { OrderItem, PaymentStatus, currency } from './user.dto';

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

export type typeGetDbSeach = {
  seller_id: string;
  status?: PaymentStatus;
};
