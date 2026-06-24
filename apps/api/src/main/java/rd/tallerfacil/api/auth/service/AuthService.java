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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

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
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserResponse.from(user));
    }
}
