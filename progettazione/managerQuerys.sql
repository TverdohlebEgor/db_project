-- Creazione progetto
INSERT INTO Progetto (NomeProgetto, Concluso, Deadline)
VALUES (?, ?, ?);

-- Coordinamento progetto da parte del manager
INSERT INTO Coordinare (IdProgetto, IdManager)
VALUES (?, ?);

-- Assegnazione dipendente al progetto
INSERT INTO Attribuire (IdProgetto, IdDipedente)
VALUES (?, ?);

-- Scrittura comunicazione
INSERT INTO Comunicazione (Tipo, Testo, IdProgetto)
VALUES (?, ?, ?);


INSERT INTO Immagine (Immagini, IdComunicazione)
VALUES (?, ?);
---Per ogni immagine nella comunicazione va inserita con l'IdComunicazione relativo


INSERT INTO Afferente (IdManager,IdDipedente)
VALUES (?,?)

-- Approvazione rimborso
UPDATE RimborsoSpese
SET Approvato = TRUE
WHERE IdRimborso = ?;



-- Visualizzare rimborsi spese (possono esserci più filtri)

SELECT *
FROM RimborsoSpese

SELECT *
FROM RimborsoSpese
WHERE IdUtente = ?
  AND Approvato IS NULL;

SELECT *
FROM RimborsoSpese
WHERE IdUtente = ?
  AND Approvato IS NULL;

-- Approvazione evento
UPDATE Evento
SET Approvato = TRUE
WHERE IdEvento = ?;

-- Visualizzare eventi (possono esserci più filtri)

SELECT *
FROM Evento

SELECT *
FROM Evento
WHERE IdUtente = ?
  AND Approvato IS NULL;


-- Prendere poi la comunicazioni con relative imamgine, valutare una Join

SELECT *
FROM Comunicazione
WHERE IdComunicazione = X;  


SELECT *
FROM Immagine
WHERE IdComunicazione = X;  



-- Visualizzare dipendenti (sia quelli suoi(per vedere chi poter aggiungere), che quelli non suoi)

SELECT *
FROM Dipendente


SELECT *
FROM Utente
JOIN Afferente ON Utente.IdUtente = Afferente.IdDipendente
WHERE Afferente.IdManager = ?;