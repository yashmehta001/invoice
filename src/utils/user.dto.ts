import {
  IsNotEmpty,
  MinLength,
  IsEmail,
  Matches,
  Length,
  ValidateNested,
  IsArray,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  firstName: string;
  @IsNotEmpty()
  @MinLength(3)
  lastName: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

export class UserLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

export class UserVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Length(6)
  code: string;
}

export class ResendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class getInvoicesDto {
  @IsNotEmpty()
  user: string;
}

export class OrderItem {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export enum PaymentStatus {
  Outstanding = 'Outstanding',
  Paid = 'Paid',
}

export enum Action {
  Save = 'save',
  Email = 'email',
}

export enum currency {
  IND = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}
export class CreateInvoiceDto {
  @IsNotEmpty()
  sellerName: string;

  invoiceName: string;

  @IsNotEmpty()
  @IsEmail()
  sellerEmail: string;

  sellerAddress1: string;

  sellerAddress2: string;

  sellerAddress3: string;

  sellerMobile: string;

  sellerGst: string;

  logo: string;

  @IsNotEmpty()
  clientName: string;

  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;

  clientAddress1: string;

  clientAddress2: string;

  clientAddress3: string;

  clientMobile: string;

  tax: number;

  @IsEnum(currency)
  currency: currency;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  billingDate: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  orderItem: OrderItem[];
}

export class UpdateInvoiceDetailsDto {
  @IsNotEmpty()
  sellerName?: string;

  invoiceName?: string;

  @IsNotEmpty()
  @IsEmail()
  sellerEmail?: string;

  sellerAddress1?: string;

  sellerAddress2?: string;

  sellerAddress3?: string;

  sellerMobile?: string;

  sellerGst?: string;

  logo?: string;

  @IsNotEmpty()
  clientName?: string;

  @IsNotEmpty()
  @IsEmail()
  clientEmail?: string;

  clientAddress1?: string;

  clientAddress2?: string;

  clientAddress3?: string;

  clientMobile?: string;

  tax?: number;

  @IsEnum(currency)
  currency?: currency;

  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  billingDate?: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  orderItem?: OrderItem[];
}
