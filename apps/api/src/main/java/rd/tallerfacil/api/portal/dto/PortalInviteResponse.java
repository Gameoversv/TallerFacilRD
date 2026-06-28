package rd.tallerfacil.api.portal.dto;

public record PortalInviteResponse(
        String documentId,
        String temporaryPassword,
        String portalUrl
) {}
