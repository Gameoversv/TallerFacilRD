package rd.tallerfacil.api.workorder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rd.tallerfacil.api.reception.repository.ReceptionRepository;
import rd.tallerfacil.api.shared.web.ApiResponse;
import rd.tallerfacil.api.workorder.domain.WorkOrder;
import rd.tallerfacil.api.workorder.domain.WorkOrderItem;
import rd.tallerfacil.api.workorder.domain.WorkOrderStatus;
import rd.tallerfacil.api.workorder.dto.AddWorkOrderItemRequest;
import rd.tallerfacil.api.workorder.dto.CreateWorkOrderRequest;
import rd.tallerfacil.api.workorder.dto.UpdateWorkOrderStatusRequest;
import rd.tallerfacil.api.workorder.dto.WorkOrderResponse;
import rd.tallerfacil.api.workorder.repository.WorkOrderRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final ReceptionRepository receptionRepository;

    @Transactional
    public WorkOrderResponse create(CreateWorkOrderRequest req) {
        var reception = receptionRepository.findByIdWithVehicle(req.receptionId())
                .orElseThrow(() -> new IllegalArgumentException("Recepción no encontrada: " + req.receptionId()));

        if (workOrderRepository.existsByReceptionId(req.receptionId())) {
            throw new IllegalStateException("La recepción ya tiene una orden de trabajo asignada");
        }

        var wo = new WorkOrder();
        wo.setReception(reception);
        wo.setDiagnosis(req.diagnosis());
        wo.setAssignedTo(req.assignedTo());
        wo.setEstimatedCost(req.estimatedCost());

        return WorkOrderResponse.from(workOrderRepository.save(wo));
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse findById(UUID id) {
        return workOrderRepository.findByIdWithDetails(id)
                .map(WorkOrderResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Orden de trabajo no encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse findByReception(UUID receptionId) {
        return workOrderRepository.findByReceptionId(receptionId)
                .map(WorkOrderResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("No existe orden para la recepción: " + receptionId));
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<WorkOrderResponse>> findAll(WorkOrderStatus status, int page, int size) {
        Page<WorkOrder> result = workOrderRepository.findAllWithDetails(
                status,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        List<WorkOrderResponse> data = result.getContent().stream()
                .map(WorkOrderResponse::from)
                .toList();
        return ApiResponse.paged(data, result.getTotalElements(), page, size);
    }

    @Transactional
    public WorkOrderResponse addItem(UUID id, AddWorkOrderItemRequest req) {
        var wo = workOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden de trabajo no encontrada: " + id));

        if (wo.getStatus() == WorkOrderStatus.COMPLETADA || wo.getStatus() == WorkOrderStatus.CANCELADA) {
            throw new IllegalStateException("No se pueden agregar ítems a una orden " + wo.getStatus());
        }

        var item = new WorkOrderItem();
        item.setWorkOrder(wo);
        item.setDescription(req.description());
        item.setType(req.type());
        item.setQuantity(req.quantity());
        item.setUnitPrice(req.unitPrice());
        item.setTotal(req.quantity().multiply(req.unitPrice()));

        wo.getItems().add(item);
        return WorkOrderResponse.from(workOrderRepository.save(wo));
    }

    @Transactional
    public WorkOrderResponse removeItem(UUID orderId, UUID itemId) {
        var wo = workOrderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden de trabajo no encontrada: " + orderId));

        if (wo.getStatus() == WorkOrderStatus.COMPLETADA || wo.getStatus() == WorkOrderStatus.CANCELADA) {
            throw new IllegalStateException("No se pueden eliminar ítems de una orden " + wo.getStatus());
        }

        boolean removed = wo.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new IllegalArgumentException("Ítem no encontrado: " + itemId);
        }

        return WorkOrderResponse.from(workOrderRepository.save(wo));
    }

    @Transactional
    public WorkOrderResponse updateStatus(UUID id, UpdateWorkOrderStatusRequest req) {
        var wo = workOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden de trabajo no encontrada: " + id));

        wo.transitionTo(req.status());
        return WorkOrderResponse.from(workOrderRepository.save(wo));
    }
}
