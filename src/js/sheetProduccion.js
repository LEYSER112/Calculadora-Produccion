import { State } from './state.js';
import { calcularOpcion1 } from './ui.js';

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Arma UNA sola fila con toda la producción: suma las presentaciones
// agregadas en sus respectivas columnas, y toma el/los cliente(s) y la
// descripción del bloque superior (aplican a toda la tanda, no por línea).
function construirFila() {
    const producto = document.getElementById('inputProductoOp1').value.trim();
    const turno = document.getElementById('selectTurnoOp1').value;
    const totalProduccion = parseFloat(document.getElementById('totalProduccion').value) || 0;
    const descripcion = document.getElementById('descripcionGlobal').value.trim();
    const clientesSeleccionados = Array.from(document.querySelectorAll('#panelClientesGlobal input:checked')).map(c => c.value);

    if (!producto) throw new Error("Ingresa el nombre del producto.");
    if (State.itemsOp1.length === 0) throw new Error("Agrega al menos una presentación con cantidad.");

    const hayCantidad = State.itemsOp1.some(item => (parseFloat(item.cantidad) || 0) > 0);
    if (!hayCantidad) throw new Error("No hay cantidades válidas para guardar.");

    const hoy = new Date();
    const fecha = hoy.toLocaleDateString('es-CO'); // dd/mm/aaaa
    const mes = MESES[hoy.getMonth()];
    const anio = hoy.getFullYear();

    const fila = {
        "Fecha": fecha,
        "Turno": turno,
        "Producto": producto,
        "Lote": "",                                    // se completa manualmente en el Sheets
        "Cantidad producida": totalProduccion,
        "Cliente": clientesSeleccionados.join('-'),    // ej. "PV-OFIX"; vacío si no se seleccionó ninguno
        "Descripción": descripcion,
        "Mes": mes,
        "Año": anio
    };

    State.presentacionesGenerales.forEach(p => { fila[p.columnaSheet] = 0; });
    State.itemsOp1.forEach(item => {
        const cant = parseFloat(item.cantidad) || 0;
        if (cant > 0) fila[item.columnaSheet] = (fila[item.columnaSheet] || 0) + cant;
    });

    return fila;
}

async function enviarFila(fila) {
    // Nota: Apps Script Web Apps no manejan bien el preflight CORS con
    // 'Content-Type: application/json', por eso se usa text/plain aquí.
    const res = await fetch(State.urlGuardarProduccion, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(fila)
    });
    if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Error desconocido al guardar.");
    return data;
}

export async function guardarProduccion() {
    const btn = document.getElementById('btnGuardarProduccion');
    const textoOriginal = btn.innerHTML;

    let fila;
    try {
        fila = construirFila();
    } catch (err) {
        alert(err.message);
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

    try {
        await enviarFila(fila);
        alert("Producción guardada en el Sheets.");

        // Limpiar el módulo para el siguiente registro
        State.itemsOp1 = [];
        document.getElementById('inputProductoOp1').value = "";
        document.getElementById('totalProduccion').value = "";
        document.getElementById('descripcionGlobal').value = "";
        document.querySelectorAll('#panelClientesGlobal input:checked').forEach(chk => chk.checked = false);
        document.getElementById('lblClientesGlobal').innerText = 'Seleccionar clientes';
        document.getElementById('contenedorItemsOp1').innerHTML = "";
        calcularOpcion1();
    } catch (err) {
        alert(`No se pudo guardar: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}