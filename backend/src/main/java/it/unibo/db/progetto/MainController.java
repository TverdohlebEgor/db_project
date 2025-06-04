package it.unibo.db.progetto;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
public class MainController {

    @GetMapping("/api/a1/eventoTest")
    public Evento testEvento() {
        return new Evento(
            1,                                // idEvento
            true,                             // approvato
            LocalDate.of(2025, 6, 4),         // data
            TipoEvento.LAVORO,              // tipo
            false,                            // straordinario
            LocalTime.of(9, 0),               // oraInizio
            LocalTime.of(11, 30),             // oraFine
            101,                              // idUtente
            202,                              // idProgetto
            303                               // idComunicazione
        );
    }
}
