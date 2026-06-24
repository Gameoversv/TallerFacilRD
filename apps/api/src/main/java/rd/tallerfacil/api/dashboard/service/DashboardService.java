package rd.tallerfacil.api.dashboard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rd.tallerfacil.api.customer.repository.CustomerRepository;
import rd.tallerfacil.api.dashboard.dto.ActivityEvent;
import rd.tallerfacil.api.dashboard.dto.AlertItem;
import rd.tallerfacil.api.dashboard.dto.DashboardSummaryResponse;
import rd.tallerfacil.api.reception.repository.ReceptionRepository;
import rd.tallerfacil.api.vehicle.repository.VehicleRepository;
import rd.tallerfacil.api.workorder.domain.WorkOrderStatus;
import rd.tallerfacil.api.workorder.repository.WorkOrderRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkOrderRepository workOrderRepository;
    private final ReceptionRepository receptionRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary() {
        var openStatuses = List.of(WorkOrderStatus.PENDIENTE, WorkOrderStatus.EN_PROGRESO);
        var todayStart = Instant.now().truncatedTo(ChronoUnit.DAYS);

        return new DashboardSummaryResponse(
                workOrderRepository.countByStatusIn(List.of(WorkOrderStatus.EN_PROGRESO)),
                workOrderRepository.countByStatusIn(List.of(WorkOrderStatus.COMPLETADA)),
                workOrderRepository.countByStatusIn(openStatuses),
                workOrderRepository.countByStatusAndCompletedAtAfter(WorkOrderStatus.COMPLETADA, todayStart),
                customerRepository.countByActiveTrue(),
                vehicleRepository.countByActiveTrue()
        );
    }

    @Transactional(readOnly = true)
    public List<ActivityEvent> activity() {
        var pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        return receptionRepository.findAllActive(pageable)
                .getContent()
                .stream()
                .map(r -> new ActivityEvent(
                        "RECEPTION",
                        r.getVehicle().getCustomer().getFirstName() + " " +
                        r.getVehicle().getCustomer().getLastName() +
                        " — " + r.getVehicle().getBrand() + " " + r.getVehicle().getModel(),
                        r.getId(),
                        r.getCreatedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlertItem> alerts() {
        var openStatuses = List.of(WorkOrderStatus.PENDIENTE, WorkOrderStatus.EN_PROGRESO);
        var sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        return workOrderRepository.findOverdue(openStatuses, sevenDaysAgo)
                .stream()
                .map(wo -> {
                    long days = ChronoUnit.DAYS.between(wo.getCreatedAt(), Instant.now());
                    var vehicle = wo.getReception().getVehicle();
                    return new AlertItem(
                            "OVERDUE_ORDER",
                            vehicle.getBrand() + " " + vehicle.getModel() +
                            " (" + vehicle.getCustomer().getFirstName() + " " +
                            vehicle.getCustomer().getLastName() + ") — " +
                            days + " días sin cerrar",
                            wo.getId(),
                            days
                    );
                })
                .toList();
    }
}
