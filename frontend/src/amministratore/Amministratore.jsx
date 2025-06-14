import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AggiungiUtente from './AggiungiUtente';
import AggiungiValute from './AggiungiValute';
import NavigationBar from './NavigationBar';

function Amministratore({amministratore}) {
    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/AggiungiUtente" element={<AggiungiUtente amministratore = {amministratore}/>} />
                <Route path="/AggiungiValute" element={<AggiungiValute amministratore = {amministratore}/>} />
            </Routes>
        </Router>
    );

}

export default Amministratore
