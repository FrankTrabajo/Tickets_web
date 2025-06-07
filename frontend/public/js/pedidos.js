document.addEventListener("DOMContentLoaded", () => {
    getPedidos();
});
function getPedidos() {
    fetch("/api/pedidos", {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(pedidos => {
        
        const container = document.getElementById("pedidos-container");
        container.innerHTML = "";

        if (pedidos.length === 0) {
            container.innerHTML = "<p>No tienes pedidos.</p>";
            return;
        }

        // Agrupar pedidos por fecha de compra
        const pedidosPorFechaCompra = {};
        const fechasMap = {};

        for (let i = 0; i < pedidos.length; i++) {
            const pedido = pedidos[i];
            const fechaCompra = new Date(pedido.fecha);
            const fechaStr = fechaCompra.toLocaleDateString("es-ES");

            if (!pedidosPorFechaCompra[fechaStr]) {
                pedidosPorFechaCompra[fechaStr] = [];
                fechasMap[fechaStr] = fechaCompra;
            }

            pedidosPorFechaCompra[fechaStr].push(pedido);
        }

        const fechasOrdenadas = Object.keys(pedidosPorFechaCompra).sort((a, b) => fechasMap[a] - fechasMap[b]);

        let mesActual = "";

        for (let i = 0; i < fechasOrdenadas.length; i++) {
            const fechaStr = fechasOrdenadas[i];
            const fechaObj = fechasMap[fechaStr];
            const pedidosDelDia = pedidosPorFechaCompra[fechaStr];

            const nombreMes = fechaObj.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric"
            });

            if (nombreMes !== mesActual) {
                mesActual = nombreMes;
                const tituloMes = document.createElement("h2");
                tituloMes.textContent = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
                container.appendChild(tituloMes);
            }

            const eventosAgrupados = {};
            let totalDia = 0;

            for (let j = 0; j < pedidosDelDia.length; j++) {
                const pedido = pedidosDelDia[j];
                totalDia += pedido.total;

                for (let k = 0; k < pedido.items.length; k++) {
                    const item = pedido.items[k];
                    const clave = `${item.evento}|${item.precio}`;

                    if (!eventosAgrupados[clave]) {
                        eventosAgrupados[clave] = {
                            evento: item.evento,
                            precio: item.precio,
                            cantidad: 1
                        };
                    } else {
                        eventosAgrupados[clave].cantidad++;
                    }
                }
            }

            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta-dia");

            const fechaTitulo = document.createElement("p");
            fechaTitulo.innerHTML = `<strong>Fecha:</strong> ${fechaStr}`;
            tarjeta.appendChild(fechaTitulo);

            const agrupados = Object.values(eventosAgrupados);
            for (let g = 0; g < agrupados.length; g++) {
                const item = agrupados[g];
                const linea = document.createElement("p");
                linea.textContent = `${item.cantidad} x entradas ${item.evento} ${item.precio.toFixed(2)} €`;
                tarjeta.appendChild(linea);
            }

            const totalTexto = document.createElement("p");
            totalTexto.classList.add("total");
            totalTexto.textContent = `Total del día: ${totalDia.toFixed(2)} €`;
            tarjeta.appendChild(totalTexto);

            container.appendChild(tarjeta);
        }
    })
    .catch(err => {
        console.error("Error al obtener pedidos:", err);
        const container = document.getElementById("pedidos-container");
        container.innerHTML = "<p>Error al cargar tus pedidos.</p>";
    });
}



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
});