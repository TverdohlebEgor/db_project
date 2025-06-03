CREATE TABLE Amministratore (
    IdAmministratore INT PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(100) NOT NULL
);

CREATE TABLE Utente (
    IdUtente INT PRIMARY KEY,
    Tipo VARCHAR(50),
    Nome VARCHAR(100),
    Cognome VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(100),
    DataDiNascita DATE,
    Residenza VARCHAR(255),
    RAL DECIMAL(10,2),
    DataDiAssunzione DATE,
    TipoDiContratto VARCHAR(100),
    IBAN VARCHAR(34),
    FerieAccumulate INT,
    IdManager INT,
    FOREIGN KEY (IdManager) REFERENCES Utente(IdUtente)
);

CREATE TABLE Progetto (
    IdProgetto INT PRIMARY KEY,
    NomeProgetto VARCHAR(100),
    Concluso BOOLEAN,
    Deadline DATE
);

CREATE TABLE Comunicazione (
    IdComunicazione INT PRIMARY KEY,
    Tipo VARCHAR(50),
    Testo TEXT,
    IdProgetto INT,
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto)
);

CREATE TABLE GiornataDiLavoro (
    IdGiornata INT PRIMARY KEY,
    Data DATE
);

CREATE TABLE Valuta (
    IdValuta INT PRIMARY KEY,
    IdAmministratore INT,
    Nome VARCHAR(50),
    Simbolo VARCHAR(10),
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
    Importo DECIMAL(10,2) NOT NULL,
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
    Data DATE NOT NULL,
    Tipo VARCHAR(8) CHECK(Tipo IN('Malattia','Ferie','Permesso','Lavoro')),
    Straordinario BOOLEAN,
    OraInizio TIME NOT NULL,
    OraFine TIME NOT NULL,
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
