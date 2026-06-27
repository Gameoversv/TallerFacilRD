package rd.tallerfacil.api.superadmin.dto;

import rd.tallerfacil.api.tenant.domain.Tenant;

import java.time.Instant;
import java.util.UUID;

public record ExpiringTenantResponse(UUID id, String name, String slug, Instant trialEndsAt) {
    public static ExpiringTenantResponse from(Tenant t) {
        return new ExpiringTenantResponse(t.getId(), t.getName(), t.getSlug(), t.getTrialEndsAt());
    }
}
