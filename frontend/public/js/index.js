document.addEventListener('DOMContentLoaded', () => {
  const authButtons = document.getElementById('auth-buttons');
  const usuarioLogueado = localStorage.getItem('usuarioLogueado') === 'true';

  if(usuarioLogueado) {
    authButtons.innerHTML = `<button id="logoutBtn">Cerrar sesión</button>`;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('usuarioLogueado');
      location.reload();
    });
  }else{
    authButtons.innerHTML = `
      <button id="loginBtn">Iniciar sesión</button>
      <button id="registerBtn">Registrarse</button>
    `;
    document.getElementById('loginBtn').addEventListener('click', () => {
      window.location.href = './login.html';
    });
    document.getElementById('registerBtn').addEventListener('click', () => {
      window.location.href = './register.html';
    });
  }
  
  //Botones de compra
  setTimeout(() => {
    document.querySelectorAll('.comprar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if(usuarioLogueado) {
          window.location.href = './compra.html';
        }else{
          window.location.href = './login.html';
        }
      });
    });
  }, 500);
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('filtroTicket');
  const cerrarBtn = document.getElementById('cerrarFiltro');
  const aside = document.getElementById('filtroAside');

  const toggleAside = () => {
    aside.classList.toggle('hidden');
  };

  toggleBtn.addEventListener('click', toggleAside);
  cerrarBtn.addEventListener('click', toggleAside);
});

function cargarEventos() {
  fetch("http://localhost:3000/api/eventos")
    .then(response => response.json())
    .then(eventos => pintarEventos(eventos))
    .catch(err => console.error("Error cargando eventos", err));
}

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
          <button class="comprar-btn">Comprar</button>
        </div>
      </div>
    `;
  });
}

document.addEventListener('DOMContentLoaded', cargarEventos);