ISTRUZIONI PER L'ESECUZIONE DEL PROGETTO

INSTALLAZIONE DI POSTGRESQL E PGADMIN 4

Per eseguire il progetto è necessario installare PostgreSQL dal seguente link:

https://www.postgresql.org/download/

Durante l’installazione, assicurarsi di includere pgAdmin 4 tra i componenti selezionati.

Quando richiesto, impostare la password "12345"

Lasciare la porta di default 5432

CONFIGURAZIONE DEL DATABASE CON PGADMIN 4

Dopo l’installazione:

Avviare pgAdmin4

Nella barra a sinistra, cliccare su "Servers (1)"

Inserire la password "12345"

Clic con il tasto destro su "PostgreSQL 17" > Create > Database

Creare un database chiamato "db_project"

Usare la stessa password "12345" se richiesta

Per caricare i dati demo:

Tasto destro su "db_project" > Restore

In "Filename" selezionare il file "esempio.sql" presente nella cartella del progetto

Assicurarsi che il filtro in basso a destra mostri i file .sql

INSTALLAZIONE DEL FRONTEND

Scaricare e installare Node.js da:

https://nodejs.org/en/download

AVVIO DEL BACKEND

Aprire un terminale, entrare nella cartella "backend" del progetto ed eseguire:

./gradlew bootRun (da powershell)

Nota: per modificare credenziali o nomi del database, aggiornare il file:

backend/src/main/resources/application.properties

AVVIO DEL FRONTEND

Entrare nella cartella "frontend"

Eseguire: npm install (non da powershell)

Poi: npm run dev

Verrà mostrato l’indirizzo per accedere all’applicativo web.

UTENTI PRESENTI NEL DATABASE

Nel database sono già presenti alcuni utenti dimostrativi:

Admin:
a@primo

Manager:
angelo@rossi

Dipendenti:
roberto@ricci
chiara@moretti

Tutti gli utenti hanno la password: 1234

In generale durante i test si ricorda di non inserire immagini troppo pesanti in quanto non supportate

