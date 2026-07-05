package rd.tallerfacil.api.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rd.tallerfacil.api.auth.domain.RoleName;
import rd.tallerfacil.api.auth.domain.User;
import rd.tallerfacil.api.auth.dto.AuthResponse;
import rd.tallerfacil.api.auth.dto.LoginRequest;
import rd.tallerfacil.api.auth.dto.RegisterRequest;
import rd.tallerfacil.api.auth.dto.UserResponse;
import rd.tallerfacil.api.auth.repository.RoleRepository;
import rd.tallerfacil.api.auth.repository.UserRepository;
import rd.tallerfacil.api.shared.web.TenantSuspendedException;
import rd.tallerfacil.api.tenant.repository.TenantRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TenantRepository tenantRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El correo ya esta registrado");
        }

        var user = new User(request.name(), request.email(), passwordEncoder.encode(request.password()));

        RoleName roleName = request.role() != null ? request.role() : RoleName.CLIENT;
        var role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Rol no encontrado: " + roleName));
        user.addRole(role);

        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Deny access to users whose tenant (taller) is suspended or cancelled.
        // SUPER_ADMIN has no tenant and is never blocked.
        if (user.getTenantId() != null) {
            tenantRepository.findById(user.getTenantId())
                    .filter(t -> t.getStatus().blocksAccess())
                    .ifPresent(t -> {
                        throw new TenantSuspendedException(
                                "Tu taller está suspendido. Contacta a soporte.");
                    });
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserResponse.from(user));
    }
}
