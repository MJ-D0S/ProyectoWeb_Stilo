Create database E_Commerce;
Use E_Commerce;
CREATE TABLE Categoria (
    CategoriaID INT NOT NULL,
    NombreCategoria NVARCHAR(100),
    PRIMARY KEY (CategoriaID)
);
CREATE TABLE Tarjeta (
    TarjetaID INT NOT NULL,
    NumeroTarjeta BIGINT,
    Fechadevencimiento nvarchar(20),
    Codigodeseguridad INT,
    PRIMARY KEY (TarjetaID)
);
CREATE TABLE MetodoPago (
    MetodoPagoID INT NOT NULL,
    TarjetaID INT NOT NULL,
    PRIMARY KEY (MetodoPagoID),
    FOREIGN KEY (TarjetaID) REFERENCES Tarjeta(TarjetaID)
);
CREATE TABLE Direcciones (
    DireccionID INT NOT NULL,
    Calle NVARCHAR(250),
    Ciudad NVARCHAR(100),
    Estado NVARCHAR(100),
    CodigoPostal NVARCHAR(10),
    Pais NVARCHAR(100),
    PRIMARY KEY (DireccionID)
);
CREATE TABLE Usuario (
    UId INT NOT NULL,
    MetodoPagoID INT NOT NULL,
    DireccionID INT NOT NULL,
    NombreU NVARCHAR(100),
    ApellidoU NVARCHAR(100),
    CorreoElectronicoU NVARCHAR(100) UNIQUE,
    ContraseniaU NVARCHAR(250),
    Telefono NVARCHAR(20),
    PRIMARY KEY (UId),
    FOREIGN KEY (MetodoPagoID) REFERENCES MetodoPago(MetodoPagoID),
    FOREIGN KEY (DireccionID) REFERENCES Direcciones(DireccionID)
);
CREATE TABLE Vendedor (
    VenID INT NOT NULL,
    NombreV NVARCHAR(100),
    Apellidos NVARCHAR(100),
    CorreoElectronico NVARCHAR(100) UNIQUE,
    Contrasenia NVARCHAR(255),
    PRIMARY KEY (VenID)
);
CREATE TABLE Productos (
    PID INT NOT NULL,
    NombreP NVARCHAR(150),
    CategoriaID INT,
    Precio DECIMAL(10,2),
    ImagenURL NVARCHAR(225),
    VendedorID INT,
    EstaActivo BIT,
    PRIMARY KEY (PID),
    FOREIGN KEY (CategoriaID) REFERENCES Categoria(CategoriaID),
    FOREIGN KEY (VendedorID) REFERENCES Vendedor(VenID)
);
CREATE TABLE Carrito (
    CarritoID INT NOT NULL,
    ProductoID INT NOT NULL,
    Cantidad INT,
    PRIMARY KEY (CarritoID, ProductoID),
    FOREIGN KEY (ProductoID) REFERENCES Productos(PID)
);
CREATE TABLE Pedidos (
    PedidoID INT NOT NULL,
    CarritoID INT NOT NULL,
    ProductoID INT NOT NULL,
    UsuarioID INT NOT NULL,
    FechaPedido DATETIME,
    Estado NVARCHAR(50),
    PRIMARY KEY (PedidoID),
    FOREIGN KEY (CarritoID) REFERENCES Carrito(CarritoID),
    FOREIGN KEY (ProductoID) REFERENCES Productos(PID),
    FOREIGN KEY (UsuarioID) REFERENCES Usuario(UId)
);
INSERT INTO Categoria (CategoriaID, NombreCategoria) VALUES
(1, 'Abrigos'),
(2, 'Camisas');
INSERT INTO Tarjeta (TarjetaID, NumeroTarjeta, Fechadevencimiento, Codigodeseguridad) VALUES
(1, 41432467453235678, '2028-11-21', 103),
(2, 55032452156364214, '2027-05-31', 542);

INSERT INTO MetodoPago (MetodoPagoID, TarjetaID) VALUES
(1, 1),
(2, 2);

INSERT INTO Direcciones (DireccionID, Calle, Ciudad, Estado, CodigoPostal, Pais) VALUES
(1, 'Calle Luz 312', 'Leon', 'Guanajuato', '36000', 'Mexico'),
(2, 'Calle Falsa 456', 'Monterrey', 'Nuevo León', '64000', 'México');
INSERT INTO Usuario (UId, MetodoPagoID, DireccionID, NombreU, ApellidoU, CorreoElectronicoU, ContraseniaU, Telefono) VALUES
(1, 1, 1, 'Juan', 'Pérez', 'juanperez4223@gmail.com', 'JuP104522', '5510226734'),
(2, 2, 2, 'Ana', 'Gómez', 'anagomez12434@gmail.com', 'ANG342123', '5555326781');

INSERT INTO Vendedor (VenID, NombreV, Apellidos, CorreoElectronico, Contrasenia) VALUES
(1, 'Carlos', 'Ramírez', 'carlramtie@gmail.com', 'HJ41FH23'),
(2, 'Laura', 'Torres', 'lauratomodow@gmail.com', 'KLD4223');

INSERT INTO Productos (PID, NombreP, CategoriaID, Precio, ImagenURL, VendedorID, EstaActivo) VALUES
(1, 'Puffer Azul Marino', 1, "abrigos", 396.00, "./img/abrigos/01.jpg", 1, 1),
(2, 'Camiseta Azul Oscuro Clásica', 2, 99.99, './img/camisetas/02.jpg', 2, 1);

INSERT INTO Carrito (CarritoID, ProductoID, Cantidad) VALUES
(1, 1, 2),
(2, 2, 1);

INSERT INTO Pedidos (PedidoID, CarritoID, ProductoID, UsuarioID, FechaPedido, Estado) VALUES
(1, 1, 1, 1, '2025-06-07 10:30:00', 'Pendiente'),
(2, 2, 2, 2, '2025-06-07 11:00:00', 'Enviado');
