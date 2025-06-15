import React, { useState } from 'react';
import ListaComunicazioni from './comunicazioni/ListaComunicazioni';

function ChatProgetto({ progetto }) {
    const [testo, setTesto] = useState('');
    const [immagini, setImmagini] = useState([]);
    const [reload, setReload] = useState(false); 

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setImmagini(Array.from(files));
        } else {
            setImmagini([]);
        }
    };

    const creaComunicazioneConImmagine = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("tipo", "Progetto");
        formData.append("testo", testo);
        formData.append("idProgetto", progetto.idProgetto);

        if (immagini.length > 0) {
            immagini.forEach((img) => {
                formData.append('immagini', img);
            });
        }
        try {
            const response = await fetch('http://localhost:8080/api/addComunicazioneWithImage', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                setTesto('');
                setImmagini([]);
                setReload(prev => !prev); 
            } else {
                console.error("Errore nell'invio della comunicazione");
            }
        } catch (err) {
            console.error("Errore di rete:", err);
        }
    };

    return (
        <div>
            <form onSubmit={creaComunicazioneConImmagine} className="p-3 border rounded bg-light shadow-sm">
                <div className="mb-3">
                    <label htmlFor="testo" className="form-label">Testo</label>
                    <textarea
                        id="testo"
                        name="testo"
                        value={testo}
                        onChange={(e) => setTesto(e.target.value)}
                        className="form-control"
                        rows="3"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="immagine" className="form-label">Immagini</label>
                    <input
                        type="file"
                        id="immagine"
                        onChange={handleFileChange}
                        className="form-control"
                        accept="image/*"
                        multiple
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">Invia</button>
            </form>

            <ListaComunicazioni progetto={progetto} reload={reload} />

        </div>
    );
}

export default ChatProgetto;
