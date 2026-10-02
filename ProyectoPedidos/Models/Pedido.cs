using System.ComponentModel.DataAnnotations;

namespace ProyectoPedidos.Models;

public class Pedido
{
    [Key]
    public int PedidoId { get; set; }
    public Estado Estado { get; set; }
    public string? Nombre { get; set; }
    public DateTime Fecha { get; set; }

    public ICollection<DetallePedido>? DetallePedidos { get; set; }
}
public enum Estado
{
    Pendiente,
    Enviado,
    Entregado,
}

public class VistaPedido
{
    public int PedidoId { get; set; }
    public string? NombreDelCliente { get; set; }
    public string EstadoPedido { get; set; }

    public string FechaFormateada { get; set; }

}
