import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from 'src/entities/invoice';
import {
  limit,
  logoFolder,
  pdfFolder,
  responseMessage,
} from 'src/utils/constants';
import {
  Order,
  Query,
  createInvoiceParams,
  getInvoiceParams,
  typeGetDbSeach,
  updateInvoiceParams,
} from 'src/utils/types';
import { Like, Repository } from 'typeorm';
import { mapper } from '../utils/mapper';
import { PaymentStatus } from 'src/utils/user.dto';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
  ) {}

  async getInvoice(
    user: getInvoiceParams,
    page = 1,
    sortBy: string | null = null,
    sortOrder: Order | null = null,
    invoiceName: string | null = null,
    params: PaymentStatus | null = null,
  ) {
    const skip = (page - 1) * limit;
    const userId = String(user);
    const search: typeGetDbSeach = {
      seller_id: userId,
    };
    if (params) {
      search.status = params;
    }
    if (invoiceName) {
      search.client_name = Like(`%${invoiceName}%`);
    }
    const order = {
      [sortBy]: sortOrder,
    };
    const dbQuery: Query = {
      select: [
        'invoice_name',
        'client_name',
        'billing_date',
        'status',
        'total',
      ],
      where: search,
      skip,
      take: limit,
    };
    if (JSON.stringify(order) != JSON.stringify({ null: null })) {
      dbQuery.order = order;
    }
    const invoices = await this.invoiceRepository.find(dbQuery);
    if (!invoices.length) {
      return responseMessage.noInvoice;
    }
    let total = 0;
    invoices.forEach((invoice) => {
      const parts = invoice.invoice_name.split('_');
      invoice.invoice_name = parts[1];
      if (invoice.status == PaymentStatus.Outstanding) {
        total += +invoice.total;
      }
    });
    return { invoices, total };
  }

  async getInvoiceDetails(user: getInvoiceParams, name: string) {
    const invoiceName = `${user}_${name}`;
    const isInvoice = await this.invoiceRepository.findOne({
      where: { invoice_name: invoiceName },
    });
    if (!isInvoice) {
      throw new BadRequestException('Invoice Not Found');
    }
    isInvoice.invoice_name = name;
    delete isInvoice.created_at;
    delete isInvoice.updated_at;
    return isInvoice;
  }

  async checkInvoice(user: getInvoiceParams, name: string) {
    const invoiceName = `${user}_${name}`;
    const invoice = await this.invoiceRepository.findOne({
      where: { invoice_name: invoiceName },
    });
    if (!invoice) {
      return false;
    }
    return invoiceName;
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
      return await this.invoiceRepository.save(invoice);
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

  async updateInvoice(
    updateInvoiceName: string,
    updateInvoiceDetails: updateInvoiceParams,
    user: getInvoiceParams,
  ) {
    const invoiceName = `${user}_${updateInvoiceName}`;
    const invoice = await this.invoiceRepository.findOne({
      where: { invoice_name: invoiceName },
    });
    if (!invoice) {
      throw new BadRequestException('Invoice Not Found');
    }
    if (updateInvoiceDetails.orderItem.length) {
      invoice.sub_total = mapper.calculateTotalAmount(
        updateInvoiceDetails.orderItem,
      );
      invoice.total =
        invoice.sub_total +
        (invoice.sub_total * updateInvoiceDetails.tax) / 100;
    }
    invoice.seller_name = updateInvoiceDetails.sellerName
      ? updateInvoiceDetails.sellerName
      : invoice.seller_name;
    invoice.invoice_name = invoiceName;
    invoice.seller_email = updateInvoiceDetails.sellerEmail
      ? updateInvoiceDetails.sellerEmail
      : invoice.seller_email;
    invoice.billing_date = updateInvoiceDetails.billingDate
      ? new Date(updateInvoiceDetails.billingDate)
      : invoice.billing_date;
    invoice.seller_address_1 = updateInvoiceDetails.sellerAddress1
      ? updateInvoiceDetails.sellerAddress1
      : invoice.seller_address_1;
    invoice.seller_address_2 = updateInvoiceDetails.sellerAddress2
      ? updateInvoiceDetails.sellerAddress2
      : invoice.seller_address_2;
    invoice.seller_address_3 = updateInvoiceDetails.sellerAddress3
      ? updateInvoiceDetails.sellerAddress3
      : invoice.seller_address_3;
    invoice.seller_mobile = updateInvoiceDetails.sellerMobile
      ? updateInvoiceDetails.sellerMobile
      : invoice.seller_mobile;
    invoice.seller_gst = updateInvoiceDetails.sellerGst
      ? updateInvoiceDetails.sellerGst
      : invoice.seller_gst;
    invoice.logo = updateInvoiceDetails.logo
      ? updateInvoiceDetails.logo
      : invoice.logo;
    invoice.client_name = updateInvoiceDetails.clientName
      ? updateInvoiceDetails.clientName
      : invoice.client_name;
    invoice.client_email = updateInvoiceDetails.clientEmail
      ? updateInvoiceDetails.clientEmail
      : invoice.client_email;
    invoice.client_address_1 = updateInvoiceDetails.clientAddress1
      ? updateInvoiceDetails.clientAddress1
      : invoice.client_address_1;
    invoice.client_address_2 = updateInvoiceDetails.clientAddress2
      ? updateInvoiceDetails.clientAddress2
      : invoice.client_address_2;
    invoice.client_address_3 = updateInvoiceDetails.clientAddress3
      ? updateInvoiceDetails.clientAddress3
      : invoice.client_address_3;
    invoice.client_mobile = updateInvoiceDetails.clientMobile
      ? updateInvoiceDetails.clientMobile
      : invoice.client_mobile;
    invoice.order_items = updateInvoiceDetails.orderItem
      ? updateInvoiceDetails.orderItem
      : invoice.order_items;
    invoice.tax = updateInvoiceDetails.tax
      ? updateInvoiceDetails.tax
      : invoice.tax;
    invoice.currency = updateInvoiceDetails.currency
      ? updateInvoiceDetails.currency
      : invoice.currency;
    invoice.status = updateInvoiceDetails.status
      ? updateInvoiceDetails.status
      : invoice.status;
    invoice.updated_at = new Date();

    const savedInvoice = await this.invoiceRepository.save(invoice);
    return savedInvoice;
  }

  async deleteInvoice(user: getInvoiceParams, deleteInvoiceName: string) {
    const invoiceName = `${user}_${deleteInvoiceName}`;
    const invoice = await this.invoiceRepository.findOne({
      where: { invoice_name: invoiceName },
    });
    if (!invoice) {
      throw new BadRequestException('Invoice Not Found');
    }
    const logo = `${logoFolder}/${invoice.logo}`;
    const pdf = `${pdfFolder}/${invoice.invoice_name}`;
    if (fs.existsSync(logo)) {
      fs.unlink(logo, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
    }
    if (fs.existsSync(pdf)) {
      fs.unlink(pdf, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
    }
    await this.invoiceRepository.remove(invoice);
    return;
  }

  async invoicePaid(user: getInvoiceParams, paidInvoiceName: string) {
    const invoiceName = `${user}_${paidInvoiceName}`;
    const invoice = await this.invoiceRepository.findOne({
      where: { invoice_name: invoiceName },
    });
    if (!invoice) {
      throw new BadRequestException('Invoice Not Found');
    }
    invoice.status = PaymentStatus.Paid;

    await this.invoiceRepository.save(invoice);
    return responseMessage.invoicePaid;
  }
}
