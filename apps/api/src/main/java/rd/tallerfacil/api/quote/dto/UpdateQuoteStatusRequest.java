package rd.tallerfacil.api.quote.dto;

import jakarta.validation.constraints.NotNull;
import rd.tallerfacil.api.quote.domain.QuoteStatus;

public record UpdateQuoteStatusRequest(@NotNull QuoteStatus status) {}
