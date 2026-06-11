const MS_SEGUIMIENTO = 'http://127.0.0.1:8004';
const seguimientos = [];
const seguimientosTable = document.getElementById('seguimientosTb');
const seguimientoForm = document.forms['seguimientoForm'];

const consultarSeguimientos = async (incapacidadId = null) => {
    try {
        if (seguimientos.length > 0) seguimientos.splice(0, seguimientos.length);

        await cargarIncapacidades();
        await cargarEmpleados();

        let url = `${MS_SEGUIMIENTO}/api/seguimientos`;
        if (incapacidadId) url += `?incapacidad_id=${incapacidadId}`;

        const response = await fetch(url, {
            headers: { 'Authorization': getToken() }
        });

        const body = await response.json();

        if (response.status === 200) {
            const lista = Array.isArray(body) ? body : (body.data || []);
            lista.forEach(item => seguimientos.push(item));
            mostrarListaSeguimientos();
        } else if (response.status === 401) {
            window.location.href = '/app_front/pages/login.html';
        }
    } catch (error) {
        console.error('Error al consultar seguimientos:', error);
    }
};

let mapaIncapacidades = {};
const cargarIncapacidades = async () => {

    mapaIncapacidades = {};

    const response = await fetch(
        'http://127.0.0.1:8003/api/incapacidades',
        {
            headers: {
                'Authorization': getToken()
            }
        }
    );

    const body = await response.json();

    const lista = Array.isArray(body)
        ? body
        : (body.data || []);

    lista.forEach(i => {
        mapaIncapacidades[i.id] = i.empleado_id;
    });
};

let mapaEmpleados = {};

const cargarEmpleados = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8002/api/empleados', {
            headers: { 'Authorization': getToken() }
        });
        const body = await response.json();
        const lista = Array.isArray(body) ? body : (body.data || []);
        lista.forEach(e => {
            mapaEmpleados[e.id] = `${e.nombres} ${e.apellidos}`;
        });
    } catch (error) {
        console.error('Error al cargar empleados:', error);
    }
};

const cargarSelectIncapacidades = async () => {

    try {

        const responseIncapacidades = await fetch(
            'http://127.0.0.1:8003/api/incapacidades',
            {
                headers: {
                    'Authorization': getToken()
                }
            }
        );

        const bodyIncapacidades =
            await responseIncapacidades.json();

        const incapacidades =
            Array.isArray(bodyIncapacidades)
                ? bodyIncapacidades
                : (bodyIncapacidades.data || []);
        const responseEmpleados = await fetch(
            'http://127.0.0.1:8002/api/empleados',
            {
                headers: {
                    'Authorization': getToken()
                }
            }
        );

        const bodyEmpleados =
            await responseEmpleados.json();

        const empleados =
            Array.isArray(bodyEmpleados)
                ? bodyEmpleados
                : (bodyEmpleados.data || []);
        mapaEmpleados = {};

        empleados.forEach(emp => {

            mapaEmpleados[emp.id] =
                `${emp.nombres} ${emp.apellidos}`;

        });

        const selectForm =
            document.getElementById('incapacidad_id');

        const selectFiltro =
            document.getElementById('filtroIncapacidad');

        selectForm.innerHTML =
            '<option value="">Seleccione un empleado</option>';

        selectFiltro.innerHTML =
            '<option value="">Todos los empleados</option>';

        incapacidades.forEach(inc => {

            const nombre =
                mapaEmpleados[inc.empleado_id];

            const option1 =
                document.createElement('option');

            option1.value = inc.id;
            option1.textContent = `${nombre} - Incapacidad #${inc.id}`;

            selectForm.appendChild(option1);

            const option2 =
                document.createElement('option');

            option2.value = inc.id;
            option2.textContent =`${nombre} - Incapacidad #${inc.id}`;

            selectFiltro.appendChild(option2);

        });

    } catch(error) {

        console.error(error);

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

            const lista = Array.isArray(body)
                ? body
                : (body.data || []);

            lista.forEach(item => seguimientos.push(item));
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

        const empleadoId = mapaIncapacidades[item.incapacidad_id];

        const nombreEmpleado = mapaEmpleados[empleadoId] ||`ID ${empleadoId}`;

        const campos = [
            nombreEmpleado,
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
cargarSelectIncapacidades();

seguimientoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    registrarSeguimiento();
});

seguimientoForm.addEventListener('reset', () => {
    hideForm();
});