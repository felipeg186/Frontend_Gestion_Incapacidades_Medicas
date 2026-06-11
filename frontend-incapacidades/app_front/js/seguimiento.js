const MS_SEGUIMIENTO = 'http://127.0.0.1:8004';
const seguimientos = [];
const seguimientosTable = document.getElementById('seguimientosTb');
const seguimientoForm = document.forms['seguimientoForm'];

const consultarSeguimientos = async (incapacidadId = null) => {
    try {
        if (seguimientos.length > 0) seguimientos.splice(0, seguimientos.length);

        let url = `${MS_SEGUIMIENTO}/api/seguimientos`;
        if (incapacidadId) url += `?incapacidad_id=${incapacidadId}`;

        const response = await fetch(url, {
            headers: { 'Authorization': getToken() }
        });

        const body = await response.json();

        if (response.status === 200) {
            body.data.forEach(item => seguimientos.push(item));
            mostrarListaSeguimientos();
        } else if (response.status === 401) {
            window.location.href = '/app_front/pages/login.html';
        }
    } catch (error) {
        console.error('Error al consultar seguimientos:', error);
    }
};

const consultarHistorial = async (incapacidadId) => {
    try {
        if (seguimientos.length > 0) seguimientos.splice(0, seguimientos.length);

        const response = await fetch(`${MS_SEGUIMIENTO}/api/seguimientos/historial/${incapacidadId}`, {
            headers: { 'Authorization': getToken() }
        });

        const body = await response.json();

        if (response.status === 200) {
            body.data.forEach(item => seguimientos.push(item));
            mostrarListaSeguimientos();
        }
    } catch (error) {
        console.error('Error al consultar historial:', error);
    }
};

const mostrarListaSeguimientos = () => {
    const tbody = seguimientosTable.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    for (let item of seguimientos) {
        const tr = document.createElement('tr');

        const campos = [
            item.incapacidad_id,
            item.fecha,
            item.comentario,
            item.usuario_responsable
        ];

        campos.forEach(valor => {
            const td = document.createElement('td');
            td.textContent = valor;
            tr.appendChild(td);
        });

        const estadoTd = document.createElement('td');
        const badge = document.createElement('span');
        badge.textContent = item.estado.replace(/_/g, ' ');
        badge.className = `badge badge-${item.estado}`;
        estadoTd.appendChild(badge);
        tr.appendChild(estadoTd);

        tbody.appendChild(tr);
    }
};

const registrarSeguimiento = async () => {
    try {
        const datos = {
            incapacidad_id: seguimientoForm['incapacidad_id'].value,
            fecha: seguimientoForm['fecha'].value,
            comentario: seguimientoForm['comentario'].value,
            estado: seguimientoForm['estado'].value,
            usuario_responsable: seguimientoForm['usuario_responsable'].value
        };

        const response = await fetch(`${MS_SEGUIMIENTO}/api/seguimientos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
            },
            body: JSON.stringify(datos)
        });

        const body = await response.json();

        if (response.status === 201) {
            showMsg();
            await consultarSeguimientos();
            seguimientoForm.reset();
        } else {
            alert(body.mensaje || 'Error al registrar seguimiento');
        }
    } catch (error) {
        console.error('Error al registrar seguimiento:', error);
    }
};


consultarSeguimientos();

seguimientoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    registrarSeguimiento();
});

seguimientoForm.addEventListener('reset', () => {
    hideForm();
});