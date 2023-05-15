import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  PaymentStatus,
  createUserDto,
  getInvoicesDto,
} from 'src/utils/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  async handleUpload(@UploadedFile() file: Express.Multer.File) {
    try {
      await this.invoiceService.checkFile(file);
      const filename = await this.invoiceService.saveFile(file);
      return { success: true, filename };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
