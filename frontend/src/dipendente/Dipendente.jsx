import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Rimborsi from './Rimborsi';
import Calendario from './Calendario';
import Forum from './Forum';
import NavigationBar from './NavigationBar';

function Dipendente({dipendente}) {
    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/rimborsi" element={<Rimborsi />} />
                <Route path="/calendario" element={<Calendario dipendente = {dipendente}/>} />
                <Route path="/forum" element={<Forum />} />
            </Routes>
        </Router>
    );

}

export default Dipendente
