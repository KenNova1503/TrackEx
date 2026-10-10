using ExTrack.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExTrack.API.Data;

/// <summary>
/// Seeds three months of demo expenses: the current month and the two before it.
/// Called from the UseSeeding hook in Program.cs, only when the SeedDemoData flag is set.
/// </summary>
public static class DemoDataSeeder
{
    // Category IDs from the HasData seed in AppDbContext (Housing, Travel and Debt Payments stay empty)
    private const int FOOD = 1;
    private const int TRANSPORTATION = 2;
    private const int UTILITIES = 3;
    private const int ENTERTAINMENT = 4;
    private const int SHOPPING = 5;
    private const int HEALTHCARE = 6;
    private const int INSURANCE = 8;
    private const int EDUCATION = 9;
    private const int SUBSCRIPTIONS = 10;
    private const int WORK = 12;
    private const int GIFTS = 13;
    private const int MISCELLANEOUS = 15;

    private record SeedExpense(int Day, int CategoryId, decimal Amount, string? Description);

    // Fixed bills, added to every month with the same amount
    private static readonly SeedExpense[] RecurringExpenses =
    [
        new(1, INSURANCE, 142.00m, "Car insurance"),
        new(1, INSURANCE, 210.00m, "Health insurance premium"),
        new(1, INSURANCE, 18.50m, "Renter's insurance"),
        new(3, SUBSCRIPTIONS, 15.49m, "Netflix"),
        new(5, SUBSCRIPTIONS, 11.99m, "Spotify"),
        new(12, SUBSCRIPTIONS, 2.99m, "Cloud storage"),
        new(18, SUBSCRIPTIONS, 8.00m, "News subscription"),
        new(10, UTILITIES, 69.99m, "Internet"),
        new(22, UTILITIES, 45.00m, "Phone plan"),
    ];

