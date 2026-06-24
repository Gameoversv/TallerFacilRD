package rd.tallerfacil.api.workorder.dto;

import jakarta.validation.constraints.NotNull;
import rd.tallerfacil.api.workorder.domain.WorkOrderStatus;

public record UpdateWorkOrderStatusRequest(
        @NotNull WorkOrderStatus status
) {}
