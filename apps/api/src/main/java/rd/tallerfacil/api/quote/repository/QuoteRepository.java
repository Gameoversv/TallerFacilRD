package rd.tallerfacil.api.quote.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rd.tallerfacil.api.quote.domain.Quote;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuoteRepository extends JpaRepository<Quote, UUID> {

    @Query("SELECT q FROM Quote q LEFT JOIN FETCH q.items WHERE q.workOrder.id = :workOrderId ORDER BY q.createdAt DESC")
    List<Quote> findByWorkOrderId(UUID workOrderId);

    @Query("SELECT q FROM Quote q LEFT JOIN FETCH q.items WHERE q.id = :id")
    Optional<Quote> findByIdWithItems(UUID id);
}
