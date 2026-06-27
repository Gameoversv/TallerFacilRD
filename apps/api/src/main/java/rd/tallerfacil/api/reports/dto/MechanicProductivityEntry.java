package rd.tallerfacil.api.reports.dto;

import java.math.BigDecimal;

public record MechanicProductivityEntry(
        String mechanicName,
        long completedOts,
        long cancelledOts,
        BigDecimal totalRevenue,
        Double avgCompletionHours
) {}