    // Index 0 = current month, 1 = last month, 2 = two months ago
    private static readonly SeedExpense[][] MonthlyExpenses =
    [
        // Current month
        [
            new(1, FOOD, 89.56m, "Weekly groceries"),
            new(3, FOOD, 4.75m, "Coffee"),
            new(5, FOOD, 16.40m, "Lunch near office"),
            new(8, FOOD, 103.21m, "Weekly groceries"),
            new(10, FOOD, 64.80m, "Birthday dinner"),
            new(12, FOOD, 4.75m, "Coffee"),
            new(14, FOOD, 29.95m, "Ramen takeout"),
            new(16, FOOD, 91.38m, "Weekly groceries"),
            new(19, FOOD, 12.60m, null),
            new(22, FOOD, 84.12m, "Weekly groceries"),
            new(24, FOOD, 5.50m, "Coffee"),
            new(27, FOOD, 38.20m, "Brunch"),
            new(29, FOOD, 18.35m, "Lunch near office"),
            new(2, TRANSPORTATION, 49.60m, "Gas"),
            new(9, TRANSPORTATION, 26.40m, "Ride share to airport"),
            new(17, TRANSPORTATION, 53.25m, "Gas"),
            new(24, TRANSPORTATION, 2.75m, "Bus fare"),
            new(30, TRANSPORTATION, 18.00m, "Parking"),
            new(7, UTILITIES, 74.92m, "Electric bill"),
            new(14, UTILITIES, 33.10m, "Water bill"),
            new(4, ENTERTAINMENT, 30.00m, "Movie tickets"),
            new(11, ENTERTAINMENT, 120.00m, "Music festival pass"),
            new(18, ENTERTAINMENT, 24.99m, null),
            new(26, ENTERTAINMENT, 16.50m, "Bowling"),
            new(3, SHOPPING, 31.20m, "Household supplies"),
            new(13, SHOPPING, 189.00m, "Winter boots"),
            new(20, SHOPPING, 17.85m, "Toiletries"),
            new(28, SHOPPING, 44.99m, "Bedding"),
            new(6, HEALTHCARE, 40.00m, "Gym membership"),
            new(15, HEALTHCARE, 35.00m, "Doctor visit co-pay"),
            new(23, HEALTHCARE, 14.75m, "Allergy medicine"),
            new(1, EDUCATION, 650.00m, "Evening course tuition"),
            new(8, EDUCATION, 120.00m, "Certification exam fee"),
            new(12, EDUCATION, 56.40m, "Textbooks"),
            new(20, EDUCATION, 19.99m, "Online course"),
            new(27, EDUCATION, 25.00m, "Workshop ticket"),
            new(6, WORK, 22.40m, "Office supplies"),
            new(16, WORK, 59.00m, "Conference ticket"),
            new(25, WORK, 15.80m, "Business cards"),
            new(10, GIFTS, 20.00m, "Charity donation"),
            new(19, GIFTS, 35.00m, "Wedding gift"),
            new(29, GIFTS, 8.00m, null),
            new(2, MISCELLANEOUS, 58.90m, "Pet supplies"),
            new(7, MISCELLANEOUS, 220.00m, "Vet visit"),
            new(11, MISCELLANEOUS, 16.80m, "Shipping a package"),
            new(15, MISCELLANEOUS, 195.00m, "Furniture assembly service"),
            new(21, MISCELLANEOUS, 38.00m, "Dry cleaning"),
            new(25, MISCELLANEOUS, 85.00m, "Storage unit"),
            new(30, MISCELLANEOUS, 27.40m, null),
        ],
        // Last month
        [
            new(1, FOOD, 94.18m, "Weekly groceries"),
            new(3, FOOD, 4.75m, "Coffee"),
            new(5, FOOD, 15.60m, "Lunch near office"),
            new(7, FOOD, 22.45m, "Burger takeout"),
            new(8, FOOD, 81.92m, "Weekly groceries"),
            new(10, FOOD, 4.75m, "Coffee"),
            new(12, FOOD, 56.30m, "Dinner with friends"),
            new(15, FOOD, 88.07m, "Weekly groceries"),
            new(17, FOOD, 13.80m, null),
            new(19, FOOD, 9.40m, "Smoothie and snack"),
            new(22, FOOD, 97.64m, "Weekly groceries"),
            new(24, FOOD, 4.75m, "Coffee"),
            new(25, FOOD, 34.10m, "Sushi takeout"),
            new(27, FOOD, 17.25m, "Lunch near office"),
            new(29, FOOD, 72.48m, "Groceries"),
            new(2, TRANSPORTATION, 51.35m, "Gas"),
            new(9, TRANSPORTATION, 21.30m, "Ride share"),
            new(13, TRANSPORTATION, 2.75m, "Bus fare"),
            new(16, TRANSPORTATION, 46.80m, "Gas"),
            new(23, TRANSPORTATION, 89.99m, "Oil change"),
            new(28, TRANSPORTATION, 2.75m, "Bus fare"),
            new(7, UTILITIES, 96.18m, "Electric bill"),
            new(14, UTILITIES, 35.60m, "Water bill"),
            new(6, ENTERTAINMENT, 28.50m, "Movie tickets"),
            new(20, ENTERTAINMENT, 15.00m, "Mini golf"),
            new(27, ENTERTAINMENT, 22.00m, "Board game"),
            new(4, SHOPPING, 38.97m, "Household supplies"),
            new(11, SHOPPING, 79.99m, "Jacket"),
            new(21, SHOPPING, 18.25m, "Toiletries"),
            new(26, SHOPPING, 26.40m, null),
            new(6, HEALTHCARE, 40.00m, "Gym membership"),
            new(18, HEALTHCARE, 120.00m, "Dentist cleaning"),
            new(25, HEALTHCARE, 8.99m, "Pain relievers"),
            new(2, EDUCATION, 650.00m, "Evening course tuition"),
            new(9, EDUCATION, 45.00m, "Exam registration"),
            new(15, EDUCATION, 34.99m, "Programming book"),
            new(23, EDUCATION, 14.99m, "Online course"),
            new(5, WORK, 18.60m, "Printer ink"),
            new(16, WORK, 29.00m, "Coworking day pass"),
            new(26, WORK, 11.25m, "Office supplies"),
            new(10, GIFTS, 20.00m, "Charity donation"),
            new(21, GIFTS, 12.00m, "Fundraiser raffle"),
            new(28, GIFTS, 6.50m, null),
            new(4, MISCELLANEOUS, 61.75m, "Pet supplies"),
            new(8, MISCELLANEOUS, 175.00m, "Laptop repair"),
            new(12, MISCELLANEOUS, 95.00m, "Locksmith"),
            new(18, MISCELLANEOUS, 22.30m, "Key copies"),
            new(24, MISCELLANEOUS, 210.00m, "Bike repair"),
            new(30, MISCELLANEOUS, 40.00m, "Dry cleaning"),
        ],
        // Two months ago
        [
            new(2, FOOD, 86.42m, "Weekly groceries"),
            new(4, FOOD, 4.75m, "Coffee"),
            new(6, FOOD, 14.20m, "Lunch near office"),
            new(9, FOOD, 92.15m, "Weekly groceries"),
            new(10, FOOD, 27.80m, "Pizza night"),
            new(12, FOOD, 5.25m, null),
            new(14, FOOD, 48.60m, "Dinner with friends"),
            new(16, FOOD, 78.33m, "Weekly groceries"),
            new(18, FOOD, 13.50m, "Lunch near office"),
            new(20, FOOD, 4.75m, "Coffee"),
            new(23, FOOD, 101.07m, "Weekly groceries"),
            new(25, FOOD, 31.40m, "Thai takeout"),
            new(27, FOOD, 16.90m, null),
            new(29, FOOD, 6.10m, "Bakery"),
            new(3, TRANSPORTATION, 48.20m, "Gas"),
            new(8, TRANSPORTATION, 18.75m, "Ride share"),
            new(15, TRANSPORTATION, 52.10m, "Gas"),
            new(21, TRANSPORTATION, 2.75m, "Bus fare"),
            new(28, TRANSPORTATION, 24.00m, "Parking"),
            new(7, UTILITIES, 112.64m, "Electric bill"),
            new(14, UTILITIES, 38.20m, "Water bill"),
            new(8, ENTERTAINMENT, 32.00m, "Movie tickets"),
            new(17, ENTERTAINMENT, 85.00m, "Concert tickets"),
            new(26, ENTERTAINMENT, 19.99m, "Video game"),
            new(5, SHOPPING, 64.99m, "Running shoes"),
            new(11, SHOPPING, 23.48m, "Household supplies"),
            new(19, SHOPPING, 42.00m, "T-shirts"),
            new(30, SHOPPING, 15.75m, "Toiletries"),
            new(6, HEALTHCARE, 40.00m, "Gym membership"),
            new(13, HEALTHCARE, 25.00m, "Prescription co-pay"),
            new(24, HEALTHCARE, 12.49m, "Vitamins"),
            new(1, EDUCATION, 650.00m, "Evening course tuition"),
            new(6, EDUCATION, 89.95m, "Textbooks"),
            new(20, EDUCATION, 29.99m, "Online course"),
            new(7, WORK, 34.50m, "Office supplies"),
            new(15, WORK, 12.99m, "Notebook and pens"),
            new(22, WORK, 49.00m, "Industry webinar"),
            new(10, GIFTS, 20.00m, "Charity donation"),
            new(24, GIFTS, 15.50m, "Birthday card and flowers"),
            new(28, GIFTS, 5.00m, null),
            new(3, MISCELLANEOUS, 54.30m, "Pet supplies"),
            new(9, MISCELLANEOUS, 240.00m, "Vet visit"),
            new(14, MISCELLANEOUS, 18.40m, "Shipping a package"),
            new(19, MISCELLANEOUS, 149.00m, "Phone screen repair"),
            new(25, MISCELLANEOUS, 32.00m, "Dry cleaning"),
            new(29, MISCELLANEOUS, 130.00m, "Passport renewal"),
        ],
    ];

