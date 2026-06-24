package rd.tallerfacil.api.reception.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import rd.tallerfacil.api.reception.domain.Reception;
import rd.tallerfacil.api.reception.dto.CreateReceptionRequest;
import rd.tallerfacil.api.reception.dto.ReceptionResponse;
import rd.tallerfacil.api.reception.repository.ReceptionRepository;
import rd.tallerfacil.api.shared.storage.StorageService;
import rd.tallerfacil.api.vehicle.repository.VehicleRepository;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceptionService {

    private final ReceptionRepository receptionRepository;
    private final VehicleRepository vehicleRepository;
    private final StorageService storageService;

    @Transactional
    public ReceptionResponse create(CreateReceptionRequest req) {
        var vehicle = vehicleRepository.findByIdAndActiveTrue(req.vehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado: " + req.vehicleId()));

        var reception = new Reception();
        reception.setVehicle(vehicle);
        reception.setEntryKm(req.entryKm());
        reception.setReportedProblem(req.reportedProblem());
        reception.setChecklist(req.checklist().toDomain());
        reception.setNotes(req.notes());

        return ReceptionResponse.from(receptionRepository.save(reception));
    }

    @Transactional
    public ReceptionResponse addPhoto(UUID id, MultipartFile file) throws IOException {
        var reception = receptionRepository.findByIdWithVehicle(id)
                .orElseThrow(() -> new IllegalArgumentException("Recepción no encontrada: " + id));

        String ext = getExtension(file.getOriginalFilename());
        String filename = "receptions/" + id + "/" + UUID.randomUUID() + ext;
        String url = storageService.upload(filename, file.getBytes(), file.getContentType());

        reception.getPhotos().add(url);
        return ReceptionResponse.from(receptionRepository.save(reception));
    }

    @Transactional(readOnly = true)
    public ReceptionResponse findById(UUID id) {
        return receptionRepository.findByIdWithVehicle(id)
                .map(ReceptionResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Recepción no encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<ReceptionResponse> findByVehicle(UUID vehicleId) {
        return receptionRepository.findByVehicleId(vehicleId)
                .stream()
                .map(ReceptionResponse::from)
                .toList();
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}
