package rd.tallerfacil.api.payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rd.tallerfacil.api.invoice.domain.Invoice;
import rd.tallerfacil.api.invoice.domain.InvoiceStatus;
import rd.tallerfacil.api.invoice.repository.InvoiceRepository;
import rd.tallerfacil.api.payment.domain.Payment;
import rd.tallerfacil.api.payment.domain.PaymentMethod;
import rd.tallerfacil.api.payment.dto.CreatePaymentRequest;
import rd.tallerfacil.api.payment.dto.PaymentResponse;
import rd.tallerfacil.api.payment.repository.PaymentRepository;
import rd.tallerfacil.api.shared.domain.TenantContext;
import rd.tallerfacil.api.shared.web.ApiResponse;
import rd.tallerfacil.api.shared.web.ResourceNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<PaymentResponse>> listByInvoice(UUID invoiceId) {
        UUID tenantId = TenantContext.require();
        invoiceRepository.findByIdWithDetails(invoiceId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada: " + invoiceId));
        var payments = paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId)
                .stream().map(PaymentResponse::from).toList();
        return ApiResponse.ok(payments);
    }

    @Transactional
    public ApiResponse<PaymentResponse> create(CreatePaymentRequest req) {
        UUID tenantId = TenantContext.require();
        Invoice invoice = invoiceRepository.findByIdWithDetails(req.invoiceId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada: " + req.invoiceId()));

        if (invoice.getStatus() == InvoiceStatus.ANULADA) {
            throw new IllegalStateException("No se puede registrar pago en factura anulada");
        }
        if (invoice.getStatus() == InvoiceStatus.PAGADA) {
            throw new IllegalStateException("La factura ya está completamente pagada");
        }
        if (req.amount() == null || req.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        BigDecimal currentPaid = paymentRepository.sumAmountByInvoiceId(req.invoiceId());
        BigDecimal remaining = invoice.getTotal().subtract(currentPaid);

        if (req.amount().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    "El monto excede el saldo pendiente (" + remaining + ")");
        }

        var payment = new Payment();
        payment.setTenantId(tenantId);
        payment.setInvoice(invoice);
        payment.setAmount(req.amount());
        payment.setPaymentDate(req.paymentDate() != null ? req.paymentDate() : LocalDate.now());
        payment.setNotes(req.notes());

        if (req.paymentMethod() != null) {
            payment.setPaymentMethod(PaymentMethod.valueOf(req.paymentMethod()));
        }

        Payment saved = paymentRepository.saveAndFlush(payment);

        BigDecimal newPaid = currentPaid.add(req.amount());
        if (newPaid.compareTo(invoice.getTotal()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAGADA);
            invoiceRepository.save(invoice);
        }

        Payment reloaded = paymentRepository.findById(saved.getId()).orElse(saved);
        return ApiResponse.ok(PaymentResponse.from(reloaded));
    }

    @Transactional(readOnly = true)
    public BigDecimal getPaidAmount(UUID invoiceId) {
        return paymentRepository.sumAmountByInvoiceId(invoiceId);
    }
}
