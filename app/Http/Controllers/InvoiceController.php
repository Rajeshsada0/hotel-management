<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(
        protected InvoiceService $invoiceService
    ) {}

    /**
     * Display list of invoices.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status');
        $search = $request->input('search');

        $invoices = Invoice::with(['guest', 'reservation.room'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q, $search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('guest', function ($g) use ($search) {
                      $g->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display printable/interactive folio invoice.
     */
    public function show(Invoice $invoice): Response
    {
        $invoice->load([
            'guest',
            'hotel',
            'reservation.room.roomType',
            'items',
            'payments.receivedByUser',
        ]);

        $hotel = $invoice->hotel ?? Hotel::current() ?? Hotel::first();

        return Inertia::render('invoices/show', [
            'invoice' => $invoice,
            'hotel' => $hotel,
        ]);
    }

    /**
     * Add extra line item to invoice (e.g. restaurant, laundry, minibar).
     */
    public function addItem(Request $request, Invoice $invoice): RedirectResponse
    {
        $validated = $request->validate([
            'item_type' => ['required', 'string'],
            'description' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $this->invoiceService->addItem(
            invoice: $invoice,
            itemType: $validated['item_type'],
            description: $validated['description'],
            quantity: (float) $validated['quantity'],
            rate: (float) $validated['unit_price']
        );

        return back()->with('success', 'Charge added to folio successfully.');
    }

    /**
     * Record payment on invoice.
     */
    public function recordPayment(Request $request, Invoice $invoice): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,credit_card,debit_card,bank_transfer,mobile_payment,online'],
            'transaction_number' => ['nullable', 'string', 'max:100'],
            'reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->invoiceService->recordPayment(
            invoice: $invoice,
            amount: (float) $validated['amount'],
            method: $validated['payment_method'],
            transactionNumber: $validated['transaction_number'] ?? null,
            reference: $validated['reference'] ?? null,
            notes: $validated['notes'] ?? null,
            userId: $request->user()->id
        );

        return back()->with('success', 'Payment recorded successfully.');
    }
}
