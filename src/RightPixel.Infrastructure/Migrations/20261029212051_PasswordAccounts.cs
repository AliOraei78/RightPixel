using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RightPixel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PasswordAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "PlayerProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LoginFailure",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmailHash = table.Column<string>(type: "text", nullable: false),
                    IpHash = table.Column<string>(type: "text", nullable: false),
                    At = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginFailure", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PasswordGrant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    TokenHash = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Used = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordGrant", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PasswordGrant_PlayerProfiles_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "PlayerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoginFailure_EmailHash_At",
                table: "LoginFailure",
                columns: new[] { "EmailHash", "At" });

            migrationBuilder.CreateIndex(
                name: "IX_LoginFailure_IpHash_At",
                table: "LoginFailure",
                columns: new[] { "IpHash", "At" });

            migrationBuilder.CreateIndex(
                name: "IX_PasswordGrant_PlayerId",
                table: "PasswordGrant",
                column: "PlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LoginFailure");

            migrationBuilder.DropTable(
                name: "PasswordGrant");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "PlayerProfiles");
        }
    }
}
