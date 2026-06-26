package rd.tallerfacil.api.tenant.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rd.tallerfacil.api.auth.dto.AuthResponse;
import rd.tallerfacil.api.shared.web.ApiResponse;
import rd.tallerfacil.api.tenant.dto.RegisterTenantRequest;
import rd.tallerfacil.api.tenant.service.TenantService;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterTenantRequest req) {
        return ApiResponse.ok(tenantService.registerTenant(req));
    }
}
