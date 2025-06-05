package it.unibo.db.progetto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MainController {

  final UtenteRepository utente;
  final EventoRepository evento;
  final ProgettoRepository progetto;

  @GetMapping("/allEmployees")
  public List<Utente> getAllEmployees() {
    return utente.findAllEmployees();
  }

  @PostMapping("/allEmployeesNotAssociatedWith")
  public ResponseEntity<List<Utente>> getAllEmployeesNotAssociatedWith(@RequestBody Map<String, String> body) {

    return utente.findAllEmployeesNotAssociatedWith(body);
  }

  @PostMapping("/login")
  public ResponseEntity<Utente> loginUser(@RequestBody Map<String, String> body) {

    return utente.login(body);

  }

  @PostMapping("/employeesOfManager")
  public ResponseEntity<List<Utente>> getEmployeesOfManager(@RequestBody Map<String, String> body) {

    return utente.findEmployeesOfManager(body);

  }

  @PostMapping("/addEmployeeToManager")
  public ResponseEntity<String> addEmployeeToManager(@RequestBody Map<String, String> body) {

    return utente.addEmployeeToManager(body);
  }

  @PostMapping("/removeEmployeeFromManager")
  public ResponseEntity<String> removeEmployeeFromManager(@RequestBody Map<String, String> body) {

    return utente.removeEmployeeFromManager(body);
  }

  @PostMapping("/getEventPerDay")
  public ResponseEntity<List<Evento>> getEventPerDay(@RequestBody Map<String, String> body) {

    return evento.getEventPerDay(body);
  }

  @PostMapping("/getProjectsPerManager")
  public ResponseEntity<List<Progetto>> getProjectsPerManager(@RequestBody Map<String, String> body) {

    return progetto.getProjectsPerManager(body);
  }

  @PostMapping("/isUserAssignedToProject")
  public ResponseEntity<String> isUserAssigned(@RequestBody Map<String, String> body) {
    return utente.isUserAssignedToProject(body);
  }

  @PostMapping("/addUserToProject")
  public ResponseEntity<String> addUserToProject(@RequestBody Map<String, String> body) {
    return utente.addUserToProject(body);
  }

  @PostMapping("/removeUserFromProject")
  public ResponseEntity<String> removeUserFromProject(@RequestBody Map<String, String> body) {
    return utente.removeUserFromProject(body);
  }

  @PostMapping("/addProject")
  public ResponseEntity<String> addProject(@RequestBody Map<String, String> body) {
    return progetto.addProject(body);
  }

  @GetMapping("/getAllManagers")
  public List<Utente> getAllManagers() {
    return utente.findAllManagers();
  }

  @PostMapping("/addManagerToProject")
  public ResponseEntity<String> addManagerToProject(@RequestBody Map<String, String> body) {
    return utente.addManagerToProject(body);
  }

  @PostMapping("/removeManagerFromProject")
  public ResponseEntity<String> removeManagerFromProject(@RequestBody Map<String, String> body) {
    return utente.removeManagerFromProject(body);
  }

  @PostMapping("/isManagerAssignedToProject")
  public ResponseEntity<String> isManagerAssignedToProject(@RequestBody Map<String, String> body) {
    return utente.isManagerAssignedToProject(body);
  }

}
