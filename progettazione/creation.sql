CREATE TABLE Amministratore (
    IdAmministratore INT PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(100) NOT NULL
);

CREATE TABLE Utente (
    IdUtente INT PRIMARY KEY,
    Tipo VARCHAR(10) NOT NULL CHECK(Tipo IN ('Dipendente', 'Manager')),
    Nome VARCHAR(100) NOT NULL,
    Cognome VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(100) NOT NULL,
    DataDiNascita DATE NOT NULL ,
    Residenza VARCHAR(255) NOT NULL,
    RAL DECIMAL(10,2) NOT NULL,
    DataDiAssunzione DATE NOT NULL,
    TipoDiContratto VARCHAR(13) NOT NULL CHECK(TipoDiContratto IN ('FullTime', 'PartTime',"Stage","Apprendistato")),
    IBAN VARCHAR(27) CHECK(LEN(CAP)=27),
    FerieAccumulate INT NOT NULL,
    IdManager INT OT NULL,
    FOREIGN KEY (IdManager) REFERENCES Utente(IdUtente)
);

CREATE TABLE Progetto (
    IdProgetto INT PRIMARY KEY,
    NomeProgetto VARCHAR(100) NOT NULL,
    Concluso BOOLEAN NOT NULL,
    Deadline DATE NOT NULL
);

CREATE TABLE Comunicazione (
    IdComunicazione INT PRIMARY KEY,
    Tipo VARCHAR(8) NOT NULL CHECK(Tipo IN ('Progetto', 'Forum')),
    Testo TEXT NOT NULL,
    IdProgetto INT NOT NULL,
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto)
);

CREATE TABLE GiornataDiLavoro (
    IdGiornata INT PRIMARY KEY,
    Data DATE NOT NULL
);

CREATE TABLE Valuta (
    IdValuta INT PRIMARY KEY,
    IdAmministratore INT NOT NULL,
    Nome VARCHAR(3) NOT NULL CHECK(LEN(Nome)=3),
    Simbolo VARCHAR(1) CHECK(LEN(Nome)=1),,
    FOREIGN KEY (IdAmministratore) REFERENCES Amministratore(IdAmministratore)
);

CREATE TABLE ArchivioImmagini (
    IdImmagini INT PRIMARY KEY,
    Immagini BLOB,
    IdComunicazione INT,
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione)
);

CREATE TABLE RimborsoSpese (
    IdRimborso INT PRIMARY KEY,
    Approvato BOOLEAN,
    Data DATE,
    Importo DECIMAL(10,2),
    IdComunicazione INT,
    IdUtente INT,
    IdValuta INT,
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione),
    FOREIGN KEY (IdUtente) REFERENCES Utente(IdUtente),
    FOREIGN KEY (IdValuta) REFERENCES Valuta(IdValuta)
);

CREATE TABLE Evento (
    IdEvento INT PRIMARY KEY,
    Approvato BOOLEAN,
    Data DATE,
    Tipo VARCHAR(100),
    Straordinario BOOLEAN,
    OraInizio TIME,
    OraFine TIME,
    IdUtente INT,
    IdProgetto INT,
    IdComunicazione INT,
    FOREIGN KEY (IdUtente) REFERENCES Utente(IdUtente),
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto),
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione)
);

CREATE TABLE Visualizzare (
    IdComunicazione INT,
    IdUtente INT,
    PRIMARY KEY (IdComunicazione, IdUtente),
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione),
    FOREIGN KEY (IdUtente) REFERENCES Utente(IdUtente)
);

CREATE TABLE Attribuire (
    IdProgetto INT,
    IdDipedente INT,
    PRIMARY KEY (IdProgetto, IdDipedente),
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto),
    FOREIGN KEY (IdDipedente) REFERENCES Utente(IdUtente)
);

CREATE TABLE Coordinare (
    IdProgetto INT,
    IdManager INT,
    PRIMARY KEY (IdProgetto, IdManager),
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto),
    FOREIGN KEY (IdManager) REFERENCES Utente(IdUtente)
);

CREATE TABLE Formare (
    IdEvento INT,
    IdGiornata INT,
    PRIMARY KEY (IdEvento, IdGiornata),
    FOREIGN KEY (IdEvento) REFERENCES Evento(IdEvento),
    FOREIGN KEY (IdGiornata) REFERENCES GiornataDiLavoro(IdGiornata)
);
