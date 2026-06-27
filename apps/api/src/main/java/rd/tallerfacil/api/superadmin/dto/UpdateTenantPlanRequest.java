package rd.tallerfacil.api.superadmin.dto;

import jakarta.validation.constraints.NotNull;
import rd.tallerfacil.api.tenant.domain.TenantPlan;

public record UpdateTenantPlanRequest(@NotNull TenantPlan plan) {}
