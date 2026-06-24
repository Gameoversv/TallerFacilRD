package rd.tallerfacil.api.purchase.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rd.tallerfacil.api.purchase.domain.Purchase;

import java.util.Optional;
import java.util.UUID;

public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {

    @Query("SELECT p FROM Purchase p JOIN FETCH p.supplier ORDER BY p.purchaseDate DESC")
    Page<Purchase> findAllWithSupplier(Pageable pageable);

    @Query("SELECT p FROM Purchase p JOIN FETCH p.supplier LEFT JOIN FETCH p.items i LEFT JOIN FETCH i.product WHERE p.id = :id")
    Optional<Purchase> findByIdWithDetails(UUID id);
}
