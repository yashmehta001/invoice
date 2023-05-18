import { OrderItem } from 'src/utils/user.dto';

export class mapper {
  static calculateTotalAmount(orderItems: OrderItem[]): number {
    let total = 0;
    for (const item of orderItems) {
      total += item.quantity * item.price;
    }
    return total;
  }
}
