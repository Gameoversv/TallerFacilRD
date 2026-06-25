package rd.tallerfacil.api.invoice.dto;

import jakarta.validation.constraints.NotNull;
import rd.tallerfacil.api.invoice.domain.InvoiceStatus;

public record UpdateInvoiceStatusRequest(@NotNull InvoiceStatus status) {}
