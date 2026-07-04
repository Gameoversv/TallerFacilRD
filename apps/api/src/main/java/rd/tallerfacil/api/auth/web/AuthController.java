package rd.tallerfacil.api.auth.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rd.tallerfacil.api.auth.dto.AuthResponse;
import rd.tallerfacil.api.auth.dto.LoginRequest;
import rd.tallerfacil.api.auth.dto.RegisterRequest;
import rd.tallerfacil.api.auth.service.AuthService;
import rd.tallerfacil.api.shared.ratelimit.ClientIpResolver;
import rd.tallerfacil.api.shared.ratelimit.RateLimiterService;
import rd.tallerfacil.api.shared.ratelimit.RateLimitProperties;
import rd.tallerfacil.api.shared.web.ApiResponse;
import rd.tallerfacil.api.shared.web.RateLimitExceededException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RateLimiterService rateLimiterService;
    private final RateLimitProperties rateLimitProperties;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        enforceRateLimit("register", request.email(), httpRequest, rateLimitProperties.getRegister());
        return ResponseEntity.ok(ApiResponse.ok(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        enforceRateLimit("login", request.email(), httpRequest, rateLimitProperties.getLogin());
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }

    private void enforceRateLimit(
            String action, String account, HttpServletRequest httpRequest, RateLimitProperties.Limit limit) {
        if (!rateLimitProperties.isEnabled()) {
            return;
        }
        String ip = ClientIpResolver.resolve(httpRequest);
        String key = action + ":" + ip + ":" + (account == null ? "" : account.toLowerCase());
        if (!rateLimiterService.tryConsume(key, limit)) {
            throw new RateLimitExceededException(
                    "Demasiados intentos de " + action + " desde " + ip);
        }
    }
}
