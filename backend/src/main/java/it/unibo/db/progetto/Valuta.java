package it.unibo.db.progetto;

/*
 CREATE TABLE Valuta (
    IdValuta INT SERIAL PRIMARY KEY,
    IdAmministratore INT NOT NULL,
    Nome VARCHAR(3) NOT NULL CHECK(LEN(Nome)=3),
    Simbolo VARCHAR(1) CHECK(LEN(Nome)=1),
    FOREIGN KEY (IdAmministratore) REFERENCES Amministratore(IdAmministratore)
);
*/

public record Valuta(
	int idValuta,
	int idAmministratore,
	String nome,
	String simbolo
		) { }
