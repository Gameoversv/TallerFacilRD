package rd.tallerfacil.api.dashboard.web;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rd.tallerfacil.api.dashboard.dto.ActivityEvent;
import rd.tallerfacil.api.dashboard.dto.AlertItem;
import rd.tallerfacil.api.dashboard.dto.DashboardSummaryResponse;
import rd.tallerfacil.api.dashboard.service.DashboardService;
import rd.tallerfacil.api.shared.web.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> summary() {
        return ApiResponse.ok(service.summary());
    }

    @GetMapping("/activity")
    public ApiResponse<List<ActivityEvent>> activity() {
        return ApiResponse.ok(service.activity());
    }

    @GetMapping("/alerts")
    public ApiResponse<List<AlertItem>> alerts() {
        return ApiResponse.ok(service.alerts());
    }
}
