   // ==========================================
        // 1. PRESENTACIONES GENÉRICAS
        // ==========================================
        const presentacionesGenerales = [
            { nombre: "Galón", volumen: 3.8 },
            { nombre: "Cuñete", volumen: 20 },
            { nombre: "Litro", volumen: 1 },
            { nombre: "Medio litro", volumen: 0.5 },
            { nombre: "Dos litros", volumen: 2 },
            { nombre: "Tres litros", volumen: 3 },
            { nombre: "Cuatro litros", volumen: 4 },
            { nombre: "Cinco litros", volumen: 5 }
        ];

        // ==========================================
        // 2. BASE DE DATOS DRIVE
        // ==========================================
        let baseDeDatosSheets = [];
        let listaEnvio = [];

        // 👉 PEGA TU ENLACE TSV AQUÍ (Solo en esta línea):
        const urlGoogleSheets = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHyD7QoyNE6EvOy74aBCj-lmuOEXXHYp0Y-Zl6gKMbdqwCnY4v4wobHUSwfvS1QWGHUyD9woXxSowi/pub?gid=0&single=true&output=tsv';

        window.onload = function() {
            inicializarSelectores();
            agregarFila('itemsOpcion1', calcularOpcion1);
            agregarFila('itemsOpcion2', calcularOpcion2);
            
            if(urlGoogleSheets !== 'TU_ENLACE_DE_PUBLICACION_AQUI') {
                cargarDatosDrive();
            }
        };

        function parsearVolumen(vol) {
            if(typeof vol === 'number') return vol;
            return parseFloat(String(vol).replace(',', '.')) || 0;
        }

        function inicializarSelectores() {
            const selOp1 = document.getElementById('presentacionRestante');
            const selOp2 = document.getElementById('presentacionSobranteOp2');
            
            presentacionesGenerales.forEach((pres, index) => {
                let texto = `${pres.nombre} (${pres.volumen} L)`;
                selOp1.options.add(new Option(texto, index));
                selOp2.options.add(new Option(texto, index));
            });
        }

        function agregarFila(contenedorId, callback) {
            const contenedor = document.getElementById(contenedorId);
            const fila = document.createElement('div');
            fila.className = 'dynamic-row';

            let opcionesHtml = presentacionesGenerales.map((pres, index) => 
                `<option value="${index}">${pres.nombre} (${pres.volumen} L)</option>`
            ).join('');

            fila.innerHTML = `
                <select onchange="${callback.name}()">
                    ${opcionesHtml}
                </select>
                <input type="number" min="0" placeholder="Cantidad" oninput="${callback.name}()">
                <button class="btn-danger btn-action" onclick="this.parentElement.remove(); ${callback.name}();" title="Eliminar"><i class="fa-solid fa-xmark"></i></button>
            `;
            contenedor.appendChild(fila);
            callback();
        }

        function calcularVolumenModulo(contenedorId) {
            const filas = document.querySelectorAll(`#${contenedorId} .dynamic-row`);
            let total = 0;
            filas.forEach(fila => {
                const index = fila.querySelector('select').value;
                const cantidad = parseFloat(fila.querySelector('input').value) || 0;
                const volumenUnidad = parsearVolumen(presentacionesGenerales[index].volumen);
                total += (volumenUnidad * cantidad);
            });
            return total;
        }

        function calcularOpcion1() {
            const totalLote = parseFloat(document.getElementById('totalProduccion').value) || 0;
            const asignado = calcularVolumenModulo('itemsOpcion1');
            const libre = totalLote - asignado;

            document.getElementById('descontadoOp1').innerText = `${asignado.toFixed(2)} L`;
            document.getElementById('restanteOp1').innerText = `${libre.toFixed(2)} L`;

            const barra = document.getElementById('progresoBarra');
            const txtBarra = document.getElementById('progresoTexto');
            const alerta = document.getElementById('alertaExcesoOp1');
            
            let porcentaje = totalLote > 0 ? (asignado / totalLote) * 100 : 0;
            
            if (porcentaje > 100) {
                barra.style.width = '100%';
                barra.style.backgroundColor = 'var(--danger)';
                alerta.style.display = 'block';
                document.getElementById('restanteOp1').style.color = 'var(--danger)';
            } else {
                barra.style.width = `${porcentaje}%`;
                barra.style.backgroundColor = 'var(--primary)';
                alerta.style.display = 'none';
                document.getElementById('restanteOp1').style.color = 'var(--primary)';
            }
            txtBarra.innerText = `${porcentaje.toFixed(1)}%`;

            const indexRestante = document.getElementById('presentacionRestante').value;
            if (indexRestante !== "" && libre > 0) {
                const volUnidad = parsearVolumen(presentacionesGenerales[indexRestante].volumen);
                document.getElementById('calculoRestante').innerText = `${Math.floor(libre / volUnidad)} unidades`;
            } else {
                document.getElementById('calculoRestante').innerText = '0 unidades';
            }
        }

        function calcularOpcion2() {
            const netoRequerido = calcularVolumenModulo('itemsOpcion2');
            
            // Requerimiento nuevo: Intervalos fijos en 100, sin selector.
            const escala = 100; 
            
            document.getElementById('necesarioOp2').innerText = `${netoRequerido.toFixed(2)} L`;

            if (netoRequerido > 0) {
                const sugerido = Math.ceil(netoRequerido / escala) * escala;
                document.getElementById('sugeridoOp2').innerText = `${sugerido} L`;
                const excesoLitros = sugerido - netoRequerido;
                const indexSobrante = document.getElementById('presentacionSobranteOp2').value;
                const volSobrante = parsearVolumen(presentacionesGenerales[indexSobrante].volumen);
                
                document.getElementById('sobranteUnidadesOp2').innerText = `${Math.floor(excesoLitros / volSobrante)} unidades aprox.`;
            } else {
                document.getElementById('sugeridoOp2').innerText = '0 L';
                document.getElementById('sobranteUnidadesOp2').innerText = '0 unidades';
            }
        }

        // ==========================================
        // CONEXIÓN CON GOOGLE SHEETS & BUSCADOR
        // ==========================================
        async function cargarDatosDrive() {
            try {
                const response = await fetch(urlGoogleSheets);
                const dataText = await response.text();
                procesarTSV(dataText);
            } catch (error) {
                console.error("Error cargando el TSV:", error);
                document.getElementById('buscadorProductos').placeholder = "Error al conectar con Drive...";
            }
        }

        function procesarTSV(tsv) {
            const lineas = tsv.split('\n');
            baseDeDatosSheets = [];
            
            for(let i = 1; i < lineas.length; i++) {
                if(!lineas[i].trim()) continue;
                const columnas = lineas[i].split('\t');
                
                if(columnas.length >= 4) {
                    baseDeDatosSheets.push({
                        referencia: columnas[0].trim(),
                        nombre: columnas[1].trim(),
                        presentacion: columnas[2].trim(),
                        volumenStr: columnas[3].trim()
                    });
                }
            }
            console.log("¡Éxito! Base de datos de Drive cargada:", baseDeDatosSheets.length, "productos.");
        }

        function filtrarProductos() {
            const input = document.getElementById('buscadorProductos').value.toLowerCase();
            const cajaResultados = document.getElementById('resultadosBusqueda');
            document.getElementById('productoSeleccionadoIndex').value = ""; 
            
            cajaResultados.innerHTML = '';

            if (input.length < 2) {
                cajaResultados.style.display = 'none';
                return;
            }

            const coincidencias = baseDeDatosSheets.filter(prod => 
                prod.referencia.toLowerCase().includes(input) || 
                prod.nombre.toLowerCase().includes(input) || 
                prod.presentacion.toLowerCase().includes(input)
            );

            if (coincidencias.length > 0) {
                cajaResultados.style.display = 'block';
                coincidencias.slice(0, 15).forEach(prod => { 
                    let div = document.createElement('div');
                    div.className = 'sugerencia-item';
                    div.innerText = `${prod.referencia} | ${prod.nombre} - ${prod.presentacion}`;
                    
                    div.onclick = function() {
                        document.getElementById('buscadorProductos').value = div.innerText;
                        document.getElementById('productoSeleccionadoIndex').value = baseDeDatosSheets.indexOf(prod);
                        cajaResultados.style.display = 'none';
                    };
                    cajaResultados.appendChild(div);
                });
            } else {
                cajaResultados.style.display = 'none';
            }
        }

        document.addEventListener('click', function(e) {
            if(e.target.id !== 'buscadorProductos') {
                document.getElementById('resultadosBusqueda').style.display = 'none';
            }
        });

        // ==========================================
        // LÓGICA DE ENVÍOS
        // ==========================================
        function agregarProductoAEnvio() {
            const indexSeleccionado = document.getElementById('productoSeleccionadoIndex').value;
            const cantidad = parseInt(document.getElementById('cantidadEnvio').value) || 0;

            if (indexSeleccionado === "" || cantidad <= 0) {
                alert("Por favor selecciona un producto de las sugerencias y define una cantidad.");
                return;
            }

            listaEnvio.push({
                producto: baseDeDatosSheets[indexSeleccionado],
                cantidad: cantidad,
                oculto: false
            });

            document.getElementById('buscadorProductos').value = '';
            document.getElementById('productoSeleccionadoIndex').value = '';
            document.getElementById('cantidadEnvio').value = '1';

            renderizarTablaEnvio();
        }

        function renderizarTablaEnvio() {
            const cuerpo = document.getElementById('tablaEnvioCuerpo');
            cuerpo.innerHTML = '';

            listaEnvio.forEach((item, index) => {
                const fila = document.createElement('tr');
                if (item.oculto) fila.className = 'row-hidden';

                const pesoFila = parsearVolumen(item.producto.volumenStr) * item.cantidad;
                
                // Determinación del icono del ojo (abierto / cerrado cruzado)
                const iconoOjo = item.oculto ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';

                fila.innerHTML = `
                    <td>${item.producto.referencia}</td>
                    <td>${item.producto.nombre}</td>
                    <td>${item.producto.presentacion}</td>
                    <td>${item.cantidad}</td>
                    <td>${pesoFila.toFixed(2)} Kg</td>
                    <td class="action-btns" style="justify-content: center;">
                        <button class="btn-action btn-outline" onclick="alternarVisibilidadProducto(${index})" title="Ocultar/Mostrar" style="margin:0;">
                            ${iconoOjo}
                        </button>
                        <button class="btn-action btn-warning" onclick="editarProducto(${index})" title="Editar" style="color: #0f172a; margin:0;">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-action btn-danger" onclick="eliminarProducto(${index})" title="Eliminar" style="margin:0;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;
                cuerpo.appendChild(fila);
            });
            calcularEnvio();
        }

        function alternarVisibilidadProducto(index) {
            listaEnvio[index].oculto = !listaEnvio[index].oculto;
            renderizarTablaEnvio();
        }

        function eliminarProducto(index) {
            listaEnvio.splice(index, 1);
            renderizarTablaEnvio();
        }

        // Nueva función: Editar Producto
        function editarProducto(index) {
            const item = listaEnvio[index];
            
            // Rellenar el buscador con los datos del producto seleccionado
            document.getElementById('buscadorProductos').value = `${item.producto.referencia} | ${item.producto.nombre} - ${item.producto.presentacion}`;
            
            // Rastrear el índice original en la BD general
            const indexOriginal = baseDeDatosSheets.indexOf(item.producto);
            document.getElementById('productoSeleccionadoIndex').value = indexOriginal;
            
            // Rellenar la cantidad actual
            document.getElementById('cantidadEnvio').value = item.cantidad;
            
            // Eliminar de la lista actual para reescribirlo al presionar "Agregar"
            listaEnvio.splice(index, 1);
            renderizarTablaEnvio();
            
            // Llevar el foco del usuario a la casilla de cantidad para edición rápida
            document.getElementById('cantidadEnvio').focus();
        }

        function calcularEnvio() {
            let pesoTotal = 0;
            listaEnvio.forEach(item => {
                if (!item.oculto) {
                    pesoTotal += parsearVolumen(item.producto.volumenStr) * item.cantidad;
                }
            });

            const toneladas = pesoTotal / 1000;
            document.getElementById('pesoTotalKg').innerText = `${pesoTotal.toFixed(2)} Kg`;
            document.getElementById('pesoTotalTon').innerText = `${toneladas.toFixed(3)} t`;

            const limite = parseFloat(document.getElementById('limitePeso').value) || 0;
            const alertaPeso = document.getElementById('alertaExcesoPeso');

            if (limite > 0 && pesoTotal > limite) {
                alertaPeso.style.display = 'block';
                document.getElementById('pesoTotalKg').style.color = 'var(--danger)';
            } else {
                alertaPeso.style.display = 'none';
                document.getElementById('pesoTotalKg').style.color = 'var(--primary)';
            }
        }

        function generarArchivoTxt() {
            if (listaEnvio.length === 0) return alert("La lista de despacho está vacía.");

            const bodega = document.getElementById('bodegaDestino').value;
            const pesoKg = document.getElementById('pesoTotalKg').innerText;
            const pesoTon = document.getElementById('pesoTotalTon').innerText;
            
            let txt = `==================================================\n`;
            txt += `          REPORTE DE DESPACHO - VIMACH S.A.S.     \n`;
            txt += `==================================================\n`;
            txt += `Destino: ${bodega}\nFecha: ${new Date().toLocaleString()}\n`;
            txt += `--------------------------------------------------\n`;

            listaEnvio.forEach(item => {
                let est = item.oculto ? "[EXCLUIDO] " : "";
                let p = parsearVolumen(item.producto.volumenStr) * item.cantidad;
                txt += `${item.producto.referencia.padEnd(9)} | ${est}${item.producto.nombre} (${item.producto.presentacion}) x ${item.cantidad} -> ${p.toFixed(2)} Kg\n`;
            });

            txt += `--------------------------------------------------\n`;
            txt += `TOTAL NETO: ${pesoKg} | EQUIVALENTE: ${pesoTon}\n`;
            txt += `==================================================\n`;

            const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Despacho_${bodega.replace(' ', '_')}_${new Date().toISOString().slice(0,10)}.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
        }