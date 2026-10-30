using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RightPixel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReceiptOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ShopReceipts",
                table: "ShopReceipts");

            migrationBuilder.DropIndex(
                name: "IX_ShopReceipts_PlayerId",
                table: "ShopReceipts");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShopReceipts",
                table: "ShopReceipts",
                columns: new[] { "PlayerId", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ShopReceipts",
                table: "ShopReceipts");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShopReceipts",
                table: "ShopReceipts",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ShopReceipts_PlayerId",
                table: "ShopReceipts",
                column: "PlayerId");
        }
    }
}
