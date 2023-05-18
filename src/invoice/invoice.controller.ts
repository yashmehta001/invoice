import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  PaymentStatus,
  CreateInvoiceDto,
  getInvoicesDto,
  UpdateInvoiceDetailsDto,
  Action,
} from 'src/utils/user.dto';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from 'src/pdf/pdf.service';
import {
  emailInvoiceSubject,
  emailInvoiceText,
  responseMessage,
} from 'src/utils/constants';
import { v4 as uuid } from 'uuid';
import { EmailService } from 'src/email/email.service';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    private pdfService: PdfService,
    private emailService: EmailService,
  ) {}

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

  @Post(':action')
  @UsePipes(new ValidationPipe())
  async createInvoice(
    @Headers('user') user: getInvoicesDto,
    @Body() invoiceDetailsDto: CreateInvoiceDto,
    @Param('action') action: Action,
  ) {
    const invoice = await this.invoiceService.createInvoice(
      invoiceDetailsDto,
      user,
    );
    const pdfPath = await this.pdfService.generatePdf(invoice);

    if (action == 'email') {
      const attachments = [
        {
          filename: uuid(),
          content: fs.createReadStream(pdfPath),
        },
      ];
      await this.emailService.sendEmail(
        invoiceDetailsDto.clientEmail,
        emailInvoiceSubject,
        emailInvoiceText,
        attachments,
      );
    }
    return responseMessage.emailInvoice;
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  async handleUpload(
    @Headers('user') user: getInvoicesDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      await this.invoiceService.checkFile(file);
      const filename = await this.invoiceService.saveFile(user, file);
      return { success: true, filename };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':name/:action')
  async updatePdf(
    @Headers('user') user: getInvoicesDto,
    @Param('name') name: string,
    @Param('action') action: Action,
    @Body() updateInvoiceDetailsDto: UpdateInvoiceDetailsDto,
  ) {
    const invoice = await this.invoiceService.updateInvoice(
      name,
      updateInvoiceDetailsDto,
      user,
    );
    const pdfPath = await this.pdfService.generatePdf(invoice);
    if (action == 'email') {
      const attachments = [
        {
          filename: uuid(),
          content: fs.createReadStream(pdfPath),
        },
      ];
      await this.emailService.sendEmail(
        updateInvoiceDetailsDto.clientEmail,
        emailInvoiceSubject,
        emailInvoiceText,
        attachments,
      );
      return responseMessage.emailInvoice;
    }
    return responseMessage.invoiceSaved;
  }

  @Delete(':name')
  async deleteInvoice(
    @Headers('user') user: getInvoicesDto,
    @Param('name') name: string,
  ) {
    await this.invoiceService.deleteInvoice(user, name);
    return responseMessage.deleteInvoice;
  }
}
