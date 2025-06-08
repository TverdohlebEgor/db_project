package it.unibo.db.progetto;



public record ArchivioImmagini (
	int idImmagini,
	String immagine, // should be a list? how to divide it?
	int idCommunicazione
		) { }

