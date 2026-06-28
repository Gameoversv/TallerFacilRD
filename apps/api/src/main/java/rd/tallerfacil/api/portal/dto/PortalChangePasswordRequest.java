package rd.tallerfacil.api.portal.dto;

public record PortalChangePasswordRequest(
        String currentPassword,
        String newPassword
) {}
