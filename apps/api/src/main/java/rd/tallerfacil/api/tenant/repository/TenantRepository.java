package rd.tallerfacil.api.tenant.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rd.tallerfacil.api.tenant.domain.Tenant;
import rd.tallerfacil.api.tenant.domain.TenantStatus;

import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    boolean existsBySlug(String slug);

    Optional<Tenant> findBySlug(String slug);

    long countByStatus(TenantStatus status);

    @Query("SELECT t FROM Tenant t WHERE :q IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Tenant> search(@Param("q") String q, Pageable pageable);
}
