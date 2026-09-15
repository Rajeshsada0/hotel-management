<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'hotel_id',
        'reservation_id',
        'guest_id',
        'issue_date',
        'due_date',
        'subtotal',
        'discount',
        'tax',
        'total_amount',
        'paid_amount',
        'status',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'tax' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
        ];
    }

    protected $appends = ['balance'];

    protected function balance(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, (float)$this->total_amount - (float)$this->paid_amount),
        );
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $count = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('INV-%s-%04d', $year, $count);
    }

    /**
     * Recalculate totals from items.
     */
    public function recalculate(): self
    {
        $subtotal = $this->items()->sum('total_price');
        $total = max(0, $subtotal - (float)$this->discount + (float)$this->tax);
        $paid = $this->payments()->sum('amount');

        $status = 'unpaid';
        if ($paid >= $total && $total > 0) {
            $status = 'paid';
        } elseif ($paid > 0) {
            $status = 'partially_paid';
        }

        $this->update([
            'subtotal' => $subtotal,
            'total_amount' => $total,
            'paid_amount' => $paid,
            'status' => $status,
        ]);

        return $this;
    }
}
