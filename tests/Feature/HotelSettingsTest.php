<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_hotel_settings(): void
    {
        $response = $this->get(route('hotel.edit'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_hotel_settings(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('hotel.edit'));
        $response->assertOk();
    }

    public function test_hotel_settings_can_be_updated(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->put(route('hotel.update'), [
            'name' => 'Seaside Grand Resort',
            'code' => 'SGR-01',
            'address' => '500 Coastal Hwy',
            'city' => 'San Diego',
            'country' => 'United States',
            'phone' => '+1 (555) 999-1234',
            'email' => 'contact@seasideresort.com',
            'website' => 'https://seasideresort.com',
            'tax_number' => 'CA-998877',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'check_in_time' => '15:00',
            'check_out_time' => '10:00',
            'status' => 'active',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('hotels', [
            'name' => 'Seaside Grand Resort',
            'code' => 'SGR-01',
            'city' => 'San Diego',
        ]);
    }

    public function test_user_role_helpers(): void
    {
        $superAdminRole = Role::create([
            'slug' => 'super_admin',
            'name' => 'Super Admin',
        ]);

        $user = User::factory()->create([
            'role_id' => $superAdminRole->id,
            'role' => 'super_admin',
        ]);

        $this->assertTrue($user->isSuperAdmin());
        $this->assertTrue($user->isHotelAdmin());
        $this->assertTrue($user->hasRole('super_admin'));
        $this->assertFalse($user->hasRole('housekeeping'));
    }
}
