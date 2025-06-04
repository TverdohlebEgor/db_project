package it.unibo.db.progetto;

/*
CREATE TABLE ArchivioImmagini (
    IdImmagini INT SERIAL PRIMARY KEY,
    Immagini BLOB NOT NULL,
    IdComunicazione INT,
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione)
);
*/

public record ArchivioImmagini (
	int idImmagini,
	String immagine, // should be a list? how to divide it?
	int idCommunicazione
		) { }

