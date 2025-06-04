package it.unibo.db.progetto;

import java.time.LocalDate;

/*
 CREATE TABLE GiornataDiLavoro (
    IdGiornata INT SERIAL PRIMARY KEY,
    Data DATE NOT NULL
);
 */

public record GiornataDiLavoro(
	int idGiornata,
	LocalDate data
		) { }
