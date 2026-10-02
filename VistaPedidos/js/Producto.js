// Función para solicitar a la API el listado completo de productos mediante GET
function ObtenerProducto() {
    fetch("http://localhost:5111/api/Producto")
        .then((respuesta) => respuesta.json())
        .then((data) => {
            console.log(data);
            mostrarProducto(data); // Ejecuta la función que renderiza los productos en su grilla de datos
        })
        .catch((error) => {
            console.error("Error al obtener productos:", error);
        });
}

// Función encargada de dibujar los productos en las columnas de la tabla HTML correspondiente
function mostrarProducto(data) {
    const tbody = document.getElementById("tablaProductos"); // Captura el cuerpo de la tabla por ID
    if (!tbody) return; // Si no encuentra el contenedor, detiene la ejecución inmediatamente
    tbody.innerHTML = ""; // Borra registros viejos

    // Mapea las propiedades del objeto de la API (provenientes del DTO VistaProducto en camelCase)
    data.forEach((element) => {
        let tr = tbody.insertRow(); // Agrega una fila vacía en la tabla
        tr.insertCell(0).innerHTML = element.nombreProducto;
        tr.insertCell(1).innerHTML = element.stockProducto;
        tr.insertCell(2).innerHTML = element.pCostoProducto; 
        tr.insertCell(3).innerHTML = element.pVentaProducto; 
        tr.insertCell(4).innerHTML = element.nombreCategoria; // Muestra la categoría asociada de forma textual
        
        // --- Botón Editar dinámico ---
        let editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.classList.add("btn", "btn-primary");
        editar.setAttribute(
            "onclick",
            `BuscarValoresProductos(${element.productoId})` // Pasa el productoId (camelCase) correcto
        );
        let tdEditar = tr.insertCell(5); // Añade la columna de edición
        tdEditar.appendChild(editar); // Agrega el botón a la celda

        // --- Botón Eliminar dinámico ---
        let eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.classList.add("btn", "btn-danger");
        eliminar.onclick = function () {
            ValidacionEliminarProducto(element.productoId); // CORREGIDO: Se cambió a Mayúscula para coincidir con la definición de la función
        }
        let tdEliminar = tr.insertCell(6); // Añade la columna de borrado
        tdEliminar.appendChild(eliminar); // Agrega el botón a la celda
    });
}

// Función que pide a la API los IDs y nombres simplificados de las categorías para los cuadros de selección
function ObtenerCategorias() {
    fetch("http://localhost:5111/api/Producto/idCategorias")
        .then((respuesta) => respuesta.json())
        .then((data) => {
            let opciones = '<option value="">[SELECCIONE...]</option>'; // Opción por defecto inicial
            data.forEach((categoria) => {
                // Las propiedades del objeto anónimo que armaste en C# llegan en camelCase pura ('id' y 'nombre')
                opciones += `<option value="${categoria.id}">${categoria.nombre}</option>`;
            });
            // Llena de manera idéntica los selectores del formulario de alta y del formulario modal de edición
            document.getElementById("categoria").innerHTML = opciones;
            document.getElementById("categoriaIdEditar").innerHTML = opciones;
        })
        .catch((error) => {
            console.error("Error al obtener categorías:", error);
        });
}

// Función para empaquetar un nuevo producto y guardarlo a través del método POST
function AgregarProducto() {
    // Arma un JSON respetando el mapeo del modelo 'Producto' de tu backend (pCosto y pVenta en minúscula por camelCase)
    var nuevoProducto = {
        nombre: document.getElementById("nombreProducto").value,
        stock: parseInt(document.getElementById("stockProducto").value),
        pCosto: parseFloat(document.getElementById("precioCostoProducto").value), 
        pVenta: parseFloat(document.getElementById("precioVentaProducto").value), 
        categoriaId: parseInt(document.getElementById("categoria").value)       
    };

    console.log("Nuevo producto a enviar:", nuevoProducto);

    fetch("http://localhost:5111/api/Producto", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoProducto) // Envía el JSON serializado al servidor
    })
    // No usamos .json() aquí porque el controlador C# responde un texto plano ("Producto guardado")
    .then((respuesta) => {
        // Limpia todos los campos del formulario de registro una vez guardado correctamente en la DB
        document.getElementById("nombreProducto").value = "";
        document.getElementById("stockProducto").value = "";
        document.getElementById("precioCostoProducto").value = "";
        document.getElementById("precioVentaProducto").value = "";
        document.getElementById("categoria").value = "";

        ObtenerProducto(); // Recarga la cuadrícula para reflejar el producto ingresado en tiempo real
    })
    .catch((error) => console.error("Error al agregar el producto:", error)); // CORREGIDO: Se agregó el parámetro (error) que faltaba en el catch
}

