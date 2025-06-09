document.addEventListener("DOMContentLoaded", () => {
    getEntradas();
});

//Funcion para conseguir las entradas de un usuario
function getEntradas() {
    fetch("/api/entradas", {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(entradas => {
        const container = document.getElementById("entradas-container");
        container.innerHTML = "";

        if (entradas.length === 0) {
            container.innerHTML = "<p>No tienes entradas disponibles.</p>";
            return;
        }

        //recorro cada entrada y creo la carta que nos muestran las entradas
        entradas.forEach(entrada => {
            const card = document.createElement("div");
            card.classList.add("card");
            console.log(entrada);
            card.innerHTML = `
                <h3>${entrada.evento}</h3>
                <p><strong>Lugar:</strong> ${entrada.lugar}</p>
                <p><strong>Fecha:</strong> ${new Date(entrada.fecha).toLocaleDateString()}</p>
                <p><strong>Precio:</strong> ${entrada.precio.toFixed(2)} €</p>
                <div class="qr" style="margin-top: 10px;"></div>                
                <div class="mensaje-error" style="color: red; font-size: 0.9rem; margin-top: 5px;"></div>
                
                <div class="valoracion" data-codigo="${entrada.codigo}" data-evento="${entrada.id_evento}">
                    <div class="estrellas">
                    ${[1,2,3,4,5].map(num => `<span class="estrella" data-valor="${num}">&#9733;</span>`).join('')}
                    </div>
                    <textarea placeholder="Escribe tu comentario..."></textarea>
                    <button class="enviar-btn">Enviar valoración</button>
                </div>
                `;

            container.appendChild(card);

            new QRCode(card.querySelector(".qr"), {
                text: entrada.codigo,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff"
            });

        });

        document.querySelectorAll('#entradas-container .card h3').forEach(h3 => {
          if(h3.textContent.trim() === "undefined") {
            h3.parentElement.style.display = "none";
          }
        });
    })
    .catch(error => {
        console.error("Error al cargar entradas:", error);
    });
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('estrella')) {
    const valor = parseInt(e.target.getAttribute('data-valor'));
    const estrellas = e.target.parentElement.querySelectorAll('.estrella');

    // Para pintar las estrellas
    estrellas.forEach((estrella, i) => {
      estrella.classList.toggle('seleccionada', i < valor);
    });
    e.target.parentElement.setAttribute('data-seleccion', valor);
  }

  if (e.target.classList.contains('enviar-btn')) {
    const contenedor = e.target.closest('.valoracion');
    const estrellasElem = contenedor.querySelector('.estrellas');
    const estrellas = parseInt(estrellasElem.getAttribute('data-seleccion')) || 0;
    const comentario = contenedor.querySelector('textarea').value.trim();
    const id_evento = contenedor.getAttribute('data-evento');
    const mensajeError = contenedor.parentElement.querySelector('.mensaje-error');
    console.log(id_evento);
    mensajeError.textContent = '';

    // Validación básica
    if (estrellas === 0 || comentario === '') {
      mensajeError.textContent = 'Por favor selecciona una valoración y escribe una reseña';
      return;
    }

    if (!id_evento) {
      mensajeError.textContent = 'Error: no se encontró el ID del evento.';
      return;
    }

    // Enviar comentario al backend
    fetch('/api/comentarios/new-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        evento: id_evento,  // Fíjate que en el backend usas "evento" (nombre), no "id_evento". Si necesitas enviar id_evento, revisa backend.
        comentario,
        valoracion: estrellas
      })
    })
    .then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al enviar el comentario');
      }
      return res.json();
    })
    .then(data => {
      alert("Gracias por tu valoración");
      // Limpio campos
      contenedor.querySelector('textarea').value = '';
      estrellasElem.querySelectorAll('.estrella').forEach(el => el.classList.remove('seleccionada'));
      estrellasElem.removeAttribute('data-seleccion');
    })
    .catch(error => {
      mensajeError.textContent = error.message;
      alert("No se pudo realizar la valoración");
    });
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
});