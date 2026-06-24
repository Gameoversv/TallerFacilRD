package rd.tallerfacil.api.reception.domain;

public record ReceptionChecklist(
        ExteriorChecklist exterior,
        InteriorChecklist interior,
        MechanicalChecklist mechanical
) {
    public record ExteriorChecklist(Boolean scratches, Boolean dents, Boolean lights) {}
    public record InteriorChecklist(Boolean radio, Boolean screen, Boolean mats) {}
    public record MechanicalChecklist(Boolean oilLevel, Boolean coolant, Boolean battery) {}
}
