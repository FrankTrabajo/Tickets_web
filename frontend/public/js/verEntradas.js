
document.addEventListener("DOMContentLoaded", async () => {
    const id = window.location.pathname.split('/').pop();
    if (id) {
        getEvent(id);
    }
});

/**
 * Se encarga de obtener todos los eventos y pintarlos mediante SVG.
 * @param {String} id 
 */
function getEvent(id) {
    const tooltip = document.getElementById('tooltip');
    const svg = document.getElementById("mapaZonas");

    const svgWidth = svg.viewBox.baseVal.width || svg.clientWidth;
    const svgHeight = svg.viewBox.baseVal.height || svg.clientHeight;

    fetch(`/api/event/details/${id}`)
        .then(response => response.json())
        .then(data => {
            const evento = data.evento;
            document.getElementById("nombreEvento").textContent = evento.nombre;
            document.getElementById("descripcionEvento").textContent = evento.descripcion;
            document.getElementById("fechaEvento").textContent = new Date(evento.fecha).toLocaleDateString();

            const zonas = evento.entradas;
            const pista = zonas.find(z => z.tipo.toLowerCase() === 'pista');
            const otrasZonas = zonas.filter(z => z.tipo.toLowerCase() !== 'pista');

            // CENTRO: Zona Pista
            if (pista) {
                const width = 250;
                const height = 150;
                const x = (svgWidth / 2) - (width / 2);
                const y = (svgHeight / 2) - (height / 2);
                agregarZona(pista, x, y, width, height, id, svg, tooltip);
            }

            // Tamaños de zona
            let zonaWidth = 200;
            let zonaHeight = 60;

            const centroX = svgWidth / 2;
            const centroY = svgHeight / 2;

            let arribaCount = 0;
            let derechaCount = 0;
            let abajoCount = 0;

            otrasZonas.forEach((zona, i) => {
                let x, y;

                if (arribaCount < 2) {
                    zonaHeight = 60;
                    zonaWidth = 200;
                    // Arriba (hasta 2)
                    x = centroX - zonaWidth - 10 + arribaCount * (zonaWidth + 20); // espacio entre zonas
                    y = centroY - 100 - zonaHeight;
                    arribaCount++;
                } else if (derechaCount < 1) {
                    zonaHeight = 150;
                    zonaWidth = 60;
                    // Derecha (hasta 2 en columna)
                    x = centroX + 150;
                    y = centroY - zonaHeight / 2 + (derechaCount * (zonaHeight + 20));
                    derechaCount++;
                } else {
                    zonaHeight = 60;
                    zonaWidth = 200;
                    // Abajo (el resto en fila)
                    x = centroX - zonaWidth - 10 + abajoCount * (zonaWidth + 20);
                    y = centroY + 100;
                    abajoCount++;
                }

                agregarZona(zona, x, y, zonaWidth, zonaHeight, id, svg, tooltip);
            });
        });
}

/**
 * Agrega las zonas de las entradas de los evento.
 * @param {SVG} zona 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 * @param {String} id 
 * @param {SVG} svg 
 * @param {String} tooltip 
 */
function agregarZona(zona, x, y, width, height, id, svg, tooltip) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("fill", "#90e0ef");
    rect.setAttribute("class", "zona");

    rect.dataset.tipo = zona.tipo;
    rect.dataset.precio = zona.precio;
    rect.dataset.cantidad = zona.cantidad;

    rect.addEventListener('mouseover', () => {
        tooltip.innerHTML = `
            <strong>${zona.tipo}</strong><br>
            Precio: ${zona.precio}€<br>
            Disponibles: ${zona.cantidad}
        `;
        tooltip.style.display = 'block';
    });

    rect.addEventListener('mousemove', (e) => {
        console.log("mousemove", e.clientX, e.clientY); // <-- este log
        tooltip.style.left = 500 +  'px';
        tooltip.style.top = 500 - 40 + 'px';

    });

    rect.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });

    rect.addEventListener('click', () => {
        localStorage.setItem('tipoEntrada', zona.tipo);
        localStorage.setItem('precioEntrada', zona.precio);
        localStorage.setItem('cantidadEntrada', zona.cantidad);
        localStorage.setItem('idEvento', id);
        window.location.href = '/comprar';
    });

    svg.appendChild(rect);
}

/**
 * Se encarga de comprobar si el usuario actual está autenticado o no, en caso de que no lo esté lo lleva al login.
 * @returns 
 */
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
