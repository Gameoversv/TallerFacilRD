package rd.tallerfacil.api.portal.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rd.tallerfacil.api.portal.dto.PortalAuthResponse;
import rd.tallerfacil.api.portal.dto.PortalChangePasswordRequest;
import rd.tallerfacil.api.portal.dto.PortalLoginRequest;
import rd.tallerfacil.api.portal.service.PortalAuthService;
import rd.tallerfacil.api.shared.domain.CustomerContext;
import rd.tallerfacil.api.shared.domain.TenantContext;
import rd.tallerfacil.api.shared.web.ApiResponse;

@RestController
@RequestMapping("/api/portal/auth")
@RequiredArgsConstructor
public class PortalAuthController {

    private final PortalAuthService portalAuthService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<PortalAuthResponse>> login(@RequestBody PortalLoginRequest request) {
        try {
            PortalAuthResponse response = portalAuthService.login(request);
            return ResponseEntity.ok(ApiResponse.ok(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody PortalChangePasswordRequest request
    ) {
        try {
            portalAuthService.changePassword(
                    CustomerContext.require(),
                    TenantContext.require(),
                    request.currentPassword(),
                    request.newPassword()
            );
            return ResponseEntity.ok(ApiResponse.ok(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }
}
