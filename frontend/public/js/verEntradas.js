
document.addEventListener("DOMContentLoaded", async () => {
    const id = window.location.pathname.split('/').pop();
    if (id) {
        getEvent(id);
    }
});


function getEvent(id) {

    const tooltip = document.getElementById('tooltip');
    const svg = document.getElementById("mapaZonas");

    const svgWidth = svg.viewBox.baseVal.width || svg.clientWidth;
    const svgHeight = svg.viewBox.baseVal.height || svg.clientHeight;

    let nonPistaIndex = 0;

    fetch(`/api/event/details/${id}`)
        .then(response => response.json())
        .then(data => {
            let evento = data.evento;
            document.getElementById("nombreEvento").textContent = evento.nombre;
            document.getElementById("descripcionEvento").textContent = evento.descripcion;
            document.getElementById("fechaEvento").textContent = new Date(evento.fecha).toLocaleDateString();

            const zonas = evento.entradas;

            zonas.forEach((zona, index) => {
                let width, height, x, y;

                if (zona.tipo.toLowerCase() === 'pista') {
                    width = 250;
                    height = 150;
                    x = (svgWidth / 2) - (width / 2);
                    y = (svgHeight / 2);
                } else {
                    width = 300;
                    height = 70;
                    x = (svgWidth / 2) - (width / 2);
                    y = (svgHeight / 2) - height - 40 - nonPistaIndex * (height + 10);
                    nonPistaIndex++;
                }

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

                rect.addEventListener('mouseover', (e) => {
                    tooltip.innerHTML = `
                    <strong>${zona.tipo}</strong<br>
                    Precio: ${zona.precio}€<br>
                    Disponibles: ${zona.cantidad}
                `;
                    tooltip.style.display = 'block';
                });

                rect.addEventListener('mousemove', (e) => {
                    tooltip.style.left = e.pageX + 10 + 'px';
                    tooltip.style.top = e.pageY + 10 + "px";
                });

                rect.addEventListener('mouseleave', (e) => {
                    tooltip.style.display = 'none';
                })

                rect.addEventListener('click', () => {
                    localStorage.setItem('tipoEntrada', zona.tipo);
                    localStorage.setItem('precioEntrada', zona.precio);
                    localStorage.setItem('cantidadEntrada', zona.cantidad);
                    window.location.href = '/comprar'; // O la ruta real del archivo
                });

                svg.appendChild(rect);


            });
        })
}