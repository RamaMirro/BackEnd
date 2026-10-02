// Función para obtener la lista de todas las categorías desde la API mediante GET
function ObtenerCategorias() {
    fetch("http://localhost:5111/api/Categoria") // Realiza la petición HTTP al servidor de .NET
        .then((response) => response.json()) // Convierte la respuesta del servidor a un objeto JSON usable
        .then((data) => {
            console.log(data); // Imprime el arreglo de categorías en la consola para depuración
            mostrarCategorias(data); // Envía los datos a la función encargada de dibujarlos en la pantalla
        })
        .catch((error) => console.error("No se pudo acceder a la API:", error)); // Captura fallos de red o caídas del servidor
}

// Función encargada de construir las filas de la tabla de categorías dinámicamente
function mostrarCategorias(data) {
    const tbody = document.getElementById("TablaCategorias"); // Captura el contenedor de la tabla HTML
    tbody.innerHTML = ""; // Borra las filas anteriores para evitar que se dupliquen al recargar

    // Recorre cada categoría devuelta por la API (las propiedades llegan en camelCase: 'nombre', 'categoriaId')
    data.forEach((element) => {
        console.log("Elemento:", element);
        let tr = tbody.insertRow(); // Agrega una fila nueva (<tr>) al final de la tabla
        tr.insertCell(0).textContent = element.nombre; // Inserta el nombre de la categoría en la primera columna

        // --- Configuración del Botón Eliminar ---
        let eliminar = document.createElement("button"); // Crea el botón en memoria
        eliminar.textContent = "Eliminar"; // Le asigna el texto visible
        eliminar.classList.add("btn", "btn-danger"); // Le inyecta clases estéticas de Bootstrap    
        eliminar.setAttribute(
            "onclick",
            `ValidacionEliminarCategoria(${element.categoriaId})` // Pasa el ID correcto (camelCase) al evento click
        );

        let tdEliminar = tr.insertCell(1); // Crea la segunda columna en la fila
        tdEliminar.appendChild(eliminar); // Coloca el botón de eliminar dentro de esa columna

        // --- Configuración del Botón Editar ---
        let editar = document.createElement("button"); // Crea el botón en memoria
        editar.textContent = "Editar"; // Le asigna el texto visible
        editar.classList.add("btn", "btn-primary"); // Le inyecta clases estéticas de Bootstrap
        editar.setAttribute(
            "onclick",
            `BuscarValoresCategoria(${element.categoriaId})` // Configura el click para buscar los datos de esta categoría
        );

        let tdEditar = tr.insertCell(2); // Crea la tercera columna en la fila
        tdEditar.appendChild(editar); // Coloca el botón de editar dentro de esa columna
    });
}

// ... (Todo el código anterior permanece exactamente igual)

// Función para enviar una nueva categoría al servidor usando POST
function AgregarCategoria() {
    // Almacena el texto ingresado en el input dentro de un objeto estructurado para la API
    var nuevaCategoria = {
        nombre: document.getElementById("nombreCategoria").value
    };

    fetch("http://localhost:5111/api/Categoria", {
        method: "POST", // Define la operación HTTP como creación
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json" // Especifica que el cuerpo del mensaje contiene datos JSON
        },
        body: JSON.stringify(nuevaCategoria) // Transforma el objeto JS a una cadena de texto JSON pura
    })
        // No usamos .json() aquí porque el controlador C# responde un texto plano ("Categoria guardada")
        .then((response) => {
            document.getElementById("nombreCategoria").value = ""; // Vacía el cuadro de texto del formulario
            ObtenerCategorias(); // Llama a la función de listado para ver la nueva categoría reflejada en la tabla
        })
        .catch((error) => console.error("Error al agregar categoría:", error)); // CORREGIDO: Se agregó el parámetro (error) explícito en el catch
}



// Función que busca los datos individuales de una categoría para precargar el formulario del Modal de edición
function BuscarValoresCategoria(id){
    fetch(`http://localhost:5111/api/Categoria/${id}`) // Envía el ID directamente en la ruta de la URL
        .then((respuesta)=> {
            if (!respuesta.ok) { // Si la API devuelve un código de error (ej. 404), frena el flujo
                throw new Error("Error en la solicitud: " + respuesta.status);
            }
            return respuesta.json(); // Si todo está bien, parsea la categoría recuperada
        })
        .then((data) => {
            console.log("Categoría:", data);
            // Carga los datos mapeados de la API en los campos ocultos y visibles del formulario modal
            document.getElementById("idEditar").value = data.categoriaId;
            document.getElementById("nombreEditar").value = data.nombre;

            // Inicializa el modal de Bootstrap y lo despliega visualmente en la pantalla
            let modal = new bootstrap.Modal(document.getElementById("editarCategoriaModal"));
            modal.show();
        })
        .catch((error) => {
            console.error("Error al obtener la categoría:", error);
        });
}

// Función encargada de tomar los cambios del formulario modal y enviarlos mediante PUT
function EditarCategoria() {
    let id = document.getElementById("idEditar").value; // Obtiene el ID numérico de la categoría a modificar

    // Prepara el objeto JSON respetando exactamente la estructura de tu modelo C# Categoria
    let categoriaEditada = {
        categoriaId: parseInt(id), 
        nombre: document.getElementById("nombreEditar").value
    };
    
    fetch(`http://localhost:5111/api/Categoria/${id}`, {
        method: "PUT", // Define la operación HTTP como modificación completa
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(categoriaEditada) // Convierte los datos a texto JSON
    })
        // No usamos .json() aquí porque el controlador C# responde un texto plano ("Categoria editada")
        .then((response) => {
            // Reinicia los controles del formulario a sus valores neutros de fábrica
            document.getElementById("idEditar").value = 0; 
            document.getElementById("nombreEditar").value = "";
            
            // Obtiene la ventana modal que se encuentra activa y la cierra de forma visual
            let modal = bootstrap.Modal.getInstance(document.getElementById("editarCategoriaModal"));
            modal.hide();
            
            ObtenerCategorias(); // Recarga la tabla de categorías para mostrar la actualización de inmediato
        })
        .catch((error) => 
            console.error("Error al editar la categoría:", error));
}

// Función intermedia que dispara un cuadro de confirmación nativo antes de procesar un borrado
function ValidacionEliminarCategoria(id) {
    var siElimina = confirm("¿Está seguro que desea eliminar la categoría?"); // Abre la ventana Sí/No del navegador
    if (siElimina == true)  { // Si el usuario confirma la acción
        EliminarCategoria(id); // Ejecuta la llamada física de borrado a la API
    }
}

// Función que ejecuta la llamada DELETE al servidor para quitar la categoría de la base de datos
function EliminarCategoria(id) {
    fetch(`http://localhost:5111/api/Categoria/${id}`, {
        method: "DELETE" // Método HTTP especializado en remoción
    })
        .then(()=>{
            ObtenerCategorias(); // Si se borró con éxito, actualiza la grilla de la interfaz
        })
        .catch((error) =>
            console.error("Error al eliminar la categoría:", error));
}
