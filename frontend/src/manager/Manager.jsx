import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GestioneDipendenti from './dipendenti/GestioneDipendenti';
import GestioneProgetti from './progetti/GestioneProgetti';
import NavigationBar from './NavigationBar';
import ProgettoInfo from './progetti/ProgettoInfo';
import GestioneMembriProgetto from './progetti/GestioneMembriProgetto';
import GestioneMembriManager from './progetti/GestioneMembriManager';
import GestioneRimborsi from './rimborsi/GestioneRimborsi';
import CalendarioDipendente from './dipendenti/CalendarioDipendente/CalendarioDipendente';
import ForumManager from './forum/ForumManager';
import Dashboard from './dashboard/DashBoard';
import Calendar from '../dipendente/Calendario';
import Rimborsi from '../dipendente/Rimborsi';

function Manager({ manager }) {
    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/" element={<GestioneDipendenti manager={manager} />} />
                <Route path="/progetti" element={<GestioneProgetti manager={manager} />} />
                <Route path="/forum" element={<ForumManager manager={manager} />} />
                <Route path="/rimborsi" element={<GestioneRimborsi manager={manager} />} />
                <Route path="/dashboard" element={<Dashboard manager={manager} />} />
                <Route path="/calendarioManager" element={<Calendar dipendente={manager} />} />
                <Route path="/richiesteRimborsiManager" element={<Rimborsi dipendente={manager} />} />



                <Route path="/progetto/:id" element={<ProgettoInfo />} />
                <Route path="/progetto/:id/gestione" element={<GestioneMembriProgetto />} />
                <Route path="/progetto/:id/gestione" element={<GestioneMembriProgetto />} />
                <Route path="/progetto/:id/gestionemanager" element={<GestioneMembriManager />} />
                <Route path="/calendarioDipendente" element={<CalendarioDipendente />} />




            </Routes>
        </Router>
    );
}

export default Manager;
