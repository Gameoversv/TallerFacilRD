package rd.tallerfacil.api.superadmin.dto;

import jakarta.validation.constraints.NotNull;
import rd.tallerfacil.api.tenant.domain.TenantStatus;

public record UpdateTenantStatusRequest(@NotNull TenantStatus status) {}
