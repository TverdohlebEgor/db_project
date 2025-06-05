package it.unibo.db.progetto;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class UtenteRepository {
    private final JdbcTemplate jdbc;

    public UtenteRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Utente> utenteRowMapper = (rs, rowNum) -> new Utente(
            rs.getInt("IdUtente"),
            TipoUtente.valueOf(rs.getString("Tipo").toUpperCase()),
            rs.getString("Nome"),
            rs.getString("Cognome"),
            rs.getString("Email"),
            rs.getString("Password"),
            rs.getDate("DataDiNascita").toLocalDate(),
            rs.getString("Residenza"),
            rs.getDouble("RAL"),
            rs.getDate("DataDiAssunzione").toLocalDate(),
            TipoContratto.valueOf(normalizeContratto(rs.getString("TipoDiContratto"))));

    public List<Utente> findAll() {
        return jdbc.query("SELECT * FROM Utente", utenteRowMapper);
    }

    public Utente findById(int id) {
        return jdbc.queryForObject("SELECT * FROM Utente WHERE IdUtente = ?", utenteRowMapper, id);
    }

    public ResponseEntity<Utente> login(Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        try {
            Utente user = jdbc.queryForObject(
                    "SELECT * FROM Utente WHERE Email = ? AND Password = ?",
                    utenteRowMapper, email, password);
            return ResponseEntity.ok(user); // 200 OK + utente
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized senza corpo
        }
    }

    private static String normalizeContratto(String dbValue) {
        return dbValue.toUpperCase().replace(" ", "_");
    }
}
