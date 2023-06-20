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
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import { getInvoices } from 'src/utils/dto/invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
  ) {}

  async getInvoice(user: getInvoiceParams, payload: getInvoices) {
    try {
      const { sortBy, sortOrder, params, invoiceNumber } = payload;
      const page = payload.page ?? 1;
      const skip = (+page - 1) * +limit;
      const userId = String(user);
      const search: typeGetDbSeach = {
        fromId: userId,
      };
      if (params) search.status = params;
      if (invoiceNumber) search.toName = Like(`%${invoiceNumber}%`);
      const order = {
        [sortBy]: sortOrder,
      };
      const dbQuery: Query = {
        select: ['invoiceNumber', 'toName', 'issueDate', 'status', 'total'],
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
        invoice.invoiceNumber = invoice.invoiceNumber.split('_')[1];
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
        where: { invoiceNumber: invoiceNumber },
      });
      if (!isInvoice) throw new BadRequestException('Invoice Not Found');
      isInvoice.invoiceNumber = name;
      delete isInvoice.createdAt;
      delete isInvoice.updatedAt;
      return { ...responseMessage.getInvoice, data: isInvoice };
    } catch (e) {
      return e;
    }
  }

  async checkInvoice(user: getInvoiceParams, number: string) {
    try {
      const invoiceNumber = `${user}_${number}`;
      const invoice = await this.invoiceRepository.findOne({
        where: { invoiceNumber: invoiceNumber },
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
        where: { invoiceNumber: invoiceNumber },
      });
      if (isInvoice) return errorMessage.invoiceExists;
      const tax = createInvoiceDetails.tax ?? 0;
      const orderItems = createInvoiceDetails.orderItem;
      const subTotalAmount = mapper.calculateTotalAmount(orderItems);
      const taxAmount = subTotalAmount * (tax / 100);
      const total = subTotalAmount + taxAmount;
      const invoice = {
        logo: createInvoiceDetails.logo,
        invoiceName: createInvoiceDetails.invoiceName,
        fromId: user.toString(),
        fromName: createInvoiceDetails.fromName,
        fromEmail: createInvoiceDetails.fromEmail,
        fromEddress: createInvoiceDetails.fromAddress,
        fromMobile: createInvoiceDetails.fromMobile,
        fromBusinessId: createInvoiceDetails.fromBusinessId,
        toName: createInvoiceDetails.toName,
        toEmail: createInvoiceDetails.toEmail,
        toAddress: createInvoiceDetails.toAddress,
        toMobile: createInvoiceDetails.toMobile,
        invoiceNumber: invoiceNumber,
        issueDate: createInvoiceDetails.issueDate,
        currency: createInvoiceDetails.currency,
        status: createInvoiceDetails.status,
        orderItems: orderItems,
        taxRate: tax,
        subTotal: subTotalAmount,
        taxAmount,
        total,
        createdAt: new Date(),
        updatedAt: new Date(),
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

  async saveLogo(user: getInvoiceParams, file: Express.Multer.File) {
    const logoName = `${user}_${uuid()}${path.extname(file.originalname)}`;
    const logoFolder = path.join(__dirname, '..', '..', 'files', 'logos');
    if (!fs.existsSync(logoFolder))
      fs.mkdirSync(logoFolder, { recursive: true });
    fs.writeFileSync(path.join(logoFolder, logoName), file.buffer);
    return logoName;
  }

  async saveSignature(user: getInvoiceParams, file: Express.Multer.File) {
    const signatureName = `${user}_${uuid()}${path.extname(file.originalname)}`;
    const signatureFolder = path.join(
      __dirname,
      '..',
      '..',
      'files',
      'signature',
    );
    if (!fs.existsSync(signatureFolder))
      fs.mkdirSync(signatureFolder, { recursive: true });
    fs.writeFileSync(path.join(signatureFolder, signatureName), file.buffer);
    return signatureName;
  }

  async updateInvoice(
    updateInvoiceNumber: string,
    updateInvoiceDetails: updateInvoiceParams,
    user: getInvoiceParams,
  ) {
    try {
      const invoiceNumber = `${user}_${updateInvoiceNumber}`;
      const invoice = await this.invoiceRepository.findOne({
        where: { invoiceNumber: invoiceNumber },
      });
      if (!invoice) throw new BadRequestException('Invoice Not Found');
      if (updateInvoiceDetails.orderItem.length) {
        invoice.subTotal = mapper.calculateTotalAmount(
          updateInvoiceDetails.orderItem,
        );
        invoice.taxAmount = invoice.subTotal * (invoice.taxRate / 100);
        invoice.total = invoice.subTotal + invoice.taxAmount;
      }
      invoice.fromName = updateInvoiceDetails.fromName ?? invoice.fromName;
      invoice.fromEmail = updateInvoiceDetails.fromEmail ?? invoice.fromEmail;
      invoice.issueDate =
        updateInvoiceDetails.issueDate !== undefined
          ? new Date(updateInvoiceDetails.issueDate)
          : invoice.issueDate;
      invoice.fromAddress =
        updateInvoiceDetails.fromAddress ?? invoice.fromAddress;
      invoice.fromMobile =
        updateInvoiceDetails.fromMobile ?? invoice.fromMobile;
      invoice.fromBusinessId =
        updateInvoiceDetails.fromBusinessId ?? invoice.fromBusinessId;
      invoice.logo = updateInvoiceDetails.logo ?? invoice.logo;
      invoice.toName = updateInvoiceDetails.toName ?? invoice.toName;
      invoice.toEmail = updateInvoiceDetails.toEmail ?? invoice.toEmail;
      invoice.toAddress = updateInvoiceDetails.toAddress ?? invoice.toAddress;
      invoice.toMobile = updateInvoiceDetails.toMobile ?? invoice.toMobile;
      invoice.orderItems = updateInvoiceDetails.orderItem ?? invoice.orderItems;
      invoice.taxRate = updateInvoiceDetails.tax ?? invoice.taxRate;
      invoice.currency = updateInvoiceDetails.currency ?? invoice.currency;
      invoice.status = updateInvoiceDetails.status ?? invoice.status;
      invoice.updatedAt = new Date();
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
        where: { invoiceNumber: invoiceNumber },
      });
      if (!invoice) throw new BadRequestException('Invoice Not Found');
      const logo = `${logoFolder}/${invoice.logo}`;
      const pdf = `${pdfFolder}${invoice.invoiceNumber}`;
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
        where: { invoiceName: invoiceNumber },
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
