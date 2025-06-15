package it.unibo.db.progetto;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;
import java.util.Objects;
import java.sql.PreparedStatement;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import java.time.LocalDate;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.math.RoundingMode;

import java.sql.Date;
import java.sql.Time;

@Repository
public class UtenteRepository {
    private final JdbcTemplate jdbc;

    public UtenteRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Amministratore> amministratoreRowMapper = (rs, rowNum) -> new Amministratore(
            rs.getInt("idAmministratore"),
            rs.getString("email"),
            rs.getString("password"));

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
            rs.getDate("deadline").toLocalDate());

    private final RowMapper<Valuta> valutaRowMapper = (rs, rowNum) -> new Valuta(
            rs.getInt("idValuta"),
            rs.getInt("idAmministratore"),
            rs.getString("nome"),
            rs.getString("simbolo"));

    private final RowMapper<RimborsoSpeseDisplay> rimborsoSpeseRowMapper = (rs, rowNum) -> {
        boolean approvatoPrimitive = rs.getBoolean("approvato");
        Boolean approvato = rs.wasNull() ? null : approvatoPrimitive;

        return new RimborsoSpeseDisplay(
                rs.getInt("idRimborso"),
                approvato, // Use the Boolean object that can be null
                rs.getDouble("importo"),
                rs.getString("testo"),
                rs.getString("nome"));
    };

    private final RowMapper<EventoDisplay> eventoDisplayRowMapper = (rs, rowNum) -> new EventoDisplay(
            rs.getInt("IdEvento"),
            rs.getString("Approvato"),
            rs.getDate("Data").toLocalDate(),
            TipoEvento.valueOf(normalizeContratto(rs.getString("Tipo"))),
            rs.getBoolean("Straordinario"),
            rs.getTime("OraInizio").toLocalTime(),
            rs.getTime("OraFine").toLocalTime(),
            rs.getString("nomeProgetto"),
            rs.getString("testo"));

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

    public ResponseEntity<Amministratore> amministratoreLogin(Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        try {
            Amministratore user = jdbc.queryForObject(
                    "SELECT * FROM Amministratore WHERE Email = ? AND Password = ?",
                    amministratoreRowMapper, email, password);
            return ResponseEntity.ok(user);
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    public ResponseEntity<Boolean> addUtente(Map<String, String> body) {
        try {
            LocalDate dataDiNascita = LocalDate.parse((String) body.get("dataDiNascita"));
            LocalDate dataDiAssunzione = LocalDate.parse((String) body.get("dataDiAssunzione"));
            BigDecimal ral = new BigDecimal(String.valueOf(body.get("ral")));
            ral = ral.setScale(2, RoundingMode.HALF_UP);
            System.out.println(ral);
            String sql = "INSERT INTO Utente (" +
                    "Tipo, Nome, Cognome, Email, Password, DataDiNascita, Residenza, RAL, DataDiAssunzione, TipoDiContratto, IBAN, FerieAccumulate"
                    +
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            jdbc.update(sql,
                    body.get("tipo"),
                    body.get("nome"),
                    body.get("cognome"),
                    body.get("email"),
                    body.get("password"),
                    dataDiNascita,
                    body.get("residenza"),
                    ral,
                    dataDiAssunzione,
                    body.get("tipoDiContratto"),
                    body.get("iban"),
                    0.0);
            return ResponseEntity.ok(true);
        } catch (java.lang.Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

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

    public ResponseEntity<Boolean> addValuta(Map<String, String> body) {
        try {
            jdbc.update("INSERT INTO VALUTA (idAmministratore,nome,simbolo) VALUES (?,?,?)",
                    Integer.valueOf(body.get("id")),
                    body.get("code"),
                    body.get("symbol"));
            return ResponseEntity.ok(true);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        }
    }

    public ResponseEntity<Boolean> updateEventi() {
        LocalDate cutoffDate = LocalDate.now().minusDays(14);
        System.out.println(Date.valueOf(cutoffDate));

        jdbc.update("UPDATE Evento SET Approvato = TRUE WHERE Data <= ?", Date.valueOf(cutoffDate));

        return ResponseEntity.ok(true);
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
            List<MultipartFile> images) {
        List<Progetto> temp = jdbc.query("SELECT * FROM PROGETTO WHERE nomeProgetto = ?", progettoRowMapper,
                nomeProgetto);
        if (temp.isEmpty()) {
            return ResponseEntity.badRequest().body(false);
        }
        int idProgetto = temp.getFirst().idProgetto();
        int generatedComunicazioneId = insertMessage("Richiesta", message, idProgetto);
        insertImmages(images, generatedComunicazioneId);

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
        Time finalHourStart = (hourStart == null || hourStart.isEmpty()) ? Time.valueOf("00:00:00")
                : Time.valueOf(hourStart + ":00");
        Time finalHourEnd = (hourEnd == null || hourEnd.isEmpty()) ? Time.valueOf("23:59:59")
                : Time.valueOf(hourEnd + ":00");
        jdbc.update(addEventoQuery,
                null,
                Date.valueOf(date),
                type,
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
                null,
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
                ")", progettoRowMapper);
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

    public List<RimborsoSpeseDisplay> getRimborsiDipendente(String date, int idDipendente) {
        String selectEventoQuery = "SELECT R.idRimborso, R.approvato, R.importo, C.testo, V.nome " +
                "FROM RIMBORSOSPESE AS R,  " +
                "COMUNICAZIONE AS C, " +
                "VALUTA AS V " +
                "WHERE Data = ? " +
                "AND idUtente = ? " +
                "AND R.idComunicazione = C.idComunicazione " +
                "AND R.idValuta = V.idValuta";
        List<RimborsoSpeseDisplay> eventi = jdbc.query(
                selectEventoQuery,
                rimborsoSpeseRowMapper,
                Date.valueOf(date), // This is already a java.sql.Date
                idDipendente // This is already an int
        );

        return eventi;
    }

    public boolean deleteEvento(int eventoId) {
        try {
            jdbc.update("DELETE FROM EVENTO WHERE IdEvento = " + eventoId);
            return true;
        } catch (java.lang.Exception e) {
            return false;
        }
    }

    public boolean deleteRimborso(String rimborsoId) {
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

    private int insertMessage(String tipo, String message, int idProgetto) {
        String addMessageQuery = "INSERT INTO  Comunicazione (Tipo, Testo, IdProgetto) VALUES (?,?,?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(addMessageQuery, new String[] { "idcomunicazione" });
            ps.setString(1, tipo);
            ps.setString(2, message);
            ps.setInt(3, idProgetto);
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }

    private int insertMessage(String tipo, String message) {
        String addMessageQuery = "INSERT INTO  Comunicazione (Tipo, Testo) VALUES (?,?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(addMessageQuery, new String[] { "idcomunicazione" });
            ps.setString(1, tipo);
            ps.setString(2, message);
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }

    private void insertImmages(List<MultipartFile> images, int IdComunicazione) {
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

    public ResponseEntity<Utente> getUtenteById(Map<String, Integer> body) {
        int idUtente = body.get("idUtente");

        String sql = "SELECT * FROM Utente WHERE IdUtente = ?";
        return ResponseEntity.ok(jdbc.queryForObject(sql, utenteRowMapper, idUtente));
    }

    public ResponseEntity<List<Utente>> getStatisticheFerieAccumulate() {
        String sql = """
                    SELECT *
                    FROM Utente
                    WHERE FerieAccumulate > 30 * 24 * 60
                    ORDER BY FerieAccumulate DESC
                """;

        List<Utente> utenti = jdbc.query(sql, utenteRowMapper);
        return ResponseEntity.ok(utenti);
    }

    public ResponseEntity<?> aggiornaFerie(@RequestBody Map<String, Integer> body) {
        try {
            int idEvento = body.get("idEvento");

            String sqlEvento = """
                        SELECT Tipo, Approvato, OraInizio, OraFine, IdUtente
                        FROM Evento
                        WHERE IdEvento = ?
                    """;

            Map<String, Object> evento = jdbc.queryForMap(sqlEvento, idEvento);

            if (!Boolean.TRUE.equals(evento.get("Approvato"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Evento non approvato.");
            }

            if (!"Lavoro".equalsIgnoreCase((String) evento.get("Tipo"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Evento non di lavoro");
            }

            Time inizio = (Time) evento.get("OraInizio");
            Time fine = (Time) evento.get("OraFine");

            long inizioMillis = inizio.getTime();
            long fineMillis = fine.getTime();

            // Gestione evento che passa la mezzanotte
            if (fineMillis <= inizioMillis) {
                fineMillis += 24 * 60 * 60 * 1000;
            }

            long minutiLavorati = (fineMillis - inizioMillis) / (1000 * 60);

            if (minutiLavorati <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Durata evento non valida.");
            }

            double moltiplicatore = 0.1;
            int minutiFerie = (int) Math.round(minutiLavorati * moltiplicatore);

            int idUtente = (int) evento.get("IdUtente");

            String sqlUpdate = """
                        UPDATE Utente
                        SET FerieAccumulate = FerieAccumulate + ?
                        WHERE IdUtente = ?
                    """;

            jdbc.update(sqlUpdate, minutiFerie, idUtente);

            return ResponseEntity.ok("Ferie aggiornate con successo: +" + minutiFerie + " minuti");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore nel calcolo ferie: " + e.getMessage());
        }
    }

}
