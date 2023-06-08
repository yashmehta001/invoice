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
  IsOptional,
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

export class EmailDto {
  @IsEmail()
  email: string;

  number: string;
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
  otp: string;
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
  Outstanding = 'outstanding',
  Paid = 'paid',
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
  fromName: string;

  @IsOptional()
  invoiceName: string;

  @IsNotEmpty()
  @IsEmail()
  fromEmail: string;

  @IsOptional()
  fromAddress: string;

  @IsOptional()
  fromMobile: string;

  @IsOptional()
  fromBusinessId: string;

  @IsOptional()
  logo: string;

  @IsNotEmpty()
  toName: string;

  @IsNotEmpty()
  @IsEmail()
  toEmail: string;

  @IsOptional()
  toAddress: string;

  @IsOptional()
  toMobile: string;

  @IsOptional()
  tax: number;

  @IsEnum(currency)
  currency: currency;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsNotEmpty()
  invoiceNumber: string;

  @IsOptional()
  issueDate: number | null;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  orderItem: OrderItem[];
}

export class UpdateInvoiceDetailsDto {
  @IsNotEmpty()
  fromName?: string;

  @IsOptional()
  invoiceName?: string;

  @IsNotEmpty()
  @IsEmail()
  fromEmail?: string;

  @IsOptional()
  fromAddress?: string;

  @IsOptional()
  fromMobile?: string;

  @IsOptional()
  from_business_id?: string;

  @IsOptional()
  logo?: string;

  @IsNotEmpty()
  toName?: string;

  @IsNotEmpty()
  @IsEmail()
  toEmail?: string;

  @IsOptional()
  toAddress?: string;

  @IsOptional()
  toMobile?: string;

  @IsOptional()
  tax?: number;

  @IsEnum(currency)
  currency?: currency;

  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  billingDate?: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  orderItem?: OrderItem[];
}