    public static void Seed(DbContext context)
    {
        var expenses = context.Set<Expense>();

        // Never touch a database that already has expenses
        if (expenses.Any())
            return;

        var today = DateTime.UtcNow.Date;
        var currentMonthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var seeded = MonthlyExpenses.SelectMany((monthExpenses, monthsAgo) =>
        {
            var monthStart = currentMonthStart.AddMonths(-monthsAgo);
            var daysInMonth = DateTime.DaysInMonth(monthStart.Year, monthStart.Month);

            return RecurringExpenses.Concat(monthExpenses).Select(item => new Expense
            {
                Amount = item.Amount,
                Description = item.Description,
                CategoryId = item.CategoryId,
                Date = monthStart.AddDays(ToDayOfMonth(item.Day, monthsAgo, today.Day, daysInMonth) - 1).AddHours(12)
            });
        });

        expenses.AddRange(seeded);
        context.SaveChanges();
    }

    // The current month is only partly over, so its full month of expenses is squeezed into
    // the days so far (keeping their order). Past months clamp to the month's last day.
    private static int ToDayOfMonth(int day, int monthsAgo, int todayDay, int daysInMonth) =>
        monthsAgo == 0
            ? (day * todayDay + daysInMonth - 1) / daysInMonth
            : Math.Min(day, daysInMonth);
}
