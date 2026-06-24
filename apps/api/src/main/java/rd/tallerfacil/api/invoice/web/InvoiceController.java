package rd.tallerfacil.api.invoice.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import rd.tallerfacil.api.invoice.dto.CreateInvoiceRequest;
import rd.tallerfacil.api.invoice.dto.InvoiceResponse;
import rd.tallerfacil.api.invoice.dto.UpdateInvoiceStatusRequest;
import rd.tallerfacil.api.invoice.service.InvoiceService;
import rd.tallerfacil.api.shared.web.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService service;

    @GetMapping
    public ApiResponse<List<InvoiceResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.list(page, size);
    }

    @GetMapping("/{id}")
    public ApiResponse<InvoiceResponse> findById(@PathVariable UUID id) {
        return ApiResponse.ok(service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InvoiceResponse> create(@Valid @RequestBody CreateInvoiceRequest req) {
        return ApiResponse.ok(service.create(req));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<InvoiceResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInvoiceStatusRequest req
    ) {
        return ApiResponse.ok(service.updateStatus(id, req));
    }
}
