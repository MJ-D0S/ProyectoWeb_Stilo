document.addEventListener('DOMContentLoaded', () => {
    const formAgregarProducto = document.getElementById('form-agregar-producto');

    // Mapeo de nombres a los IDs numéricos de tu tabla Categoria en SQL
    const CATEGORIA_IDS = {
        "Abrigos": 1,
        "Camisetas": 2,
        "Pantalones": 3
    };

    if (formAgregarProducto) {
        // Añadimos los atributos necesarios directamente por JS por seguridad
        formAgregarProducto.method = "POST";
        formAgregarProducto.action = "procesar_admin.php";
        formAgregarProducto.enctype = "multipart/form-data";

        formAgregarProducto.addEventListener('submit', validarYEnviar);
        console.log("Formulario vinculado al sistema PHP/SQL.");
    }

    function validarYEnviar(e) {
        // 1. OBTENER ELEMENTOS
        const inputNombre = document.getElementById('input-nombre');
        const inputPrecio = document.getElementById('input-precio');
        const selectCategoria = document.getElementById('select-categoria');
        const inputImagenFile = document.getElementById('input-imagen');

        const nombre = inputNombre.value.trim();
        const precio = parseFloat(inputPrecio.value);
        const categoriaNombre = selectCategoria.value;
        const archivoImagen = inputImagenFile.files[0];

        // 2. VALIDACIONES BÁSICAS
        if (!nombre || isNaN(precio) || precio <= 0 || !categoriaNombre || !archivoImagen) {
            e.preventDefault(); // Detiene el envío si hay error
            alert("❌ ERROR: Completa todos los campos. El precio debe ser mayor a 0 y la imagen es obligatoria.");
            return;
        }

        // 3. VALIDACIÓN DE CATEGORÍA
        const categoriaId = CATEGORIA_IDS[categoriaNombre];
        if (!categoriaId) {
            e.preventDefault();
            alert(`❌ ERROR: La categoría "${categoriaNombre}" no es válida para el sistema SQL.`);
            return;
        }

        // 4. OBTENER VENDEDOR (Desde localStorage como lo tenías)
        const vendedorDataString = localStorage.getItem('vendedorLogueado');
        const vendedorID = vendedorDataString ? JSON.parse(vendedorDataString).uid : null;

        if (!vendedorID) {
            e.preventDefault();
            alert("❌ ERROR: No se detectó sesión de vendedor. Inicia sesión de nuevo.");
            return;
        }

        // 5. PREPARAR DATOS PARA PHP
        // Creamos campos ocultos para enviar el ID numérico de la categoría y el ID del vendedor
        crearCampoOculto(formAgregarProducto, "categoria_id", categoriaId);
        crearCampoOculto(formAgregarProducto, "vendedor_id", vendedorID);
        crearCampoOculto(formAgregarProducto, "accion", "insertar");

        // Los nombres de los inputs en el HTML deben coincidir con lo que espera el PHP
        inputNombre.name = "nombre_p";
        inputPrecio.name = "precio";
        inputImagenFile.name = "imagen";

        console.log("✅ Validación exitosa. Enviando datos al servidor PHP...");
        // El formulario se enviará normalmente a procesar_admin.php
    }

    // Función auxiliar para añadir datos extra al formulario antes de enviarlo
    function crearCampoOculto(form, nombre, valor) {
        let input = form.querySelector(`input[name="${nombre}"]`);
        if (!input) {
            input = document.createElement("input");
            input.type = "hidden";
            input.name = nombre;
            form.appendChild(input);
        }
        input.value = valor;
    }
});