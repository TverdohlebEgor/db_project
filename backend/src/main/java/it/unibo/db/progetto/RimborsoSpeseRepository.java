package it.unibo.db.progetto;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Repository
public class RimborsoSpeseRepository {

    private final JdbcTemplate jdbc;

    public RimborsoSpeseRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<RimborsoSpese> rimborsoRowMapper = (rs, rowNum) -> new RimborsoSpese(
            rs.getInt("IdRimborso"),
            rs.getObject("Approvato", Boolean.class),
            rs.getDate("Data").toLocalDate(),
            rs.getDouble("Importo"),
            rs.getInt("IdComunicazione"),
            rs.getInt("IdUtente"),
            rs.getInt("IdValuta"));

    public ResponseEntity<List<RimborsoSpese>> getRimborsiByManager(@RequestBody Map<String, String> body) {
        try {
            Integer idManager = Integer.parseInt(body.get("idManager"));

            String sql = "SELECT rs.* FROM RimborsoSpese rs " +
                    "JOIN Utente u ON rs.IdUtente = u.IdUtente " +
                    "JOIN Afferente a ON a.IdDipendente = u.IdUtente " +
                    "WHERE a.IdManager = ? AND rs.Approvato IS NULL";

            List<RimborsoSpese> rimborsi = jdbc.query(sql, rimborsoRowMapper, idManager);

            return ResponseEntity.ok(rimborsi);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    public ResponseEntity<String> gestisciRimborso(@RequestBody Map<String, String> body) {
        try {
            Integer idRimborso = Integer.parseInt(body.get("idRimborso"));
            Boolean approvato = Boolean.parseBoolean(body.get("approvato"));

            int updated = jdbc.update(
                    "UPDATE RimborsoSpese SET Approvato = ? WHERE IdRimborso = ?",
                    approvato, idRimborso);

            if (updated == 1) {
                return ResponseEntity.ok("Rimborso aggiornato con successo");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Rimborso non trovato");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Errore nei dati inviati");
        }
    }

    public ResponseEntity<Map<String, Object>> getStatisticheRimborsi() {
        try {
            // Statistiche globali: numero e valore medio rimborsi approvati
            String sqlGlobale = """
                        SELECT
                            COUNT(*) AS numero_totale,
                            AVG(Importo) AS valore_medio
                        FROM RimborsoSpese
                        WHERE Approvato = TRUE
                    """;
            Map<String, Object> statsGlobali = jdbc.queryForMap(sqlGlobale);

            String sqlMensile = """
                        SELECT
                            DATE_TRUNC('month', Data) AS mese,
                            COUNT(*) AS numero_rimborsi,
                            AVG(Importo) AS valore_medio
                        FROM RimborsoSpese
                        WHERE Approvato = TRUE
                        GROUP BY mese
                        ORDER BY mese
                    """;
            List<Map<String, Object>> andamentoMensile = jdbc.queryForList(sqlMensile);

            Map<String, Object> response = Map.of(
                    "statisticheGlobali", statsGlobali,
                    "andamentoMensile", andamentoMensile);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
