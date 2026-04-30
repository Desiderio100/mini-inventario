CREATE DATABASE IF NOT EXISTS inventario;
USE inventario;
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
INSERT INTO productos (nombre, cantidad, precio) VALUES ('Teclado', 10, 25.50), ('Monitor', 5, 150.00);
