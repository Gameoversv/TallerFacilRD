package rd.tallerfacil.api.tenant.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rd.tallerfacil.api.tenant.domain.Tenant;

import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    boolean existsBySlug(String slug);

    Optional<Tenant> findBySlug(String slug);
}
