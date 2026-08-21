import { State } from './state.js';

export function inicializarSelectores() {
    const selects = ['selectPresOp1', 'presentacionRestante', 'selectPresOp2', 'presentacionSobranteOp2'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        el.innerHTML = ""; // Limpiar previo
        State.presentacionesGenerales.forEach((pres, index) => {
            el.options.add(new Option(`${pres.nombre} (${pres.volumen} lt)`, index));
        });
    });
}

export function mostrarModulo(idModulo, btnElement) {
    document.querySelectorAll('.module-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(idModulo).classList.add('active');
    btnElement.classList.add('active');
}

// ==========================================
// MÓDULO 1: PRODUCCIÓN TOTAL
// ==========================================
export function agregarFilaOp1() {
    const idx = document.getElementById('selectPresOp1').value;
    const pres = State.presentacionesGenerales[idx];
    State.itemsOp1.push({ nombre: pres.nombre, volumen: pres.volumen, columnaSheet: pres.columnaSheet, cantidad: "" });
    renderItemsOp1();
}

// ---- Selector de clientes GLOBAL (uno solo para toda la producción) ----
export function renderClientesGlobal() {
    const panel = document.getElementById('panelClientesGlobal');
    if (!panel) return;
    panel.innerHTML = State.clientesDisponibles.length === 0
        ? `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 4px;">Sin clientes cargados</div>`
        : State.clientesDisponibles.map(c => `
            <label class="cliente-check">
                <input type="checkbox" value="${c}">
                ${c}
            </label>`).join('');
    panel.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', actualizarLabelClientesGlobal);
    });
}

function actualizarLabelClientesGlobal() {
    const seleccionados = Array.from(document.querySelectorAll('#panelClientesGlobal input:checked')).map(c => c.value);
    document.getElementById('lblClientesGlobal').innerText = seleccionados.length ? seleccionados.join(', ') : 'Seleccionar clientes';
}

export function toggleClientesGlobalPanel() {
    const panel = document.getElementById('panelClientesGlobal');
    const abierto = panel.style.display === 'block';
    document.querySelectorAll('.clientes-panel').forEach(p => p.style.display = 'none');
    panel.style.display = abierto ? 'none' : 'block';
}

export function actualizarCantOp1(index, valor) {
    // Validar negativos
    if (valor < 0) valor = 0;
    State.itemsOp1[index].cantidad = valor; 
    
    // BUG FIX: Actualizar el span en tiempo real sin re-renderizar todo el DOM
    const cantCalculo = parseFloat(valor) || 0;
    const spanVisual = document.getElementById(`vol-calc-op1-${index}`);
    if (spanVisual) {
        spanVisual.innerText = `= ${(State.itemsOp1[index].volumen * cantCalculo).toFixed(1)} lt`;
    }
    
    calcularOpcion1();
}

export function eliminarItemOp1(index) {
    State.itemsOp1.splice(index, 1);
    renderItemsOp1();
}

function renderItemsOp1() {
    const cont = document.getElementById('contenedorItemsOp1');
    cont.innerHTML = '';
    State.itemsOp1.forEach((item, i) => {
        const cantCalculo = parseFloat(item.cantidad) || 0;
        
        const div = document.createElement('div');
        div.className = 'added-item';
        div.innerHTML = `
            <div class="item-info"><strong>${item.nombre}</strong><small>${item.volumen} lt c/u</small></div>
            <div class="item-controls">
                <input type="number" min="0" placeholder="0" value="${item.cantidad}" id="input-op1-${i}">
                <span id="vol-calc-op1-${i}" style="color: var(--text-muted); font-size: 0.9rem; min-width: 60px;">= ${(item.volumen * cantCalculo).toFixed(1)} lt</span>
                <button class="btn-danger-icon" id="del-op1-${i}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        cont.appendChild(div);

        // Listeners
        div.querySelector(`#input-op1-${i}`).addEventListener('input', (e) => actualizarCantOp1(i, e.target.value));
        div.querySelector(`#del-op1-${i}`).addEventListener('click', () => eliminarItemOp1(i));
    });
    calcularOpcion1();
}

