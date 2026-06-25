package rd.tallerfacil.api.cash.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateCashTransactionRequest(
        String type,
        BigDecimal amount,
        String description,
        String category,
        LocalDate transactionDate
) {}
