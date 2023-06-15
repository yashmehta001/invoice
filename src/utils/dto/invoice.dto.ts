import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Currency, PaymentStatus } from '../types';
import { PartialType } from '@nestjs/swagger';

export class getInvoices {
  @IsOptional()
  @Transform((value) => value || 1)
  page: number;

  @IsOptional()
  sortBy: string;

  @IsOptional()
  sortOrder: string;

  @IsOptional()
  params: PaymentStatus;

  @IsOptional()
  status: string;

  @IsOptional()
  invoiceNumber: string;

  @IsOptional()
  search: string;
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

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsNotEmpty()
  invoiceNumber: string;

  @IsOptional()
  issueDate: number | Date | null;

  // @IsNotEmpty()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => OrderItem)
  // orderItem: OrderItem[];

  @IsNotEmpty()
  orderItem: string;
}

export class UpdateInvoiceDetailsDto extends PartialType(CreateInvoiceDto) {}
