package rd.tallerfacil.api.superadmin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rd.tallerfacil.api.auth.repository.UserRepository;
import rd.tallerfacil.api.customer.repository.CustomerRepository;
import rd.tallerfacil.api.superadmin.dto.GlobalStatsResponse;
import rd.tallerfacil.api.superadmin.dto.TenantSummaryResponse;
import rd.tallerfacil.api.superadmin.dto.UpdateTenantPlanRequest;
import rd.tallerfacil.api.superadmin.dto.UpdateTenantStatusRequest;
import rd.tallerfacil.api.tenant.domain.TenantStatus;
import rd.tallerfacil.api.tenant.repository.TenantRepository;
import rd.tallerfacil.api.vehicle.repository.VehicleRepository;
import rd.tallerfacil.api.workorder.repository.WorkOrderRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkOrderRepository workOrderRepository;

    public GlobalStatsResponse globalStats() {
        return new GlobalStatsResponse(
                tenantRepository.count(),
                tenantRepository.countByStatus(TenantStatus.TRIAL),
                tenantRepository.countByStatus(TenantStatus.ACTIVE),
                tenantRepository.countByStatus(TenantStatus.SUSPENDED),
                tenantRepository.countByStatus(TenantStatus.CANCELLED),
                userRepository.countByTenantIdIsNotNull(),
                customerRepository.count(),
                vehicleRepository.count(),
                workOrderRepository.count()
        );
    }

    public Page<TenantSummaryResponse> listTenants(String q, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return tenantRepository.search(q == null || q.isBlank() ? null : q, pageable)
                .map(t -> TenantSummaryResponse.of(
                        t,
                        userRepository.countByTenantId(t.getId()),
                        customerRepository.countByTenantIdAndActiveTrue(t.getId()),
                        vehicleRepository.countByTenantIdAndActiveTrue(t.getId()),
                        workOrderRepository.countByTenantId(t.getId())
                ));
    }

    @Transactional
    public TenantSummaryResponse updateStatus(UUID id, UpdateTenantStatusRequest req) {
        var tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
        tenant.setStatus(req.status());
        tenantRepository.save(tenant);
        return TenantSummaryResponse.of(tenant,
                userRepository.countByTenantId(id),
                customerRepository.countByTenantIdAndActiveTrue(id),
                vehicleRepository.countByTenantIdAndActiveTrue(id),
                workOrderRepository.countByTenantId(id));
    }

    @Transactional
    public TenantSummaryResponse updatePlan(UUID id, UpdateTenantPlanRequest req) {
        var tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
        tenant.setPlan(req.plan());
        tenantRepository.save(tenant);
        return TenantSummaryResponse.of(tenant,
                userRepository.countByTenantId(id),
                customerRepository.countByTenantIdAndActiveTrue(id),
                vehicleRepository.countByTenantIdAndActiveTrue(id),
                workOrderRepository.countByTenantId(id));
    }
}
