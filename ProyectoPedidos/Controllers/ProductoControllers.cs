using ProyectoPedidos.Data;
using ProyectoPedidos.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ProyectoPedidos.Controllers
{
    [Route("api/[controller]")] // Ruta base: api/Producto
    [ApiController]
    public class ProductoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Método HTTP GET para listar todos los productos detallados (Ruta: api/Producto)
        [HttpGet]
        public async Task<IActionResult> ListadoProducto()
        {
            // Carga los productos incluyendo los datos de su Categoría asociada (.Include)
            var listadoProductos = await _context.Productos.Include(p => p.Categoria).ToListAsync();
            
            // Transforma la lista a un formato específico para mostrar en la interfaz ('VistaProducto')
            var ProductoMostrar = listadoProductos.Select(p => new VistaProducto
            {
                ProductoId = p.ProductoId,
                CategoriaId = p.CategoriaId,
                NombreProducto = p.Nombre,
                DescripcionProducto = p.Descripcion,
                PCostoProducto = p.PCosto,
                PVentaProducto = p.PVenta,
                StockProducto = p.Stock,
                NombreCategoria = p.Categoria?.Nombre // Evita errores si la categoría llega a ser nula
            }).ToList();
            
            return Ok(ProductoMostrar);
        }

        // Método HTTP POST para registrar un nuevo producto con validaciones (Ruta: api/Producto)
        [HttpPost]
        public async Task<IActionResult> CrearProducto([FromBody] Producto producto)
        {
            // Validación 1: Comprueba que la categoría asignada al producto realmente exista en la base de datos
            var existeCategoria = await _context.Categorias.AnyAsync(c => c.CategoriaId == producto.CategoriaId);
            if (!existeCategoria)
            {
                // Si no existe la categoría, devuelve un error 400 Bad Request frenando el flujo
                return BadRequest($"Error: La categoria con ID {producto.CategoriaId}no existe.");
            }

            // Validación 2: Comprueba que el campo nombre no venga vacío
            if (producto.Nombre == "")
            {
                return BadRequest("Error: El nombre del producto no puede estar vacío.");
            }

            // Creación del nuevo objeto Producto con los datos validados
            var nuevoProducto = new Producto
            {
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                PCosto = producto.PCosto,
                PVenta = producto.PVenta,
                Stock = producto.Stock,
                CategoriaId = producto.CategoriaId
            };
            
            _context.Add(nuevoProducto); // Lo prepara en el contexto
            await _context.SaveChangesAsync(); // Lo registra permanentemente

            return Ok("Producto guardado");
        }

        // Método HTTP PUT para actualizar un producto existente (Ruta: api/Producto/{id})
        [HttpPut("{productoId}")]
        public async Task<IActionResult> EditarProducto(int productoId, [FromBody] Producto producto)
        {
            // Validación: Evita nombres vacíos
            if (producto.Nombre == "")
            {
                return NotFound("Error: El nombre del producto no puede estar vacío."); // Nota: Debería ser BadRequest
            }

            var nombreMayuscula = producto.Nombre.ToUpper(); // Convierte el nuevo nombre a mayúsculas
            
            // Busca en la base de datos el producto original que se quiere editar
            var editarProducto = await _context.Productos.Where(p => p.ProductoId == productoId).FirstOrDefaultAsync();
            if (editarProducto == null)
            {
                return NotFound($"Error: No se encontró el producto con ID {productoId}.");
            }

            // Verifica que no haya OTRO producto diferente que ya use ese mismo nombre
            var existeNombre = await _context.Productos.Where(p => p.Nombre == nombreMayuscula && p.ProductoId != productoId).AnyAsync();
            
            if (!existeNombre)
            {
                // Si el nombre está libre, actualiza todos los campos del producto seleccionado
                editarProducto.Nombre = nombreMayuscula;
                editarProducto.Descripcion = producto.Descripcion;
                editarProducto.PCosto = producto.PCosto;
                editarProducto.PVenta = producto.PVenta;
                editarProducto.Stock = producto.Stock;
                
                await _context.SaveChangesAsync(); // Guarda los cambios realizados en el objeto 'editarProducto'
                return Ok("Producto editado exitosamente");
            }
            
            return NotFound("Error: Ya existe un producto con el mismo nombre.");
        }

        // Método HTTP GET para obtener parejas de ID y Nombre de categorías (Ruta: api/Producto/IdCategorias)
        // Se suele usar para llenar elementos desplegables (Select/Combobox) en el Frontend
        [HttpGet("IdCategorias")]
        public async Task<IActionResult> ObtenerCategorias()
        {
            var categorias = await _context.Categorias
            .OrderBy(c => c.Nombre) // Las ordena alfabéticamente
            .Select(c => new
            {
                id = c.CategoriaId,
                nombre = c.Nombre // Crea un objeto anónimo optimizado solo con los datos necesarios
            })
            .ToListAsync();
            
            return Ok(categorias);
        }

        // Método HTTP GET para ver la ficha detallada de un producto por su ID (Ruta: api/Producto/{id})
        [HttpGet("{productoId}")]
        public async Task<IActionResult> ObtenerProductos(int productoId)
        {
            var producto = await _context.Productos
                .Where(p => p.ProductoId == productoId)
                .Select(p => new
                {
                    productoId = p.ProductoId,
                    nombre = p.Nombre,
                    precioCosto = p.PCosto,
                    precioVenta = p.PVenta,
                    stock = p.Stock,
                    nombreCategoria = p.Categoria.Nombre // Trae el texto de la categoría directamente sin todo el objeto complejo
                })
                .FirstOrDefaultAsync();

            if (producto == null)
            {
                return NotFound(); // Error 404 si el ID no corresponde a ningún producto
            }
            return Ok(producto);
        }

        // Método HTTP DELETE para dar de baja un producto (Ruta: api/Producto/{id})
        [HttpDelete("{productoId}")]
        public async Task<IActionResult> Eliminar(int productoId)
        {
            var producto = await _context.Productos.FindAsync(productoId);

            if (producto == null)
            {
                return NotFound("Producto no encontrado");
            }
            
            _context.Productos.Remove(producto); // Remueve el producto encontrado
            await _context.SaveChangesAsync(); // Ejecuta los cambios en la base de datos
            return NoContent();
        }
    }
}
