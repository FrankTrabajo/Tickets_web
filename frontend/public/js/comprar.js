// Obtener elementos DOM desde el principio
const metodoPago = document.getElementById('metodoPago');
const datosTarjeta = document.getElementById('datosTarjeta');
const numeroTarjeta = document.getElementById('numeroTarjeta');
const fechaExpiracion = document.getElementById('fechaExpiracion');
const cvv = document.getElementById('cvv');
const btnComprar = document.getElementById('btn-success');

// Simular datos que vienen al hacer clic en una zona
const zonaSeleccionada = {
    tipo: localStorage.getItem('tipoEntrada'),
    precio: parseFloat(localStorage.getItem('precioEntrada')),
    cantidad: parseInt(localStorage.getItem('cantidadEntrada')),
    idEvento: localStorage.getItem('idEvento')
};

// Redirigir si no hay datos de compra en localStorage
if (
    !zonaSeleccionada.tipo ||
    !zonaSeleccionada.precio ||
    !zonaSeleccionada.cantidad ||
    !zonaSeleccionada.idEvento
) {
    window.location.href = '/';
}

// Mostrar datos
document.getElementById('zonaNombre').textContent = zonaSeleccionada.tipo;
document.getElementById('precioEntrada').textContent = zonaSeleccionada.precio;
document.getElementById('entradasDisponibles').textContent = zonaSeleccionada.cantidad;

// Validar y simular compra
document.getElementById('formCompra').addEventListener('submit', function (e) {
    e.preventDefault();

    const cantidad = parseInt(document.getElementById('cantidad').value);
    const metodo = metodoPago.value;
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

    // Validar método de pago
    if (!metodo) {
        errorMsg.textContent = 'Debes seleccionar un método de pago.';
        return;
    }

    if (metodo === 'tarjeta' && !validarFormulario()) {
        // Mensajes ya mostrados por validarFormulario
        return;
    }

    // Simular compra exitosa
    successMsg.textContent = `¡Compra realizada! Has comprado ${cantidad} entrada(s) para la zona ${zonaSeleccionada.tipo}. Total: ${cantidad * zonaSeleccionada.precio}€`;

    fetch("/api/compra/nueva_compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            idEvento: zonaSeleccionada.idEvento,
            tipoEntrada: zonaSeleccionada.tipo,
            cantidad: cantidad,
            metodoPago: metodo
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                localStorage.removeItem('tipoEntrada');
                localStorage.removeItem('precioEntrada');
                localStorage.removeItem('cantidadEntrada');
                localStorage.removeItem('idEvento');
                window.location.href = "/compra_exito";
            } else {
                alert("Ha habido un error al procesar la compra.");
            }
        })
        .catch(error => {
            console.error("ERROR:", error);
            alert("Error al procesar la compra.");
        });
});

metodoPago.addEventListener('change', () => {
    datosTarjeta.style.display = metodoPago.value === 'tarjeta' ? 'block' : 'none';
    validarFormulario();
});

numeroTarjeta.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = valor.replace(/(.{4})/g, '$1 ').trim();
    validarFormulario();
});

fechaExpiracion.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (valor.length >= 3) {
        e.target.value = valor.substring(0, 2) + '/' + valor.substring(2);
    } else {
        e.target.value = valor;
    }
    validarFormulario();
});

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

        if (!/^\d{16}$/.test(num)) {
            mensajesError.push('Número de tarjeta inválido (deben ser 16 dígitos)');
            valido = false;
        }

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

        if (!/^\d{3}$/.test(cvvVal)) {
            mensajesError.push('CVV inválido (deben ser 3 dígitos)');
            valido = false;
        }
    }

    if (mensajesError.length > 0) {
        errorMsg.innerHTML = mensajesError.join('<br>');
    }

    btnComprar.disabled = !valido;
    return valido;
}

document.getElementById("ventanaAnterior").addEventListener('click', () => {
    window.history.back();
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
});
