package rd.tallerfacil.api.invoice.dto;

import rd.tallerfacil.api.invoice.domain.Invoice;
import rd.tallerfacil.api.invoice.domain.InvoiceItem;
import rd.tallerfacil.api.invoice.domain.InvoiceItemType;
import rd.tallerfacil.api.invoice.domain.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        String invoiceNumber,
        UUID workOrderId,
        String vehicleLabel,
        String customerName,
        LocalDate issueDate,
        InvoiceStatus status,
        boolean applyItbis,
        BigDecimal itbisRate,
        BigDecimal subtotal,
        BigDecimal itbisAmount,
        BigDecimal total,
        String notes,
        List<ItemResponse> items,
        Instant createdAt
) {
    public record ItemResponse(
            UUID id,
            InvoiceItemType itemType,
            String description,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {
        public static ItemResponse from(InvoiceItem i) {
            return new ItemResponse(i.getId(), i.getItemType(), i.getDescription(),
                    i.getQuantity(), i.getUnitPrice(), i.getSubtotal());
        }
    }

    public static InvoiceResponse from(Invoice inv) {
        var wo = inv.getWorkOrder();
        var reception = wo.getReception();
        var vehicle = reception != null ? reception.getVehicle() : null;
        var customer = vehicle != null ? vehicle.getCustomer() : null;

        String vehicleLabel = vehicle != null
                ? (vehicle.getLicensePlate() != null ? vehicle.getLicensePlate() + " — " : "")
                  + vehicle.getBrand() + " " + vehicle.getModel() + " " + vehicle.getYear()
                : "—";

        return new InvoiceResponse(
                inv.getId(),
                inv.getInvoiceNumber(),
                wo.getId(),
                vehicleLabel,
                customer != null ? customer.getFirstName() + " " + customer.getLastName() : "—",
                inv.getIssueDate(),
                inv.getStatus(),
                inv.isApplyItbis(),
                inv.getItbisRate(),
                inv.getSubtotal(),
                inv.getItbisAmount(),
                inv.getTotal(),
                inv.getNotes(),
                inv.getItems().stream().map(ItemResponse::from).toList(),
                inv.getCreatedAt()
        );
    }
}
