// Importación de librerías esenciales
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoPedidos.Data;
using ProyectoPedidos.Models;

namespace ProyectoPedidos.controllers
{
    [Route("api/[controller]")] // Ruta base: api/Pedido
    [ApiController]
    public class PedidoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Constructor para la inyección de dependencias del contexto de base de datos
        public PedidoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Método HTTP GET para listar los pedidos transformados a una estructura visual (Ruta: api/Pedido)
        [HttpGet]
        public async Task<IActionResult> ListadoPedido()
        {
            // Mapea y transforma los pedidos a un modelo de vista simplificado ('VistaPedido')
            var pedidos = await _context.Pedidos.Select(p => new VistaPedido
            {
                PedidoId = p.PedidoId,
                NombreDelCliente = p.Nombre,
                FechaFormateada = p.Fecha.ToString("dd/MM/yyyy"), // Convierte la fecha a formato legible día/mes/año
                EstadoPedido = p.Estado.ToString() // Convierte el estado (que suele ser un Enum) a texto plano
            }).ToListAsync(); // Ejecuta la consulta de forma asíncrona y la convierte en lista
            
            return Ok(pedidos); // Retorna los pedidos procesados
        }

        // Método HTTP POST para registrar un pedido completo junto con sus productos (Ruta: api/Pedido)
        [HttpPost]
        public async Task<IActionResult> CrearPedidoConDetalles([FromBody] Pedido pedido)
        {
            try
            {
                // Mapea los datos recibidos del pedido y genera la estructura con su lista de detalles
                var nuevoPedido = new Pedido
                {
                    Nombre = pedido.Nombre,
                    Fecha = pedido.Fecha,
                    Estado = pedido.Estado,
                    // Recorre cada producto del detalle recibido y crea un nuevo objeto 'DetallePedido'
                    DetallePedidos = pedido.DetallePedidos.Select(d => new DetallePedido
                    {
                        ProductoId = d.ProductoId,
                        Cantidad = d.Cantidad,
                        PrecioUnitario = d.PrecioUnitario,
                    }).ToList()
                };
                
                // Añade de forma asíncrona el pedido principal (Entity Framework guardará los detalles en cascada automáticamente)
                await _context.Pedidos.AddAsync(nuevoPedido);
                await _context.SaveChangesAsync(); // Guarda de forma definitiva todo en la base de datos

                // Retorna un estado 201 Created indicando dónde se puede consultar el recurso e incluye datos del éxito
                return CreatedAtAction(nameof(CrearPedidoConDetalles), new { id = nuevoPedido.PedidoId }, new
                {
                    mensaje = "Pedido creado exitosamente",
                    pedidoId = nuevoPedido.PedidoId
                });
            }
            catch (Exception ex)
            {
                // Si ocurre algún fallo imprevisto (ej. error de conexión o datos inválidos), captura la excepción
                // y devuelve un estado 500 (Error Interno del Servidor) explicando qué falló
                return new JsonResult(new { error = "Error al guardar:" + ex.Message }) { StatusCode = 500 };
            }
        }

        // Método HTTP GET para obtener una lista rápida de todos los productos (Ruta: api/Pedido/productos)
        [HttpGet("productos")]
        public IActionResult ObtenerProductos()
        {
            // Obtiene todos los productos de forma síncrona
            var productos = _context.Productos.ToList();
            return Ok(productos);
        }
    }
}
