using System.ComponentModel.DataAnnotations;

namespace ProyectoPedidos.Models;

public class Producto
{
    [Key]
    public int ProductoId { get; set; }
    public int CategoriaId { get; set; }
    public string? Nombre { get; set; }
    public string? Descripcion { get; set; }
    public decimal PCosto { get; set; }
    public decimal PVenta { get; set; }
    public int Stock { get; set; }


    public virtual Categoria? Categoria { get; set; }
    public ICollection<DetallePedido>? DetallePedidos { get; set; }

}

public class VistaProducto
{
    public int ProductoId { get; set; }
    public string? NombreProducto { get; set; }
    public string? DescripcionProducto { get; set; }
    public decimal PCostoProducto { get; set; }
    public decimal PVentaProducto { get; set; }
    public int StockProducto { get; set; }


    public int CategoriaId { get; set; }
    public string? NombreCategoria { get; set; }
}
