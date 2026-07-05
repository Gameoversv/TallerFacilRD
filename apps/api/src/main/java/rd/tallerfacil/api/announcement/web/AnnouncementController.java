package rd.tallerfacil.api.announcement.web;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rd.tallerfacil.api.announcement.dto.AnnouncementResponse;
import rd.tallerfacil.api.announcement.service.AnnouncementService;
import rd.tallerfacil.api.shared.web.ApiResponse;

/**
 * Read-only endpoint any authenticated taller user hits to fetch the active
 * global banner (null when none is active).
 */
@RestController
@RequestMapping("/api/announcement")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService service;

    @GetMapping
    public ApiResponse<AnnouncementResponse> active() {
        return ApiResponse.ok(service.getActive());
    }
}
