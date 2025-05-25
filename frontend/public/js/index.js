import { hideItems, showItems } from "./utils.js";


const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
function checkUser() {

  fetch("/check-auth")
    .then(response => response.json())
    .then(data => {
      if (!data.logueado) {
        hideItems([logoutBtn]);
        showItems([loginBtn, registerBtn]);

      } else {
        hideItems([loginBtn, registerBtn]);
        showItems([logoutBtn]);
      }
    });
}

loginBtn.addEventListener('click', () => {
  window.location.href = './login';
});
registerBtn.addEventListener('click', () => {
  window.location.href = './register';
});
logoutBtn.addEventListener('click', async () => {
  await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/';
});


document.addEventListener('DOMContentLoaded', () => {
  checkUser();
  const toggleBtn = document.getElementById('filtroTicket');
  const cerrarBtn = document.getElementById('cerrarFiltro');
  const aside = document.getElementById('filtroAside');

  const toggleAside = () => {
    aside.classList.toggle('hidden');
  };

  toggleBtn.addEventListener('click', toggleAside);
  cerrarBtn.addEventListener('click', toggleAside);
});

// function cargarEventos() {
//   fetch("http://localhost:3000/api/eventos")
//     .then(response => response.json())
//     .then(eventos => pintarEventos(eventos))
//     .catch(err => console.error("Error cargando eventos", err));
// }

function pintarEventos(eventos) {
  const contenedor = document.querySelector('.eventos');
  contenedor.innerHTML = '';

  eventos.forEach(e => {
    if (!e.imagen || e.imagen.startsWith('blob:')) return;

    const fechaFormateada = new Date(e.fecha).toLocaleDateString();

    contenedor.innerHTML += `
      <div class="evento">
        <img src="${e.imagen}" alt="Imagen de ${e.nombre}" />
        <div class="info">
          <h3>${e.nombre}</h3>
          <p>${e.descripcion}</p>
          <p><strong>Lugar:</strong> ${e.lugar.nombre}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
          <button id="detallesEvento" class="btn details" data-id="${e._id}">Detalles del evento</button>
          <button class="comprar-btn">Comprar</button>
        </div>
      </div>
    `;
  });
}

//document.addEventListener('DOMContentLoaded', cargarEventos);