import { Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

function ProgettoInfo() {
    const navigate = useNavigate();
    const location = useLocation();

    const { progetto, manager } = location.state || {};


    const goToGestioneMembri = () => {
        navigate(`/progetto/${progetto.idProgetto}/gestione`, {
            state: { progetto, manager }
        });
    };

    const goToGestioneManager = () => {
        navigate(`/progetto/${progetto.idProgetto}/gestionemanager`, {
            state: { progetto, manager }
        });
    };
    return (

        <div className="user-card" style={{ margin: "10px", padding: "10px" }}>

            <Button onClick={goToGestioneMembri}>Gestisci dipendenti</Button>
            <Button onClick={goToGestioneManager}>Gestisci manager</Button>

        </div>);


}

export default ProgettoInfo