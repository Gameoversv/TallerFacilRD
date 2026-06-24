package rd.tallerfacil.api.workorder.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rd.tallerfacil.api.workorder.domain.WorkOrder;
import rd.tallerfacil.api.workorder.domain.WorkOrderStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, UUID> {

    @Query("""
            SELECT wo FROM WorkOrder wo
            JOIN FETCH wo.reception r
            JOIN FETCH r.vehicle v
            JOIN FETCH v.customer
            LEFT JOIN FETCH wo.items
            WHERE wo.id = :id
            """)
    Optional<WorkOrder> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
            SELECT wo FROM WorkOrder wo
            JOIN FETCH wo.reception r
            JOIN FETCH r.vehicle v
            JOIN FETCH v.customer
            WHERE r.id = :receptionId
            """)
    Optional<WorkOrder> findByReceptionId(@Param("receptionId") UUID receptionId);

    boolean existsByReceptionId(UUID receptionId);

    long countByStatusIn(List<WorkOrderStatus> statuses);

    long countByStatusAndCompletedAtAfter(WorkOrderStatus status, Instant after);

    @Query("""
            SELECT wo FROM WorkOrder wo
            JOIN FETCH wo.reception r
            JOIN FETCH r.vehicle v
            JOIN FETCH v.customer
            WHERE wo.status IN :statuses AND wo.createdAt < :before
            ORDER BY wo.createdAt ASC
            """)
    List<WorkOrder> findOverdue(@Param("statuses") List<WorkOrderStatus> statuses,
                                @Param("before") Instant before);

    @Query("""
            SELECT wo FROM WorkOrder wo
            JOIN FETCH wo.reception r
            JOIN FETCH r.vehicle v
            JOIN FETCH v.customer
            WHERE (:status IS NULL OR wo.status = :status)
            """)
    Page<WorkOrder> findAllWithDetails(@Param("status") WorkOrderStatus status, Pageable pageable);
}
