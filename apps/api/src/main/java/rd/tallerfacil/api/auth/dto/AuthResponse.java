package rd.tallerfacil.api.auth.dto;

public record AuthResponse(String token, UserResponse user) {}
