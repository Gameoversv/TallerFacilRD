package rd.tallerfacil.api.superadmin.dto;

import rd.tallerfacil.api.tenant.domain.Tenant;
import rd.tallerfacil.api.tenant.domain.TenantPlan;
import rd.tallerfacil.api.tenant.domain.TenantStatus;

import java.time.Instant;
import java.util.UUID;

public record TenantSummaryResponse(
        UUID id,
        String name,
        String slug,
        TenantPlan plan,
        TenantStatus status,
        Instant trialEndsAt,
        Instant createdAt,
        long userCount,
        long customerCount,
        long vehicleCount,
        long orderCount
) {
    public static TenantSummaryResponse of(Tenant t, long users, long customers, long vehicles, long orders) {
        return new TenantSummaryResponse(
                t.getId(), t.getName(), t.getSlug(),
                t.getPlan(), t.getStatus(), t.getTrialEndsAt(), t.getCreatedAt(),
                users, customers, vehicles, orders
        );
    }
}
