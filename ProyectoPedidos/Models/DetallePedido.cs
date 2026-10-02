using System.ComponentModel.DataAnnotations;

namespace ProyectoPedidos.Models;

public class DetallePedido
{
    [Key]
    public int DetallePedidoId { get; set; }
    public int PedidoId { get; set; }
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public virtual Pedido? Pedido { get; set; }
    public virtual Producto? Producto { get; set; }
}

