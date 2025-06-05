import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GestioneDipendenti from './GestioneDipendenti';
import GestioneProgetti from './GestioneProgetti';
import ForumManager from './ForumManager';
import NavigationBar from './NavigationBar';


function Manager({manager}) {
    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/" element={<GestioneDipendenti manager={manager} />} />
                <Route path="/progetti" element={<GestioneProgetti />} />
                <Route path="/forum" element={<ForumManager />} />
            </Routes>
        </Router>
    );
}

export default Manager;
