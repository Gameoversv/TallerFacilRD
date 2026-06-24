package rd.tallerfacil.api.reception.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rd.tallerfacil.api.reception.domain.Reception;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReceptionRepository extends JpaRepository<Reception, UUID> {

    @Query("SELECT r FROM Reception r JOIN FETCH r.vehicle v JOIN FETCH v.customer WHERE r.id = :id AND r.active = true")
    Optional<Reception> findByIdWithVehicle(@Param("id") UUID id);

    @Query("SELECT r FROM Reception r JOIN FETCH r.vehicle v WHERE v.id = :vehicleId AND r.active = true ORDER BY r.createdAt DESC")
    List<Reception> findByVehicleId(@Param("vehicleId") UUID vehicleId);
}
