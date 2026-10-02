using System.ComponentModel.DataAnnotations;

namespace ProyectoPedidos.Models;

public class Categoria
{
    [Key]
    public int CategoriaId { get; set; }
    public string? Nombre { get; set; }

public ICollection<Producto>? Productos { get; set; } 
}
