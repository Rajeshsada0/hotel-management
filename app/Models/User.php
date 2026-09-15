<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string|null $username
 * @property string $email
 * @property string|null $phone
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property int|null $role_id
 * @property string $role
 * @property string $status
 * @property string|null $profile_image
 * @property Carbon|null $last_login_at
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'username',
    'email',
    'phone',
    'password',
    'role_id',
    'role',
    'status',
    'profile_image',
    'last_login_at',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Role relationship.
     */
    public function roleRelation(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Check if user has a given role or any in the list of roles.
     */
    public function hasRole(string|array $roles): bool
    {
        $roleList = is_array($roles) ? $roles : func_get_args();

        if (in_array($this->role, $roleList, true)) {
            return true;
        }

        if ($this->roleRelation && in_array($this->roleRelation->slug, $roleList, true)) {
            return true;
        }

        return false;
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isHotelAdmin(): bool
    {
        return $this->hasRole('super_admin', 'hotel_admin');
    }

    public function isManager(): bool
    {
        return $this->hasRole('super_admin', 'hotel_admin', 'manager');
    }

    public function isReceptionist(): bool
    {
        return $this->hasRole('super_admin', 'hotel_admin', 'manager', 'receptionist');
    }

    public function isAccountant(): bool
    {
        return $this->hasRole('super_admin', 'hotel_admin', 'accountant');
    }

    public function isHousekeeping(): bool
    {
        return $this->hasRole('housekeeping');
    }

    public function isRestaurantStaff(): bool
    {
        return $this->hasRole('restaurant_staff');
    }

    public function isStorekeeper(): bool
    {
        return $this->hasRole('storekeeper');
    }
}
