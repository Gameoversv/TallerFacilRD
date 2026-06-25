package rd.tallerfacil.api.employee.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import rd.tallerfacil.api.auth.domain.RoleName;
import rd.tallerfacil.api.employee.domain.Employee;

import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Page<Employee> findByActiveAndRoleOrderByLastNameAscFirstNameAsc(
            boolean active, RoleName role, Pageable pageable);

    Page<Employee> findByActiveOrderByLastNameAscFirstNameAsc(
            boolean active, Pageable pageable);

    Page<Employee> findAllByOrderByLastNameAscFirstNameAsc(Pageable pageable);
}
