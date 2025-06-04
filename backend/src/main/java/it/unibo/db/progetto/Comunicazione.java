package it.unibo.db.progetto;

/*
 CREATE TABLE Comunicazione (
    IdComunicazione INT SERIAL PRIMARY KEY,
    Tipo VARCHAR(9) NOT NULL CHECK(Tipo IN ('Progetto', 'Forum','Richiesta')),
    Testo TEXT NOT NULL,
    IdProgetto INT NOT NULL,
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto)
);
*/

public record Comunicazione (
	int idComunicazione,
	TipoComunicazione tipo,
	String testo,
	int idProgetto
		) { }


enum TipoComunicazione {
	PROGETTO,
	FORUM,
	RICHIESTA
}
