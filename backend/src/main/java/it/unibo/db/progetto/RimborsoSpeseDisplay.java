package it.unibo.db.progetto;

public record RimborsoSpeseDisplay(
        int idRimborso,
        Boolean approvato,
        double importo,
        String testo,
        String nome) {
}
