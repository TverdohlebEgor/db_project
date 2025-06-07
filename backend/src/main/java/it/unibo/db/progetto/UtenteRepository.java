package it.unibo.db.progetto;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;
import java.util.Objects;
import java.sql.PreparedStatement;
import java.sql.Statement;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

import java.time.LocalDate;
import java.sql.Date;
import java.sql.Time;

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

    private final RowMapper<Progetto> progettoRowMapper = (rs, rowNum) -> new Progetto(
            rs.getInt("IdProgetto"),
            rs.getString("nomeProgetto"),
            rs.getBoolean("concluso"),
            rs.getDate("deadline").toLocalDate()
    );

    private final RowMapper<Valuta> valutaRowMapper = (rs, rowNum) -> new Valuta(
            rs.getInt("idValuta"),
            rs.getInt("idAmministratore"),
            rs.getString("nome"),
            rs.getString("simbolo")
    );

    private final RowMapper<RimborsoSpeseDisplay> rimborsoSpeseRowMapper = (rs, rowNum) -> new RimborsoSpeseDisplay(
            rs.getInt("idRimborso"),
            rs.getBoolean("approvato"),
            rs.getDouble("importo"),
            rs.getString("testo"),
            rs.getString("nome")
    );

    private final RowMapper<Evento> eventoRowMapper = (rs, rowNum) -> new Evento(
            rs.getInt("IdEvento"),
            rs.getBoolean("Approvato"),
            rs.getDate("Data").toLocalDate(),
            TipoEvento.valueOf(normalizeContratto(rs.getString("Tipo"))),
            rs.getBoolean("Straordinario"),
            rs.getTime("OraInizio").toLocalTime(),
            rs.getTime("OraFine").toLocalTime(),
            rs.getInt("IdUtente"),
            rs.getInt("IdProgetto"),
            rs.getInt("IdComunicazione")
    );

    private final RowMapper<EventoDisplay> eventoDisplayRowMapper = (rs, rowNum) -> new EventoDisplay(
            rs.getInt("IdEvento"),
            rs.getString("Approvato"),
            rs.getDate("Data").toLocalDate(),
            TipoEvento.valueOf(normalizeContratto(rs.getString("Tipo"))),
            rs.getBoolean("Straordinario"),
            rs.getTime("OraInizio").toLocalTime(),
            rs.getTime("OraFine").toLocalTime(),
            rs.getString("nomeProgetto"),
            rs.getString("testo")
    );

    public List<Utente> findAll() {
        return jdbc.query("SELECT * FROM Utente", utenteRowMapper);
    }

    public List<Valuta> getAllValute() {
        return jdbc.query("SELECT * FROM Valuta", valutaRowMapper);
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

    public ResponseEntity<Boolean> addEvent(
            String date,
            String type,
            boolean overtime,
            String hourStart,
            String hourEnd,
            String nomeProgetto,
            int idDipendente,
            String message,
            List<MultipartFile> images
    ) {
        List<Progetto> temp = jdbc.query("SELECT * FROM PROGETTO WHERE nomeProgetto = ?",progettoRowMapper,nomeProgetto);
        if(temp.isEmpty()){
            return ResponseEntity.badRequest().body(false);
        }
        int idProgetto = temp.getFirst().idProgetto();
        int generatedComunicazioneId = insertMessage("Richiesta",message,idProgetto);
        insertImmages(images,generatedComunicazioneId);

        String addEventoQuery = "INSERT INTO Evento (\n" +
                "    Approvato,\n" +
                "    Data,\n" +
                "    Tipo,\n" +
                "    Straordinario,\n" +
                "    OraInizio,\n" +
                "    OraFine,\n" +
                "    IdUtente,\n" +
                "    IdProgetto,\n" +
                "    IdComunicazione\n" +
                ")\n" +
                "VALUES (?,?,?,?,?,?,?,?,?);";
        String finalType = convertType(type);
        Time finalHourStart = (hourStart == null || hourStart.isEmpty()) ? Time.valueOf("00:00:00")
                : Time.valueOf(hourStart + ":00");
        Time finalHourEnd = (hourEnd == null || hourEnd.isEmpty()) ? Time.valueOf("23:59:59")
                : Time.valueOf(hourEnd + ":00");
        jdbc.update(addEventoQuery,
                null,
                Date.valueOf(date),
                finalType,
                overtime,
                finalHourStart,
                finalHourEnd,
                idDipendente,
                idProgetto,
                generatedComunicazioneId);

        return ResponseEntity.ok(true);
    }

    public ResponseEntity<Boolean> addRimborso(
            String date,
            double importo,
            String message,
            int idDipendente,
            String idValuta,
            List<MultipartFile> images) {
        int generatedComunicazioneId = insertMessage("Richiesta", message);
        insertImmages(images, generatedComunicazioneId);
        jdbc.update("INSERT INTO RimborsoSpese (" +
                "Approvato," +
                "Data," +
                "Importo," +
                "IdComunicazione," +
                "IdUtente," +
                "IdValuta)" +
                " VALUES (?,?,?,?,?,?)",
                false,
                Date.valueOf(date),
                importo,
                generatedComunicazioneId,
                idDipendente,
                Integer.parseInt(idValuta));
        return ResponseEntity.ok(true);
    }

    public List<Progetto> getProgetti() {
        return jdbc.query("SELECT * FROM PROGETTO AS p WHERE (\n" +
                "\tp.idProgetto IN (SELECT idProgetto FROM Attribuire AS a WHERE a.idProgetto = p.idProgetto)\n" +
                ")",progettoRowMapper);
    }

    public List<EventoDisplay> getEventiDipendentne(String date, int idDipendente) {
        String selectEventoQuery = "SELECT E.IdEvento, E.approvato, E.data, E.tipo" +
                ", E.straordinario, E.oraInizio, E.oraFine, P.nomeProgetto, C.testo " +
                "FROM EVENTO AS E,  " +
                "COMUNICAZIONE AS C, " +
                "PROGETTO AS P " +
                "WHERE Data = ? " +
                "AND idUtente = ? " +
                "AND E.idProgetto = P.idProgetto " +
                "AND E.idComunicazione = C.idComunicazione";

        List<EventoDisplay> eventi = jdbc.query(
                selectEventoQuery,
                eventoDisplayRowMapper,
                Date.valueOf(date), // This is already a java.sql.Date
                idDipendente // This is already an int
        );

        return eventi;
    }

    public List<RimborsoSpeseDisplay> getRimborsiDipendente(String date,int idDipendente) {
        String selectEventoQuery = "SELECT R.idRimborso, R.approvato, R.importo, C.testo, V.nome " +
                "FROM RIMBORSOSPESE AS R,  " +
                "COMUNICAZIONE AS C, " +
                "VALUTA AS V "+
                "WHERE Data = ? " +
                "AND idUtente = ? " +
                "AND R.idComunicazione = C.idComunicazione "+
                "AND R.idValuta = V.idValuta";
        List<RimborsoSpeseDisplay> eventi = jdbc.query(
                selectEventoQuery,
                rimborsoSpeseRowMapper,
                Date.valueOf(date),     // This is already a java.sql.Date
                idDipendente            // This is already an int
        );

        return eventi;
    }

    public boolean deleteEvento(int eventoId){
        try {
            jdbc.update("DELETE FROM EVENTO WHERE IdEvento = " + eventoId);
            return true;
        } catch (java.lang.Exception e) {
            return false;
        }
    }
    public boolean deleteRimborso(String rimborsoId){
        try {
            jdbc.update("DELETE FROM RIMBORSOSPESE WHERE IdRimborso = " + rimborsoId);
            return true;
        } catch (java.lang.Exception e) {
            return false;
        }
    }

    private static String normalizeContratto(String dbValue) {
        return dbValue.toUpperCase().replace(" ", "_");
    }

    private String convertType(String type){
        return switch (type){
            case "Work" -> "Lavoro";
            case "Holiday" -> "Ferie";
            case "Permission" -> "Permesso";
            case "Sickness" -> "Malattia";
            default -> "Lavoro";
        };
    }

    private int insertMessage(String tipo, String message, int idProgetto){
        String addMessageQuery = "INSERT INTO  Comunicazione (Tipo, Testo, IdProgetto) VALUES (?,?,?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(addMessageQuery, new String[]{"idcomunicazione"});
            ps.setString(1, tipo);
            ps.setString(2, message);
            ps.setInt(3, idProgetto);
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }
    private int insertMessage(String tipo, String message){
        String addMessageQuery = "INSERT INTO  Comunicazione (Tipo, Testo) VALUES (?,?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(addMessageQuery, new String[]{"idcomunicazione"});
            ps.setString(1, tipo);
            ps.setString(2, message);
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }

    private void insertImmages(List<MultipartFile> images, int IdComunicazione){
        if (images != null && !images.isEmpty()) {
            String insertImageQuery = "INSERT INTO Immagine (Immagini, IdComunicazione) VALUES (?, ?)";
            for (MultipartFile image : images) {
                try {
                    byte[] imageData = image.getBytes();
                    jdbc.update(insertImageQuery, imageData, IdComunicazione);
                } catch (Exception e) {
                    System.err.println("Error inserting image : " + e.getMessage());
                }
            }
        } else {
            System.out.println("No images provided for insertion.");
        }
    }

}
