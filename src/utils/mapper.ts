import { OrderItem } from './dto/invoice.dto';

export class mapper {
  static calculateTotalAmount(orderItems: OrderItem[]): number {
    let total = 0;
    for (const item of orderItems) total += item.quantity * item.price;
    return total;
  }

  static generateOTP() {
    return Math.floor(Math.random() * 900000) + 100000;
  }
}
