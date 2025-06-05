import { useState, useEffect } from "react";
import ProjectMember from "./ProjectMember";
import { useLocation } from "react-router-dom";


function GestioneMembriProgetto() {

    const location = useLocation();

    const { progetto, manager } = location.state || {};

    const [members, setMembers] = useState([])

    const loadMembers = async () => {
        try {
            const idUtente = manager.idUtente
            const response = await fetch('http://localhost:8080/api/employeesOfManager', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idUtente })
            });

            const data = await response.json();

            setMembers(data);


        } catch (err) {
            console.log(err)

        }

    }

    useEffect(() => {
        loadMembers();
    }, [])
    return (

        <div className="user-card" style={{ margin: "10px", padding: "10px" }}>

            {members.length > 0 ? (
                members.map((member) => (

                    <ProjectMember key={member.idUtente} progetto={progetto} member={member} />
                ))
            ) : (
                <p>Nssuna modifica possibile</p>
            )}

        </div>);


}

export default GestioneMembriProgetto