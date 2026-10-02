// Arreglo global que funciona como un carrito de compras temporal en la memoria del navegador
let detallesPedido = [];

// Función para listar todos los productos disponibles y rellenar el menú desplegable del formulario
function ObtenerProductos(){
    fetch("http://localhost:5111/api/Pedido/productos") // Llama al endpoint de productos
    .then((respuesta) => respuesta.json())
    .then((data) => {
        let productoSeleccionado = document.getElementById("producto"); // Captura el elemento HTML <select>
        productoSeleccionado.innerHTML = '<option value="">[SELECCIONE...]</option>'; // Restablece la opción por defecto

        // Itera la lista de productos devueltos (mapeados desde el modelo C# VistaProducto en camelCase)
        data.forEach((producto) => {
            // Inserta cada opción guardando el precio de venta dentro de un atributo especial de datos 'data-precio'
            productoSeleccionado.innerHTML += `
                <option 
                    value="${producto.productoId}" data-precio="${producto.pVenta}">
                    ${producto.nombre}
                </option>
            `;
        });
     
    })
    .catch((error) => {
        console.error("Error al obtener productos:", error);
    });
}

// Función encargada de autocompletar el precio unitario cuando el usuario cambia el producto seleccionado
function cargarPrecio() 
{
    let producto = document.getElementById("producto"); // Obtiene el componente select
    let precioInput = document.getElementById("precioUnitario"); // Obtiene el input de precio
    let opcionSeleccionada = producto.options[producto.selectedIndex]; // Localiza la opción exacta que clickeó el usuario

    // Si el usuario vuelve a posicionarse sobre la opción vacía de selección, limpia el input de precio y frena
    if (producto.value == "") {
        precioInput.value = "";
        return;
    }
    
    let precio = opcionSeleccionada.dataset.precio; // Extrae el valor guardado previamente en el atributo 'data-precio'
    precioInput.value = precio; // Establece el precio de forma automática en el formulario
}

// Función que lee el formulario de carga, construye un ítem de detalle y lo introduce al carrito temporal
function AgregarDetalle() {
    let producto = document.getElementById("producto");
    let cantidad = Number(document.getElementById("cantidad").value); // Lee la cantidad asegurando que se interprete como número
    let precio = Number(document.getElementById("precioUnitario").value); // Lee el precio asegurando que se interprete como número

    // Construye la estructura de la línea del pedido para que encaje con el modelo DetallePedido de C#
    let detalle = {
        productoId: Number(producto.value), // Clave del producto para la base de datos
        nombreProducto: producto.options[producto.selectedIndex].text, // Guarda el texto visible únicamente para renderizar en la tabla
        cantidad: cantidad, 
        precioUnitario: precio
    };
    detallesPedido.push(detalle); // Añade el objeto al final del arreglo global
    MostrarDetalles(); // Llama a la función de dibujo para actualizar la pantalla
}

// Función que recorre la lista del carrito temporal y construye las filas de la tabla de ítems de manera visual
function MostrarDetalles() {
    let tbody = document.getElementById("detallePedido"); // Obtiene el elemento cuerpo de la tabla por su ID
    if (!tbody) return; // Si la tabla no está presente en la vista actual, frena para que el script no rompa

    tbody.innerHTML = ""; // Limpia por completo la tabla antes de redibujarla
    let totalAcumulado = 0; // Inicializa una variable de sumatoria para calcular el total general del pedido
    
    // Recorre secuencialmente el carrito usando el elemento de detalle y su índice de posición
    detallesPedido.forEach((detalle, index) => {
        let subtotal = detalle.cantidad * detalle.precioUnitario; // Multiplica la cantidad por el precio de esa línea
        totalAcumulado += subtotal; // Acumula el resultado en la variable global del total

        // Inyecta el renglón en formato HTML restringiendo los campos de moneda a dos decimales fijos (.toFixed(2))
        tbody.innerHTML += `
            <tr>
                <td>${detalle.nombreProducto}</td>
                <td>${detalle.cantidad}</td>
                <td>${detalle.precioUnitario.toFixed(2)}</td>
                <td>${subtotal.toFixed(2)}</td>
                <td><button onclick="EliminarDetalle(${index})">Eliminar</button></td> 
            </tr>
        `; // El botón eliminar pasa su índice posicional para poder ser identificado individualmente después
    });
}

// Función para remover una línea específica del detalle del pedido usando su ubicación en el arreglo
function EliminarDetalle(index) {
    detallesPedido.splice(index, 1); // Corta y elimina el elemento que está en la posición 'index'
    MostrarDetalles(); // Redibuja la tabla HTML reflejando el cambio y recalculando el total acumulado
}

// Inicializador automático: Corre al cargarse la página web para llenar el combobox de productos inmediatamente
ObtenerProductos();
