using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ExTrack.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false, defaultValue: "#007BFF")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Color", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "#007BFF", "Groceries, restaurants, coffee", "Food & Dining" },
                    { 2, "#28A745", "Gas, ride-sharing, public transit", "Transportation" },
                    { 3, "#FFC107", "Electricity, water, internet, phone", "Utilities" },
                    { 4, "#DC3545", "Movies, concerts, subscriptions", "Entertainment" },
                    { 5, "#6F42C1", "Clothes, household items, personal care", "Shopping" },
                    { 6, "#17A2B8", "Doctor visits, prescriptions, gym", "Healthcare" },
                    { 7, "#E83E8C", "Rent, mortgage, home maintenance", "Housing" },
                    { 8, "#FD7E14", "Car, health, home insurance", "Insurance" },
                    { 9, "#007BFF", "Courses, books, tuition", "Education" },
                    { 10, "#20C997", "Apps, software, memberships", "Subscriptions" },
                    { 11, "#0DCAF0", "Flights, hotels, vacation", "Travel" },
                    { 12, "#6C757D", "Office supplies, professional development", "Work-Related" },
                    { 13, "#198754", "Gifts for people, charity", "Gifts & Donations" },
                    { 14, "#FF6B6B", "Loan payments, credit card payments", "Debt Payments" },
                    { 15, "#495057", "Catch-all for things that don't fit", "Miscellaneous" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId",
                table: "Expenses",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
