package rd.tallerfacil.api.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import rd.tallerfacil.api.customer.repository.CustomerRepository;
import rd.tallerfacil.api.reception.repository.ReceptionRepository;
import rd.tallerfacil.api.tenant.repository.TenantRepository;
import rd.tallerfacil.api.auth.repository.UserRepository;
import rd.tallerfacil.api.vehicle.repository.VehicleRepository;
import rd.tallerfacil.api.workorder.repository.WorkOrderRepository;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;
    @Autowired protected UserRepository userRepository;
    @Autowired protected TenantRepository tenantRepository;
    @Autowired protected CustomerRepository customerRepository;
    @Autowired protected VehicleRepository vehicleRepository;
    @Autowired protected ReceptionRepository receptionRepository;
    @Autowired protected WorkOrderRepository workOrderRepository;

    protected void cleanAll() {
        workOrderRepository.deleteAll();
        receptionRepository.deleteAll();
        vehicleRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();
        tenantRepository.deleteAll();
    }

    protected String registerTenantAndGetToken(String email, String password) throws Exception {
        var body = Map.of(
                "tenant_name", "Taller Test",
                "admin_name", "Admin Test",
                "admin_email", email,
                "admin_password", password
        );
        var res = mockMvc.perform(post("/api/tenants/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).path("data").path("token").asText();
    }
}
