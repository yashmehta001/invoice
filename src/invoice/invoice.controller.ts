import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  PaymentStatus,
  createUserDto,
  getInvoicesDto,
} from 'src/utils/user.dto';

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  userInvoice(@Headers('user') user: getInvoicesDto) {
    return this.invoiceService.getInvoice(user);
  }

  @Get(':status')
  @UsePipes(new ValidationPipe())
  userInvoiceStatus(
    @Headers('user') user: getInvoicesDto,
    @Param('status') status: PaymentStatus,
  ) {
    return this.invoiceService.getInvoice(user, status);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createInvoice(
    @Headers('user') user: getInvoicesDto,
    @Body() invoiceDetailsDto: createUserDto,
  ) {
    return this.invoiceService.createInvoice(invoiceDetailsDto, user);
  }
}
