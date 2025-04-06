/**
 * Funcion que nos crea el formulario de login
 */
function loginForm(){
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

    let inputSubmit = document.createElement('input');
    inputSubmit.type = "submit";
    inputSubmit.id = 'submit';
    inputSubmit.addEventListener('click', function(e){
        e.preventDefault();
        loginUser();
    })

    form.appendChild(labelEmail);
    form.appendChild(inputEmail);
    form.appendChild(labelPassword);
    form.appendChild(inputPassword);
    form.appendChild(inputSubmit);

    formContainer.appendChild(form);

    let p = document.createElement('p');

    let a = document.createElement('a');
    p.textContent = '¿Aún no tienes cuenta?';
    a.textContent = 'Registrarse';
    a.href = '/register';
    p.appendChild(a);
    formContainer.appendChild(p);

}


loginForm();

/**
 * Función que  nos envía los datos del login al servidor y 
 * nos permite manejar la autenticación del usuario.
 */
function loginUser(){

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const pError = document.getElementById('pError');
    if(!email || !password){
        mostrarError("Todos los campos son obligatorios");
    }

    fetch("/user/login", {
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
        if(data.message === 'Login correcto'){
            fetch("/check-admin")
            .then(response => response.json())
            .then(data => {
                if(data.admin){
                    window.location.href = "/admin-dashboard";
                }else{
                    fetch('/check-active')
                    .then(response => response.json())
                    .then(data => {
                        if(data.active){
                            window.location.href = "/";
                        }else{
                            //No se loguea y aparece un mensaje de error de usuario inactivo 
                            mostrarError("Tu cuenta esta inactiva. Contacta con el aministrador. (admin@correo.com)");
                            return fetch('/user/logout', { 
                                    method: "POST",
                                    credentials: 'include'
                                
                            }).then(response => response.json())
                            .then(data => {
                                console.log("Sesion cerrada automaticamente");
                            });
                        }
                    })
                    
                }
            })
        }else{
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
function mostrarError(mensaje){

    let pError = document.getElementById('pError');
    pError.classList.remove('hide');
    pError.classList.add('error');
    pError.textContent = mensaje;
    
}