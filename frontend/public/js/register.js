
/**
 * Funcion crear el formulario del registro
 */
function registerForm() {
    //nombre, email y password

    let formContainer = document.getElementById('form-container');
    let h1Register = document.createElement('h1');
    h1Register.textContent = "Crear nueva cuenta";
    formContainer.appendChild(h1Register);

    let form = document.getElementById('register-form');
    let labelName = document.createElement('label');
    labelName.textContent = "Nombre de usuario";

    //Nombre de usuario
    let inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.name = 'nombre';
    inputName.id = 'nombre';
    inputName.placeholder = 'Nombre de usuario';
    inputName.required = true;

    //Mensaje de error del nombre
    let errorName = document.createElement('p');
    errorName.id = 'errorName';
    errorName.style.color = 'red';
    errorName.style.display = 'none';

    //Correo eletrónico
    let labelEmail = document.createElement('label');
    labelEmail.textContent = "Correo electrónico";
    let inputEmail = document.createElement('input');
    inputEmail.type = 'email';
    inputEmail.name = 'email';
    inputEmail.id = 'email';
    inputEmail.placeholder = "Correo electrónico";
    inputEmail.required = true;

    //Mensaje de error del email
    let errorEmail = document.createElement('p');
    errorEmail.id = 'errorEmail';
    errorEmail.style.color = 'red';
    errorEmail.style.display = 'none';

    //Contraseña
    let labelPassword = document.createElement('label');
    labelPassword.textContent = "Contraseña";
    let inputPassword = document.createElement('input');
    inputPassword.type = 'password';
    inputPassword.name = 'password1';
    inputPassword.id = 'password1';
    inputPassword.placeholder = "Contraseña";
    inputPassword.required = true;

    let labelPassword2 = document.createElement('label');
    labelPassword2.textContent = "Contraseña";
    let inputPassword2 = document.createElement('input');
    inputPassword2.type = 'password';
    inputPassword2.name = 'password2';
    inputPassword2.id = 'password2';
    inputPassword2.placeholder = "Confirme su contraseña";
    inputPassword2.required = true;

    //Mensaje de error de la contraseña
    let errorPwd = document.createElement('p');
    errorPwd.id = 'errorPwd';
    errorPwd.style.color = 'red';
    errorPwd.style.display = 'none';

    let inputSubmit = document.createElement('input');
    inputSubmit.type = "submit";
    inputSubmit.id = 'submit';
    inputSubmit.value = "Crear usuario";
    inputSubmit.addEventListener('click', function (e) {
        e.preventDefault();
        if (validarFormulario()) {
            registrar();
        }
    })

    form.appendChild(labelName);
    form.appendChild(inputName);
    form.appendChild(errorName);
    form.appendChild(labelEmail);
    form.appendChild(inputEmail);
    form.appendChild(errorEmail);
    form.appendChild(labelPassword);
    form.appendChild(inputPassword);
    form.appendChild(labelPassword2);
    form.appendChild(inputPassword2);
    form.appendChild(errorPwd);
    form.appendChild(inputSubmit);

    formContainer.appendChild(form);

    let p = document.createElement('p');
    p.classList.add('texto-login');
    let a = document.createElement('a');
    p.textContent = '¿Ya tienes cuenta? ';
    a.textContent = 'Iniciar sesión';
    a.href = '/login';
    a.classList.add('link-login');
    p.appendChild(a);
    formContainer.appendChild(p);
}

function validarFormulario() {
    let name = document.getElementById('nombre').value.trim();
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password1').value.trim();
    let password2 = document.getElementById('password2').value.trim();
    let valido = true;

    let errorName = document.getElementById('errorName');
    if (name.length < 3 || name.length > 20) {
        errorName.textContent = 'El nombre tiene q tener entre 3 y 20 caracteres'
        errorName.style.display = 'block';
        valido = false;
    } else {
        errorName.style.display = 'none';
    }

    let errorEmail = document.getElementById('errorEmail');
    let contenidoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contenidoEmail.test(email)) {
        errorEmail.textContent = 'El email es incorrecto';
        errorEmail.style.display = 'block';
        valido = false;
    } else {
        errorEmail.style.display = 'none';
    }

    let errorPwd = document.getElementById('errorPwd');
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!regexPassword.test(password)) {
        errorPwd.textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.';
        errorPwd.style.display = 'block';
        valido = false;
    } else if (password !== password2) {
        errorPwd.textContent = 'Las contraseñas no coinciden.';
        errorPwd.style.display = 'block';
        valido = false;
    } else {
        errorPwd.style.display = 'none';
    }


    return valido;
}

registerForm();

/**
 * Función para registrar un nuevo usuario
 */
function registrar() {
    // Aqui tenemos que llamar al evento de crear usuario
    fetch("api/user/", {
        method: 'POST',
        headers: { "Content-Type": "application/json " },
        body: JSON.stringify({
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            password1: document.getElementById('password1').value,
            password2: document.getElementById('password2').value
        })
    })
        .then(message => message.json())
        .then(data => {
            if(data.ok){
               window.location.href = '/login'; 
            }else{
                let errorPwd = document.getElementById('errorPwd');
                errorPwd.textContent = data.message;
                errorPwd.style.display = 'block';

            }
            console.log(data);
            
        })
        .catch(err => console.error("Ha habido un error", err));
}