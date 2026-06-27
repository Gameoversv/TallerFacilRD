package rd.tallerfacil.api.superadmin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rd.tallerfacil.api.auth.domain.RoleName;
import rd.tallerfacil.api.auth.repository.UserRepository;
import rd.tallerfacil.api.auth.service.JwtService;
import rd.tallerfacil.api.customer.repository.CustomerRepository;
import rd.tallerfacil.api.superadmin.domain.AdminAction;
import rd.tallerfacil.api.superadmin.dto.*;
import rd.tallerfacil.api.superadmin.repository.AdminActionRepository;
import rd.tallerfacil.api.tenant.domain.TenantStatus;
import rd.tallerfacil.api.tenant.repository.TenantRepository;
import rd.tallerfacil.api.vehicle.repository.VehicleRepository;
import rd.tallerfacil.api.workorder.repository.WorkOrderRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkOrderRepository workOrderRepository;
    private final AdminActionRepository auditRepository;
    private final JwtService jwtService;

    // ── Global stats ──────────────────────────────────────────────────────────

    public GlobalStatsResponse globalStats() {
        return new GlobalStatsResponse(
                tenantRepository.count(),
                tenantRepository.countByStatus(TenantStatus.PENDING),
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

    public List<ExpiringTenantResponse> expiringTrials() {
        var now = Instant.now();
        var in7days = now.plus(7, ChronoUnit.DAYS);
        return tenantRepository
                .findByTrialEndsAtBetweenOrderByTrialEndsAtAsc(now, in7days)
                .stream()
                .map(ExpiringTenantResponse::from)
                .toList();
    }

    public List<TenantSummaryResponse> recentTenants() {
        return tenantRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(t -> TenantSummaryResponse.of(t,
                        userRepository.countByTenantId(t.getId()),
                        customerRepository.countByTenantIdAndActiveTrue(t.getId()),
                        vehicleRepository.countByTenantIdAndActiveTrue(t.getId()),
                        workOrderRepository.countByTenantId(t.getId())))
                .toList();
    }

    // ── Tenant list ───────────────────────────────────────────────────────────

    public Page<TenantSummaryResponse> listTenants(TenantStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var tenants = status != null
                ? tenantRepository.findByStatus(status, pageable)
                : tenantRepository.findAll(pageable);
        return tenants.map(t -> TenantSummaryResponse.of(t,
                userRepository.countByTenantId(t.getId()),
                customerRepository.countByTenantIdAndActiveTrue(t.getId()),
                vehicleRepository.countByTenantIdAndActiveTrue(t.getId()),
                workOrderRepository.countByTenantId(t.getId())));
    }

    // ── Tenant detail ─────────────────────────────────────────────────────────

    public TenantDetailResponse getTenantDetail(UUID id) {
        var tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
        var owners = userRepository.findByTenantId(id).stream()
                .filter(u -> u.getRoles().stream().anyMatch(r ->
                        r.getName() == RoleName.OWNER || r.getName() == RoleName.MANAGER))
                .map(UserSummaryResponse::from)
                .toList();
        return TenantDetailResponse.of(tenant,
                userRepository.countByTenantId(id),
                customerRepository.countByTenantIdAndActiveTrue(id),
                vehicleRepository.countByTenantIdAndActiveTrue(id),
                workOrderRepository.countByTenantId(id),
                owners);
    }

    // ── Tenant actions ────────────────────────────────────────────────────────

    @Transactional
    public TenantSummaryResponse approveTenant(UUID id, String actor) {
        var tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
        if (tenant.getStatus() != TenantStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Taller no está pendiente");
        }
        tenant.setStatus(TenantStatus.TRIAL);
        tenantRepository.save(tenant);
        audit(actor, "APPROVE", id, "Aprobado → TRIAL");
        return summary(tenant);
    }

    @Transactional
    public TenantSummaryResponse updateStatus(UUID id, UpdateTenantStatusRequest req, String actor) {
        var tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
        var prev = tenant.getStatus();
        tenant.setStatus(req.status());
        tenantRepository.save(tenant);
        audit(actor, "STATUS_CHANGE", id, prev + " → " + req.status());
        return summary(tenant);
    }

    @Transactional
    public TenantSummaryResponse updatePlan(UUID id, UpdateTenantPlanRequest req, String actor) {
        var tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
        var prev = tenant.getPlan();
        tenant.setPlan(req.plan());
        tenantRepository.save(tenant);
        audit(actor, "PLAN_CHANGE", id, prev + " → " + req.plan());
        return summary(tenant);
    }

    @Transactional
    public TenantSummaryResponse extendTrial(UUID id, int days, String actor) {
        var tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
        var newEnd = (tenant.getTrialEndsAt() != null ? tenant.getTrialEndsAt() : Instant.now())
                .plus(days, ChronoUnit.DAYS);
        tenant.setTrialEndsAt(newEnd);
        tenantRepository.save(tenant);
        audit(actor, "EXTEND_TRIAL", id, "+" + days + " días → " + newEnd);
        return summary(tenant);
    }

    // ── Impersonation ─────────────────────────────────────────────────────────

    @Transactional
    public ImpersonateResponse impersonate(UUID tenantId, String superAdminEmail) {
        var tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado"));
        var superAdmin = userRepository.findByEmail(superAdminEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
        audit(superAdminEmail, "IMPERSONATE", tenantId, "Sesión iniciada como " + tenant.getName());
        return new ImpersonateResponse(
                jwtService.generateImpersonationToken(superAdmin, tenant.getId(), tenant.getName()),
                tenant.getName()
        );
    }

    // ── User search ───────────────────────────────────────────────────────────

    public Page<UserSummaryResponse> searchUsers(String email, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "email"));
        return userRepository
                .findByEmailContainingIgnoreCaseAndTenantIdIsNotNull(email, pageable)
                .map(UserSummaryResponse::from);
    }

    // ── Audit log ─────────────────────────────────────────────────────────────

    public Page<AdminActionResponse> auditLog(UUID tenantId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var results = tenantId != null
                ? auditRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                : auditRepository.findAllByOrderByCreatedAtDesc(pageable);
        return results.map(AdminActionResponse::from);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void audit(String actor, String action, UUID tenantId, String detail) {
        auditRepository.save(new AdminAction(actor, action, tenantId, detail));
    }

    private TenantSummaryResponse summary(rd.tallerfacil.api.tenant.domain.Tenant t) {
        return TenantSummaryResponse.of(t,
                userRepository.countByTenantId(t.getId()),
                customerRepository.countByTenantIdAndActiveTrue(t.getId()),
                vehicleRepository.countByTenantIdAndActiveTrue(t.getId()),
                workOrderRepository.countByTenantId(t.getId()));
    }
}
