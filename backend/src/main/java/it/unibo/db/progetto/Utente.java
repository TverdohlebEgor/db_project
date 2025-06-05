package it.unibo.db.progetto;

import java.time.LocalDate;

/*
 * CREATE TABLE Utente (
    IdUtente INT SERIAL PRIMARY KEY,
    Tipo VARCHAR(10) NOT NULL CHECK(Tipo IN ('Dipendente', 'Manager')),
    Nome VARCHAR(100) NOT NULL,
    Cognome VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(100) NOT NULL,
    DataDiNascita DATE NOT NULL ,
    Residenza VARCHAR(255) NOT NULL,
    RAL DECIMAL(10,2) NOT NULL,
    DataDiAssunzione DATE NOT NULL,
    TipoDiContratto VARCHAR(13) NOT NULL CHECK(TipoDiContratto IN ('FullTime', 'PartTime',"Stage","Apprendistato")),
    IBAN VARCHAR(27) CHECK(LEN(IBAN)=27),
    FerieAccumulate INT NOT NULL,
);
*/
public record Utente (
	int idUtente,
	TipoUtente tipo,
	String nome,
	String cognome,
	String email,
	String password,
	LocalDate dataDiNascita,
	String residenza,
	double ral,
	LocalDate dataiDiAssunzione,
	TipoContratto tipoContratto
		){ }

enum TipoUtente {
	DIPENDENTE,
	MANAGER
}


enum TipoContratto {
	FULLTIME,
	PARTTIME,
	STAGE,
	APPRENDISTATO
}
