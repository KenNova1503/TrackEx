using ExTrack.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExTrack.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(c => c.Name).IsUnique();
            entity.Property(c => c.Description).IsRequired().HasMaxLength(500);
            entity.Property(c => c.Color).HasMaxLength(7).HasDefaultValue("#007BFF");
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Expenses)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Food & Dining", Description = "Groceries, restaurants, coffee", Color = "#007BFF" },
            new Category { Id = 2, Name = "Transportation", Description = "Gas, ride-sharing, public transit", Color = "#28A745" },
            new Category { Id = 3, Name = "Utilities", Description = "Electricity, water, internet, phone", Color = "#FFC107" },
            new Category { Id = 4, Name = "Entertainment", Description = "Movies, concerts, subscriptions", Color = "#DC3545" },
            new Category { Id = 5, Name = "Shopping", Description = "Clothes, household items, personal care", Color = "#6F42C1" },
            new Category { Id = 6, Name = "Healthcare", Description = "Doctor visits, prescriptions, gym", Color = "#17A2B8" },
            new Category { Id = 7, Name = "Housing", Description = "Rent, mortgage, home maintenance", Color = "#E83E8C" },
            new Category { Id = 8, Name = "Insurance", Description = "Car, health, home insurance", Color = "#FD7E14" },
            new Category { Id = 9, Name = "Education", Description = "Courses, books, tuition", Color = "#007BFF" },
            new Category { Id = 10, Name = "Subscriptions", Description = "Apps, software, memberships", Color = "#20C997" },
            new Category { Id = 11, Name = "Travel", Description = "Flights, hotels, vacation", Color = "#0DCAF0" },
            new Category { Id = 12, Name = "Work-Related", Description = "Office supplies, professional development", Color = "#6C757D" },
            new Category { Id = 13, Name = "Gifts & Donations", Description = "Gifts for people, charity", Color = "#198754" },
            new Category { Id = 14, Name = "Debt Payments", Description = "Loan payments, credit card payments", Color = "#FF6B6B" },
            new Category { Id = 15, Name = "Miscellaneous", Description = "Catch-all for things that don't fit", Color = "#495057" }
        );
    }
}
