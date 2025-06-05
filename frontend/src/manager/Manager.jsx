import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GestioneDipendenti from './dipendenti/GestioneDipendenti';
import GestioneProgetti from './progetti/GestioneProgetti';
import ForumManager from './ForumManager';
import NavigationBar from './NavigationBar';


function Manager({manager}) {
    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/" element={<GestioneDipendenti manager={manager} />} />
                <Route path="/progetti" element={<GestioneProgetti manager={manager}/>} />
                <Route path="/forum" element={<ForumManager manager={manager}/>} />
            </Routes>
        </Router>
    );
}

export default Manager;
