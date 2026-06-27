package rd.tallerfacil.api.shared;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rd.tallerfacil.api.auth.domain.RoleName;
import rd.tallerfacil.api.auth.domain.User;
import rd.tallerfacil.api.auth.repository.RoleRepository;
import rd.tallerfacil.api.auth.repository.UserRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email:admin@taller.rd}")
    private String adminEmail;

    @Value("${app.seed.admin-password:admin123}")
    private String adminPassword;

    @Value("${app.seed.admin-name:Administrador}")
    private String adminName;

    @Value("${app.seed.super-admin-email:superadmin@tallerfacil.rd}")
    private String superAdminEmail;

    @Value("${app.seed.super-admin-password:superadmin123}")
    private String superAdminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var ownerRole = roleRepository.findByName(RoleName.OWNER)
                .orElseThrow(() -> new IllegalStateException("Rol OWNER no encontrado — verificar migración V2"));

        if (!userRepository.existsByEmail(adminEmail)) {
            var admin = new User(adminName, adminEmail, passwordEncoder.encode(adminPassword));
            admin.addRole(ownerRole);
            userRepository.save(admin);
            log.info("Admin creado: {} / {}", adminEmail, adminPassword);
        }

        if (!userRepository.existsByEmail(superAdminEmail)) {
            var superAdminRole = roleRepository.findByName(RoleName.SUPER_ADMIN)
                    .orElseThrow(() -> new IllegalStateException("Rol SUPER_ADMIN no encontrado"));
            var superAdmin = new User("Super Admin", superAdminEmail, passwordEncoder.encode(superAdminPassword));
            superAdmin.addRole(superAdminRole);
            userRepository.save(superAdmin);
            log.info("Super Admin creado: {} / {}", superAdminEmail, superAdminPassword);
        }
    }
}