export function calcularOpcion1() {
    const totalStr = document.getElementById('totalProduccion').value;
    const total = parseFloat(totalStr) || 0;
    let usado = 0;
    
    State.itemsOp1.forEach(item => usado += (item.volumen * (parseFloat(item.cantidad) || 0)));
    let restante = total - usado;
    if (restante < 0) restante = 0;

    const porcentaje = total > 0 ? (usado / total) * 100 : 0;
    const alerta = document.getElementById('alertaExcesoOp1');
    const barra = document.getElementById('barraOp1');

    document.getElementById('txtProgresoGeneral').innerText = `${usado.toFixed(1)} / ${totalStr === "" ? "0" : total} lt`;
    
    if (porcentaje > 100) {
        barra.style.width = '100%';
        barra.style.background = 'var(--danger)';
        alerta.style.display = 'flex';
    } else {
        barra.style.width = `${porcentaje}%`;
        barra.style.background = 'linear-gradient(90deg, #0284c7, var(--primary))';
        alerta.style.display = 'none';
    }

    document.getElementById('txtPorcentaje').innerText = `${Math.min(porcentaje, 100).toFixed(1)}% usado`;
    document.getElementById('txtRestanteFloat').innerText = `Restante: ${restante.toFixed(1)} lt`;
    document.getElementById('boxTotal').innerText = total;
    document.getElementById('boxUsado').innerText = usado.toFixed(1);
    document.getElementById('boxRestante').innerText = restante.toFixed(1);

    const idxRestante = document.getElementById('presentacionRestante').value;
    const btnAgregarRestante = document.getElementById('btnAgregarRestante');
    if (idxRestante !== "" && restante > 0) {
        const volPres = State.presentacionesGenerales[idxRestante].volumen;
        const unidades = Math.floor(restante / volPres);
        document.getElementById('lblRestanteVerde').innerText = `Restante en ${State.presentacionesGenerales[idxRestante].nombre}s`;
        document.getElementById('valRestanteVerde').innerText = `${unidades} Unidades`;
        document.getElementById('detallesRestanteVerde').innerText = `Equivalente a ${(unidades * volPres).toFixed(1)} litros`;
        if (btnAgregarRestante) btnAgregarRestante.style.display = unidades > 0 ? 'flex' : 'none';
    } else {
        document.getElementById('lblRestanteVerde').innerText = 'Restante Calculado';
        document.getElementById('valRestanteVerde').innerText = '0 Unidades';
        document.getElementById('detallesRestanteVerde').innerText = 'Sin litros restantes.';
        if (btnAgregarRestante) btnAgregarRestante.style.display = 'none';
    }
}

// Convierte el cálculo del "Restante" en una línea real dentro de
// itemsOp1, para que quede sujeta a las mismas reglas (cliente opcional)
// y se incluya al guardar la producción en el Sheets.
export function agregarRestanteComoLinea() {
    const idxRestante = document.getElementById('presentacionRestante').value;
    if (idxRestante === "") return;

    const totalStr = document.getElementById('totalProduccion').value;
    const total = parseFloat(totalStr) || 0;
    let usado = 0;
    State.itemsOp1.forEach(item => usado += (item.volumen * (parseFloat(item.cantidad) || 0)));
    const restante = Math.max(total - usado, 0);

    const pres = State.presentacionesGenerales[idxRestante];
    const unidades = Math.floor(restante / pres.volumen);
    if (unidades <= 0) return;

    State.itemsOp1.push({
        nombre: pres.nombre, volumen: pres.volumen, columnaSheet: pres.columnaSheet,
        cantidad: unidades
    });
    renderItemsOp1();
}

// ==========================================
// MÓDULO 2: PROYECCIÓN
// ==========================================
export function agregarFilaOp2() {
    const idx = document.getElementById('selectPresOp2').value;
    const pres = State.presentacionesGenerales[idx];
    State.itemsOp2.push({ nombre: pres.nombre, volumen: pres.volumen, cantidad: "" });
    renderItemsOp2();
}

function actualizarCantOp2(index, valor) {
    if (valor < 0) valor = 0;
    State.itemsOp2[index].cantidad = valor;
    calcularOpcion2();
}

