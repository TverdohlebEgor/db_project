package it.unibo.db.progetto;

import java.time.LocalDate;

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
