package rd.tallerfacil.api.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rd.tallerfacil.api.auth.domain.Role;
import rd.tallerfacil.api.auth.domain.RoleName;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(RoleName name);
}
