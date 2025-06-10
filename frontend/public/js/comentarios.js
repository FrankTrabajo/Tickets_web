document.addEventListener("DOMContentLoaded", () => {
    getComentarios();
});
/**
 * Se encarga de obtener todos los comentarios por usuario específico y mostrarlos en la web.
 */
function getComentarios() {
    fetch("/api/comentarios/usuario", {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(comentarios => {
        
        const container = document.getElementById("comentarios-container");
        container.innerHTML = "";

        if (comentarios.length === 0) {
            container.innerHTML = "<p>No has hecho ninguna reseña todavia</p>";
            return;
        }

        
      const agrupadosPorMes = {};

      comentarios.forEach(comentario => {
        const fechaObj = new Date(comentario.createdAt);
        const fechaStr = fechaObj.toLocaleDateString("es-ES");
        const mesStr = fechaObj.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

        if (!agrupadosPorMes[mesStr]) agrupadosPorMes[mesStr] = [];
        console.log(comentario);
        agrupadosPorMes[mesStr].push({
          fecha: fechaStr,
          evento: comentario.nombre_evento || "Evento desconocido",
          texto: comentario.comentario,
          valoracion: comentario.valoracion,
          nombreEvento: comentario.nombreEvento
        });
      });

      // Mostrar reseñas agrupadas por mes
      Object.keys(agrupadosPorMes).forEach(mes => {
        const titulo = document.createElement("h2");
        titulo.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
        container.appendChild(titulo);

        agrupadosPorMes[mes].forEach(resena => {
          console.log(resena);
          const tarjeta = document.createElement("div");
          tarjeta.classList.add("tarjeta-dia");

          tarjeta.innerHTML = `
            <p><strong>Fecha:</strong> ${resena.fecha} &nbsp;&nbsp; <strong>Entrada:</strong> ${resena.nombreEvento}</p>
            <p><strong>Comentario:</strong></p>
            <p>${resena.texto}</p>
            <p><strong>Valoración:</strong> ${renderEstrellas(resena.valoracion)}</p>
          `;

          container.appendChild(tarjeta);
        });
      });
    })
    .catch(err => {
      console.error("Error al cargar reseñas:", err);
      const container = document.getElementById("comentarios-container");
      container.innerHTML = "<p>Error al cargar tus reseñas.</p>";
    });
}

/**
 * Se encarga de mostrar las estrellas en función del valor recibido por la lectura del comentario.
 * @param {Number} valor 
 * @returns 
 */
function renderEstrellas(valor) {
  return [1, 2, 3, 4, 5]
    .map(i => (i <= valor ? "⭐" : "☆"))
    .join("");
}

/**
 * Se encarga de hacer una peticion para saber si el usuario actual está autenticado o no.
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