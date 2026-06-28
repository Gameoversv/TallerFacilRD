package rd.tallerfacil.api.portal.dto;

import java.util.UUID;

public record PortalAuthResponse(
        String token,
        String customerName,
        String tenantName,
        UUID customerId
) {}
