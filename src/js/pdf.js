import { State } from './state.js';

export function generarPDF() {
    const activos = State.listaEnvio.filter(i => !i.oculto && (parseFloat(i.cantidad) || 0) > 0);
    if (activos.length === 0) return alert("No hay productos válidos/visibles para el despacho.");

    const bodega = document.getElementById('bodegaDestino').value;
    const fechaHora = new Date().toLocaleString('es-CO');
    const totalKg = document.getElementById('pesoTotalKg').innerText;
    const totalTon = document.getElementById('pesoTotalTon').innerText;
    
    const elementoOculto = document.createElement('div');
    elementoOculto.style.padding = "40px";
    elementoOculto.style.fontFamily = "Helvetica, Arial, sans-serif";
    elementoOculto.style.color = "#333";
    elementoOculto.style.backgroundColor = "#fff";

    // Se elimina la clase del footer y se mantiene la configuración de la tabla
    let htmlPDF = `
        <style>
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid !important; page-break-after: auto; }
            thead { display: table-header-group; }
            td, th { word-break: break-word; }
        </style>
        
        <div style="border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h1 style="color: #0284c7; margin: 0; font-size: 28px;">VIMACH S.A.S.</h1>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Documento de Remisión Logística</p>
                
                <!-- TOTALES MOVIDOS A LA CABECERA -->
                <div style="margin-top: 15px; padding: 10px; background-color: #f8fafc; border-left: 4px solid #0284c7; display: inline-block;">
                    <span style="font-size: 14px;">Peso Total Bruto: </span>
                    <strong style="color: #0284c7; font-size: 18px;">${totalKg}</strong><br>
                    <span style="font-size: 12px; color: #666;">Equivalente a: <strong>${totalTon}</strong></span>
                </div>
            </div>
            
            <div style="text-align: right; color: #444; font-size: 12px;">
                <strong>Fecha de Emisión:</strong> ${fechaHora}<br>
                <strong>Destino:</strong> ${bodega}
            </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: left;">
                    <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; width: 40px;">✓</th>
                    <th style="padding: 12px; border: 1px solid #cbd5e1;">CÓDIGO REF.</th>
                    <th style="padding: 12px; border: 1px solid #cbd5e1;">DESCRIPCIÓN DEL PRODUCTO</th>
                    <th style="padding: 12px; border: 1px solid #cbd5e1;">PRESENTACIÓN</th>
                    <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">CANT.</th>
                    <th style="padding: 12px; border: 1px solid #cbd5e1; text-align: right;">PESO (Kg)</th>
                </tr>
            </thead>
            <tbody>
    `;

    activos.forEach(item => {
        const cant = parseFloat(item.cantidad) || 0;
        const pesoFila = item.producto.pesoFijo * cant;
        htmlPDF += `
            <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">
                    <div style="width: 16px; height: 16px; border: 1.5px solid #64748b; border-radius: 3px; margin: 0 auto;"></div>
                </td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">${item.producto.referencia}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>${item.producto.nombre}</strong></td>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">${item.producto.presentacion}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${cant}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">${pesoFila.toFixed(2)}</td>
            </tr>
        `;
    });

    htmlPDF += `
            </tbody>
        </table>
    `;

    elementoOculto.innerHTML = htmlPDF;

    const opciones = {
        margin:       [15, 10, 15, 10],
        filename:     `Remision_${bodega.replace(' ', '_')}_${new Date().getTime()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true,   scrollX: 0,
    scrollY: 0,
    windowWidth: document.body.scrollWidth,
    windowHeight: elementoOculto.scrollHeight}, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] } 
    };
    

    html2pdf().set(opciones).from(elementoOculto).save();
}