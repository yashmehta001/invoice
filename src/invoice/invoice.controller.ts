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
  Query,
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
  EmailDto,
} from 'src/utils/user.dto';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from 'src/pdf/pdf.service';
import {
  emailInvoiceSubject,
  emailInvoiceText,
  errorMessage,
  pdfFolder,
  responseMessage,
} from 'src/utils/constants';
import { v4 as uuid } from 'uuid';
import { EmailService } from 'src/email/email.service';
import * as path from 'path';
import { Order } from 'src/utils/types';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    private pdfService: PdfService,
    private emailService: EmailService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe())
  userInvoice(
    @Headers('user') user: getInvoicesDto,
    @Query('page') page: number,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: Order,
    @Query('status') status: PaymentStatus,
    @Query('search') search: string,
  ) {
    return this.invoiceService.getInvoice(
      user,
      page,
      sortBy,
      sortOrder,
      status,
      search,
    );
  }

  @Post('paid')
  @UsePipes(new ValidationPipe())
  async invoicePaind(
    @Headers('user') user: getInvoicesDto,
    @Body('name') name: string,
  ) {
    await this.invoiceService.invoicePaid(user, name);
    return responseMessage.invoicePaid;
  }

  @Post('logo')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('logo'))
  async handleUpload(
    @Headers('user') user: getInvoicesDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const checkFile = await this.invoiceService.checkFile(file);
    if (!checkFile.success) {
      return checkFile;
    }
    const filename = await this.invoiceService.saveFile(user, file);
    return { ...responseMessage.validLogoSaved, filename };
  }

  @Post('user/email')
  @UsePipes(new ValidationPipe())
  async emailInvoice(
    @Headers('user') user: getInvoicesDto,
    @Body() details: EmailDto,
  ) {
    const checkInvoice = await this.invoiceService.checkInvoice(
      user,
      details.number,
    );
    if (!checkInvoice) {
      throw new BadRequestException('Invoice Not Found');
    }
    const pdfPath = path.join(pdfFolder, '/', checkInvoice);
    if (!fs.existsSync(pdfPath)) {
      return errorMessage.emailPDF;
    }
    const attachments = [
      {
        filename: uuid(),
        content: fs.createReadStream(pdfPath),
      },
    ];
    await this.emailService.sendEmail(
      details.email,
      emailInvoiceSubject,
      emailInvoiceText,
      attachments,
    );
    return responseMessage.emailInvoice;
  }

  @Get(':name')
  @UsePipes(new ValidationPipe())
  async getInvoice(
    @Headers('user') user: getInvoicesDto,
    @Param('name') name: string,
  ) {
    return await this.invoiceService.getInvoiceDetails(user, name);
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
    if (invoice.success == false) {
      return invoice;
    }
    const pdfPath = await this.pdfService.generatePdf(invoice);
    if (action == 'email') {
      const attachments = [
        {
          filename: uuid(),
          content: fs.createReadStream(pdfPath),
        },
      ];
      await this.emailService.sendEmail(
        invoiceDetailsDto.toEmail,
        emailInvoiceSubject,
        emailInvoiceText,
        attachments,
      );
      return responseMessage.emailInvoice;
    }
    return responseMessage.invoiceSaved;
  }

  @Put(':number/:action')
  @UsePipes(new ValidationPipe())
  async updatePdf(
    @Headers('user') user: getInvoicesDto,
    @Param('number') number: string,
    @Param('action') action: Action,
    @Body() updateInvoiceDetailsDto: UpdateInvoiceDetailsDto,
  ) {
    const invoice = await this.invoiceService.updateInvoice(
      number,
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
        updateInvoiceDetailsDto.toEmail,
        emailInvoiceSubject,
        emailInvoiceText,
        attachments,
      );
      return responseMessage.emailInvoice;
    }
    return responseMessage.invoiceSaved;
  }

  @Delete(':number')
  @UsePipes(new ValidationPipe())
  async deleteInvoice(
    @Headers('user') user: getInvoicesDto,
    @Param('number') number: string,
  ) {
    await this.invoiceService.deleteInvoice(user, number);
    return responseMessage.deleteInvoice;
  }
}
