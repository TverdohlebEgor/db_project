CREATE TABLE Amministratore (
    IdAmministratore SERIAL   PRIMARY KEY ,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(100) NOT NULL
);

CREATE TABLE Utente (
    IdUtente  SERIAL PRIMARY KEY,
    Tipo VARCHAR(10) NOT NULL CHECK(Tipo IN ('Dipendente', 'Manager')),
    Nome VARCHAR(100) NOT NULL,
    Cognome VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(100) NOT NULL,
    DataDiNascita DATE NOT NULL ,
    Residenza VARCHAR(255) NOT NULL,
    RAL DECIMAL(10,2) NOT NULL,
    DataDiAssunzione DATE NOT NULL,
    TipoDiContratto VARCHAR(13) NOT NULL CHECK(TipoDiContratto IN ('FullTime', 'PartTime','Stage','Apprendistato')),
    IBAN VARCHAR(27) CHECK(LENGTH(IBAN)=27),
    FerieAccumulate INT NOT NULL
);

CREATE TABLE Progetto (
    IdProgetto  SERIAL PRIMARY KEY,
    NomeProgetto VARCHAR(100) NOT NULL,
    Concluso BOOLEAN NOT NULL,
    Deadline DATE NOT NULL
);

CREATE TABLE Comunicazione (
    IdComunicazione  SERIAL PRIMARY KEY,
    Tipo VARCHAR(9) NOT NULL CHECK(Tipo IN ('Progetto', 'Forum','Richiesta')),
    Testo TEXT NOT NULL,
    IdProgetto INT NOT NULL,
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto) ON DELETE CASCADE
);

CREATE TABLE GiornataDiLavoro (
    IdGiornata  SERIAL PRIMARY KEY,
    Data DATE NOT NULL
);

CREATE TABLE Valuta (
    IdValuta  SERIAL PRIMARY KEY,
    IdAmministratore INT NOT NULL,
    Nome VARCHAR(3) NOT NULL CHECK(LENGTH(Nome)=3),
    Simbolo VARCHAR(1) CHECK(LENGTH(Simbolo)=1),
    FOREIGN KEY (IdAmministratore) REFERENCES Amministratore(IdAmministratore) ON DELETE SET NULL
);

CREATE TABLE Immagine (
    IdImmagine  SERIAL PRIMARY KEY,
    Immagini BYTEA NOT NULL,
    IdComunicazione INT,
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione) ON DELETE CASCADE
);

CREATE TABLE RimborsoSpese (
    IdRimborso  SERIAL PRIMARY KEY,
    Approvato BOOLEAN,
    Data DATE NOT NULL,
    Importo DECIMAL(10,2) NOT NULL,
    IdComunicazione INT,
    IdUtente INT,
    IdValuta INT,
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione)  ON DELETE SET NULL,
    FOREIGN KEY (IdUtente) REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    FOREIGN KEY (IdValuta) REFERENCES Valuta(IdValuta)  ON DELETE SET NULL
);

CREATE TABLE Evento (
    IdEvento  SERIAL PRIMARY KEY,
    Approvato BOOLEAN,
    Data DATE NOT NULL,
    Tipo VARCHAR(8) CHECK(Tipo IN('Malattia','Ferie','Permesso','Lavoro')),
    Straordinario BOOLEAN,
    OraInizio TIME NOT NULL,
    OraFine TIME NOT NULL,
    IdUtente INT,
    IdProgetto INT,
    IdComunicazione INT,
    FOREIGN KEY (IdUtente) REFERENCES Utente(IdUtente) ON DELETE CASCADE,
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto) ON DELETE SET NULL,
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione) ON DELETE SET NULL
);

CREATE TABLE Visualizzare (
    IdComunicazione INT,
    IdUtente INT,
    PRIMARY KEY (IdComunicazione, IdUtente),
    FOREIGN KEY (IdComunicazione) REFERENCES Comunicazione(IdComunicazione) ON DELETE CASCADE,
    FOREIGN KEY (IdUtente) REFERENCES Utente(IdUtente) ON DELETE CASCADE
);

CREATE TABLE Attribuire (
    IdProgetto INT,
    IdDipedente INT,
    PRIMARY KEY (IdProgetto, IdDipedente),
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto) ON DELETE CASCADE,
    FOREIGN KEY (IdDipedente) REFERENCES Utente(IdUtente) ON DELETE CASCADE
);

CREATE TABLE Coordinare (
    IdProgetto INT,
    IdManager INT,
    PRIMARY KEY (IdProgetto, IdManager),
    FOREIGN KEY (IdProgetto) REFERENCES Progetto(IdProgetto) ON DELETE CASCADE,
    FOREIGN KEY (IdManager) REFERENCES Utente(IdUtente) ON DELETE CASCADE
);

CREATE TABLE Formare (
    IdEvento INT,
    IdGiornata INT,
    PRIMARY KEY (IdEvento, IdGiornata),
    FOREIGN KEY (IdEvento) REFERENCES Evento(IdEvento) ON DELETE CASCADE,
    FOREIGN KEY (IdGiornata) REFERENCES GiornataDiLavoro(IdGiornata) ON DELETE CASCADE
);


CREATE TABLE Afferente (
    IdManager INT,
    IdDipedente INT,
    PRIMARY KEY (IdManager, IdDipedente),
    FOREIGN KEY (IdDipedente) REFERENCES Dipendente(IdDipedente) ON DELETE CASCADE,
    FOREIGN KEY (IdManager) REFERENCES Manager(IdManager) ON DELETE CASCADE
);

