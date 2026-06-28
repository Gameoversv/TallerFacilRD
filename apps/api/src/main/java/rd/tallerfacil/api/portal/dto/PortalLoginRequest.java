package rd.tallerfacil.api.portal.dto;

public record PortalLoginRequest(
        String tenantSlug,
        String documentId,
        String password
) {}
