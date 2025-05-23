// Simular datos que vienen al hacer clic en una zona
const zonaSeleccionada = {
    tipo: localStorage.getItem('tipoEntrada') || 'Pista',
    precio: parseFloat(localStorage.getItem('precioEntrada')) || 30,
    cantidad: parseInt(localStorage.getItem('cantidadEntrada')) || 100,
    idEvento: localStorage.getItem('idEvento')
};
const idEvento = localStorage.getItem('idEvento');

// Mostrar datos
document.getElementById('zonaNombre').textContent = zonaSeleccionada.tipo;
document.getElementById('precioEntrada').textContent = zonaSeleccionada.precio;
document.getElementById('entradasDisponibles').textContent = zonaSeleccionada.cantidad;

// Validar y simular compra
document.getElementById('formCompra').addEventListener('submit', function (e) {
    e.preventDefault();

    const cantidad = parseInt(document.getElementById('cantidad').value);
    const errorMsg = document.getElementById('mensajeError');
    const successMsg = document.getElementById('mensajeExito');
    errorMsg.textContent = '';
    successMsg.textContent = '';

    if (cantidad > 6) {
        errorMsg.textContent = 'No puedes comprar más de 6 entradas.';
        return;
    }

    if (cantidad > zonaSeleccionada.cantidad) {
        errorMsg.textContent = 'No hay suficientes entradas disponibles.';
        return;
    }

    // Simular una compra exitosa
    successMsg.textContent = `¡Compra realizada! Has comprado ${cantidad} entrada(s) para la zona ${zonaSeleccionada.tipo}. Total: ${cantidad * zonaSeleccionada.precio}€`;
    fetch("/api/compra/nueva_compra", {
      method: "POST",
      headers: { "Content-Type" : "application/json" },
      body: JSON.stringify({
        idEvento: zonaSeleccionada.idEvento,
        tipoEntrada: zonaSeleccionada.tipo,
        cantidad: cantidad,
        metodoPago: "tarjeta"
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log("Compra confirmada", data);
      })
      .catch(error => console.error("ERROR:", error));
    // Aquí podrías hacer un fetch POST a tu backend para guardar la compra
    
});


document.getElementById("ventanaAnterior").addEventListener('click', () => {
    window.history.back();
});

document.getElementById("metodoPago").addEventListener("change", function() {
      const metodo = this.value;
      const datosTarjeta = document.getElementById("datosTarjeta");
      if (metodo === "tarjeta") {
        datosTarjeta.style.display = "block";
      } else {
        datosTarjeta.style.display = "none";
      }
    });