import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from 'src/entities/invoice';
import {
  errorMessage,
  limit,
  logoFolder,
  pdfFolder,
  responseMessage,
} from 'src/utils/constants';
import {
  Order,
  PaymentStatus,
  Query,
  createInvoiceParams,
  getInvoiceParams,
  typeGetDbSeach,
  updateInvoiceParams,
} from 'src/utils/types';
import { Like, Repository } from 'typeorm';
import { mapper } from '../utils/mapper';
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
    params: PaymentStatus | null = null,
    invoiceNumber: string | null = null,
  ) {
    try {
      const skip = (page - 1) * limit;
      const userId = String(user);
      const search: typeGetDbSeach = {
        from_id: userId,
      };
      if (params) search.status = params;
      if (invoiceNumber) search.to_name = Like(`%${invoiceNumber}%`);
      const order = {
        [sortBy]: sortOrder,
      };
      const dbQuery: Query = {
        select: ['invoice_number', 'to_name', 'issue_date', 'status', 'total'],
        where: search,
        skip,
        take: limit,
      };
      if (JSON.stringify(order) != JSON.stringify({ null: null }))
        dbQuery.order = order;
      const data = await this.invoiceRepository.find(dbQuery);
      if (!data.length) return responseMessage.noInvoice;
      let total = 0;

      data.forEach((invoice) => {
        invoice.invoice_number = invoice.invoice_number.split('_')[1];
        if (invoice.status == PaymentStatus.Outstanding) {
          total += +invoice.total;
        }
      });
      return {
        ...responseMessage.getInvoice,
        data,
        total,
      };
    } catch (e) {
      return e;
    }
  }

  async getInvoiceDetails(user: getInvoiceParams, name: string) {
    try {
      const invoiceNumber = `${user}_${name}`;
      const isInvoice = await this.invoiceRepository.findOne({
        where: { invoice_number: invoiceNumber },
      });
      if (!isInvoice) throw new BadRequestException('Invoice Not Found');
      isInvoice.invoice_number = name;
      delete isInvoice.created_at;
      delete isInvoice.updated_at;
      return { ...responseMessage.getInvoice, data: isInvoice };
    } catch (e) {
      return e;
    }
  }

  async checkInvoice(user: getInvoiceParams, number: string) {
    try {
      const invoiceNumber = `${user}_${number}`;
      const invoice = await this.invoiceRepository.findOne({
        where: { invoice_number: invoiceNumber },
      });
      if (!invoice) return false;
      return invoiceNumber;
    } catch (e) {
      return e;
    }
  }

  async createInvoice(
    createInvoiceDetails: createInvoiceParams,
    user: getInvoiceParams,
  ) {
    try {
      const invoiceNumber = `${user}_${createInvoiceDetails.invoiceNumber}`;
      const isInvoice = await this.invoiceRepository.findOne({
        where: { invoice_number: invoiceNumber },
      });
      if (isInvoice) return errorMessage.invoiceExists;

      const tax = createInvoiceDetails.tax ? createInvoiceDetails.tax : 0;
      const orderItems = createInvoiceDetails.orderItem;
      const subTotalAmount = mapper.calculateTotalAmount(orderItems);
      const taxAmount = subTotalAmount * (tax / 100);
      const total = subTotalAmount + taxAmount;
      const logo = createInvoiceDetails.logo;
      const invoice = {
        logo: logo,
        invoice_name: createInvoiceDetails.invoiceName,
        from_id: user.toString(),
        from_name: createInvoiceDetails.fromName,
        from_email: createInvoiceDetails.fromEmail,
        from_address: createInvoiceDetails.fromAddress,
        from_mobile: createInvoiceDetails.fromMobile,
        from_business_id: createInvoiceDetails.fromBusinessId,
        to_name: createInvoiceDetails.toName,
        to_email: createInvoiceDetails.toEmail,
        to_address: createInvoiceDetails.toAddress,
        to_mobile: createInvoiceDetails.toMobile,
        invoice_number: invoiceNumber,
        issue_date: new Date(createInvoiceDetails.issueDate),
        currency: createInvoiceDetails.currency,
        status: createInvoiceDetails.status,
        order_items: orderItems,
        tax_rate: tax,
        sub_total: subTotalAmount,
        tax_amount: taxAmount,
        total: total,
        created_at: new Date(),
        updated_at: new Date(),
      };
      return await this.invoiceRepository.save(invoice);
    } catch (e) {
      return e;
    }
  }

  async checkFile(file: Express.Multer.File) {
    if (!file) return errorMessage.invalidLogoFileNull;

    if (file.size > 2000000) return errorMessage.invalidLogoFileSize;
    const fileType = file.originalname.split('.').pop();
    if (fileType !== 'jpg' && fileType !== 'png')
      return errorMessage.invalidLogoFileType;

    return responseMessage.validLogoFile;
  }

  async saveFile(user: getInvoiceParams, file: Express.Multer.File) {
    const filename = `${user}_${uuidv4()}${path.extname(file.originalname)}`;
    const logoFolder = path.join(__dirname, '..', '..', 'files', 'logos');
    if (!fs.existsSync(logoFolder))
      fs.mkdirSync(logoFolder, { recursive: true });
    fs.writeFileSync(`files/logos/${filename}`, file.buffer);
    return filename;
  }

  async updateInvoice(
    updateInvoiceNumber: string,
    updateInvoiceDetails: updateInvoiceParams,
    user: getInvoiceParams,
  ) {
    try {
      const invoiceNumber = `${user}_${updateInvoiceNumber}`;
      const invoice = await this.invoiceRepository.findOne({
        where: { invoice_number: invoiceNumber },
      });
      if (!invoice) throw new BadRequestException('Invoice Not Found');
      if (updateInvoiceDetails.orderItem.length) {
        invoice.sub_total = mapper.calculateTotalAmount(
          updateInvoiceDetails.orderItem,
        );
        invoice.tax_amount = invoice.sub_total * (invoice.tax_rate / 100);
        invoice.total = invoice.sub_total + invoice.tax_amount;
      }
      invoice.from_name = updateInvoiceDetails.fromName
        ? updateInvoiceDetails.fromName
        : invoice.from_name;
      invoice.invoice_number = invoiceNumber;
      invoice.from_email = updateInvoiceDetails.fromEmail
        ? updateInvoiceDetails.fromEmail
        : invoice.from_email;
      invoice.issue_date = updateInvoiceDetails.issueDate
        ? new Date(updateInvoiceDetails.issueDate)
        : invoice.issue_date;
      invoice.from_address = updateInvoiceDetails.fromAddress
        ? updateInvoiceDetails.fromAddress
        : invoice.from_address;
      invoice.from_mobile = updateInvoiceDetails.fromMobile
        ? updateInvoiceDetails.fromMobile
        : invoice.from_mobile;
      invoice.from_business_id = updateInvoiceDetails.fromBusinessId
        ? updateInvoiceDetails.fromBusinessId
        : invoice.from_business_id;
      invoice.logo = updateInvoiceDetails.logo
        ? updateInvoiceDetails.logo
        : invoice.logo;
      invoice.to_name = updateInvoiceDetails.toName
        ? updateInvoiceDetails.toName
        : invoice.to_name;
      invoice.to_email = updateInvoiceDetails.toEmail
        ? updateInvoiceDetails.toEmail
        : invoice.to_email;
      invoice.to_address = updateInvoiceDetails.toAddress
        ? updateInvoiceDetails.toAddress
        : invoice.to_address;
      invoice.to_mobile = updateInvoiceDetails.toMobile
        ? updateInvoiceDetails.toMobile
        : invoice.to_mobile;
      invoice.order_items = updateInvoiceDetails.orderItem
        ? updateInvoiceDetails.orderItem
        : invoice.order_items;
      invoice.tax_rate = updateInvoiceDetails.tax
        ? updateInvoiceDetails.tax
        : invoice.tax_rate;
      invoice.currency = updateInvoiceDetails.currency
        ? updateInvoiceDetails.currency
        : invoice.currency;
      invoice.status = updateInvoiceDetails.status
        ? updateInvoiceDetails.status
        : invoice.status;
      invoice.updated_at = new Date();

      const savedInvoice = await this.invoiceRepository.save(invoice);
      return savedInvoice;
    } catch (e) {
      return e;
    }
  }

  async deleteInvoice(user: getInvoiceParams, deleteInvoiceNumber: string) {
    try {
      const invoiceNumber = `${user}_${deleteInvoiceNumber}`;
      const invoice = await this.invoiceRepository.findOne({
        where: { invoice_number: invoiceNumber },
      });
      if (!invoice) throw new BadRequestException('Invoice Not Found');
      const logo = `${logoFolder}/${invoice.logo}`;
      const pdf = `${pdfFolder}${invoice.invoice_number}`;
      if (fs.existsSync(logo))
        fs.unlink(logo, (err) => {
          if (err) console.log(err);
          return;
        });
      if (fs.existsSync(pdf))
        fs.unlink(pdf, (err) => {
          if (err) console.log(err);
          return;
        });
      await this.invoiceRepository.remove(invoice);
      return;
    } catch (e) {
      return e;
    }
  }

  async invoicePaid(user: getInvoiceParams, paidInvoiceNumber: string) {
    try {
      const invoiceNumber = `${user}_${paidInvoiceNumber}`;
      const invoice = await this.invoiceRepository.findOne({
        where: { invoice_name: invoiceNumber },
      });
      if (!invoice) throw new BadRequestException('Invoice Not Found');
      invoice.status = PaymentStatus.Paid;

      await this.invoiceRepository.save(invoice);
      return responseMessage.invoicePaid;
    } catch (e) {
      return e;
    }
  }
}
