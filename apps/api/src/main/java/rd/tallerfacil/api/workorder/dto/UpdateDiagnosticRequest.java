package rd.tallerfacil.api.workorder.dto;

import jakarta.validation.constraints.NotNull;
import rd.tallerfacil.api.workorder.domain.WorkOrderPriority;

public record UpdateDiagnosticRequest(
        String diagnosis,
        @NotNull WorkOrderPriority priority
) {}
