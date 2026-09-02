export const State = {
    presentacionesGenerales: [
        { nombre: "Galón", volumen: 3.8, columnaSheet: "3,8 Lt" }, { nombre: "Cuñete", volumen: 20, columnaSheet: "20 Lt" },
        { nombre: "Litro", volumen: 1, columnaSheet: "1 Lt" }, { nombre: "Medio litro", volumen: 0.5, columnaSheet: "500 ml" },
        { nombre: "Dos litros", volumen: 2, columnaSheet: "2 Lt" }, { nombre: "Tres litros", volumen: 3, columnaSheet: "3 Lt" },
        { nombre: "Cuatro litros", volumen: 4, columnaSheet: "4 Lt" }, { nombre: "Cinco litros", volumen: 5, columnaSheet: "5lt" },
        { nombre: "30 ML", volumen: 0.03, columnaSheet: "30ml" }, { nombre: "60 ML", volumen: 0.06, columnaSheet: "60ml" },
        { nombre: "120 ML", volumen: 0.120, columnaSheet: "120 ml" },  { nombre: "240 ML", volumen: 0.240, columnaSheet: "240 ml" },
        { nombre: "250 ML", volumen: 0.250, columnaSheet: "250ml" },  { nombre: "300 ML", volumen: 0.300, columnaSheet: "300ml" },
        { nombre: "800 ML", volumen: 0.800, columnaSheet: "800 ml" },  { nombre: "200 LT", volumen: 200, columnaSheet: "200 Lt" }
    ],
    baseDeDatosSheets: [],
    listaEnvio: [],
    itemsOp1: [],
    itemsOp2: [],
    clientesDisponibles: [],
    productosDisponibles: [],
    urlGoogleSheets: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHyD7QoyNE6EvOy74aBCj-lmuOEXXHYp0Y-Zl6gKMbdqwCnY4v4wobHUSwfvS1QWGHUyD9woXxSowi/pub?gid=0&single=true&output=tsv',

    // ---- NUEVO: registro de producción (bitácora hacia el Sheets) ----
    // ⚠️ Reemplaza esta URL por la que te entregue el despliegue de tu Apps Script (ver instrucciones aparte).
    urlGuardarProduccion: 'https://script.google.com/macros/s/AKfycbzHA2FfjsmUv-IJZ-wlBPItNZyKqcTCZy9tChkTQvOuos9Yli96AfdSLFvCdw34wDk/exec',
    ordenColumnasSheet: [
        "ID Producción","Fecha","Turno","Producto","Lote","Cantidad producida","Cliente","Descripción","Mes","Año",
        "30ml","60ml","120 ml","240 ml","250ml","300ml","500 ml","800 ml",
        "1 Lt","2 Lt","3 Lt","3,8 Lt","4 Lt","5lt","20 Lt","200 Lt"
    ]
};

const parsearVolumen = (vol) => parseFloat(String(vol).replace(',', '.')) || 0;

export async function cargarDatosDrive() {
    try {
        const res = await fetch(State.urlGoogleSheets);
        if(!res.ok) throw new Error("Error en red al obtener los datos");
        const data = await res.text();
        const lineas = data.split('\n');
        
        State.baseDeDatosSheets = [];
        for (let i = 1; i < lineas.length; i++) {
            if (!lineas[i].trim()) continue;
            const col = lineas[i].split('\t');
            if (col.length >= 4) {
                State.baseDeDatosSheets.push({
                    referencia: col[0].trim(),
                    nombre: col[1].trim(),
                    presentacion: col[2].trim(),
                    volumenStr: col[3].trim(),
                    pesoFijo: parsearVolumen(col[3].trim())
                });
            }
        }
    } catch (error) {
        console.error("Error cargando base de datos:", error);
    }
}

// Trae el listado de clientes desde "Hoja1" (columna F) del mismo Sheets
// de producción, vía el Apps Script (petición GET con ?accion=clientes).
// Así, para agregar/quitar clientes solo se edita esa columna, sin tocar código.
export async function cargarClientes() {
    try {
        const res = await fetch(`${State.urlGuardarProduccion}?accion=clientes`);
        if (!res.ok) throw new Error("Error en red al obtener clientes");
        const data = await res.json();
        State.clientesDisponibles = data.ok ? (data.clientes || []) : [];
    } catch (error) {
        console.error("Error cargando clientes:", error);
        State.clientesDisponibles = [];
    }
}

// Trae el listado de productos desde "Hoja1" (columna A) del mismo Sheets
// de producción, vía el Apps Script (petición GET con ?accion=productos).
// Es independiente del catálogo del módulo de Envíos (Google Sheets aparte).
export async function cargarProductos() {
    try {
        const res = await fetch(`${State.urlGuardarProduccion}?accion=productos`);
        if (!res.ok) throw new Error("Error en red al obtener productos");
        const data = await res.json();
        State.productosDisponibles = data.ok ? (data.productos || []) : [];
    } catch (error) {
        console.error("Error cargando productos:", error);
        State.productosDisponibles = [];
    }
}
