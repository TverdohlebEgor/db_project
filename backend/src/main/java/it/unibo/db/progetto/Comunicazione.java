package it.unibo.db.progetto;



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
