// Simular datos que vienen al hacer clic en una zona
const zonaSeleccionada = {
  tipo: localStorage.getItem('tipoEntrada'),
  precio: parseFloat(localStorage.getItem('precioEntrada')),
  cantidad: parseInt(localStorage.getItem('cantidadEntrada')),
  idEvento: localStorage.getItem('idEvento')
};

//Redirige a la pagina principal si los datos de la entrada a comprar están vacíos
// Redirigir si no hay datos de compra en localStorage
if (
    !localStorage.getItem('tipoEntrada') ||
    !localStorage.getItem('precioEntrada') ||
    !localStorage.getItem('cantidadEntrada') ||
    !localStorage.getItem('idEvento')
) {
    window.location.href = '/';
}
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
    headers: { "Content-Type": "application/json" },
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
      if (data.ok) {
        if (data.ok) {
            localStorage.removeItem('tipoEntrada');
            localStorage.removeItem('precioEntrada');
            localStorage.removeItem('cantidadEntrada');
            localStorage.removeItem('idEvento');
            window.location.href = "/compra_exito";
        }
      } else {
        alert("Ha habido un error al procesar la compra.");
      }
    })
    .catch(error => console.error("ERROR:", error));
  // Aquí podrías hacer un fetch POST a tu backend para guardar la compra

});


document.getElementById("ventanaAnterior").addEventListener('click', () => {
  window.history.back();
});

document.getElementById("metodoPago").addEventListener("change", function () {
  const metodo = this.value;
  const datosTarjeta = document.getElementById("datosTarjeta");
  if (metodo === "tarjeta") {
    datosTarjeta.style.display = "block";
  } else {
    datosTarjeta.style.display = "none";
  }
});

async function checkAuth() {
    return fetch('/check-auth', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.logueado) {
            window.location.href = '/login';
        }
    })
    .catch(error => {
        console.error("Error al verificar autenticación:", error);
        window.location.href = '/login';
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    // Aquí podrías cargar más datos si es necesario
});
