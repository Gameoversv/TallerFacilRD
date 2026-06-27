package rd.tallerfacil.api.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rd.tallerfacil.api.auth.domain.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByTenantId(java.util.UUID tenantId);
    long countByTenantIdIsNotNull();
}
