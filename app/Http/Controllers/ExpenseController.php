<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Hotel;
use App\Models\Staff;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(
        protected ExpenseService $expenseService
    ) {}

    /**
     * Display hotel expenses, category summary, and staff directory.
     */
    public function index(): Response
    {
        $hotel = Hotel::current() ?? Hotel::first();

        $expenses = Expense::with(['staff', 'creator'])
            ->latest('expense_date')
            ->latest('id')
            ->paginate(15);

        $staffList = Staff::orderBy('department')
            ->orderBy('name')
            ->get();

        $summary = $this->expenseService->getExpenseBreakdown($hotel?->id);

        return Inertia::render('expenses/index', [
            'hotel' => $hotel,
            'expenses' => $expenses,
            'staffList' => $staffList,
            'summary' => $summary,
        ]);
    }

    /**
     * Record a new hotel operational expense.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'expense_date' => ['required', 'date'],
            'payment_method' => ['required', 'string'],
            'description' => ['nullable', 'string', 'max:255'],
            'staff_id' => ['nullable', 'exists:staff,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $expense = $this->expenseService->recordExpense($validated, $request->user()?->id);

        return back()->with('success', "Expense #{$expense->expense_number} recorded successfully.");
    }

    /**
     * Add a new staff member.
     */
    public function storeStaff(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'department' => ['required', 'string'],
            'position' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'joining_date' => ['required', 'date'],
            'salary' => ['required', 'numeric', 'min:0'],
        ]);

        $hotel = Hotel::current() ?? Hotel::first();

        $staff = Staff::create(array_merge($validated, [
            'hotel_id' => $hotel?->id,
            'employee_id' => Staff::generateEmployeeId(),
            'status' => 'active',
        ]));

        return back()->with('success', "Staff member '{$staff->name}' ({$staff->employee_id}) added.");
    }
}
