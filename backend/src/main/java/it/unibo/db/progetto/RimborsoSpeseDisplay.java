package it.unibo.db.progetto;

import java.time.LocalDate;

/*
 *CREATE TABLE RimborsoSpese (
    IdRimborso INT SERIAL PRIMARY KEY,
    Approvato BOOLEAN,
    Data DATE NOT NULL,
    Importo DECIMAL(10,2) NOT NULL,
    IdComunicazione INT,
    IdUtente INT,
    IdValuta INT,
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione),
    FOREIGN KEY (IdUtente) REFERENCES Utente(IdUtente),
    FOREIGN KEY (IdValuta) REFERENCES Valuta(IdValuta)
);
 */
public record RimborsoSpeseDisplay (
	int idRimborso,
	Boolean approvato,
	double importo,
	String testo,
	String nome
		) { }
