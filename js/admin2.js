document.addEventListener('DOMContentLoaded', () => {
    // Usamos el ID del formulario: "form-agregar-producto"
    const formAgregarProducto = document.getElementById('form-agregar-producto');

    // Mapeo de nombres de categoría a sus IDs de documento en Firestore
    const CATEGORIA_IDS = {
        "Abrigos": "xGfLBx8ymCkNDKN1EVJo",
        "Camisetas": "W5sOkIw5SxSqTvxSR2bs",
        "Pantalones": "0mQTpFM9nsP7JhKhgUlF"
    };

    if (formAgregarProducto) {
        formAgregarProducto.addEventListener('submit', agregarProducto);
        console.log("Formulario de agregar producto enlazado correctamente.");
    } else {
        console.error("ERROR CRÍTICO: Formulario de agregar producto no encontrado. Revise el ID 'form-agregar-producto' en admin2.html.");
        alert("ERROR: No se encontró el formulario para agregar productos.");
    }

    async function agregarProducto(e) {
        e.preventDefault();
        
        // 1. OBTENER Y VERIFICAR ELEMENTOS DEL DOM
        const inputNombre = document.getElementById('input-nombre');
        const inputPrecio = document.getElementById('input-precio');
        const selectCategoria = document.getElementById('select-categoria');
        // CRÍTICO: Ahora buscamos el ID del input type="file"
        const inputImagenFile = document.getElementById('input-imagen'); 

        // Verificación crítica de IDs de HTML (para evitar el error de null)
        if (!inputNombre || !inputPrecio || !selectCategoria || !inputImagenFile) {
            alert("❌ ERROR: Faltan elementos de formulario en el HTML. Verifique los IDs.");
            return;
        }

        // Obtener los valores
        const nombre = inputNombre.value.trim();
        const precio = parseFloat(inputPrecio.value); 
        const categoria = selectCategoria.value; 
        const archivoImagen = inputImagenFile.files[0]; // Obtenemos el objeto File
        
        // 2. Validaciones de campos
        if (!nombre || isNaN(precio) || precio <= 0 || !categoria || !archivoImagen) {
            alert("❌ ERROR: Por favor, completa todos los campos correctamente. Precio debe ser un número positivo y debe seleccionar una imagen.");
            return;
        }

        // 3. Obtener el ID de Categoría
        const categoriaId = CATEGORIA_IDS[categoria]; 
        if (!categoriaId) {
            alert(`❌ ERROR: La categoría "${categoria}" no tiene un ID de documento asignado.`);
            return;
        }

        // 4. Obtener el ID del Vendedor (dinámicamente desde localStorage)
        const vendedorDataString = localStorage.getItem('vendedorLogueado');
        const vendedorID = vendedorDataString ? JSON.parse(vendedorDataString).uid : null; 
        
        if (!vendedorID) {
            alert("❌ ERROR: El ID de Vendedor no se encontró en la sesión. Por favor, cierre e inicie sesión de administrador nuevamente.");
            return;
        }

        console.log(`Datos válidos. Vendedor ID: ${vendedorID}. Intentando subir imagen y guardar en Firestore...`);
        
        try {
            // A. SUBIR LA IMAGEN A FIREBASE STORAGE
            const storageRef = firebase.storage().ref();
            // Creamos una ruta única: productos/timestamp-nombrearchivo
            const fileRef = storageRef.child(`productos/${Date.now()}-${archivoImagen.name}`);
            
            alert(`⏳ Subiendo imagen...`);
            const uploadTask = await fileRef.put(archivoImagen);
            
            // Obtenemos la URL pública de la imagen
            const imagenURL = await uploadTask.ref.getDownloadURL();
            console.log(`✅ Imagen subida con éxito. URL: ${imagenURL}`);
            
            // B. GUARDAR EL PRODUCTO EN FIRESTORE
            const estadoActivo = true; 
            
            const docRef = await db.collection("Productos").add({
                NombreP: nombre,
                Precio: precio.toFixed(2), 
                CategoriaID: categoriaId, 
                ImagenUrl: imagenURL, // URL de Storage
                Vendedor: vendedorID, 
                EstadoActivo: estadoActivo, 
                FechaCreacion: firebase.firestore.FieldValue.serverTimestamp() 
            });

            // 6. CONFIRMACIÓN DE ÉXITO
            console.log(`✅ Producto guardado con éxito. ID: ${docRef.id}`);
            alert(`✅ ¡Éxito! Producto "${nombre}" guardado en Firestore. ID: ${docRef.id}`);
            
            // Limpiar el formulario
            formAgregarProducto.reset();

        } catch (error) {
            // 7. MENSAJE DE ERROR DETALLADO
            console.error("Error al guardar el producto:", error);
            let errorMessage = `❌ ERROR al guardar el producto. Mensaje: ${error.message}`;
            
            if (error.code === 'permission-denied' || error.message.includes('permission')) {
                 errorMessage += "\n\n⚠️ ¡PROBLEMA DE PERMISOS! La regla de seguridad de Firestore O Storage no permite la escritura. Asegúrate de que las reglas de 'Productos' sean 'allow write: if true;'";
            }
            
            alert(errorMessage);
        }
    }
});