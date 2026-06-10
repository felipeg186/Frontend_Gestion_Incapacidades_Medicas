const MS_AUTH = 'http://127.0.0.1:8001';


const getToken = () => localStorage.getItem('token');


const guardarSesion = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', data.usuario);
    localStorage.setItem('nombre', data.nombre);
    localStorage.setItem('rol', data.rol);
};


const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
};


const verificarSesion = () => {
    const token = getToken();
    if (!token) {
        window.location.href = '../pages/login.html';
    }
};


const login = async () => {
    try {
        const loginForm = document.forms['loginForm'];
        const datos = {
            usuario: loginForm['usuario'].value,
            contrasena: loginForm['contrasena'].value
        };

        const response = await fetch(`${MS_AUTH}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const body = await response.json();

        if (response.status === 200) {
            guardarSesion(body.data);
            window.location.href = '../index.html';
        } else {
            mostrarError(body.mensaje || 'Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error en login:', error);
        mostrarError('Error al conectar con el servidor');
    }
};


const logout = async () => {
    try {
        await fetch(`${MS_AUTH}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': getToken() }
        });
    } catch (error) {
        console.error('Error en logout:', error);
    } finally {
        cerrarSesion();
        window.location.href = 'pages/login.html';
    }
};


const mostrarError = (mensaje) => {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
    }
};