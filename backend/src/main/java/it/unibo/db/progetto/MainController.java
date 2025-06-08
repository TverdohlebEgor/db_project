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
import java.util.HashMap;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MainController {

  final UtenteRepository utente;
  final EventoRepository evento;
  final ProgettoRepository progetto;
  final ComunicazioneRepository comunicazione;
  final RimborsoSpeseRepository rimborsoSpese;
  final ValutaRepository valuta;

  @GetMapping("/progetti/utente") // '{id}' indica una variabile nel percorso
  public List<Progetto> getProgettiUtenti() {
    return utente.getProgetti();
  }

  @GetMapping("get/forum/messages/{selectedTopicId}")
  public List<Comunicazione> getMessaggiProgetto(@PathVariable int selectedTopicId) {
    return comunicazione.findComunicazioniByIdProgetto(selectedTopicId);
  }

  @GetMapping("get/valuta") // '{id}' indica una variabile nel percorso
  public List<Valuta> getAllValute() {
    return utente.getAllValute();
  }

  @GetMapping("/get/evento/{date}/{idDipendente}") // '{id}' indica una variabile nel percorso
  public List<EventoDisplay> getEventiDipendente(@PathVariable String date, @PathVariable int idDipendente) {
    return utente.getEventiDipendentne(date, idDipendente);
  }

  @GetMapping("/get/rimborsi/{date}/{idDipendente}") // '{id}' indica una variabile nel percorso
  public List<RimborsoSpeseDisplay> getRimborsiDipendente(@PathVariable String date, @PathVariable int idDipendente) {
    return utente.getRimborsiDipendente(date, idDipendente);
  }

  @GetMapping("get/forum/images/{messageId}")
  public List<String> getForumImages(@PathVariable String messageId) {
    return comunicazione.immaginiByComunicazione(messageId);
  }

  @DeleteMapping("/delete/evento/{idToDelete}")
  public ResponseEntity<Boolean> deleteEvento(@PathVariable int idToDelete) {
    boolean result = utente.deleteEvento(idToDelete);
    return ResponseEntity.ok(result);
  }

  @DeleteMapping("/delete/rimborso/{idToDelete}")
  public ResponseEntity<Boolean> deleteRimborso(@PathVariable String idToDelete) {
    boolean result = utente.deleteRimborso(idToDelete);
    return ResponseEntity.ok(result);
  }

  @GetMapping("/allEmployees")
  public List<Utente> getAllEmployees() {
    return utente.findAllEmployees();
  }

  @PostMapping("update/visualized")
  public ResponseEntity<Boolean> updateVisualizzato(@RequestBody Map<String, String> body) {
    return comunicazione.updateVisualizzato(body);
  }

  @PostMapping("/allEmployeesNotAssociatedWith")
  public ResponseEntity<List<Utente>> getAllEmployeesNotAssociatedWith(@RequestBody Map<String, String> body) {

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
      @RequestPart(value = "images", required = false) List<MultipartFile> images) {
    return utente.addEvent(date, type, overtime == "true" ? true : false, hourStart, hourEnd, projectId, idDipendente,
        message, images);
  }

  @PostMapping(value = "/add/rimborso", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Boolean> addRimborso(
      @RequestParam("date") String date,
      @RequestParam("import") double importo,
      @RequestParam("message") String message,
      @RequestParam("idDipendente") int idDipendente,
      @RequestParam("idValuta") String idValuta,
      @RequestPart(value = "images", required = false) List<MultipartFile> images) {
    return utente.addRimborso(date, importo, message, idDipendente, idValuta, images);
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

  @PostMapping("/addComunicazioneWithImage")
  public ResponseEntity<String> addComunicazioneWithImage(
      @RequestParam Map<String, String> body,
      @RequestParam(value = "immagini", required = false) List<MultipartFile> immagini) {
    return comunicazione.insertComunicazioneWithImages(body, immagini);
  }

  @PostMapping("/findComunicazioniByIdProgetto")
  public ResponseEntity<List<Comunicazione>> findComunicazioniByIdProgetto(@RequestBody Map<String, Integer> body) {

    return comunicazione.findComunicazioniByIdProgetto(body);
  }

  @PostMapping("/immaginiByComunicazione")
  public ResponseEntity<List<String>> immaginiByComunicazione(@RequestBody Map<String, Integer> body) {
    return comunicazione.immaginiByComunicazione(body);

  }

  @PostMapping("/countVisuals")
  public ResponseEntity<Integer> countVisuals(@RequestBody Map<String, Integer> body) {

    return comunicazione.countVisuals(body);

  }

  @PostMapping("/progettoDelete")
  public ResponseEntity<Void> deleteProgetto(@RequestBody Map<String, Integer> body) {
    return progetto.deleteProgetto(body);
  }

  @PostMapping("/progettoToggleConcluso")
  public ResponseEntity<Void> toggleConcluso(@RequestBody Map<String, Object> body) {
    return progetto.toggleConcluso(body);

  }

  @PostMapping("/rimborsiByManager")
  public ResponseEntity<List<RimborsoSpese>> getRimborsiByManager(@RequestBody Map<String, String> body) {
    return rimborsoSpese.getRimborsiByManager(body);
  }

  @PostMapping("/findComunicazioniById")
  public ResponseEntity<List<Comunicazione>> findComunicazioniById(@RequestBody Map<String, Integer> body) {

    return comunicazione.findComunicazioniById(body);
  }

  @PostMapping("/valutaById")
  public ResponseEntity<Valuta> getValutaById(@RequestBody Map<String, String> body) {

    return valuta.getValutaById(body);
  }

  @PostMapping("/gestisciRimborso")
  public ResponseEntity<String> gestisciRimborso(@RequestBody Map<String, String> body) {

    return rimborsoSpese.gestisciRimborso(body);
  }

  @PostMapping("/updateApprovazione")
  public ResponseEntity<?> updateApprovazione(@RequestBody Map<String, String> body) {
    return evento.updateApprovazione(body);
  }

  @PostMapping("/getUtentebyId")
  public ResponseEntity<Utente> getUtenteById(@RequestBody Map<String, Integer> body) {
    return utente.getUtenteById(body);
  }
}
