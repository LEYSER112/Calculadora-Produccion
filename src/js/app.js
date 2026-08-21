import { cargarDatosDrive, cargarClientes } from './state.js';
import { generarPDF } from './pdf.js';
import { guardarProduccion } from './sheetProduccion.js';
import { 
    inicializarSelectores, mostrarModulo, agregarFilaOp1, calcularOpcion1,
    agregarFilaOp2, calcularOpcion2, agregarProductoAEnvio, 
    ordenarTabla, calcularEnvio, filtrarProductos, agregarRestanteComoLinea,
    renderClientesGlobal, toggleClientesGlobalPanel
} from './ui.js';

document.addEventListener("DOMContentLoaded", async () => {
    inicializarSelectores();
    await cargarDatosDrive();
    await cargarClientes();
    renderClientesGlobal();
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
    document.getElementById('btnClientesGlobal').addEventListener('click', (e) => { e.stopPropagation(); toggleClientesGlobalPanel(); });

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
    });

    // Cerrar el panel de selección de clientes si se hace clic fuera de él
    document.addEventListener('click', e => {
        if (!e.target.closest('.cliente-multiselect')) {
            document.querySelectorAll('.clientes-panel').forEach(p => p.style.display = 'none');
        }
    });
});