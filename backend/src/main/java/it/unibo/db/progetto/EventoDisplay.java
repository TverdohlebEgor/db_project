package it.unibo.db.progetto;
import java.time.LocalDate;
import java.time.LocalTime;

/*
CREATE TABLE Evento (
    IdEvento INT SERIAL PRIMARY KEY,
    Approvato BOOLEAN,
    Data DATE NOT NULL,
    Tipo VARCHAR(8) CHECK(Tipo IN('Malattia','Ferie','Permesso','Lavoro')),
    Straordinario BOOLEAN,
    OraInizio TIME NOT NULL,
    OraFine TIME NOT NULL,
    IdUtente INT,
    IdProgetto INT,
    IdComunicazione INT,
    FOREIGN KEY (IdUtente) REFERENCES Utente(IdUtente),
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto),
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione)
);
*/

public record EventoDisplay (
	int IdEvento,
	String approvato,
	LocalDate data,
	TipoEvento tipo,
	boolean staordinario,
	LocalTime oraInizio,
	LocalTime oraFine,
	String nomeProgetto,
	String messaggio
	) { }
