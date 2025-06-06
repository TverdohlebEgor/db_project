package it.unibo.db.progetto;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MainController {

  final UtenteRepository utente;

  @GetMapping("/progetti/utente") // '{id}' indica una variabile nel percorso
  public List<Progetto> getProgettiUtenti() {
      return utente.getProgetti();
  }

  @GetMapping("/get/evento/{date}/{idDipendente}") // '{id}' indica una variabile nel percorso
  public List<EventoDisplay> getEventiDipendentne(@PathVariable String date, @PathVariable int idDipendente) {
    return utente.getEventiDipendentne(date,idDipendente);
  }

  @DeleteMapping("/delete/evento/{idToDelete}")
  public ResponseEntity<Boolean> deleteEvento(@PathVariable int idToDelete) {
    boolean result = utente.deleteEvento(idToDelete);
    return ResponseEntity.ok(result);
  }

  @GetMapping("/allEmployees")
  public List<Utente> getAllEmployees() {
    return utente.findAllEmployees();
  }

  @PostMapping("/allEmployeesNotAssociatedWith")
  public  ResponseEntity<List<Utente>> getAllEmployeesNotAssociatedWith(@RequestBody Map<String, String> body) {

    return utente.findAllEmployeesNotAssociatedWith(body);
  }

  @PostMapping("/login")
  public ResponseEntity<Utente> loginUser(@RequestBody Map<String, String> body) {

    return utente.login(body);

  }

  @PostMapping(value = "/add/event", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Boolean> addEvent(
          @RequestParam("date") String date,
          @RequestParam("type") String type,
          @RequestParam("overtime") String overtime,
          @RequestParam("hourStart") String hourStart,
          @RequestParam("hourEnd") String hourEnd,
          @RequestParam("message") String message,
          @RequestParam("projectId") String projectId,
          @RequestParam("idDipendente") int idDipendente,
          @RequestPart(value = "images", required = false) List<MultipartFile> images
  ) {
    System.out.println(images);
    return utente.addEvent(date,type,overtime == "true" ? true : false,hourStart,hourEnd,projectId,idDipendente,message,images);
  }

  @PostMapping("/employeesOfManager")
  public ResponseEntity<List<Utente>> getEmployeesOfManager(@RequestBody Map<String, String> body) {

    return utente.findEmployeesOfManager(body);
  }

}
