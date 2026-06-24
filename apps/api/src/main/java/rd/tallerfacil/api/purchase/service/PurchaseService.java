package rd.tallerfacil.api.purchase.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rd.tallerfacil.api.inventory.domain.Product;
import rd.tallerfacil.api.inventory.repository.ProductRepository;
import rd.tallerfacil.api.purchase.domain.Purchase;
import rd.tallerfacil.api.purchase.domain.PurchaseItem;
import rd.tallerfacil.api.purchase.domain.Supplier;
import rd.tallerfacil.api.purchase.dto.CreatePurchaseRequest;
import rd.tallerfacil.api.purchase.dto.PurchaseResponse;
import rd.tallerfacil.api.purchase.dto.SupplierRequest;
import rd.tallerfacil.api.purchase.dto.SupplierResponse;
import rd.tallerfacil.api.purchase.repository.PurchaseRepository;
import rd.tallerfacil.api.purchase.repository.SupplierRepository;
import rd.tallerfacil.api.shared.web.ApiResponse;
import rd.tallerfacil.api.shared.web.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    // --- Suppliers ---

    @Transactional(readOnly = true)
    public List<SupplierResponse> listSuppliers() {
        return supplierRepository.findByActiveTrueOrderByNameAsc()
                .stream().map(SupplierResponse::from).toList();
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest req) {
        var supplier = new Supplier();
        supplier.setName(req.name());
        supplier.setPhone(req.phone());
        supplier.setEmail(req.email());
        return SupplierResponse.from(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(UUID id) {
        var supplier = supplierRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + id));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    // --- Purchases ---

    @Transactional(readOnly = true)
    public ApiResponse<List<PurchaseResponse>> list(int page, int size) {
        var result = purchaseRepository.findAllWithSupplier(PageRequest.of(page, size));
        var data = result.getContent().stream().map(PurchaseResponse::from).toList();
        return ApiResponse.paged(data, result.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public PurchaseResponse findById(UUID id) {
        return purchaseRepository.findByIdWithDetails(id)
                .map(PurchaseResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada: " + id));
    }

    @Transactional
    public PurchaseResponse create(CreatePurchaseRequest req) {
        var supplier = supplierRepository.findByIdAndActiveTrue(req.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + req.supplierId()));

        var purchase = new Purchase();
        purchase.setSupplier(supplier);
        purchase.setPurchaseDate(req.purchaseDate());
        purchase.setNotes(req.notes());

        BigDecimal total = BigDecimal.ZERO;

        for (var itemReq : req.items()) {
            Product product = productRepository.findByIdAndActiveTrue(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + itemReq.productId()));

            var item = new PurchaseItem();
            item.setPurchase(purchase);
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());
            item.setUnitCost(itemReq.unitCost());

            BigDecimal subtotal = itemReq.unitCost().multiply(BigDecimal.valueOf(itemReq.quantity()));
            item.setSubtotal(subtotal);
            total = total.add(subtotal);

            purchase.getItems().add(item);

            // Increment stock
            product.setCurrentStock(product.getCurrentStock() + itemReq.quantity());
            productRepository.save(product);
        }

        purchase.setTotal(total);
        return PurchaseResponse.from(purchaseRepository.save(purchase));
    }
}
