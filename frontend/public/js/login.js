/**
 * Funcion que nos crea el formulario de login
 */
function loginForm() {
    let formContainer = document.getElementById('form-container');
    let h1Login = document.createElement('h1');
    h1Login.textContent = "Login";
    formContainer.appendChild(h1Login);
    let form = document.getElementById('login-form');
    let labelEmail = document.createElement('label');
    labelEmail.textContent = "Correo electrónico";
    let inputEmail = document.createElement('input');
    inputEmail.type = 'email';
    inputEmail.name = 'email';
    inputEmail.id = 'email';
    inputEmail.placeholder = "Correo electrónico";

    let labelPassword = document.createElement('label');
    labelPassword.textContent = "Contraseña";
    let inputPassword = document.createElement('input');
    inputPassword.type = 'password';
    inputPassword.name = 'password';
    inputPassword.id = 'password';
    inputPassword.placeholder = "Contraseña";

    // Botón para mostrar/ocultar contraseña usando Bootstrap Icons
    let togglePassword = document.createElement('button');
    togglePassword.type = 'button';
    togglePassword.style.marginLeft = '8px';
    togglePassword.style.background = 'none';
    togglePassword.style.border = 'none';
    togglePassword.style.cursor = 'pointer';

    let iconEye = document.createElement('i');
    iconEye.className = 'bi bi-eye';
    togglePassword.appendChild(iconEye);

    togglePassword.addEventListener('click', function () {
        if (inputPassword.type === 'password') {
            inputPassword.type = 'text';
            iconEye.className = 'bi bi-eye-slash';
        } else {
            inputPassword.type = 'password';
            iconEye.className = 'bi bi-eye';
        }
    });

    let inputSubmit = document.createElement('input');
    inputSubmit.type = "submit";
    inputSubmit.id = 'submit';
    inputSubmit.value = "Iniciar sesión";
    inputSubmit.addEventListener('click', function (e) {
        e.preventDefault();
        loginUser();
    });

    form.appendChild(labelEmail);
    form.appendChild(inputEmail);
    form.appendChild(labelPassword);

    // Contenedor para input y botón juntos
    let passwordContainer = document.createElement('div');
    passwordContainer.style.display = 'flex';
    passwordContainer.style.alignItems = 'center';
    passwordContainer.appendChild(inputPassword);
    passwordContainer.appendChild(togglePassword);

    form.appendChild(passwordContainer);
    form.appendChild(inputSubmit);

    formContainer.appendChild(form);

    let p = document.createElement('p');
    p.classList.add('texto-login');
    let a = document.createElement('a');
    p.textContent = '¿Aún no tienes cuenta? ';
    a.textContent = 'Registrarse';
    a.href = '/register';
    a.classList.add('link-login');
    p.appendChild(a);
    formContainer.appendChild(p);

    let forgot_p = document.createElement('p');
    forgot_p.classList.add('texto-login');
    let forgot_a = document.createElement('a');
    forgot_p.textContent = '¿Olvidaste tu contraseña? Si es así pincha ';
    forgot_a.textContent = 'aquí';
    forgot_a.href = '/forgot-password';
    forgot_a.classList.add('link-login');
    forgot_p.appendChild(forgot_a);
    formContainer.appendChild(forgot_p);
}

loginForm();

/**
 * Función que  nos envía los datos del login al servidor y 
 * nos permite manejar la autenticación del usuario.
 */
function loginUser() {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const pError = document.getElementById('pError');
    if (!email || !password) {
        mostrarError("Todos los campos son obligatorios");
        return;
    }

    fetch("api/user/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email, password
        }),
        credentials: 'include'
    })
        .then(message => message.json())
        .then(data => {
            if (data.message === 'Login correcto') {
                fetch("/check-superadmin", {
                    method: 'GET',
                    credentials: "include"
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.super_admin) {
                            window.location.href = "/super-admin-dashboard";
                        } else {
                            fetch("/check-admin", {
                                method: 'GET',
                                credentials: "include"
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.admin) {
                                        window.location.href = "/admin_dashboard";
                                    } else {
                                        window.location.href = "/";
                                    }
                                })
                                .catch(error => console.error("ERROR: " + error));
                        }
                    })
                    .catch(error => console.error("ERROR: " + error));

            } else {
                mostrarError("Error al iniciar sesion, compruebe su contraseña y su email");
                return;
            }
        })
        .catch(err => console.error(err));
}

/**
 * Funcion que nos muestra un mensaje de error si es que lo hay 
 * @param {string} mensaje 
 */
function mostrarError(mensaje) {
    let pError = document.getElementById('pError');
    pError.classList.remove('hide');
    pError.classList.add('error');
    pError.textContent = mensaje;
}

async function checkAuth() {
    return fetch('/check-auth', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.logueado) {
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
    // Aquí podrías cargar más datos si es necesario
});