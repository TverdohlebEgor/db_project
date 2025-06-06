package it.unibo.db.progetto;

import java.sql.PreparedStatement;

import java.sql.Statement;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

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

            for (MultipartFile img : immagini) {
                jdbc.update("INSERT INTO Immagine (Immagini, IdComunicazione) VALUES (?, ?)",
                        img.getBytes(), idComunicazione);
            }

            return ResponseEntity.ok("Comunicazione e immagini inserite con successo");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore durante l'inserimento della comunicazione");
        }
    }

}
