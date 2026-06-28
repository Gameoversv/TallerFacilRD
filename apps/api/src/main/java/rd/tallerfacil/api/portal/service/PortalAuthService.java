package rd.tallerfacil.api.portal.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rd.tallerfacil.api.auth.domain.RoleName;
import rd.tallerfacil.api.auth.domain.User;
import rd.tallerfacil.api.auth.repository.RoleRepository;
import rd.tallerfacil.api.auth.repository.UserRepository;
import rd.tallerfacil.api.auth.service.JwtService;
import rd.tallerfacil.api.customer.domain.Customer;
import rd.tallerfacil.api.customer.repository.CustomerRepository;
import rd.tallerfacil.api.portal.dto.PortalAuthResponse;
import rd.tallerfacil.api.portal.dto.PortalInviteResponse;
import rd.tallerfacil.api.portal.dto.PortalLoginRequest;
import rd.tallerfacil.api.shared.web.ResourceNotFoundException;
import rd.tallerfacil.api.tenant.domain.Tenant;
import rd.tallerfacil.api.tenant.repository.TenantRepository;

import java.security.SecureRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortalAuthService {

    private final TenantRepository tenantRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

    public PortalAuthResponse login(PortalLoginRequest request) {
        Tenant tenant = tenantRepository.findBySlug(request.tenantSlug())
                .orElseThrow(() -> new IllegalArgumentException("Taller no encontrado: " + request.tenantSlug()));

        Customer customer = customerRepository.findByDocumentIdAndTenantIdAndActiveTrue(
                        request.documentId(), tenant.getId())
                .orElseThrow(() -> new IllegalArgumentException("Cédula no registrada en este taller"));

        User portalUser = userRepository.findByCustomerIdAndTenantId(customer.getId(), tenant.getId())
                .orElseThrow(() -> new IllegalArgumentException("Portal no habilitado para este cliente. Contacte al taller."));

        if (!portalUser.isEnabled()) {
            throw new IllegalArgumentException("Usuario de portal desactivado");
        }

        if (!passwordEncoder.matches(request.password(), portalUser.getPassword())) {
            throw new IllegalArgumentException("Contraseña incorrecta");
        }

        String token = jwtService.generatePortalToken(portalUser, customer.getId());
        String customerName = customer.getFirstName() + " " + customer.getLastName();
        return new PortalAuthResponse(token, customerName, tenant.getName(), customer.getId());
    }

    @Transactional
    public PortalInviteResponse invite(UUID customerId, UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));

        Customer customer = customerRepository.findByIdAndTenantIdAndActiveTrue(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        if (customer.getDocumentId() == null || customer.getDocumentId().isBlank()) {
            throw new IllegalStateException("El cliente debe tener cédula registrada para acceder al portal");
        }

        if (userRepository.existsByCustomerId(customerId)) {
            throw new IllegalStateException("El portal ya está habilitado para este cliente");
        }

        String password = generatePassword(10);
        String email = "portal_" + customerId + "@tallerfacil.internal";

        var clientRole = roleRepository.findByName(RoleName.CLIENT)
                .orElseThrow(() -> new IllegalStateException("Rol CLIENT no encontrado"));

        var user = new User(
                customer.getFirstName() + " " + customer.getLastName(),
                email,
                passwordEncoder.encode(password)
        );
        user.setTenantId(tenantId);
        user.setCustomerId(customerId);
        user.addRole(clientRole);
        userRepository.save(user);

        String portalUrl = "/portal/" + tenant.getSlug() + "/login";
        return new PortalInviteResponse(customer.getDocumentId(), password, portalUrl);
    }

    private String generatePassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
