package rd.tallerfacil.api.reports.dto;

import java.math.BigDecimal;

public record SalesTrendEntry(String label, BigDecimal revenue, long invoiceCount) {}