// Función encargada de buscar los campos de un producto por su ID para desplegar el panel de edición
function BuscarValoresProductos(id) {
    fetch(`http://localhost:5111/api/Producto/${id}`)
        .then((respuesta) => {
            if (!respuesta.ok) {
                throw new Error("Error en la solicitud: " + respuesta.status);
            }
            return respuesta.json(); // Parsea el producto encontrado devuelto por el servidor
        })
        .then((data) => {
            console.log("Producto obtenido para editar:", data);
            // Setea el valor actual de las propiedades del producto en los inputs internos del Modal
            document.getElementById("idEditar").value = data.productoId;
            document.getElementById("nombreEditar").value = data.nombre;
            document.getElementById("precioCostoEditar").value = data.precioCosto;
            document.getElementById("precioVentaEditar").value = data.precioVenta;
            document.getElementById("stockEditar").value = data.stock;

            // Instancia y abre en la pantalla el componente modal de Bootstrap para editar el ítem
            let modal = new bootstrap.Modal(document.getElementById("editarProductoModal"));
            modal.show();
        })
        .catch((error) => {
            console.error("Error al obtener the producto:", error);
        });
}

// Función encargada de recolectar los campos editados del modal y enviarlos a través de PUT
function EditarProducto() {
    let id = document.getElementById("idEditar").value; // Toma el ID del campo invisible

    // Estructura el JSON de actualización con los datos tipeados, apuntando a las firmas de tu modelo Producto
    let productoEditado = {
        productoId: parseInt(id),
        nombre: document.getElementById("nombreEditar").value,
        pCosto: parseFloat(document.getElementById("precioCostoEditar").value),
        pVenta: parseFloat(document.getElementById("precioVentaEditar").value),
        stock: parseInt(document.getElementById("stockEditar").value),
        categoriaId: parseInt(document.getElementById("categoriaIdEditar").value)
    };

    fetch(`http://localhost:5111/api/Producto/${id}`, {
        method: "PUT", // Operación HTTP de reemplazo / actualización
        headers: {  
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(productoEditado)
    })
    // No usamos .json() aquí porque el controlador C# responde un texto plano ("Producto editado exitosamente")
    .then((respuesta) => {
        // Limpia a sus valores iniciales los elementos de control del formulario modal
        document.getElementById("idEditar").value = 0;
        document.getElementById("categoriaIdEditar").value = ""; // CORREGIDO: Se cambió 0 por "" para deseleccionar correctamente el combobox de Bootstrap
        document.getElementById("nombreEditar").value = "";
        document.getElementById("precioCostoEditar").value = "";
        document.getElementById("precioVentaEditar").value = "";
        document.getElementById("stockEditar").value = "";

        // Captura la ventana modal activa de Bootstrap y fuerza su cierre en pantalla
        let modal = bootstrap.Modal.getInstance(document.getElementById("editarProductoModal"));
        modal.hide();
        
        ObtenerProducto(); // Recarga la grilla general para observar los campos actualizados
    })
    .catch((error) => {
        console.error("Error al editar el producto:", error);
    });
}

// Función de protección que pide autorización mediante confirm() antes de efectuar una baja física
function ValidacionEliminarProducto(id) { // CORREGIDO: Inicial con Mayúscula para coincidir con la llamada del botón
    if (confirm("¿Está seguro que desea eliminar este producto?")) { // Despliega la ventana interactiva Sí/No
        fetch(`http://localhost:5111/api/Producto/${id}`, {
            method: "DELETE" // Petición HTTP DELETE apuntando al ID específico en la URL
        })
        .then(() => {
            ObtenerProducto(); // Si se procesó de forma correcta, limpia el ítem eliminado actualizando la grilla
        })
        .catch((error) => {
            console.error("Error al eliminar el producto:", error);
        });
    }
}

// Disparadores de ejecución inicial: Se activan automáticamente apenas el navegador lee e interpreta este archivo JS
ObtenerProducto(); // Levanta los datos de la tabla principal de productos
ObtenerCategorias(); // Descarga las categorías para los elementos de selección del formulario
