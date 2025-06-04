package it.unibo.db.progetto;

import java.time.LocalDate;
/*
CREATE TABLE Progetto (
    IdProgetto INT SERIAL PRIMARY KEY,
    NomeProgetto VARCHAR(100) NOT NULL,
    Concluso BOOLEAN NOT NULL,
    Deadline DATE NOT NULL
);
*/
public record Progetto(
	int idProgetto,
	String nomeProgetto,
	boolean concluso,
	LocalDate deadline
		) { }
