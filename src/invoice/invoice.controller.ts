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
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDetailsDto,
  getInvoices,
} from 'src/utils/dto/invoice.dto';
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
import { Action, createInvoiceParams } from 'src/utils/types';
import { ApiTags } from '@nestjs/swagger';
import { getInvoicesDto, EmailDto } from 'src/utils/dto/user.dto';

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
    @Query() payload: getInvoices,
  ) {
    return this.invoiceService.getInvoice(user, payload);
  }

  @Post('paid')
  async invoicePaind(
    @Headers('user') user: getInvoicesDto,
    @Body('name') name: string,
  ) {
    await this.invoiceService.invoicePaid(user, name);
    return responseMessage.invoicePaid;
  }

  @Post('user/email')
  async emailInvoice(
    @Headers('user') user: getInvoicesDto,
    @Body() details: EmailDto,
  ) {
    const checkInvoice = await this.invoiceService.checkInvoice(
      user,
      details.number,
    );
    if (!checkInvoice) throw new BadRequestException('Invoice Not Found');
    const pdfPath = path.join(pdfFolder, checkInvoice);
    if (!fs.existsSync(pdfPath)) return errorMessage.emailPDF;
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
  async getInvoice(
    @Headers('user') user: getInvoicesDto,
    @Param('name') name: string,
  ) {
    return await this.invoiceService.getInvoiceDetails(user, name);
  }

  @Post(':action')
  @UseInterceptors(FileInterceptor('logo'))
  async createInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Headers('user') user: getInvoicesDto,
    @Body() body: CreateInvoiceDto,
    @Param('action') action: Action,
  ) {
    const checkLogo = await this.invoiceService.checkFile(file);
    if (checkLogo.isError) return checkLogo;
    const logo = await this.invoiceService.saveLogo(user, file);
    body.logo = logo;
    body.orderItem = JSON.parse(body.orderItem);
    body.issueDate = new Date(+body.issueDate);
    const invoiceDetails = body as unknown as createInvoiceParams;
    const invoice = await this.invoiceService.createInvoice(
      invoiceDetails,
      user,
    );
    if (invoice.isError) return invoice;
    const pdfPath = await this.pdfService.generatePdf(invoice);
    if (action === 'save') return responseMessage.invoiceSaved;
    const attachments = [
      {
        filename: uuid(),
        content: fs.createReadStream(pdfPath),
      },
    ];
    await this.emailService.sendEmail(
      invoiceDetails.toEmail,
      emailInvoiceSubject,
      emailInvoiceText,
      attachments,
    );
    return responseMessage.emailInvoice;
  }

  @Put(':number/:action')
  @UseInterceptors(FileInterceptor('logo'))
  async updatePdf(
    @UploadedFiles() file: Express.Multer.File,
    @Headers('user') user: getInvoicesDto,
    @Body() body: UpdateInvoiceDetailsDto,
    @Param('action') action: Action,
    @Param('number') number: string,
  ) {
    if (file) {
      // const checkFile = await this.invoiceService.checkFile(file);
      // if (checkFile.isError) return checkFile;
      const filename = await this.invoiceService.saveLogo(user, file);
      body.logo = filename;
    }
    body.orderItem = JSON.parse(body.orderItem);
    body.issueDate = new Date(+body.issueDate);
    const updateInvoiceDetails = body as unknown;
    const invoice = await this.invoiceService.updateInvoice(
      number,
      updateInvoiceDetails,
      user,
    );
    const pdfPath = await this.pdfService.generatePdf(invoice);
    if (action == 'save') return responseMessage.invoiceSaved;
    const attachments = [
      {
        filename: uuid() + '.pdf',
        content: fs.createReadStream(pdfPath),
      },
    ];
    this.emailService.sendEmail(
      body.toEmail,
      emailInvoiceSubject,
      emailInvoiceText,
      attachments,
    );
    return responseMessage.emailInvoice;
  }

  @Delete(':number')
  async deleteInvoice(
    @Headers('user') user: getInvoicesDto,
    @Param('number') number: string,
  ) {
    await this.invoiceService.deleteInvoice(user, number);
    return responseMessage.deleteInvoice;
  }
}
