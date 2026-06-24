package rd.tallerfacil.api.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record ActivityEvent(
        String type,
        String description,
        UUID entityId,
        Instant occurredAt
) {}
