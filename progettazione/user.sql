-- Visualizzare eventi (possono esserci più filtri)

SELECT *
FROM Evento

SELECT *
FROM Evento
WHERE IdUtente = ?
  AND Approvato IS NULL;




-- Inserisce una visualizzazione
INSERT INTO Visualizzare (IdComunicazione, IdUtente)
VALUES (?, ?);



-- La catena di eventi prevende che dopo aver inserito uno evento o rimborso spese, vada aggiunta una comunicazione e poi le immagini collegate ad essa
INSERT INTO Evento (
    Approvato,
    Data,
    Tipo,
    Straordinario,
    OraInizio,
    OraFine,
    IdUtente,
    IdProgetto,
    IdComunicazione
)
VALUES (?,?,?,?,?,?,?,?,?);


INSERT INTO RimborsoSpese (
    Approvato,
    Data,
    Importo,
    IdComunicazione,
    IdUtente,
    IdValuta
)
VALUES (?,?,?,?,?);


NSERT INTO Comunicazione (Tipo, Testo, IdProgetto)
VALUES (?,?,?); 
  

INSERT INTO Immagine (Immagini, IdComunicazione)
VALUES (?, ?);