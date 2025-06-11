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

  // Validar cantidad
  if (isNaN(cantidad)) {
    errorMsg.textContent = 'Por favor ingrese una cantidad válida';
    return;
  }

  if (cantidad <= 0) {
    errorMsg.textContent = 'La cantidad debe ser mayor a 0';
    return;
  }

  if (cantidad > 6) {
    errorMsg.textContent = 'No puedes comprar más de 6 entradas.';
    return;
  }

  if (cantidad > zonaSeleccionada.cantidad) {
    errorMsg.textContent = 'No hay suficientes entradas disponibles.';
    return;
  }

  // Validar método de pago si es tarjeta
  if (metodoPago.value === 'tarjeta' && !validarFormulario()) {
    // El mensaje de error ya se muestra en validarFormulario()
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

});

const metodoPago = document.getElementById('metodoPago');
const datosTarjeta = document.getElementById('datosTarjeta');
const numeroTarjeta = document.getElementById('numeroTarjeta');
const fechaExpiracion = document.getElementById('fechaExpiracion');
const cvv = document.getElementById('cvv');
const bntComprar = document.querySelector('button[type="submit"]');

metodoPago.addEventListener('change', () => {
  datosTarjeta.style.display = metodoPago.value === 'tarjeta' ? 'block' : 'none';
  validarFormulario();
});

// Formateo de tarjeta
numeroTarjeta.addEventListener('input', (e) => {
  let valor = e.target.value.replace(/\D/g, '').substring(0, 16);
  e.target.value = valor.replace(/(.{4})/g, '$1 ').trim();
  validarFormulario();
});

// Formateo de fecha
fechaExpiracion.addEventListener('input', (e) => {
  let valor = e.target.value.replace(/\D/g, '').substring(0, 4);
  if (valor.length >= 3) {
    e.target.value = valor.substring(0, 2) + '/' + valor.substring(2);
  } else {
    e.target.value = valor;
  }
  validarFormulario();
});

// Limite de dígitos en cvv
cvv.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
  validarFormulario();
});

function validarFormulario() {
  const errorMsg = document.getElementById('mensajeError');
  errorMsg.textContent = '';
  let valido = true;
  let mensajesError = [];

  if (metodoPago.value === 'tarjeta') {
    const num = numeroTarjeta.value.replace(/\s/g, '');
    const fecha = fechaExpiracion.value;
    const cvvVal = cvv.value;

    // Validar número de tarjeta
    if (!/^\d{16}$/.test(num)) {
      mensajesError.push('Número de tarjeta inválido (deben ser 16 dígitos)');
      valido = false;
    }

    // Validar fecha
    if (!/^\d{2}\/\d{2}$/.test(fecha)) {
      mensajesError.push('Formato de fecha inválido (MM/AA)');
      valido = false;
    } else {
      const [mes, año] = fecha.split('/').map(Number);
      const ahora = new Date();
      const añoActual = ahora.getFullYear() % 100;
      const mesActual = ahora.getMonth() + 1;

      if (año < añoActual || (año === añoActual && mes < mesActual)) {
        mensajesError.push('La tarjeta está expirada');
        valido = false;
      } else if (mes < 1 || mes > 12) {
        mensajesError.push('Mes de expiración inválido');
        valido = false;
      }
    }

    // Validar CVV
    if (!/^\d{3}$/.test(cvvVal)) {
      mensajesError.push('CVV inválido (deben ser 3 dígitos)');
      valido = false;
    }
  }

  // Mostrar todos los mensajes de error
  if (mensajesError.length > 0) {
    errorMsg.innerHTML = mensajesError.join('<br>');
  }

  bntComprar.disabled = !valido;
}


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
  validarFormulario();
  // Aquí podrías cargar más datos si es necesario
});
