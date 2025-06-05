import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GestioneDipendenti from './dipendenti/GestioneDipendenti';
import GestioneProgetti from './progetti/GestioneProgetti';
import ForumManager from './ForumManager';
import NavigationBar from './NavigationBar';
import ProgettoInfo from './progetti/ProgettoInfo';
import GestioneMembriProgetto from './progetti/GestioneMembriProgetto';
import GestioneMembriManager from './progetti/GestioneMembriManager';


function Manager({ manager }) {
    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/" element={<GestioneDipendenti manager={manager} />} />
                <Route path="/progetti" element={<GestioneProgetti manager={manager} />} />
                <Route path="/forum" element={<ForumManager manager={manager} />} />
                <Route path="/progetto/:id" element={<ProgettoInfo />} />
                <Route path="/progetto/:id/gestione" element={<GestioneMembriProgetto />} />
                <Route path="/progetto/:id/gestione" element={<GestioneMembriProgetto />} />
                <Route path="/progetto/:id/gestionemanager" element={<GestioneMembriManager />} />



            </Routes>
        </Router>
    );
}

export default Manager;
