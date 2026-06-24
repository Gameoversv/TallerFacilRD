package rd.tallerfacil.api.auth.dto;

import rd.tallerfacil.api.auth.domain.RoleName;
import rd.tallerfacil.api.auth.domain.User;

import java.util.UUID;

public record UserResponse(UUID id, String name, String email, RoleName role, boolean active) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPrimaryRole(),
                user.isActive()
        );
    }
}
