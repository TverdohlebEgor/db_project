import { useEffect, useState } from "react";
import { Button, Row, Col } from "react-bootstrap";


function ProjectMember({ progetto, member }) {
    const [isMember, setIsMember] = useState(false);

    const loadStatus = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/isUserAssignedToProject", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idUtente: member.idUtente,
                    idProgetto: progetto.idProgetto
                })
            });

            const text = await response.text();
            setIsMember(text === "Assegnato");
        } catch (err) {
            console.error("Errore nel caricamento dello stato del membro:", err);
        }
    };

    const handleToggleMembership = async () => {
        const url = isMember
            ? "http://localhost:8080/api/removeUserFromProject"
            : "http://localhost:8080/api/addUserToProject";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idUtente: member.idUtente,
                    idProgetto: progetto.idProgetto
                })
            });

            if (response.ok) {
                setIsMember(!isMember);
            } else {
                console.error("Operazione fallita");
            }
        } catch (err) {
            console.error("Errore durante l'operazione:", err);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    return (
      <Row
  className="border border-secondary rounded p-3 my-2 align-items-center shadow-sm"
  style={{ backgroundColor: "#fafafa" }}
>
  <Col xs={8}>
    <div className="fw-semibold fs-5">
      {member.nome} {member.cognome}
    </div>
    <small className="text-muted" style={{ fontSize: "0.9rem" }}>
      {member.email}
    </small>
  </Col>
  <Col xs={4} className="text-end">
    <Button
      variant={isMember ? "outline-danger" : "outline-success"}
      onClick={handleToggleMembership}
      size="sm"
    >
      {isMember ? "Rimuovi" : "Aggiungi"}
    </Button>
  </Col>
</Row>

    );
}

export default ProjectMember;
