       const presentacionesGenerales = [
            { nombre: "Galón", volumen: 3.8 }, { nombre: "Cuñete", volumen: 20 },
            { nombre: "Litro", volumen: 1 }, { nombre: "Medio litro", volumen: 0.5 },
            { nombre: "Dos litros", volumen: 2 }, { nombre: "Tres litros", volumen: 3 },
            { nombre: "Cuatro litros", volumen: 4 }, { nombre: "Cinco litros", volumen: 5 }
        ];

        let baseDeDatosSheets = [];
        let listaEnvio = [];
        let itemsOp1 = [];
        let itemsOp2 = [];

        // ENLACE DE DRIVE
        const urlGoogleSheets = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHyD7QoyNE6EvOy74aBCj-lmuOEXXHYp0Y-Zl6gKMbdqwCnY4v4wobHUSwfvS1QWGHUyD9woXxSowi/pub?gid=0&single=true&output=tsv';

        window.onload = function() {
            inicializarSelectores();
            if(urlGoogleSheets !== 'TU_ENLACE_DE_PUBLICACION_AQUI') cargarDatosDrive();
            calcularOpcion1(); 
        };

        function mostrarModulo(idModulo, btnElement) {
            document.querySelectorAll('.module-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(idModulo).classList.add('active');
            btnElement.classList.add('active');
        }

        function parsearVolumen(vol) { return parseFloat(String(vol).replace(',', '.')) || 0; }

        function inicializarSelectores() {
            const selects = ['selectPresOp1', 'presentacionRestante', 'selectPresOp2', 'presentacionSobranteOp2'];
            selects.forEach(id => {
                const el = document.getElementById(id);
                presentacionesGenerales.forEach((pres, index) => {
                    el.options.add(new Option(`${pres.nombre} (${pres.volumen} lt)`, index));
                });
            });
        }

        // ==========================================
        // MÓDULO 1
        // ==========================================
        function agregarFilaOp1() {
            const idx = document.getElementById('selectPresOp1').value;
            const pres = presentacionesGenerales[idx];
            // Cantidad inicia vacía ("") para obligar al operario a digitar
            itemsOp1.push({ nombre: pres.nombre, volumen: pres.volumen, cantidad: "" });
            renderItemsOp1();
        }

        function actualizarCantOp1(index, valor) {
            itemsOp1[index].cantidad = valor; 
            calcularOpcion1();
        }

        function eliminarItemOp1(index) {
            itemsOp1.splice(index, 1);
            renderItemsOp1();
        }

        function renderItemsOp1() {
            const cont = document.getElementById('contenedorItemsOp1');
            cont.innerHTML = '';
            itemsOp1.forEach((item, i) => {
                const cantCalculo = parseFloat(item.cantidad) || 0;
                cont.innerHTML += `
                    <div class="added-item">
                        <div class="item-info"><strong>${item.nombre}</strong><small>${item.volumen} lt c/u</small></div>
                        <div class="item-controls">
                            <input type="number" min="0" placeholder="0" value="${item.cantidad}" oninput="actualizarCantOp1(${i}, this.value)">
                            <span style="color: var(--text-muted); font-size: 0.9rem; min-width: 60px;">= ${(item.volumen * cantCalculo).toFixed(1)} lt</span>
                            <button class="btn-danger-icon" onclick="eliminarItemOp1(${i})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>`;
            });
            calcularOpcion1();
        }

        function calcularOpcion1() {
            const totalStr = document.getElementById('totalProduccion').value;
            const total = parseFloat(totalStr) || 0;
            let usado = 0;
            itemsOp1.forEach(item => usado += (item.volumen * (parseFloat(item.cantidad) || 0)));
            let restante = total - usado;
            if(restante < 0) restante = 0;

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
            if (idxRestante !== "" && restante > 0) {
                const volPres = presentacionesGenerales[idxRestante].volumen;
                const unidades = Math.floor(restante / volPres);
                document.getElementById('lblRestanteVerde').innerText = `Restante en ${presentacionesGenerales[idxRestante].nombre}s`;
                document.getElementById('valRestanteVerde').innerText = `${unidades} Unidades`;
                document.getElementById('detallesRestanteVerde').innerText = `Equivalente a ${(unidades * volPres).toFixed(1)} litros`;
            } else {
                document.getElementById('lblRestanteVerde').innerText = 'Restante Calculado';
                document.getElementById('valRestanteVerde').innerText = '0 Unidades';
                document.getElementById('detallesRestanteVerde').innerText = 'Sin litros restantes.';
            }
        }

        // ==========================================
        // MÓDULO 2
        // ==========================================
        function agregarFilaOp2() {
            const idx = document.getElementById('selectPresOp2').value;
            const pres = presentacionesGenerales[idx];
            itemsOp2.push({ nombre: pres.nombre, volumen: pres.volumen, cantidad: "" });
            renderItemsOp2();
        }

        function actualizarCantOp2(index, valor) {
            itemsOp2[index].cantidad = valor;
            calcularOpcion2();
        }

        function eliminarItemOp2(index) {
            itemsOp2.splice(index, 1);
            renderItemsOp2();
        }

        function renderItemsOp2() {
            const cont = document.getElementById('contenedorItemsOp2');
            cont.innerHTML = '';
            itemsOp2.forEach((item, i) => {
                cont.innerHTML += `
                    <div class="added-item">
                        <div class="item-info"><strong>${item.nombre}</strong><small>${item.volumen} lt c/u</small></div>
                        <div class="item-controls">
                            <input type="number" min="0" placeholder="0" value="${item.cantidad}" oninput="actualizarCantOp2(${i}, this.value)">
                            <button class="btn-danger-icon" onclick="eliminarItemOp2(${i})"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>`;
            });
            calcularOpcion2();
        }

        function calcularOpcion2() {
            let requerido = 0;
            itemsOp2.forEach(item => requerido += (item.volumen * (parseFloat(item.cantidad) || 0)));
            const escala = 100;
            const sugerido = requerido > 0 ? Math.ceil(requerido / escala) * escala : 0;

            document.getElementById('necesarioOp2').innerText = `${requerido.toFixed(1)} L`;
            document.getElementById('sugeridoOp2').innerText = `${sugerido} L`;

            const idxSobrante = document.getElementById('presentacionSobranteOp2').value;
            if(idxSobrante !== "" && sugerido > requerido) {
                const volPres = presentacionesGenerales[idxSobrante].volumen;
                const exceso = sugerido - requerido;
                document.getElementById('sobranteUnidadesOp2').innerText = `${Math.floor(exceso / volPres)} Unidades`;
            } else {
                document.getElementById('sobranteUnidadesOp2').innerText = `0 Unidades`;
            }
        }

        // ==========================================
        // MÓDULO 3
        // ==========================================
        async function cargarDatosDrive() {
            try {
                const res = await fetch(urlGoogleSheets);
                const data = await res.text();
                const lineas = data.split('\n');
                baseDeDatosSheets = [];
                for(let i = 1; i < lineas.length; i++) {
                    if(!lineas[i].trim()) continue;
                    const col = lineas[i].split('\t');
                    if(col.length >= 4) {
                        baseDeDatosSheets.push({
                            referencia: col[0].trim(), nombre: col[1].trim(),
                            presentacion: col[2].trim(), volumenStr: col[3].trim(),
                            pesoFijo: parsearVolumen(col[3].trim()) 
                        });
                    }
                }
            } catch (e) { console.log(e); }
        }

        function filtrarProductos() {
            const input = document.getElementById('buscadorProductos').value.toLowerCase();
            const caja = document.getElementById('resultadosBusqueda');
            document.getElementById('productoSeleccionadoIndex').value = ""; 
            caja.innerHTML = '';
            if (input.length < 2) { caja.style.display = 'none'; return; }

            const coincidencias = baseDeDatosSheets.filter(p => 
                p.referencia.toLowerCase().includes(input) || p.nombre.toLowerCase().includes(input) || p.presentacion.toLowerCase().includes(input)
            );

            if (coincidencias.length > 0) {
                caja.style.display = 'block';
                coincidencias.slice(0, 10).forEach(prod => { 
                    let div = document.createElement('div');
                    div.className = 'sugerencia-item';
                    div.innerHTML = `
                        <div class="sugerencia-icon"><i class="fa-solid fa-box"></i></div>
                        <div class="sugerencia-text">
                            <strong>${prod.nombre}</strong>
                            <small>Ref:${prod.referencia} | ${prod.presentacion} | ${prod.volumenStr} lt</small>
                        </div>`;
                    div.onclick = function() {
                        document.getElementById('buscadorProductos').value = `${prod.nombre} (${prod.presentacion})`;
                        document.getElementById('productoSeleccionadoIndex').value = baseDeDatosSheets.indexOf(prod);
                        caja.style.display = 'none';
                    };
                    caja.appendChild(div);
                });
            } else { caja.style.display = 'none'; }
        }

        document.addEventListener('click', e => {
            if(e.target.id !== 'buscadorProductos') document.getElementById('resultadosBusqueda').style.display = 'none';
        });

        function agregarProductoAEnvio() {
            const idx = document.getElementById('productoSeleccionadoIndex').value;
            if (idx === "") return alert("Selecciona un producto del buscador.");

            listaEnvio.push({ 
                producto: baseDeDatosSheets[idx], 
                cantidad: "", 
                oculto: false,
                timestamp: Date.now() // Para mantener el orden por defecto
            });
            document.getElementById('buscadorProductos').value = '';
            document.getElementById('productoSeleccionadoIndex').value = '';
            
            ordenarTabla(); // Se renderiza dentro
        }

        function editarCantEnvio(idx, valor) {
            listaEnvio[idx].cantidad = valor;
            calcularEnvio(); // Solo calcula, no re-renderiza para no perder el foco del input
        }

        function eliminarEnvio(idx) { 
            listaEnvio.splice(idx, 1); 
            renderTablaEnvio(); 
        }

        function toggleOcultar(idx) {
            listaEnvio[idx].oculto = !listaEnvio[idx].oculto;
            renderTablaEnvio();
        }

        function ordenarTabla() {
            const criterio = document.getElementById('ordenTabla').value;
            
            listaEnvio.sort((a, b) => {
                const pA = a.producto.pesoFijo * (parseFloat(a.cantidad) || 0);
                const pB = b.producto.pesoFijo * (parseFloat(b.cantidad) || 0);
                const cA = parseFloat(a.cantidad) || 0;
                const cB = parseFloat(b.cantidad) || 0;

                if (criterio === 'pesoDesc') return pB - pA;
                if (criterio === 'pesoAsc') return pA - pB;
                if (criterio === 'cantDesc') return cB - cA;
                if (criterio === 'cantAsc') return cA - cB;
                return a.timestamp - b.timestamp; // default
            });
            renderTablaEnvio();
        }

        function renderTablaEnvio() {
            const cuerpo = document.getElementById('tablaEnvioCuerpo');
            cuerpo.innerHTML = '';
            
            listaEnvio.forEach((item, i) => {
                const pesoFila = item.producto.pesoFijo * (parseFloat(item.cantidad) || 0);
                const rowClass = item.oculto ? 'row-hidden' : '';
                const iconoOjo = item.oculto ? 'fa-eye-slash' : 'fa-eye';

                cuerpo.innerHTML += `
                    <tr class="${rowClass}">
                        <td style="font-weight: 600;">${item.producto.nombre}</td>
                        <td style="color: var(--text-muted);">${item.producto.presentacion}</td>
                        <td style="color: var(--text-muted); font-family: monospace;">${item.producto.referencia}</td>
                        <td style="text-align: center;">
                            <input type="number" min="0" placeholder="0" class="input-inline" value="${item.cantidad}" oninput="editarCantEnvio(${i}, this.value)">
                        </td>
                        <td style="text-align: right; color: var(--primary);" id="pesoFila_${i}">${pesoFila.toFixed(2)} Kg</td>
                        <td style="text-align: center;">
                            <button class="btn-action-icon" onclick="toggleOcultar(${i})" title="Ocultar/Mostrar"><i class="fa-solid ${iconoOjo}"></i></button>
                            <button class="btn-danger-icon" onclick="eliminarEnvio(${i})" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                        </td>
                    </tr>
                `;
            });
            calcularEnvio();
        }

        function calcularEnvio() {
            let pesoTotal = 0;
            listaEnvio.forEach((item, i) => {
                const cant = parseFloat(item.cantidad) || 0;
                const pesoFila = item.producto.pesoFijo * cant;
                
                // Actualizar texto del peso en línea sin recargar tabla
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

        // ==========================================
        // PDF (Sin Firmas, Toneladas agregadas)
        // ==========================================
        function generarPDF() {
            const activos = listaEnvio.filter(i => !i.oculto && (parseFloat(i.cantidad) || 0) > 0);
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

            let htmlPDF = `
                <div style="border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="color: #0284c7; margin: 0; font-size: 28px;">VIMACH S.A.S.</h1>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Documento de Remisión Logística</p>
                    </div>
                    <div style="text-align: right; color: #444; font-size: 12px;">
                        <strong>Fecha de Emisión:</strong> ${fechaHora}<br>
                        <strong>Destino:</strong> ${bodega}
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; text-align: left;">
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
                <div style="text-align: right; font-size: 16px;">
                    <span>Peso Total Bruto: </span>
                    <strong style="color: #0284c7; font-size: 20px;">${totalKg}</strong><br>
                    <span style="font-size: 14px; color: #666;">Equivalente a: <strong>${totalTon}</strong></span>
                </div>
            `;

            elementoOculto.innerHTML = htmlPDF;

            const opciones = {
                margin:       10,
                filename:     `Remision_${bodega.replace(' ', '_')}_${new Date().getTime()}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opciones).from(elementoOculto).save();
        }