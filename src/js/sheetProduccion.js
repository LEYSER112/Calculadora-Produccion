import { State } from './state.js';
import { calcularOpcion1 } from './ui.js';

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Convierte "yyyy-mm-dd" (input type=date) a "dd/mm/aaaa"
function formatearFecha(fechaISO) {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
}

// ID que amarra todas las filas generadas en un mismo "Guardar" (mismo
// producto/tanda del día, repartido en varias filas por cliente):
// Lote + fecha en formato ddmmaa. Ej. Lote 1340 + 01/09/2026 → "1340010926".
function generarIdProduccion(lote, fechaISO) {
    const [anio, mes, dia] = fechaISO.split('-');
    const aa = anio.slice(-2);
    return `${lote}${dia}${mes}${aa}`;
}

// Agrupa los items agregados en Módulo 1 por cliente (uno por línea).
// Los items sin cliente asignado caen en el grupo "" (producción sin repartir).
function agruparPorCliente(items) {
    const grupos = {};
    items.forEach(item => {
        const cant = parseFloat(item.cantidad) || 0;
        if (cant <= 0) return; // ignora líneas vacías
        const clave = item.cliente || "";
        if (!grupos[clave]) grupos[clave] = {};
        grupos[clave][item.columnaSheet] = (grupos[clave][item.columnaSheet] || 0) + cant;
    });
    return grupos;
}

function construirFilas() {
    const producto = document.getElementById('inputProductoOp1').value.trim();
    const turno = document.getElementById('selectTurnoOp1').value;
    const totalProduccion = parseFloat(document.getElementById('totalProduccion').value) || 0;
    const fechaISO = document.getElementById('fechaProduccion').value;
    const lote = document.getElementById('loteProduccion').value.trim();
    const descripcion = document.getElementById('descripcionGlobal').value.trim();

    if (!producto) throw new Error("Ingresa el nombre del producto.");
    if (!fechaISO) throw new Error("Selecciona la fecha de producción.");
    if (!lote) throw new Error("Ingresa el número de lote.");
    if (State.itemsOp1.length === 0) throw new Error("Agrega al menos una presentación con cantidad.");

    const grupos = agruparPorCliente(State.itemsOp1);
    const clientes = Object.keys(grupos);
    if (clientes.length === 0) throw new Error("No hay cantidades válidas para guardar.");

    const [anio, mesNum] = fechaISO.split('-');
    const fecha = formatearFecha(fechaISO);
    const mes = MESES[parseInt(mesNum, 10) - 1];
    const idProduccion = generarIdProduccion(lote, fechaISO);

    return clientes.map(cliente => {
        const fila = {
            "ID Producción": idProduccion, // igual en todas las filas de este guardado
            "Fecha": fecha,
            "Turno": turno,
            "Producto": producto,
            "Lote": lote,                  // mismo lote físico, repetido en cada fila
            "Cantidad producida": totalProduccion,
            "Cliente": cliente,            // vacío = producción sin repartir
            "Descripción": descripcion,
            "Mes": mes,
            "Año": anio
        };
        State.presentacionesGenerales.forEach(p => { fila[p.columnaSheet] = 0; });
        Object.entries(grupos[cliente]).forEach(([col, cant]) => { fila[col] = cant; });
        return fila;
    });
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

    let filas;
    try {
        filas = construirFilas();
    } catch (err) {
        alert(err.message);
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

    try {
        for (const fila of filas) {
            await enviarFila(fila);
        }
        alert(`Producción guardada: ${filas.length} fila(s) en el Sheets (ID: ${filas[0]["ID Producción"]}).`);

        // Limpiar el módulo para el siguiente registro
        State.itemsOp1 = [];
        document.getElementById('inputProductoOp1').value = "";
        document.getElementById('totalProduccion').value = "";
        document.getElementById('loteProduccion').value = "";
        document.getElementById('descripcionGlobal').value = "";
        document.getElementById('fechaProduccion').value = new Date().toISOString().slice(0, 10);
        document.getElementById('contenedorItemsOp1').innerHTML = "";
        calcularOpcion1();
    } catch (err) {
        alert(`No se pudo guardar: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}