function eliminarItemOp2(index) {
    State.itemsOp2.splice(index, 1);
    renderItemsOp2();
}

function renderItemsOp2() {
    const cont = document.getElementById('contenedorItemsOp2');
    cont.innerHTML = '';
    State.itemsOp2.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'added-item';
        div.innerHTML = `
            <div class="item-info"><strong>${item.nombre}</strong><small>${item.volumen} lt c/u</small></div>
            <div class="item-controls">
                <input type="number" min="0" placeholder="0" value="${item.cantidad}" id="input-op2-${i}">
                <button class="btn-danger-icon" id="del-op2-${i}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        cont.appendChild(div);
        
        div.querySelector(`#input-op2-${i}`).addEventListener('input', (e) => actualizarCantOp2(i, e.target.value));
        div.querySelector(`#del-op2-${i}`).addEventListener('click', () => eliminarItemOp2(i));
    });
    calcularOpcion2();
}

export function calcularOpcion2() {
    let requerido = 0;
    State.itemsOp2.forEach(item => requerido += (item.volumen * (parseFloat(item.cantidad) || 0)));
    const escala = 100;
    const sugerido = requerido > 0 ? Math.ceil(requerido / escala) * escala : 0;

    document.getElementById('necesarioOp2').innerText = `${requerido.toFixed(1)} L`;
    document.getElementById('sugeridoOp2').innerText = `${sugerido} L`;

    const idxSobrante = document.getElementById('presentacionSobranteOp2').value;
    if(idxSobrante !== "" && sugerido > requerido) {
        const volPres = State.presentacionesGenerales[idxSobrante].volumen;
        const exceso = sugerido - requerido;
        document.getElementById('sobranteUnidadesOp2').innerText = `${Math.floor(exceso / volPres)} Unidades`;
    } else {
        document.getElementById('sobranteUnidadesOp2').innerText = `0 Unidades`;
    }
}

// ==========================================
// MÓDULO 3: ENVÍOS A BODEGA
// ==========================================
export function filtrarProductos() {
    const input = document.getElementById('buscadorProductos').value.toLowerCase();
    const caja = document.getElementById('resultadosBusqueda');
    document.getElementById('productoSeleccionadoIndex').value = ""; 
    caja.innerHTML = '';
    
    if (input.length < 2) { 
        caja.style.display = 'none'; 
        return; 
    }

    const coincidencias = State.baseDeDatosSheets.filter(p => 
        p.referencia.toLowerCase().includes(input) || 
        p.nombre.toLowerCase().includes(input) || 
        p.presentacion.toLowerCase().includes(input)
    );

    if (coincidencias.length > 0) {
        caja.style.display = 'block';
        coincidencias.slice(0, 10).forEach(prod => { 
            const div = document.createElement('div');
            div.className = 'sugerencia-item';
            div.innerHTML = `
                <div class="sugerencia-icon"><i class="fa-solid fa-box"></i></div>
                <div class="sugerencia-text">
                    <strong>${prod.nombre}</strong>
                    <small>Ref:${prod.referencia} | ${prod.presentacion} | ${prod.volumenStr} lt</small>
                </div>`;
            div.onclick = () => {
                document.getElementById('buscadorProductos').value = `${prod.nombre} (${prod.presentacion})`;
                document.getElementById('productoSeleccionadoIndex').value = State.baseDeDatosSheets.indexOf(prod);
                caja.style.display = 'none';
            };
            caja.appendChild(div);
        });
    } else { 
        caja.style.display = 'none'; 
    }
}

export function agregarProductoAEnvio() {
    const idx = document.getElementById('productoSeleccionadoIndex').value;
    if (idx === "") return alert("Selecciona un producto válido del buscador.");

    State.listaEnvio.push({ 
        producto: State.baseDeDatosSheets[idx], 
        cantidad: "", 
        oculto: false,
        timestamp: Date.now()
    });
    
    document.getElementById('buscadorProductos').value = '';
    document.getElementById('productoSeleccionadoIndex').value = '';
    
    ordenarTabla(); 
}

