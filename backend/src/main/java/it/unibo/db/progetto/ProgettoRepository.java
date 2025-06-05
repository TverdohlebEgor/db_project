package it.unibo.db.progetto;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

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
}
