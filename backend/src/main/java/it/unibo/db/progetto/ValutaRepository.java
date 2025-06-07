package it.unibo.db.progetto;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestBody;

@Repository

public class ValutaRepository {

    private final JdbcTemplate jdbc;

    public ValutaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Valuta> valutaRowMapper = (rs, rowNum) -> new Valuta(
            rs.getInt("IdValuta"),
            rs.getInt("IdAmministratore"),
            rs.getString("Nome"),
            rs.getString("Simbolo"));

    public ResponseEntity<Valuta> getValutaById(@RequestBody Map<String, String> body) {
        try {
            Integer idValuta = Integer.parseInt(body.get("idValuta"));
            String sql = "SELECT IdValuta, IdAmministratore, Nome, Simbolo FROM Valuta WHERE IdValuta = ?";
            Valuta valuta = jdbc.queryForObject(sql, valutaRowMapper, idValuta);
            return ResponseEntity.ok(valuta);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
