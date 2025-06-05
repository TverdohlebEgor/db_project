package it.unibo.db.progetto;

import org.apache.catalina.connector.Response;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

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

    public List<Utente> findAllEmployees() {
        return jdbc.query("SELECT * FROM Utente WHERE Tipo = 'Dipendente'", utenteRowMapper);
    }

    public Utente findById(int id) {
        return jdbc.queryForObject("SELECT * FROM Utente WHERE IdUtente = ?", utenteRowMapper, id);
    }

    public ResponseEntity<List<Utente>> findAllEmployeesNotAssociatedWith(Map<String, String> body) {
        Integer IdManager = Integer.parseInt(body.get("idUtente"));
        List<Utente> employees = jdbc.query(
                "SELECT * FROM Utente WHERE IdUtente NOT IN (SELECT IdDipendente FROM Afferente WHERE IdManager = ?)  AND Tipo <> 'Manager' ",
                utenteRowMapper, IdManager);

        return ResponseEntity.ok(employees);
    }

    public ResponseEntity<Utente> login(Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        try {
            Utente user = jdbc.queryForObject(
                    "SELECT * FROM Utente WHERE Email = ? AND Password = ?",
                    utenteRowMapper, email, password);
            return ResponseEntity.ok(user);
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    public ResponseEntity<List<Utente>> findEmployeesOfManager(Map<String, String> body) {

        Integer IdManager = Integer.parseInt(body.get("idUtente"));
        List<Utente> employees = jdbc.query(
                "SELECT * FROM Utente JOIN Afferente ON Utente.IdUtente = Afferente.IdDipendente WHERE Afferente.IdManager = ?",
                utenteRowMapper, IdManager);

        return ResponseEntity.ok(employees);

    }

    public ResponseEntity<String> addEmployeeToManager(Map<String, String> body) {
        try {
            Integer IdManager = Integer.parseInt(body.get("idManager"));
            Integer IdDipendente = Integer.parseInt(body.get("idDipendente"));

            jdbc.update("INSERT INTO Afferente (IdManager,IdDipendente) VALUES (?,?)", IdManager, IdDipendente);

            return ResponseEntity.ok("aggiornati");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        }

    }

    public ResponseEntity<String> removeEmployeeFromManager(Map<String, String> body) {

        try {
            Integer idManager = Integer.parseInt(body.get("idManager"));
            Integer idDipendente = Integer.parseInt(body.get("idDipendente"));

            jdbc.update("DELETE FROM Afferente WHERE IdManager = ? AND IdDipendente = ?", idManager, idDipendente);

            return ResponseEntity.ok("aggiornati");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        }

    }

    public ResponseEntity<String> isUserAssignedToProject(Map<String, String> body) {
        try {
            Integer idProgetto = Integer.parseInt(body.get("idProgetto"));
            Integer idUtente = Integer.parseInt(body.get("idUtente"));

            String sql = "SELECT COUNT(*) FROM Attribuire WHERE IdProgetto = ? AND IdDipendente = ?";
            Integer count = jdbc.queryForObject(sql, Integer.class, idProgetto, idUtente);

            if (count != null && count > 0) {
                return ResponseEntity.ok("Assegnato");
            } else {
                return ResponseEntity.ok("Non assegnato");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Errore nella richiesta");
        }
    }

    public ResponseEntity<String> addUserToProject(Map<String, String> body) {
        try {
            Integer idProgetto = Integer.parseInt(body.get("idProgetto"));
            Integer idUtente = Integer.parseInt(body.get("idUtente"));

            jdbc.update("INSERT INTO Attribuire (IdProgetto, IdDipendente) VALUES (?, ?)", idProgetto, idUtente);

            return ResponseEntity.ok("Utente aggiunto al progetto");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Errore durante l'aggiunta");
        }
    }

    public ResponseEntity<String> removeUserFromProject(Map<String, String> body) {
        try {
            Integer idProgetto = Integer.parseInt(body.get("idProgetto"));
            Integer idUtente = Integer.parseInt(body.get("idUtente"));

            jdbc.update("DELETE FROM Attribuire WHERE IdProgetto = ? AND IdDipendente = ?", idProgetto, idUtente);

            return ResponseEntity.ok("Utente rimosso dal progetto");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Errore durante la rimozione");
        }
    }

    public List<Utente> findAllManagers() {
        return jdbc.query("SELECT * FROM Utente WHERE Tipo = 'Manager'", utenteRowMapper);
    }

    public ResponseEntity<String> addManagerToProject(Map<String, String> body) {
        try {
            Integer idProgetto = Integer.parseInt(body.get("idProgetto"));
            Integer idManager = Integer.parseInt(body.get("idManager"));

            jdbc.update("INSERT INTO Coordinare (IdProgetto, IdManager) VALUES (?, ?)", idProgetto, idManager);
            return ResponseEntity.ok("Manager aggiunto al progetto");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Errore durante l'aggiunta del manager al progetto");
        }
    }

    public ResponseEntity<String> removeManagerFromProject(Map<String, String> body) {
        try {
            Integer idProgetto = Integer.parseInt(body.get("idProgetto"));
            Integer idManager = Integer.parseInt(body.get("idManager"));

            jdbc.update("DELETE FROM Coordinare WHERE IdProgetto = ? AND IdManager = ?", idProgetto, idManager);
            return ResponseEntity.ok("Manager rimosso dal progetto");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Errore durante la rimozione del manager dal progetto");
        }
    }

    public ResponseEntity<String> isManagerAssignedToProject(Map<String, String> body) {
        try {
            Integer idProgetto = Integer.parseInt(body.get("idProgetto"));
            Integer idManager = Integer.parseInt(body.get("idManager"));

            String sql = "SELECT COUNT(*) FROM Coordinare WHERE IdProgetto = ? AND IdManager = ?";
            Integer count = jdbc.queryForObject(sql, Integer.class, idProgetto, idManager);

            if (count != null && count > 0) {
                return ResponseEntity.ok("Assegnato");
            } else {
                return ResponseEntity.ok("Non assegnato");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Errore nella richiesta");
        }
    }

    private static String normalizeContratto(String dbValue) {
        return dbValue.toUpperCase().replace(" ", "_");
    }
}
