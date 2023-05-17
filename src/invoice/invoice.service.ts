import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from 'src/entities/invoice';
import { User } from 'src/entities/users';
import { responseMessage } from 'src/utils/constants';
import {
  createInvoiceParams,
  getInvoiceParams,
  typeGetDbSeach,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { mapper } from '../utils/mapper';
import { PaymentStatus } from 'src/utils/user.dto';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { PdfService } from 'src/pdf/pdf.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
    private pdfService: PdfService,
  ) {}

  async getInvoice(
    user: getInvoiceParams,
    params: PaymentStatus | null = null,
  ) {
    const userId = String(user);
    const search: typeGetDbSeach = {
      seller_id: userId,
    };
    if (params) {
      search.status = params;
    }
    const invoices = await this.invoiceRepository.find({
      select: [
        'invoice_name',
        'client_name',
        'billing_date',
        'status',
        'total',
      ],
      where: search,
    });
    if (!invoices.length) {
      return responseMessage.noInvoice;
    }
    let total = 0;
    invoices.forEach((invoice) => {
      const parts = invoice.invoice_name.split('_');
      invoice.invoice_name = parts[1];
      if (invoice.status == PaymentStatus.Outstanding) {
        total += invoice.total;
      }
    });
    return { invoices, total };
    //to-do add remaining code
  }

  async createInvoice(
    createInvoiceDetails: createInvoiceParams,
    user: getInvoiceParams,
  ) {
    const invoiceName = `${user}_${createInvoiceDetails.invoiceName}`;
    const isInvoice = await this.invoiceRepository.findOne({
      where: { invoice_name: invoiceName },
    });
    if (isInvoice) {
      console.log(isInvoice);
      throw new BadRequestException('Invoice Name should be Unique');
    }
    const tax = createInvoiceDetails.tax ? createInvoiceDetails.tax : 0;
    const orderItems = createInvoiceDetails.orderItem;
    const subTotalAmount = mapper.calculateTotalAmount(orderItems);
    const total = subTotalAmount + (subTotalAmount * tax) / 100;
    const logo = createInvoiceDetails.logo;
    const invoice = {
      seller_name: createInvoiceDetails.sellerName,
      invoice_name: invoiceName,
      seller_id: user.toString(),
      seller_email: createInvoiceDetails.sellerEmail,
      billing_date: new Date(createInvoiceDetails.billingDate),
      seller_address_1: createInvoiceDetails.sellerAddress1,
      seller_address_2: createInvoiceDetails.sellerAddress2,
      seller_address_3: createInvoiceDetails.sellerAddress3,
      seller_mobile: createInvoiceDetails.sellerMobile,
      seller_gst: createInvoiceDetails.sellerGst,
      logo: logo,
      client_name: createInvoiceDetails.clientName,
      client_email: createInvoiceDetails.clientEmail,
      client_address_1: createInvoiceDetails.clientAddress1,
      client_address_2: createInvoiceDetails.clientAddress2,
      client_address_3: createInvoiceDetails.clientAddress3,
      client_mobile: createInvoiceDetails.clientMobile,
      order_items: orderItems,
      tax: tax,
      currency: createInvoiceDetails.currency,
      status: createInvoiceDetails.status,
      sub_total: subTotalAmount,
      total: total,
      created_at: new Date(),
      updated_at: new Date(),
    };
    try {
      await this.invoiceRepository.save(invoice);
      await this.pdfService.generatePdf(invoice);
      return invoice;
    } catch (e) {
      return e;
    }
  }

  async checkFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('File not found');
    }

    if (file.size > 2000000) {
      throw new BadRequestException('File size should not exceed 2MB');
    }
    const fileType = file.originalname.split('.').pop();
    if (fileType !== 'jpg' && fileType !== 'png') {
      throw new BadRequestException('File type should be JPG or PNG');
    }
  }

  async saveFile(
    user: getInvoiceParams,
    file: Express.Multer.File,
  ): Promise<string> {
    const filename = `${user}_${uuidv4()}${path.extname(file.originalname)}`;
    const logoFolder = path.join(__dirname, '..', '..', 'files', 'logos');
    if (!fs.existsSync(logoFolder)) {
      fs.mkdirSync(logoFolder, { recursive: true });
    }
    fs.writeFileSync(`files/logos/${filename}`, file.buffer);
    return filename;
  }
}
