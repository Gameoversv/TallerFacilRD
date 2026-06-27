package rd.tallerfacil.api.superadmin.dto;

public record GlobalStatsResponse(
        long tenantsTotal,
        long tenantsTrial,
        long tenantsActive,
        long tenantsSuspended,
        long tenantsCancelled,
        long usersTotal,
        long customersTotal,
        long vehiclesTotal,
        long workOrdersTotal
) {}
