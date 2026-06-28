package rd.tallerfacil.api.customer.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rd.tallerfacil.api.customer.dto.CreateCustomerRequest;
import rd.tallerfacil.api.customer.dto.CustomerResponse;
import rd.tallerfacil.api.customer.dto.UpdateCustomerRequest;
import rd.tallerfacil.api.customer.service.CustomerService;
import rd.tallerfacil.api.portal.dto.PortalInviteResponse;
import rd.tallerfacil.api.portal.service.PortalAuthService;
import rd.tallerfacil.api.shared.domain.TenantContext;
import rd.tallerfacil.api.shared.web.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService service;
    private final PortalAuthService portalAuthService;

    @GetMapping
    public ApiResponse<Iterable<CustomerResponse>> list(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        var pageable = PageRequest.of(page, size, Sort.by("lastName", "firstName"));
        var result = service.search(q, pageable);
        return ApiResponse.paged(result.getContent(), result.getTotalElements(), page, size);
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomerResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CustomerResponse> create(@Valid @RequestBody CreateCustomerRequest req) {
        return ApiResponse.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse<CustomerResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCustomerRequest req
    ) {
        return ApiResponse.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @PostMapping("/{id}/portal/invite")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PortalInviteResponse> inviteToPortal(@PathVariable UUID id) {
        UUID tenantId = TenantContext.require();
        return ApiResponse.ok(portalAuthService.invite(id, tenantId));
    }
}
