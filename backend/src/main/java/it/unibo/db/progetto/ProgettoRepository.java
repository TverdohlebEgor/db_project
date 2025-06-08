package it.unibo.db.progetto;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestBody;

import java.sql.Date;

@Repository
public class ProgettoRepository {
    private final JdbcTemplate jdbc;

    public ProgettoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;

    }

    private final RowMapper<Progetto> progettoRowMapper = (rs, rowNum) -> new Progetto(
            rs.getInt("IdProgetto"),
            rs.getString("NomeProgetto"),
            rs.getBoolean("Concluso"),
            rs.getDate("Deadline").toLocalDate());

    public ResponseEntity<List<Progetto>> getProjectsPerManager(Map<String, String> body) {
        Integer IdManager = Integer.parseInt(body.get("idUtente"));

        try {
            String sql = "SELECT p.* FROM Progetto p " +
                    "JOIN Coordinare c ON p.IdProgetto = c.IdProgetto " +
                    "WHERE c.IdManager = ?";

            List<Progetto> progetti = jdbc.query(sql, progettoRowMapper, IdManager);

            return ResponseEntity.ok(progetti);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    public ResponseEntity<String> addProject(Map<String, String> body) {
        try {
            String nomeProgetto = body.get("nomeProgetto");
            Date deadline = Date.valueOf(body.get("deadline"));
            Integer idManager = Integer.parseInt(body.get("idManager"));

            jdbc.update("INSERT INTO Progetto (NomeProgetto, Concluso, Deadline) VALUES (?, ?, ?)",
                    nomeProgetto, false, deadline);

            Integer idProgetto = jdbc.queryForObject("SELECT MAX(IdProgetto) FROM Progetto", Integer.class);

            jdbc.update("INSERT INTO Coordinare (IdProgetto, IdManager) VALUES (?, ?)", idProgetto, idManager);

            return ResponseEntity.ok("Progetto creato e assegnato al manager");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Errore nella creazione del progetto");
        }
    }

    public ResponseEntity<Void> deleteProgetto(@RequestBody Map<String, Integer> body) {
        Integer idProgetto = body.get("idProgetto");
        jdbc.update("DELETE FROM Progetto WHERE IdProgetto = ?", idProgetto);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<Void> toggleConcluso(@RequestBody Map<String, Object> body) {
        Integer idProgetto = Integer.parseInt(body.get("idProgetto").toString());
        Boolean concluso = Boolean.parseBoolean(body.get("concluso").toString());

        System.out.println(idProgetto);
        System.out.println(concluso);

        jdbc.update("UPDATE Progetto SET Concluso = ? WHERE IdProgetto = ?", concluso, idProgetto);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<List<Map<String, Object>>> statisticheProgetti() {
        String sql = """
                    SELECT
                        p.IdProgetto,
                        p.NomeProgetto,
                        SUM(EXTRACT(EPOCH FROM (e.OraFine - e.OraInizio)) / 3600) AS oreTotali
                    FROM Evento e
                    JOIN Progetto p ON e.IdProgetto = p.IdProgetto
                    WHERE e.Tipo = 'Lavoro' AND e.Approvato = TRUE
                    GROUP BY p.IdProgetto, p.NomeProgetto
                    ORDER BY oreTotali DESC
                """;

        List<Map<String, Object>> result = jdbc.queryForList(sql);
        return ResponseEntity.ok(result);
    }

}
