<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Hotel;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    /**
     * Record a new operational hotel expense.
     */
    public function recordExpense(array $data, ?int $userId = null): Expense
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $expenseNumber = $data['expense_number'] ?? Expense::generateExpenseNumber();

        return Expense::create([
            'hotel_id' => $hotel?->id,
            'expense_number' => $expenseNumber,
            'category' => $data['category'],
            'amount' => (float)$data['amount'],
            'expense_date' => $data['expense_date'] ?? now()->toDateString(),
            'payment_method' => $data['payment_method'] ?? 'cash',
            'description' => $data['description'] ?? null,
            'staff_id' => $data['staff_id'] ?? null,
            'created_by' => $userId,
            'attachment' => $data['attachment'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Get aggregated expense totals grouped by category for current month or specified period.
     */
    public function getExpenseBreakdown(?int $hotelId = null, ?int $month = null, ?int $year = null): array
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        $query = Expense::whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month);

        if ($hotelId) {
            $query->where('hotel_id', $hotelId);
        }

        $byCategory = (clone $query)
            ->select('category', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get()
            ->keyBy('category')
            ->toArray();

        $totalAmount = (clone $query)->sum('amount');

        return [
            'month' => Carbon::createFromDate($year, $month, 1)->format('F Y'),
            'total_amount' => (float)$totalAmount,
            'by_category' => $byCategory,
        ];
    }
}
