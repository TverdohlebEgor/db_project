package it.unibo.db.progetto;

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

  @GetMapping("/allEmployees")
  public List<Utente> getAllEmployees() {
    return utente.findAllEmployees();
  }

  @PostMapping("/allEmployeesNotAssociatedWith")
  public  ResponseEntity<List<Utente>> getAllEmployeesNotAssociatedWith(@RequestBody Map<String, String> body) {

    return utente.findAllEmployeesNotAssociatedWith(body);
  }

  @PostMapping("/add/event")
  public  ResponseEntity<Boolean> addEvent(@RequestBody Map<String, String> body) {
    return utente.addEvent(body);
  }

  @PostMapping("/login")
  public ResponseEntity<Utente> loginUser(@RequestBody Map<String, String> body) {

    return utente.login(body);

  }

  @PostMapping("/employeesOfManager")
  public ResponseEntity<List<Utente>> getEmployeesOfManager(@RequestBody Map<String, String> body) {

    return utente.findEmployeesOfManager(body);
  }

}
