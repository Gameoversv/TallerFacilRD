package rd.tallerfacil.api.tenant.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import rd.tallerfacil.api.tenant.domain.Tenant;
import rd.tallerfacil.api.tenant.domain.TenantStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    boolean existsBySlug(String slug);

    Optional<Tenant> findBySlug(String slug);

    long countByStatus(TenantStatus status);

    Page<Tenant> findAll(Pageable pageable);

    Page<Tenant> findByStatus(TenantStatus status, Pageable pageable);

    List<Tenant> findByTrialEndsAtBetweenOrderByTrialEndsAtAsc(Instant from, Instant to);

    List<Tenant> findTop5ByOrderByCreatedAtDesc();
}
