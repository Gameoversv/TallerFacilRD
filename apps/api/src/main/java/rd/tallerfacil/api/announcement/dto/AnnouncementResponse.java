package rd.tallerfacil.api.announcement.dto;

import rd.tallerfacil.api.announcement.domain.PlatformAnnouncement;

import java.time.Instant;

public record AnnouncementResponse(
        String id,
        String message,
        String level,
        boolean active,
        Instant updatedAt
) {
    public static AnnouncementResponse from(PlatformAnnouncement a) {
        return new AnnouncementResponse(
                a.getId().toString(),
                a.getMessage(),
                a.getLevel(),
                a.isActive(),
                a.getUpdatedAt()
        );
    }
}
