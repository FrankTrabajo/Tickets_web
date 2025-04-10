const mongoose = require('mongoose');

const pedidoTicketSchema = new mongoose.Schema({
  id_pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
  id_ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true }
}, {
  collection: 'pedido_tickets',
  versionKey: false
});

module.exports = mongoose.model('PedidoTicket', pedidoTicketSchema);
