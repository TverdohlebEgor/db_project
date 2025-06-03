INSERT INTO Utente (
    Tipo, Nome, Cognome, Email, Password, DataDiNascita, Residenza,
    RAL, DataDiAssunzione, TipoDiContratto, IBAN, FerieAccumulate, IdManager
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);


INSERT INTO Valuta (IdAmministratore, Nome, Simbolo)
VALUES (?, ?, ?);

