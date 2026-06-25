package rd.tallerfacil.api.payment.dto;

import rd.tallerfacil.api.payment.domain.Payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID invoiceId,
        BigDecimal amount,
        LocalDate paymentDate,
        String paymentMethod,
        String notes,
        String createdAt
) {
    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getInvoice().getId(),
                p.getAmount(),
                p.getPaymentDate(),
                p.getPaymentMethod().name(),
                p.getNotes(),
                p.getCreatedAt().toString()
        );
    }
}
