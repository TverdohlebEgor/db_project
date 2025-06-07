import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import ManagerMember from "./ManagerMember"

function GestioneMembriManager() {
  const location = useLocation();
  const { progetto } = location.state || {};

  const [allManagers, setAllManagers] = useState([]);
  const [managersProgetto, setManagersProgetto] = useState([]);

  useEffect(() => {
    loadAllManagers();
  }, []);

  const loadAllManagers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/getAllManagers");
      const data = await response.json();
      setAllManagers(data);
    } catch (err) {
      console.error("Errore caricamento manager:", err);
    }
  };


  const refreshList = () => {
    loadAllManagers();
  };



  return (
    <Container className="mt-4">
      {allManagers.length === 0 ? (
        <p>Caricamento manager...</p>
      ) : (
        allManagers.map((manager) => (
          <ManagerMember
            key={manager.idManager}
            manager={manager}
            idProgetto={progetto.idProgetto}
            refreshList={refreshList}
          />
        ))
      )}
    </Container>
  );
}

export default GestioneMembriManager;
