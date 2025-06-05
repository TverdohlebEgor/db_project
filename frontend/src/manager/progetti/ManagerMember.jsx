import { Button, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";

function ManagerMember({ manager, idProgetto, refreshList }) {
    const [loading, setLoading] = useState(false);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        const checkIfMember = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/isManagerAssignedToProject", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idProgetto, idManager: manager.idUtente }),
                });
                if (response.ok) {
                    const text = await response.text();
                    setIsMember(text === "Assegnato");
                } else {
                    console.error("Errore nel controllo assegnazione manager");
                }
            } catch (err) {
                console.error("Errore nel controllo assegnazione manager:", err);
            }
        };

        checkIfMember();
    }, [idProgetto, manager.idUtente]);

    const addManagerToProject = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/addManagerToProject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idProgetto, idManager: manager.idUtente }),
            });

            if (response.ok) {
                setIsMember(true);
                refreshList();
            } else {
                console.error("Errore aggiunta manager");
            }
        } catch (err) {
            console.error("Errore aggiunta manager:", err);
        }
        setLoading(false);
    };

    const removeManagerFromProject = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/removeManagerFromProject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idProgetto, idManager: manager.idUtente }),
            });
            if (response.ok) {
                setIsMember(false);
                refreshList();
            } else {
                console.error("Errore rimozione manager");
            }
        } catch (err) {
            console.error("Errore rimozione manager:", err);
        }
        setLoading(false);
    };

    return (
        <Row
            className="align-items-center border p-3 my-2 shadow-sm"
            style={{ borderRadius: "8px", backgroundColor: "#f9f9f9" }}
        >
            <Col xs={8}>
                <div className="fw-bold fs-5">
                    {manager.nome} {manager.cognome}
                </div>
                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                    {manager.email}
                </div>
            </Col>
            <Col xs={4} className="text-end">
                {isMember ? (
                    <Button
                        variant="outline-danger"
                        onClick={removeManagerFromProject}
                        disabled={loading}
                        size="sm"
                    >
                        Rimuovi
                    </Button>
                ) : (
                    <Button
                        variant="outline-success"
                        onClick={addManagerToProject}
                        disabled={loading}
                        size="sm"
                    >
                        Aggiungi
                    </Button>
                )}
            </Col>
        </Row>

    );
}

export default ManagerMember;
