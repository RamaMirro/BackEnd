using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoPedidos.Migrations
{
    /// <inheritdoc />
    public partial class RestaurarTablaPedidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "total",
                table: "Pedidos");

            migrationBuilder.RenameColumn(
                name: "fecha",
                table: "Pedidos",
                newName: "Fecha");

            migrationBuilder.AddColumn<string>(
                name: "Nombre",
                table: "Pedidos",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Nombre",
                table: "Pedidos");

            migrationBuilder.RenameColumn(
                name: "Fecha",
                table: "Pedidos",
                newName: "fecha");

            migrationBuilder.AddColumn<decimal>(
                name: "total",
                table: "Pedidos",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
