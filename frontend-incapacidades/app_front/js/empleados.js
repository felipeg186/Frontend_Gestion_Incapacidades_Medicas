const MS_EMPLEADOS = 'http://127.0.0.1:8002';
const empleados = [];
const empleadosTable = document.getElementById('empleadosTb');
const empleadoForm = document.forms['empleadoForm'];
let empleado_id = null;

const consultarEmpleados = async (filtros = {}) => {
    try {
        if (empleados.length > 0) empleados.splice(0, empleados.length);

        let url = `${MS_EMPLEADOS}/api/empleados`;
        const params = new URLSearchParams(filtros);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            headers: { 'Authorization': getToken() }
        });

        const body = await response.json();

        if (response.status === 200) {
            body.data.forEach(item => empleados.push(item));
            mostrarListaEmpleados();
        } else if (response.status === 401) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error al consultar empleados:', error);
    }
};

const mostrarListaEmpleados = () => {
    const tbody = empleadosTable.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    for (let item of empleados) {
        const tr = document.createElement('tr');

        const campos = [
            item.nombres + ' ' + item.apellidos,
            item.documento,
            item.correo,
            item.telefono,
            item.cargo,
            item.area,
            item.fecha_ingreso
        ];

        campos.forEach(valor => {
            const td = document.createElement('td');
            td.textContent = valor;
            tr.appendChild(td);
        });

        const estadoTd = document.createElement('td');
        const badge = document.createElement('span');
        badge.textContent = item.estado;
        badge.className = `badge ${item.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}`;
        estadoTd.appendChild(badge);
        tr.appendChild(estadoTd);

        const accionesTd = document.createElement('td');

        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.className = 'btn-editar';
        editarBtn.addEventListener('click', () => cargarEmpleado(item));

        const estadoBtn = document.createElement('button');
        estadoBtn.textContent = item.estado === 'activo' ? 'Inactivar' : 'Activar';
        estadoBtn.className = 'btn-estado';
        estadoBtn.addEventListener('click', () => cambiarEstadoEmpleado(item.id, item.estado === 'activo' ? 'inactivo' : 'activo'));

        accionesTd.appendChild(editarBtn);
        accionesTd.appendChild(estadoBtn);
        tr.appendChild(accionesTd);

        tbody.appendChild(tr);
    }
};

const cargarEmpleado = (item) => {
    empleado_id = item.id;
    empleadoForm['nombres'].value = item.nombres;
    empleadoForm['apellidos'].value = item.apellidos;
    empleadoForm['documento'].value = item.documento;
    empleadoForm['correo'].value = item.correo;
    empleadoForm['telefono'].value = item.telefono;
    empleadoForm['cargo'].value = item.cargo;
    empleadoForm['area'].value = item.area;
    empleadoForm['fecha_ingreso'].value = item.fecha_ingreso;
    showForm();
};

const registrarEmpleado = async () => {
    try {
        const datos = {
            nombres: empleadoForm['nombres'].value,
            apellidos: empleadoForm['apellidos'].value,
            documento: empleadoForm['documento'].value,
            correo: empleadoForm['correo'].value,
            telefono: empleadoForm['telefono'].value,
            cargo: empleadoForm['cargo'].value,
            area: empleadoForm['area'].value,
            fecha_ingreso: empleadoForm['fecha_ingreso'].value
        };

        const response = await fetch(`${MS_EMPLEADOS}/api/empleados`, {
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
            await consultarEmpleados();
            empleadoForm.reset();
        } else {
            alert(body.mensaje || 'Error al registrar empleado');
        }
    } catch (error) {
        console.error('Error al registrar empleado:', error);
    }
};

const editarEmpleado = async () => {
    try {
        const datos = {
            nombres: empleadoForm['nombres'].value,
            apellidos: empleadoForm['apellidos'].value,
            documento: empleadoForm['documento'].value,
            correo: empleadoForm['correo'].value,
            telefono: empleadoForm['telefono'].value,
            cargo: empleadoForm['cargo'].value,
            area: empleadoForm['area'].value,
            fecha_ingreso: empleadoForm['fecha_ingreso'].value
        };

        const response = await fetch(`${MS_EMPLEADOS}/api/empleados/${empleado_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
            },
            body: JSON.stringify(datos)
        });

        const body = await response.json();

        if (response.status === 200) {
            showMsg();
            await consultarEmpleados();
            empleado_id = null;
            empleadoForm.reset();
        } else {
            alert(body.mensaje || 'Error al editar empleado');
        }
    } catch (error) {
        console.error('Error al editar empleado:', error);
    }
};

const cambiarEstadoEmpleado = async (id, nuevoEstado) => {
    try {
        const response = await fetch(`${MS_EMPLEADOS}/api/empleados/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (response.status === 200) {
            await consultarEmpleados();
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error);
    }
};

consultarEmpleados();

empleadoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    empleado_id ? editarEmpleado() : registrarEmpleado();
});

empleadoForm.addEventListener('reset', () => {
    empleado_id = null;
    hideForm();
});