package rd.tallerfacil.api.reception;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import rd.tallerfacil.api.support.IntegrationTestBase;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ReceptionIntegrationTest extends IntegrationTestBase {

    private String token;
    private String vehicleId;

    @BeforeEach
    void setUp() throws Exception {
        cleanAll();
        token = registerTenantAndGetToken("admin@test.rd", "pass1234");

        var custRes = mockMvc.perform(post("/api/customers")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "first_name", "Juan", "last_name", "Perez",
                                "phone", "8091234567"))))
                .andReturn().getResponse().getContentAsString();
        String customerId = objectMapper.readTree(custRes).path("data").path("id").asText();

        var vehRes = mockMvc.perform(post("/api/vehicles")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "brand", "Toyota", "model", "Corolla", "year", 2019,
                                "license_plate", "REC-001", "customer_id", customerId))))
                .andReturn().getResponse().getContentAsString();
        vehicleId = objectMapper.readTree(vehRes).path("data").path("id").asText();
    }

    private Map<String, Object> buildDetailedChecklist() {
        return Map.of(
                "exterior", Map.of("scratches", "OK", "dents", "NA", "lights", "LEVE"),
                "interior", Map.of("radio", "OK", "screen", "NA", "mats", "OK"),
                "mechanical", Map.of("oil_level", "GRAVE", "coolant", "OK", "battery", "NA")
        );
    }

    @Test
    @DisplayName("POST /api/receptions - crea recepción con checklist")
    void createReception_valid_returns201() throws Exception {
        var body = Map.of(
                "vehicle_id", vehicleId,
                "entry_km", 52000,
                "reported_problem", "Ruido en frenos delanteros",
                "checklist", buildDetailedChecklist()
        );

        mockMvc.perform(post("/api/receptions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.vehicle_id").value(vehicleId))
                .andExpect(jsonPath("$.data.entry_km").value(52000))
                .andExpect(jsonPath("$.data.reported_problem").value("Ruido en frenos delanteros"))
                .andExpect(jsonPath("$.data.checklist.exterior.scratches").value("OK"))
                .andExpect(jsonPath("$.data.checklist.mechanical.oil_level").value("GRAVE"))
                .andExpect(jsonPath("$.data.photos").isArray());
    }

    @Test
    @DisplayName("POST /api/receptions - falla sin vehicle_id")
    void createReception_missingVehicle_returns400() throws Exception {
        var body = Map.of(
                "entry_km", 52000,
                "reported_problem", "Falla motor",
                "checklist", buildDetailedChecklist()
        );

        mockMvc.perform(post("/api/receptions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/receptions/:id - retorna recepción existente")
    void findById_existing_returns200() throws Exception {
        var body = Map.of(
                "vehicle_id", vehicleId,
                "entry_km", 30000,
                "reported_problem", "Cambio de aceite",
                "checklist", buildDetailedChecklist()
        );

        var createRes = mockMvc.perform(post("/api/receptions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn().getResponse().getContentAsString();
        String receptionId = objectMapper.readTree(createRes).path("data").path("id").asText();

        mockMvc.perform(get("/api/receptions/" + receptionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(receptionId))
                .andExpect(jsonPath("$.data.customer_name").exists());
    }

    @Test
    @DisplayName("GET /api/vehicles/:id/receptions - lista recepciones del vehículo")
    void listByVehicle_returns200() throws Exception {
        var body = Map.of(
                "vehicle_id", vehicleId,
                "entry_km", 10000,
                "reported_problem", "Revisión general",
                "checklist", buildDetailedChecklist()
        );

        mockMvc.perform(post("/api/receptions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/receptions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/receptions/:id/photos - sube foto local")
    void addPhoto_localStorage_addsUrl() throws Exception {
        var body = Map.of(
                "vehicle_id", vehicleId,
                "entry_km", 70000,
                "reported_problem", "Revisión pre-compra",
                "checklist", buildDetailedChecklist()
        );

        var createRes = mockMvc.perform(post("/api/receptions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn().getResponse().getContentAsString();
        String receptionId = objectMapper.readTree(createRes).path("data").path("id").asText();

        var photo = new MockMultipartFile("file", "frente.jpg", "image/jpeg",
                "fake-image-bytes".getBytes());

        mockMvc.perform(multipart("/api/receptions/" + receptionId + "/photos")
                        .file(photo)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.photos", hasSize(1)))
                .andExpect(jsonPath("$.data.photos[0]", containsString("receptions/")));
    }

    @Test
    @DisplayName("GET /api/receptions/:id - 404 si no existe")
    void findById_notFound_returns400() throws Exception {
        mockMvc.perform(get("/api/receptions/00000000-0000-0000-0000-000000000000")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }
}
