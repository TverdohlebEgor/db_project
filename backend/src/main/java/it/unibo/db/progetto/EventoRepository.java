package it.unibo.db.progetto;

import org.springframework.jdbc.core.RowMapper;

import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Repository
public class EventoRepository {
    private final JdbcTemplate jdbc;

    public EventoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Evento> eventoRowMapper = (rs, rowNum) -> new Evento(
            rs.getInt("IdEvento"),
            rs.getBoolean("Approvato"),
            rs.getDate("Data").toLocalDate(),
            TipoEvento.valueOf(rs.getString("Tipo").toUpperCase()),
            rs.getBoolean("Straordinario"),
            rs.getTime("OraInizio").toLocalTime(),
            rs.getTime("OraFine").toLocalTime(),
            rs.getInt("IdUtente"),
            rs.getInt("IdProgetto"),
            rs.getInt("IdComunicazione"));

    public ResponseEntity<List<Evento>> getEventPerDay(Map<String, String> body) {
        try {
            Integer idUtente = Integer.parseInt(body.get("idUtente"));
            String data = body.get("data");

            String sql = "SELECT e.* FROM Evento e " +
                    "JOIN Formare f ON e.IdEvento = f.IdEvento " +
                    "JOIN GiornataDiLavoro g ON f.IdGiornata = g.IdGiornata " +
                    "WHERE e.IdUtente = ? AND g.Data = ?";

            List<Evento> eventi = jdbc.query(
                    sql,
                    eventoRowMapper,
                    idUtente,
                    Date.valueOf(data));

            return ResponseEntity.ok(eventi);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/updateApprovazione")
    public ResponseEntity<?> updateApprovazione(@RequestBody Map<String, String> body) {
        try {
            int idEvento = Integer.parseInt(body.get("idEvento"));
            boolean approvato = Boolean.parseBoolean(body.get("approvato"));

            String sql = "UPDATE Evento SET Approvato = ? WHERE IdEvento = ?";

            int updatedRows = jdbc.update(sql, approvato, idEvento);

            if (updatedRows > 0) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Evento non trovato");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Errore nell'aggiornamento: " + e.getMessage());
        }
    }

    public ResponseEntity<Map<String, Object>> getDashboardStatistiche() {
        Map<String, Object> statistiche = new HashMap<>();

        String perTipoSql = """
                    SELECT Tipo, COUNT(*) AS conteggio
                    FROM Evento WHERE Approvato = TRUE
                    GROUP BY Tipo
                """;
        statistiche.put("perTipo", jdbc.queryForList(perTipoSql));

        String ferieMedieSql = """
                    SELECT AVG(giorni) AS ferieMedie
                    FROM (
                        SELECT COUNT(*) AS giorni
                        FROM Evento
                        WHERE Tipo = 'Ferie'
                        AND Approvato = TRUE
                        GROUP BY IdUtente
                    ) AS sub
                """;
        Double ferieMedie = jdbc.queryForObject(ferieMedieSql, Double.class);
        if (ferieMedie == null)
            ferieMedie = 0.0;
        statistiche.put("ferieMedie", ferieMedie);

        String permessiUtenteSql = """
                    SELECT u.Nome, u.Cognome, COUNT(*) AS numeroPermessi
                    FROM Evento e
                    JOIN Utente u ON e.IdUtente = u.IdUtente
                    WHERE e.Tipo = 'Permesso'
                    AND e.Approvato = TRUE
                    GROUP BY u.Nome, u.Cognome
                    ORDER BY numeroPermessi DESC
                """;
        statistiche.put("permessiUtente", jdbc.queryForList(permessiUtenteSql));

        return ResponseEntity.ok(statistiche);
    }

    public ResponseEntity<List<Evento>> getEventiNonApprovati(@RequestBody Map<String, Integer> body) {
        Integer idDipendente = body.get("idDipendente");
        if (idDipendente == null) {
            return ResponseEntity.badRequest().build();
        }

        String sql = """
                    SELECT
                        e.IdEvento,
                        e.Approvato,
                        e.Data,
                        e.Tipo,
                        e.Straordinario,
                        e.OraInizio,
                        e.OraFine,
                        e.IdUtente,
                        e.IdProgetto,
                        e.IdComunicazione
                    FROM Evento e
                    LEFT JOIN Progetto p ON e.IdProgetto = p.IdProgetto
                    LEFT JOIN Comunicazione c ON e.IdComunicazione = c.IdComunicazione
                    WHERE e.IdUtente = ? AND e.Approvato IS NULL
                """;

        return ResponseEntity.ok(jdbc.query(sql, eventoRowMapper, idDipendente));
    }

}
