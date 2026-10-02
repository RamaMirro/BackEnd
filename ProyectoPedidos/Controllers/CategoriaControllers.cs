// Importación de librerías necesarias para el funcionamiento del código
using ProyectoPedidos.Data; // Permite acceder al contexto de la base de datos
using ProyectoPedidos.Models; // Permite usar los modelos (como Categoria)
using Microsoft.AspNetCore.Mvc; // Necesario para construir controladores API
using Microsoft.EntityFrameworkCore; // Permite usar funciones asíncronas de la base de datos (como ToListAsync)

namespace ProyectoPedidos.Controllers
{
    // Define la ruta base de la API. "[controller]" se reemplaza automáticamente por "Categoria" -> api/Categoria
    [Route("api/[controller]")] 
    [ApiController] // Indica que esta clase es un controlador de API Web y habilita comportamientos automáticos
    public class CategoriaController : ControllerBase
    {
        // Variable privada para almacenar la conexión a la base de datos
        private readonly ApplicationDbContext _context;
        
        // Constructor: Recibe e inyecta el contexto de la base de datos al iniciar el controlador
        public CategoriaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Método HTTP GET para listar todas las categorías (Ruta: api/Categoria)
        [HttpGet]
        public async Task<IActionResult> ListadoCategoria()
        {
            // Busca de forma asíncrona todas las categorías guardadas en la base de datos
            var categorias = await _context.Categorias.ToListAsync();
            // Retorna un estado 200 OK junto con la lista de categorías encontradas
            return Ok(categorias);
        }

        // Método HTTP POST para crear una nueva categoría (Ruta: api/Categoria)
        [HttpPost]
        public async Task<IActionResult> CrearCategoria([FromBody] Categoria categoria)
        {
            // Toma el nombre recibido, le quita los espacios vacíos en los extremos (.Trim) y lo pasa a mayúsculas (.ToUpper)
            var nombreMayuscula = categoria.Nombre?.Trim().ToUpper();

            // Verifica en la base de datos si ya existe alguna categoría con ese mismo nombre
            var existeCategoria = await _context.Categorias.AnyAsync(e => e.Nombre == nombreMayuscula);

            // Si la categoría NO existe, procede a guardarla
            if (!existeCategoria)
            {
                var nuevaCategoria = new Categoria
                {
                    Nombre = nombreMayuscula, // Asigna el nombre formateado en mayúsculas
                };
                _context.Add(nuevaCategoria); // Prepara la nueva categoría para ser insertada
                await _context.SaveChangesAsync(); // Guarda los cambios de forma definitiva en la base de datos
                return Ok("Categoria guardada"); // Retorna un mensaje de éxito
            }
            
            // Si ya existía, simplemente retorna un estado 200 vacío (Nota: lo ideal aquí sería un BadRequest)
            return Ok();
        }

        // Método HTTP PUT para editar una categoría existente (Ruta: api/Categoria/{id})
        [HttpPut("{categoriaId}")]
        public async Task<IActionResult> EditarCategoria(int categoriaId, [FromBody] Categoria categoria) // CORREGIDO: Se cambió 'categoriaID' a 'categoriaId' para coincidir exactamente con el parámetro de la ruta
        {
            // Limpia y pasa a mayúsculas el nombre que viene en el cuerpo de la petición
            var nombreMayuscula = categoria.Nombre?.Trim().ToUpper();

            // Busca la categoría que se quiere editar usando su ID
            var editarCategoria = await _context.Categorias.Where(e => e.CategoriaId == categoriaId).SingleOrDefaultAsync(); // CORREGIDO: Utiliza la variable en minúsculas

            // Verifica si YA existe OTRA categoría distinta con ese mismo nombre (para evitar duplicados)
            var existeNombre = await _context.Categorias.AnyAsync(e => e.Nombre == nombreMayuscula && e.CategoriaId != categoriaId); // CORREGIDO: Utiliza la variable en minúsculas

            // Si el nombre no está repetido en otra categoría, actualiza
            if (!existeNombre)
            {
                editarCategoria.Nombre = nombreMayuscula; // Asigna el nuevo nombre
                _context.Update(editarCategoria); // Prepara la actualización
                await _context.SaveChangesAsync(); // Impacta el cambio en la base de datos
                return Ok("Categoria editada");
            }
            // Si el nombre ya estaba ocupado por otro registro, cancela y avisa al usuario
            return Ok("Ya existe una categoria con ese nombre");
        }

        // Método HTTP DELETE para borrar una categoría (Ruta: api/Categoria/{id})
        [HttpDelete("{categoriaId}")]
        public async Task<IActionResult> EliminarCategoria (int categoriaId) // CORREGIDO: Se cambió 'categoria' a 'categoriaId' para enlazarse con la ruta definida en el atributo HTTP
        {
            // Busca la categoría directamente por su clave primaria (ID)
            var categoriaEliminar = await _context.Categorias.FindAsync(categoriaId); // CORREGIDO: Utiliza la variable corregida

            // Si no encuentra la categoría, devuelve un error 404 Not Found
            if (categoriaEliminar == null)
            {
                return NotFound("Categoria no encontrada");
            }
            
            _context.Categorias.Remove(categoriaEliminar); // Prepara la eliminación del registro
            await _context.SaveChangesAsync(); // Aplica el borrado en la base de datos
            return NoContent(); // Retorna un estado 204 (Sin Contenido), común al eliminar con éxito
        } 

        // Método HTTP GET para obtener una sola categoría específica por su ID (Ruta: api/Categoria/{id})
        [HttpGet("{categoriaId}")]
        public async Task<IActionResult> ObtenerCategoria(int categoriaId)
        {
            // Busca la primera categoría que coincida con el ID proporcionado
            var categoria = await _context.Categorias.FirstOrDefaultAsync(c => c.CategoriaId == categoriaId);

            // Si no existe, devuelve un error 404
            if (categoria == null)
            {
                return NotFound("Categoria no encontrada");
            }
            // Si existe, la devuelve con un estado 200 OK
            return Ok(categoria);
        }
    }
}
