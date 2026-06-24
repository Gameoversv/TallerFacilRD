package rd.tallerfacil.api.workorder.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rd.tallerfacil.api.shared.web.ApiResponse;
import rd.tallerfacil.api.workorder.domain.WorkOrderStatus;
import rd.tallerfacil.api.workorder.dto.AddWorkOrderItemRequest;
import rd.tallerfacil.api.workorder.dto.CreateWorkOrderRequest;
import rd.tallerfacil.api.workorder.dto.UpdateWorkOrderStatusRequest;
import rd.tallerfacil.api.workorder.dto.WorkOrderResponse;
import rd.tallerfacil.api.workorder.service.WorkOrderService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WorkOrderResponse> create(@Valid @RequestBody CreateWorkOrderRequest req) {
        return ApiResponse.ok(service.create(req));
    }

    @GetMapping
    public ApiResponse<List<WorkOrderResponse>> findAll(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.findAll(status, page, size);
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkOrderResponse> findById(@PathVariable UUID id) {
        return ApiResponse.ok(service.findById(id));
    }

    @GetMapping("/by-reception/{receptionId}")
    public ApiResponse<WorkOrderResponse> findByReception(@PathVariable UUID receptionId) {
        return ApiResponse.ok(service.findByReception(receptionId));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<WorkOrderResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateWorkOrderStatusRequest req
    ) {
        return ApiResponse.ok(service.updateStatus(id, req));
    }

    @PostMapping("/{id}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WorkOrderResponse> addItem(
            @PathVariable UUID id,
            @Valid @RequestBody AddWorkOrderItemRequest req
    ) {
        return ApiResponse.ok(service.addItem(id, req));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ApiResponse<WorkOrderResponse> removeItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId
    ) {
        return ApiResponse.ok(service.removeItem(id, itemId));
    }
}
