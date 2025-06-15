package it.unibo.db.progetto;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventoDisplay(
		int IdEvento,
		String approvato,
		LocalDate data,
		TipoEvento tipo,
		boolean staordinario,
		LocalTime oraInizio,
		LocalTime oraFine,
		String nomeProgetto,
		String messaggio,
		int idComunicazione

) {
}
