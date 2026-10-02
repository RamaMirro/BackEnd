using Microsoft.EntityFrameworkCore;
using ProyectoPedidos.Models;

namespace ProyectoPedidos.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Categoria> Categorias { get; set; } = null!;
    public DbSet<Pedido> Pedidos { get; set; } = null!;
    public DbSet<DetallePedido> DetallePedidos { get; set; } = null!;
    public DbSet<Producto> Productos { get; set; } = null!;
}
