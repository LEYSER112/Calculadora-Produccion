import { cargarDatosDrive, cargarClientes, cargarProductos } from './state.js';
import { generarPDF } from './pdf.js';
import { guardarProduccion } from './sheetProduccion.js';
import { 
    inicializarSelectores, mostrarModulo, agregarFilaOp1, calcularOpcion1,
    agregarFilaOp2, calcularOpcion2, agregarProductoAEnvio, 
    ordenarTabla, calcularEnvio, filtrarProductos, agregarRestanteComoLinea,
    filtrarProductosOp1
} from './ui.js';

document.addEventListener("DOMContentLoaded", async () => {
    inicializarSelectores();
    await cargarDatosDrive();
    await cargarClientes();
    await cargarProductos();
    document.getElementById('fechaProduccion').value = new Date().toISOString().slice(0, 10);
    calcularOpcion1();

    // Eventos de Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            mostrarModulo(target, e.currentTarget);
        });
    });

    // Módulo 1
    document.getElementById('totalProduccion').addEventListener('input', calcularOpcion1);
    document.getElementById('btnAgregarOp1').addEventListener('click', agregarFilaOp1);
    document.getElementById('presentacionRestante').addEventListener('change', calcularOpcion1);
    document.getElementById('btnGuardarProduccion').addEventListener('click', guardarProduccion);
    document.getElementById('btnAgregarRestante').addEventListener('click', agregarRestanteComoLinea);
    document.getElementById('inputProductoOp1').addEventListener('input', filtrarProductosOp1);

    // Módulo 2
    document.getElementById('btnAgregarOp2').addEventListener('click', agregarFilaOp2);
    document.getElementById('presentacionSobranteOp2').addEventListener('change', calcularOpcion2);

    // Módulo 3
    document.getElementById('limitePeso').addEventListener('input', calcularEnvio);
    document.getElementById('ordenTabla').addEventListener('change', ordenarTabla);
    document.getElementById('buscadorProductos').addEventListener('input', filtrarProductos);
    document.getElementById('btnAñadirEnvio').addEventListener('click', agregarProductoAEnvio);
    document.getElementById('btnGenerarPDF').addEventListener('click', generarPDF);

    // Ocultar buscador si se hace clic fuera
    document.addEventListener('click', e => {
        if (e.target.id !== 'buscadorProductos') {
            document.getElementById('resultadosBusqueda').style.display = 'none';
        }
        if (e.target.id !== 'inputProductoOp1') {
            document.getElementById('resultadosProductoOp1').style.display = 'none';
        }
    });
});