const MS_INCAPACIDADES = 'http://127.0.0.1:8003';
const incapacidades = [];
const incapacidadesTable = document.getElementById('incapacidadesTb');
const incapacidadForm = document.forms['incapacidadForm'];
let incapacidad_id = null;


const consultarIncapacidades = async (filtros = {}) => {
    try {
        if (incapacidades.length > 0) incapacidades.splice(0, incapacidades.length);

        let url = `${MS_INCAPACIDADES}/api/incapacidades`;
        const params = new URLSearchParams(filtros);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            headers: { 'Authorization': getToken() }
        });

        const body = await response.json();

        if (response.status === 200) {
            body.data.forEach(item => incapacidades.push(item));
            mostrarListaIncapacidades();
        } else if (response.status === 401) {
            window.location.href = '/app_front/pages/login.html';
        }
    } catch (error) {
        console.error('Error al consultar incapacidades:', error);
    }
};

const mostrarListaIncapacidades = () => {
    const tbody = incapacidadesTable.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    for (let item of incapacidades) {
        const tr = document.createElement('tr');

        const campos = [
            item.empleado_id,
            item.fecha_inicio,
            item.fecha_fin,
            item.dias_incapacidad + ' días',
            item.tipo.replace(/_/g, ' '),
            item.entidad_medica
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

        const accionesTd = document.createElement('td');

        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.className = 'btn-editar';
        editarBtn.addEventListener('click', () => cargarIncapacidad(item));

        const finalizarBtn = document.createElement('button');
        finalizarBtn.textContent = 'Finalizar';
        finalizarBtn.className = 'btn-finalizar';
        finalizarBtn.addEventListener('click', () => finalizarIncapacidad(item.id));

        accionesTd.appendChild(editarBtn);
        if (item.estado !== 'finalizada') accionesTd.appendChild(finalizarBtn);
        tr.appendChild(accionesTd);

        tbody.appendChild(tr);
    }
};

const cargarIncapacidad = (item) => {
    incapacidad_id = item.id;
    incapacidadForm['empleado_id'].value = item.empleado_id;
    incapacidadForm['fecha_inicio'].value = item.fecha_inicio;
    incapacidadForm['fecha_fin'].value = item.fecha_fin;
    incapacidadForm['tipo'].value = item.tipo;
    incapacidadForm['diagnostico_general'].value = item.diagnostico_general;
    incapacidadForm['entidad_medica'].value = item.entidad_medica;
    incapacidadForm['observaciones'].value = item.observaciones || '';
    incapacidadForm['estado'].value = item.estado;
    showForm();
};


const registrarIncapacidad = async () => {
    try {
        const datos = {
            empleado_id: incapacidadForm['empleado_id'].value,
            fecha_inicio: incapacidadForm['fecha_inicio'].value,
            fecha_fin: incapacidadForm['fecha_fin'].value,
            tipo: incapacidadForm['tipo'].value,
            diagnostico_general: incapacidadForm['diagnostico_general'].value,
            entidad_medica: incapacidadForm['entidad_medica'].value,
            observaciones: incapacidadForm['observaciones'].value
        };

        const response = await fetch(`${MS_INCAPACIDADES}/api/incapacidades`, {
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
            await consultarIncapacidades();
            incapacidadForm.reset();
        } else {
            alert(body.mensaje || 'Error al registrar incapacidad');
        }
    } catch (error) {
        console.error('Error al registrar incapacidad:', error);
    }
};


const editarIncapacidad = async () => {
    try {
        const datos = {
            fecha_inicio: incapacidadForm['fecha_inicio'].value,
            fecha_fin: incapacidadForm['fecha_fin'].value,
            observaciones: incapacidadForm['observaciones'].value,
            estado: incapacidadForm['estado'].value
        };

        const response = await fetch(`${MS_INCAPACIDADES}/api/incapacidades/${incapacidad_id}`, {
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
            await consultarIncapacidades();
            incapacidad_id = null;
            incapacidadForm.reset();
        } else {
            alert(body.mensaje || 'Error al editar incapacidad');
        }
    } catch (error) {
        console.error('Error al editar incapacidad:', error);
    }
};


const finalizarIncapacidad = async (id) => {
    if (!confirm('¿Desea finalizar esta incapacidad?')) return;
    try {
        const response = await fetch(`${MS_INCAPACIDADES}/api/incapacidades/${id}/finalizar`, {
            method: 'PATCH',
            headers: { 'Authorization': getToken() }
        });

        if (response.status === 200) {
            await consultarIncapacidades();
        }
    } catch (error) {
        console.error('Error al finalizar incapacidad:', error);
    }
};


consultarIncapacidades();

incapacidadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    incapacidad_id ? editarIncapacidad() : registrarIncapacidad();
});

incapacidadForm.addEventListener('reset', () => {
    incapacidad_id = null;
    hideForm();
});