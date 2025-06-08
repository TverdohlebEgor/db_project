package it.unibo.db.progetto;


public record Valuta(
	int idValuta,
	int idAmministratore,
	String nome,
	String simbolo
		) { }
