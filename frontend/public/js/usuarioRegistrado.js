document.addEventListener("DOMContentLoaded", function(){
    fetch("/api/event/get_all_events")
        .then(response => response.json())
        .then(data=>{
            const contenedor = document.getElementById("contenedor-eventos");
            data.forEach(evento => {
                let totalEntradas = "Entradas no disponibles";
                let precioMinimo = 0;

                if(evento.entradas && evento.entradas.length > 0){
                    let sumaEntradas = 0;
                    let precios = [];
                    evento.entradas.forEach(entrada => {
                        sumaEntradas += entrada.cantidad;
                        precios.push(entrada.precio);
                    });

                    if(sumaEntradas > 0){
                        totalEntradas = sumaEntradas;
                        precioMinimo = Math.min(...precios);
                    }
                }

                let lugarNombre = "No especificado";
                if(evento.lugar && evento.lugar.nombre){
                    lugarNombre = evento.lugar.nombre;
                }else if(evento.lugar){
                    lugarNombre = evento.lugar;
                }

                const fecha = new Date (evento.fecha);
                const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day:'numeric',hour: '2-digit', minute: '2-digit'
                });

                let btnDisabled = "";

                if(totalEntradas === "Entradas no disponibles"){
                    btnDisabled = "disabled";
                }

                const card = document.createElement("div");
                card.classList.add("evento-card");

                const titulo = document.createElement("h3");
                titulo.textContent = evento.nombre;

                const fechaEl = document.createElement("p");
                fechaEl.innerHTML = `Fecha: ${fechaFormateada}`;

                const lugarEl = document.createElement("p");
                lugarEl.innerHTML = `Lugar: ${lugarNombre}`;

                const btnVerMas = document.createElement("button");
                btnVerMas.textContent = "Ver más";
                btnVerMas.className = "btn btn-secondary btn-sm me-2";
                btnVerMas.addEventListener("click", function () {
                window.location.href = `/admin_dashboard/details/${evento._id}`;
                });

                const btnComprar = document.createElement("button");
                btnComprar.textContent = "Comprar";
                btnComprar.className = "btn btn-primary btn-sm";
                btnComprar.disabled = btnDisabled === "disabled";
                btnComprar.addEventListener('click', () => {
                    fetch("/check-auth", {
                        method: "GET",
                        credentials: "include" // 🔒 Esto asegura que se envíen las cookies
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.logueado) {
                        // ✅ Usuario autenticado, redirigir a la compra
                        window.location.href = `/vistaEntradas/${evento._id}`;
                        } else {
                        // 🔒 No autenticado, redirigir a login
                        window.location.href = "/login.html";
                        }
                    })
                    .catch(err => {
                        console.error("Error verificando autenticación:", err);
                        window.location.href = "/login.html"; // Por si algo falla, redirigí al login
                    });
                });
                const infoDiv = document.createElement("div");
                infoDiv.className = "info-detalle";

                const capacidad = document.createElement("p");
                capacidad.innerHTML = `Capacidad: ${evento.capacidad}`;

                const entradasDisp = document.createElement("p");
                entradasDisp.innerHTML = `Entradas disponibles: ${totalEntradas}`;

                const precio = document.createElement("p");
                precio.innerHTML = `Precio desde: ${precioMinimo} €`;

                infoDiv.appendChild(capacidad);
                infoDiv.appendChild(entradasDisp);
                infoDiv.appendChild(precio);

                card.appendChild(titulo);
                card.appendChild(fechaEl);
                card.appendChild(lugarEl);
                card.appendChild(btnVerMas);
                card.appendChild(btnComprar);
                card.appendChild(infoDiv);

                contenedor.appendChild(card);

            });
        })
        .catch(error => console.error("Error cargando eventos:", error));
});