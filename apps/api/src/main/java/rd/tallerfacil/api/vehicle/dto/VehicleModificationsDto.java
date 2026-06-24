package rd.tallerfacil.api.vehicle.dto;

public record VehicleModificationsDto(
        Boolean turbo,
        String suspension,
        String tune,
        String injectors,
        String fuelType
) {}
