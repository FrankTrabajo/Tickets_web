const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  total: { type: mongoose.Types.Decimal128, required: true },
  estado: { type: String, enum: ['pendiente', 'pagado', 'cancelado'], default: 'pendiente' },
  fecha_pedido: { type: Date, default: Date.now }
}, {
  collection: 'pedidos',
  versionKey: false
});

module.exports = mongoose.model('Pedido', pedidoSchema);
