package rd.tallerfacil.api.reports.dto;

public record LowStockEntry(String internalCode, String description, int currentStock, int minStock) {}
