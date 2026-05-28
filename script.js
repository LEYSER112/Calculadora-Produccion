     const opcionesPresentacion = `
            <option value="0.5">Medio litro (0.5 L)</option>
            <option value="1">Litro (1 L)</option>
            <option value="2">Dos litros (2 L)</option>
            <option value="3">Tres litros (3 L)</option>
            <option value="3.8" selected>Galón (3.8 L)</option>
            <option value="4">Cuatro litros (4 L)</option>
            <option value="5">Cinco litros (5 L)</option>
            <option value="20">Cuñete (20 L)</option>
        `;

        // Función para agregar filas dinámicamente
        function agregarFila(contenedorId, callback) {
            const contenedor = document.getElementById(contenedorId);
            const fila = document.createElement('div');
            fila.className = 'row-item';

            fila.innerHTML = `
                <select onchange="${callback.name}()">
                    ${opcionesPresentacion}
                </select>
                <input type="number" min="0" placeholder="Cantidad" oninput="${callback.name}()">
                <button class="btn-remove" onclick="eliminarFila(this, ${callback.name})">X</button>
            `;
            contenedor.appendChild(fila);
        }

        // Función para eliminar filas
        function eliminarFila(boton, callback) {
            boton.parentElement.remove();
            callback();
        }

        // Función que calcula el volumen total de una lista de filas
        function calcularVolumenFilas(contenedorId) {
            const filas = document.querySelectorAll(`#${contenedorId} .row-item`);
            let total = 0;
            filas.forEach(fila => {
                const volumen = parseFloat(fila.querySelector('select').value) || 0;
                const cantidad = parseFloat(fila.querySelector('input').value) || 0;
                total += (volumen * cantidad);
            });
            return total;
        }

        // Lógica de la opción 1
        function calcularOpcion1() {
            const totalProduccion = parseFloat(document.getElementById('totalProduccion').value) || 0;
            const totalDescontado = calcularVolumenFilas('itemsOpcion1');
            const restante = totalProduccion - totalDescontado;
            
            document.getElementById('descontadoOp1').innerText = totalDescontado.toFixed(2);
            document.getElementById('restanteOp1').innerText = restante.toFixed(2);

            const alerta = document.getElementById('alertaOp1');
            if (restante < 0) {
                alerta.style.display = 'block';
                document.getElementById('restanteOp1').style.color = 'var(--danger)';
            } else {
                alerta.style.display = 'none';
                document.getElementById('restanteOp1').style.color = 'var(--primary)';
            }

            // Calcular sobrante en la presentación seleccionada
            const volPresentacionRestante = parseFloat(document.getElementById('presentacionRestante').value);
            if (restante > 0) {
                const unidadesEnteras = Math.floor(restante / volPresentacionRestante);
                document.getElementById('calculoRestante').innerText = unidadesEnteras;
            } else {
                document.getElementById('calculoRestante').innerText = '0';
            }
        }

        // Lógica de la opción 2
        function calcularOpcion2() {
            const necesario = calcularVolumenFilas('itemsOpcion2');
            document.getElementById('necesarioOp2').innerText = necesario.toFixed(2);

            if (necesario > 0) {

                const sugerido = Math.ceil(necesario / 100) * 100;
                document.getElementById('sugeridoOp2').innerText = sugerido;

                // Calcular galones extras
                const sobranteLitros = sugerido - necesario;
                const galonesExtra = Math.floor(sobranteLitros / 3.8);
                document.getElementById('galonesExtra').innerText = galonesExtra;
            } else {
                document.getElementById('sugeridoOp2').innerText = '0';
                document.getElementById('galonesExtra').innerText = '0';
            }
        }

        // Inicializar con una fila vacía en cada opción
        window.onload = function() {
            agregarFila('itemsOpcion1', calcularOpcion1);
            agregarFila('itemsOpcion2', calcularOpcion2);
        };