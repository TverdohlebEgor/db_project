package it.unibo.db.progetto;

import java.sql.PreparedStatement;

import java.sql.Statement;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

@Repository
public class ComunicazioneRepository {

    private final JdbcTemplate jdbc;

    public ComunicazioneRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Comunicazione> comunicazioneRowMapper = (rs, rowNum) -> new Comunicazione(
            rs.getInt("IdComunicazione"),
            TipoComunicazione.valueOf(rs.getString("Tipo").toUpperCase()),
            rs.getString("Testo"),
            rs.getInt("IdProgetto"));

    public ResponseEntity<String> insertComunicazioneWithImages(Map<String, String> body,
            List<MultipartFile> immagini) {
        try {
            String tipo = body.get("tipo");
            String testo = body.get("testo");
            Integer idProgetto = Integer.parseInt(body.get("idProgetto"));

            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        "INSERT INTO Comunicazione (Testo, Tipo, IdProgetto) VALUES (?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, testo);
                ps.setString(2, tipo);
                ps.setInt(3, idProgetto);
                return ps;
            }, keyHolder);

            Integer idComunicazione = (Integer) keyHolder.getKeys().get("idcomunicazione");

            if (immagini != null && !immagini.isEmpty()) {
                for (MultipartFile img : immagini) {
                    if (img.getSize() > 0) {
                        jdbc.update("INSERT INTO Immagine (Immagini, IdComunicazione) VALUES (?, ?)",
                                img.getBytes(), idComunicazione);
                    }
                }
            }

            return ResponseEntity.ok("Comunicazione e immagini inserite con successo");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore durante l'inserimento della comunicazione");
        }
    }

    public List<Comunicazione> findComunicazioniByIdProgetto(int idProgetto) {
        List<Comunicazione> comunicazioni;
        if(idProgetto == 0){
            comunicazioni = jdbc.query(
                    "SELECT IdComunicazione, Tipo, Testo, IdProgetto FROM Comunicazione WHERE Tipo = \'Forum\' ORDER BY IdComunicazione ASC",
                    comunicazioneRowMapper
                    );
        }
        else {
            comunicazioni = jdbc.query(
                    "SELECT IdComunicazione, Tipo, Testo, IdProgetto FROM Comunicazione WHERE IdProgetto = ? AND Tipo = \'Progetto\' ORDER BY IdComunicazione ASC",
                    comunicazioneRowMapper,
                    idProgetto);
        }

        return comunicazioni;
    }

    public ResponseEntity<Boolean> updateVisualizzato(@RequestBody Map<String, String> body){
        try{
            if(body.get("isVisualized") == "true") {
                jdbc.update("INSERT INTO Visualizzare(IdComunicazione,IdUtente) VALUES("
                        + body.get("idMessagio") + ", " + body.get("idDipendente") + ")");
            }
            else{
                jdbc.update("DELETE FROM Visualizzare WHERE IdComunicazione = "
                        + body.get("idMessagio") + " AND IdUtente = " + body.get("idDipendente"));
            }
        } catch (java.lang.Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(true);
    }

    public ResponseEntity<List<Comunicazione>> findComunicazioniByIdProgetto( Map<String, Integer> body){
        Integer idProgetto = body.get("idProgetto");
        return ResponseEntity.ok(findComunicazioniByIdProgetto(idProgetto));
    }

    public List<String> immaginiByComunicazione(String idComunicazione) {
        List<byte[]> immaginiBytes = jdbc.query(
                "SELECT Immagini FROM Immagine Im JOIN Comunicazione Co ON Im.IdComunicazione = Co.IdComunicazione WHERE Co.IdComunicazione = ?",
                (rs, rowNum) -> rs.getBytes("Immagini"),
                Integer.valueOf(idComunicazione));

        List<String> immaginiBase64 = immaginiBytes.stream()
                .map(bytes -> "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes))
                .toList();

        return immaginiBase64;
    }
    public ResponseEntity<List<String>> immaginiByComunicazione(@RequestBody Map<String, Integer> body) {
        String idComunicazione = String.valueOf(body.get("idComunicazione"));
        if (idComunicazione == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(immaginiByComunicazione(idComunicazione));
    }

    public ResponseEntity<Integer> countVisuals(@RequestBody Map<String, Integer> body) {

        Integer idComunicazione = body.get("idComunicazione");
        System.out.println("com: " + idComunicazione);

        Integer count = jdbc.queryForObject(
                "SELECT COUNT(DISTINCT IdUtente) FROM Visualizzare WHERE IdComunicazione = ?",
                Integer.class,
                idComunicazione);

        System.out.println("visual: " + count);

        return ResponseEntity.ok(count != null ? count : 0);
    }
}
