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


INSERT INTO Affarente (IdManager,IdDipedente)
VALUES (?,?)

-- Approvazione rimborso
UPDATE RimborsoSpese
SET Approvato = TRUE
WHERE IdRimborso = ?;


SELECT *
FROM RimborsoSpese
WHERE IdUtente = 42
  AND Approvato IS NULL;

SELECT *
FROM RimborsoSpese
WHERE IdUtente = ?
  AND Approvato IS NULL;

-- Approvazione evento
UPDATE Evento
SET Approvato = TRUE
WHERE IdEvento = ?;

SELECT *
FROM Evento
WHERE IdUtente = ?
  AND Approvato IS NULL;
