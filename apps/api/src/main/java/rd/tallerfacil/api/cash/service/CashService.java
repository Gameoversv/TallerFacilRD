package rd.tallerfacil.api.cash.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rd.tallerfacil.api.cash.domain.CashTransaction;
import rd.tallerfacil.api.cash.domain.TransactionType;
import rd.tallerfacil.api.cash.dto.CashBalanceResponse;
import rd.tallerfacil.api.cash.dto.CashTransactionResponse;
import rd.tallerfacil.api.cash.dto.CreateCashTransactionRequest;
import rd.tallerfacil.api.cash.repository.CashRepository;
import rd.tallerfacil.api.shared.web.ApiResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CashService {

    private final CashRepository cashRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<CashTransactionResponse>> list(LocalDate from, LocalDate to, int page, int size) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();

        var result = cashRepository.findByTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                dateFrom, dateTo, PageRequest.of(page, size));

        var data = result.getContent().stream().map(CashTransactionResponse::from).toList();
        return ApiResponse.paged(data, result.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public ApiResponse<CashBalanceResponse> balance(LocalDate from, LocalDate to) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();

        BigDecimal ingresos = cashRepository.sumByTypeAndDateRange(TransactionType.INGRESO, dateFrom, dateTo);
        BigDecimal egresos = cashRepository.sumByTypeAndDateRange(TransactionType.EGRESO, dateFrom, dateTo);

        return ApiResponse.ok(new CashBalanceResponse(
                dateFrom, dateTo, ingresos, egresos, ingresos.subtract(egresos)));
    }

    @Transactional
    public ApiResponse<CashTransactionResponse> create(CreateCashTransactionRequest req) {
        if (req.amount() == null || req.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }
        if (req.description() == null || req.description().isBlank()) {
            throw new IllegalArgumentException("La descripción es requerida");
        }

        var tx = new CashTransaction();
        tx.setType(TransactionType.valueOf(req.type()));
        tx.setAmount(req.amount());
        tx.setDescription(req.description().trim());
        tx.setCategory(req.category());
        tx.setTransactionDate(req.transactionDate() != null ? req.transactionDate() : LocalDate.now());

        CashTransaction saved = cashRepository.saveAndFlush(tx);
        CashTransaction reloaded = cashRepository.findById(saved.getId()).orElse(saved);
        return ApiResponse.ok(CashTransactionResponse.from(reloaded));
    }
}
