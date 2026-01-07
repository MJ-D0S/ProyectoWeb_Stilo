<?php
// 1. Conexión a la base de datos para cargar datos dinámicos
$host = 'localhost'; 
$usuario = 'root'; 
$contraseña = 'Mtz100802'; 
$nombre_base_datos = 'E-Commerce';
$conn = new mysqli($host, $usuario, $contraseña, $nombre_base_datos);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stilø | Admin SQL</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css" />
    <link rel="stylesheet" href="./css/admin2.css" />
</head>
<body>
    <div class="wrapper">
        <header class="header-mobile">
            <h1 class="logo">Stilø</h1>
            <button class="open-menu" id="open-menu"><i class="bi bi-list"></i></button>
        </header>

        <aside>
            <button class="close-menu" id="close-menu"><i class="bi bi-x"></i></button>
            <header>
                <h1 class="logo">Stilø/Ventas</h1>
            </header>
            <nav class="menu">
                <ul>
                    <li><button class="boton-menu active" onclick="mostrarSeccion('agregar')"><i class="bi bi-plus-square"></i> Agregar producto</button></li>
                    <li><button class="boton-menu" onclick="mostrarSeccion('eliminar')"><i class="bi bi-trash-fill"></i> Eliminar producto</button></li>
                    <li><button class="boton-menu" onclick="mostrarSeccion('pedidos')"><i class="bi bi-cart-fill"></i> Últimos pedidos</button></li>
                </ul>
            </nav>
            <footer>
                <p class="texto-footer">© 2025 Juan Jose Hernandez Garcia</p>
                <button class="boton-cerrar-sesion" id="cerrar-sesion"><i class="bi bi-box-arrow-right"></i> Cerrar sesión</button>
            </footer>
        </aside>

        <main>
            <h2 class="titulo-principal">Panel de Administración (SQL)</h2>

            <section id="agregar" class="section active">
                <h3>Agregar Producto</h3>
                <form class="admin-form" id="form-agregar-producto" action="agregarprod.php" method="POST" enctype="multipart/form-data">
                    <label for="input-nombre">Nombre</label>
                    <input type="text" name="nombre_p" id="input-nombre" placeholder="Ej. Puffer Azul Marino" required />
                    
                    <label for="input-precio">Precio</label>
                    <input type="number" name="precio" id="input-precio" step="0.01" placeholder="Ej. 396.00" required />
                    
                    <label for="select-categoria">Categoría</label>
                    <select name="categoria_id" id="select-categoria" required>
                        <option value="">Selecciona una categoría</option>
                        <option value="1">Abrigos</option>
                        <option value="2">Camisetas</option>
                        <option value="3">Pantalones</option>
                    </select>
                    
                    <label for="input-imagen">Imagen</label>
                    <input type="file" name="imagen" id="input-imagen" accept="image/*" required />
                    
                    <input type="hidden" name="vendedor_id" id="vendedor_id_hidden" value="1">
                    
                    <button class="boton-pagar" type="submit">Guardar producto en SQL</button>
                </form>
            </section>

            <section id="eliminar" class="section">
                <h3>Eliminar Producto</h3>
                <form class="admin-form" action="eliminarprod.php" method="POST">
                    <label>Selecciona un producto para eliminar</label>
                    <select name="pid" id="select-eliminar" required>
                        <option value="">Selecciona...</option>
                        <?php
                        // Cargamos los productos activos de la base de datos
                        $res = $conn->query("SELECT PID, NombreP FROM Productos WHERE EstaActivo = 1");
                        while($row = $res->fetch_assoc()) {
                            echo "<option value='".$row['PID']."'>".$row['NombreP']."</option>";
                        }
                        ?>
                    </select>
                    <button class="boton-pagar" style="background-color: #d40000;" type="submit">Eliminar definitivamente</button>
                </form>
            </section>

            <section id="pedidos" class="section">
                <h3>Productos en Inventario</h3>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Imagen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $resTable = $conn->query("SELECT * FROM Productos WHERE EstaActivo = 1 ORDER BY PID DESC");
                            while($p = $resTable->fetch_assoc()) {
                                echo "<tr>";
                                echo "<td>".$p['PID']."</td>";
                                echo "<td>".$p['NombreP']."</td>";
                                echo "<td>$".$p['Precio']."</td>";
                                echo "<td><img src='".$p['ImagenURL']."' width='50'></td>";
                                echo "</tr>";
                            }
                            ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>

    <script src="./js/admin2.js"></script>
    <script>
        // Lógica de navegación entre secciones
        const openMenu = document.getElementById("open-menu");
        const closeMenu = document.getElementById("close-menu");
        const aside = document.querySelector("aside");

        openMenu.addEventListener("click", () => aside.classList.add("aside-visible"));
        closeMenu.addEventListener("click", () => aside.classList.remove("aside-visible"));

        function mostrarSeccion(seccionId) {
            document.querySelectorAll(".boton-menu").forEach((btn) => btn.classList.remove("active"));
            event.currentTarget.classList.add("active"); 
            document.querySelectorAll(".section").forEach((sec) => sec.classList.remove("active"));
            document.getElementById(seccionId).classList.add("active");
            
            // Si es móvil, cerrar el menú tras click
            if(window.innerWidth <= 600) aside.classList.remove("aside-visible");
        }

        // Cargar ID de vendedor desde localStorage al campo oculto
        const vendedorData = localStorage.getItem('vendedorLogueado');
        if (vendedorData) {
            const v = JSON.parse(vendedorData);
            document.getElementById('vendedor_id_hidden').value = v.uid || 1;
        }

        document.getElementById("cerrar-sesion").addEventListener("click", () => {
            localStorage.removeItem('vendedorLogueado');
            window.location.href = 'index.html'; 
        });
    </script>
</body>
</html>
