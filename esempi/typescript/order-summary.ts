interface OrderLine { name: string; quantity: number; unitPriceCents: number }
type Order = { id: string; customer: string; lines: OrderLine[]; status: 'draft' | 'paid' };

function summarize(order: Order) {
  const totalCents = order.lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
  return { orderId: order.id, customer: order.customer, totalCents, totalEuros: totalCents / 100 };
}

const order: Order = {
  id: 'o-100', customer: 'Giulia', status: 'paid',
  lines: [{ name: 'Tastiera', quantity: 2, unitPriceCents: 3590 }, { name: 'Cavo', quantity: 1, unitPriceCents: 890 }]
};
console.log(summarize(order)); // totalCents: 8070; totalEuros: 80.7
