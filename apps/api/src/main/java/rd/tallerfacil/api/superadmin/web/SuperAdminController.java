package rd.tallerfacil.api.superadmin.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rd.tallerfacil.api.shared.web.ApiResponse;
import rd.tallerfacil.api.superadmin.dto.GlobalStatsResponse;
import rd.tallerfacil.api.superadmin.dto.TenantSummaryResponse;
import rd.tallerfacil.api.superadmin.dto.UpdateTenantPlanRequest;
import rd.tallerfacil.api.superadmin.dto.UpdateTenantStatusRequest;
import rd.tallerfacil.api.superadmin.service.SuperAdminService;

import java.util.UUID;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminService service;

    @GetMapping("/stats")
    public ApiResponse<GlobalStatsResponse> stats() {
        return ApiResponse.ok(service.globalStats());
    }

    @GetMapping("/tenants")
    public ApiResponse<Page<TenantSummaryResponse>> tenants(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(service.listTenants(q, page, size));
    }

    @PatchMapping("/tenants/{id}/status")
    public ApiResponse<TenantSummaryResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTenantStatusRequest req
    ) {
        return ApiResponse.ok(service.updateStatus(id, req));
    }

    @PatchMapping("/tenants/{id}/plan")
    public ApiResponse<TenantSummaryResponse> updatePlan(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTenantPlanRequest req
    ) {
        return ApiResponse.ok(service.updatePlan(id, req));
    }
}
