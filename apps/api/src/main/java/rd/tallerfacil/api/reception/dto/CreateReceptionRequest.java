package rd.tallerfacil.api.reception.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import rd.tallerfacil.api.reception.domain.ReceptionChecklist;

import java.util.UUID;

public record CreateReceptionRequest(
        @NotNull UUID vehicleId,
        @NotNull @Positive Integer entryKm,
        @NotBlank String reportedProblem,
        @NotNull @Valid ReceptionChecklistDto checklist,
        String notes
) {
    public record ReceptionChecklistDto(
            @Valid ExteriorDto exterior,
            @Valid InteriorDto interior,
            @Valid MechanicalDto mechanical
    ) {
        public record ExteriorDto(Boolean scratches, Boolean dents, Boolean lights) {}
        public record InteriorDto(Boolean radio, Boolean screen, Boolean mats) {}
        public record MechanicalDto(Boolean oilLevel, Boolean coolant, Boolean battery) {}

        public ReceptionChecklist toDomain() {
            return new ReceptionChecklist(
                    exterior == null ? null : new ReceptionChecklist.ExteriorChecklist(
                            exterior.scratches(), exterior.dents(), exterior.lights()),
                    interior == null ? null : new ReceptionChecklist.InteriorChecklist(
                            interior.radio(), interior.screen(), interior.mats()),
                    mechanical == null ? null : new ReceptionChecklist.MechanicalChecklist(
                            mechanical.oilLevel(), mechanical.coolant(), mechanical.battery())
            );
        }
    }
}
