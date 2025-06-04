package it.unibo.db.progetto;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

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
        TipoContratto.valueOf(normalizeContratto(rs.getString("TipoDiContratto")))
    );

	
    public List<Utente> findAll() {
        return jdbc.query("SELECT * FROM Utente", utenteRowMapper);
    }

    public Utente findById(int id) {
        return jdbc.queryForObject("SELECT * FROM Utente WHERE IdUtente = ?", utenteRowMapper, id);
    }
	

    private static String normalizeContratto(String dbValue) {
        return dbValue.toUpperCase().replace(" ", "_");
    }
}
