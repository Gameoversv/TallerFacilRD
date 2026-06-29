package rd.tallerfacil.api.reception.domain;

public record ReceptionChecklist(
        ExteriorChecklist exterior,
        InteriorChecklist interior,
        MechanicalChecklist mechanical
) {
    public record ExteriorChecklist(String scratches, String dents, String lights) {}
    public record InteriorChecklist(String radio, String screen, String mats) {}
    public record MechanicalChecklist(String oilLevel, String coolant, String battery) {}
}