function editarCantEnvio(idx, valor) {
    if (valor < 0) valor = 0;
    State.listaEnvio[idx].cantidad = valor;
    calcularEnvio(); 
}

function eliminarEnvio(idx) { 
    State.listaEnvio.splice(idx, 1); 
    renderTablaEnvio(); 
}

function toggleOcultar(idx) {
    State.listaEnvio[idx].oculto = !State.listaEnvio[idx].oculto;
    renderTablaEnvio();
}

export function ordenarTabla() {
    const criterio = document.getElementById('ordenTabla').value;
    
    State.listaEnvio.sort((a, b) => {
        const pA = a.producto.pesoFijo * (parseFloat(a.cantidad) || 0);
        const pB = b.producto.pesoFijo * (parseFloat(b.cantidad) || 0);
        const cA = parseFloat(a.cantidad) || 0;
        const cB = parseFloat(b.cantidad) || 0;

        if (criterio === 'pesoDesc') return pB - pA;
        if (criterio === 'pesoAsc') return pA - pB;
        if (criterio === 'cantDesc') return cB - cA;
        if (criterio === 'cantAsc') return cA - cB;
        return a.timestamp - b.timestamp; 
    });
    renderTablaEnvio();
}

function renderTablaEnvio() {
    const cuerpo = document.getElementById('tablaEnvioCuerpo');
    cuerpo.innerHTML = '';
    
    State.listaEnvio.forEach((item, i) => {
        const pesoFila = item.producto.pesoFijo * (parseFloat(item.cantidad) || 0);
        const rowClass = item.oculto ? 'row-hidden' : '';
        const iconoOjo = item.oculto ? 'fa-eye-slash' : 'fa-eye';

        const tr = document.createElement('tr');
        tr.className = rowClass;
        tr.innerHTML = `
            <td style="font-weight: 600;">${item.producto.nombre}</td>
            <td style="color: var(--text-muted);">${item.producto.presentacion}</td>
            <td style="color: var(--text-muted); font-family: monospace;">${item.producto.referencia}</td>
            <td style="text-align: center;">
                <input type="number" min="0" placeholder="0" class="input-inline" value="${item.cantidad}" id="input-envio-${i}">
            </td>
            <td style="text-align: right; color: var(--primary);" id="pesoFila_${i}">${pesoFila.toFixed(2)} Kg</td>
            <td style="text-align: center;">
                <button class="btn-action-icon" id="toggle-envio-${i}" title="Ocultar/Mostrar"><i class="fa-solid ${iconoOjo}"></i></button>
                <button class="btn-danger-icon" id="del-envio-${i}" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        cuerpo.appendChild(tr);

        // Listeners
        tr.querySelector(`#input-envio-${i}`).addEventListener('input', (e) => editarCantEnvio(i, e.target.value));
        tr.querySelector(`#toggle-envio-${i}`).addEventListener('click', () => toggleOcultar(i));
        tr.querySelector(`#del-envio-${i}`).addEventListener('click', () => eliminarEnvio(i));
    });
    calcularEnvio();
}

export function calcularEnvio() {
    let pesoTotal = 0;
    State.listaEnvio.forEach((item, i) => {
        const cant = parseFloat(item.cantidad) || 0;
        const pesoFila = item.producto.pesoFijo * cant;
        
        const celdaPeso = document.getElementById(`pesoFila_${i}`);
        if(celdaPeso) celdaPeso.innerText = `${pesoFila.toFixed(2)} Kg`;

        if (!item.oculto) pesoTotal += pesoFila;
    });

    document.getElementById('pesoTotalKg').innerText = `${pesoTotal.toFixed(2)} Kg`;
    document.getElementById('pesoTotalTon').innerText = `${(pesoTotal/1000).toFixed(3)} t`;

    const limite = parseFloat(document.getElementById('limitePeso').value) || 0;
    const alerta = document.getElementById('alertaExcesoPeso');
    
    if(limite > 0 && pesoTotal > limite) {
        alerta.style.display = 'flex';
        document.getElementById('pesoTotalKg').style.color = 'var(--danger)';
    } else {
        alerta.style.display = 'none';
        document.getElementById('pesoTotalKg').style.color = 'var(--primary)';
    }
}