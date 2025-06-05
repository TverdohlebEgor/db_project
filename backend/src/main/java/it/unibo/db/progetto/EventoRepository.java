package it.unibo.db.progetto;

import org.springframework.jdbc.core.RowMapper;

import java.sql.Date;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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
}
