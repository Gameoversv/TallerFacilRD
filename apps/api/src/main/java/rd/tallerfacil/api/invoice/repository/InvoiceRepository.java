package rd.tallerfacil.api.invoice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rd.tallerfacil.api.invoice.domain.Invoice;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Query("SELECT i FROM Invoice i JOIN FETCH i.workOrder wo JOIN FETCH wo.reception r JOIN FETCH r.vehicle v JOIN FETCH v.customer ORDER BY i.issueDate DESC")
    Page<Invoice> findAllWithDetails(Pageable pageable);

    @Query("SELECT i FROM Invoice i JOIN FETCH i.workOrder wo JOIN FETCH wo.reception r JOIN FETCH r.vehicle v JOIN FETCH v.customer LEFT JOIN FETCH i.items WHERE i.id = :id")
    Optional<Invoice> findByIdWithDetails(UUID id);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(i.invoiceNumber, 10) AS int)), 0) FROM Invoice i WHERE i.invoiceNumber LIKE CONCAT('FAC-', :year, '-%')")
    int findMaxSeqForYear(int year);

    @Query("SELECT i FROM Invoice i JOIN i.workOrder wo JOIN wo.reception r JOIN r.vehicle v WHERE v.id = :vehicleId ORDER BY i.issueDate DESC")
    List<Invoice> findByVehicleId(@Param("vehicleId") UUID vehicleId);
}
