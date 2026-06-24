package rd.tallerfacil.api.auth.web;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rd.tallerfacil.api.auth.domain.User;
import rd.tallerfacil.api.auth.dto.UserResponse;
import rd.tallerfacil.api.auth.repository.UserRepository;
import rd.tallerfacil.api.shared.web.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal User user) {
        return ApiResponse.ok(UserResponse.from(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ApiResponse<List<UserResponse>> list() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
        return ApiResponse.ok(users);
    }
}
