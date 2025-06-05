

function UserRow({ utente }) {
    return (
        <div className="user-card" style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
            <h4>{utente.nome} {utente.cognome}</h4>
            <p>Email: {utente.email}</p>
        </div>
    );
}

export default UserRow;