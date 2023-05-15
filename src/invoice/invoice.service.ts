import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
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

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
    private emailService: EmailService,
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
      const parts = invoice.invoice_name.split('/');
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
    createInvoiceDetails.invoiceName = `${user}/${createInvoiceDetails.invoiceName}`;
    const tax = createInvoiceDetails.tax ? createInvoiceDetails.tax : 0;
    const orderItems = createInvoiceDetails.orderItem;
    const subTotalAmount = mapper.calculateTotalAmount(orderItems);
    const total = subTotalAmount + (subTotalAmount * tax) / 100;
    const invoice = {
      seller_name: createInvoiceDetails.sellerName,
      invoice_name: createInvoiceDetails.invoiceName,
      seller_id: user.toString(),
      seller_email: createInvoiceDetails.sellerEmail,
      billing_date: new Date(createInvoiceDetails.billingDate),
      seller_address_1: createInvoiceDetails.sellerAddress1,
      seller_address_2: createInvoiceDetails.sellerAddress2,
      seller_address_3: createInvoiceDetails.sellerAddress3,
      seller_mobile: createInvoiceDetails.sellerMobile,
      seller_gst: createInvoiceDetails.sellerGst,
      logo: 'null',
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
      creater_at: new Date(),
      updated_at: new Date(),
    };
    await this.invoiceRepository.save(invoice);
    return invoice;
  }
}
