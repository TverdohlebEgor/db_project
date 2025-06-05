import { Button } from "react-bootstrap";
import Progettoinfo from "./ProgettoInfo";
import { useNavigate } from "react-router-dom";




function ProgettoRow({ progetto, manager }) {
    const navigate = useNavigate();

    const projectLandingPage = () => {
        navigate(`/progetto/${progetto.idProgetto}`, { state: { progetto, manager } });


    }


    return (

        <div className="user-card" style={{ margin: "10px", padding: "10px" }}>
            <Button onClick={projectLandingPage} Button variant="outline-primary">{progetto.nomeProgetto + " | Deadline: " + progetto.deadline + " | Stato: " + (progetto.finito ? "Finito" : "In corso")}</Button>


        </div>);


}

export default ProgettoRow