import React, { useEffect, useState } from "react";

function Comunicazione({ comunicazione }) {
  const [immagini, setImmagini] = useState([]);
  const [zoomImg, setZoomImg] = useState(null);
  const [visualizzazioni, setVisualizzazioni] = useState(0);

  useEffect(() => {
    if (!comunicazione?.idComunicazione) return;

    const fetchVisualizzazioni = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/countVisuals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idComunicazione: comunicazione.idComunicazione }),
        });
        if (response.ok) {
          const count = await response.json();
          console.log(count)
          setVisualizzazioni(count);
        }
      } catch (error) {
        console.error("Errore caricamento visualizzazioni:", error);
      }
    };

    // Fetch immagini
    const fetchImmagini = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/immaginiByComunicazione", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idComunicazione: comunicazione.idComunicazione }),
        });

        if (response.ok) {
          const immaginiData = await response.json();
          setImmagini(Array.isArray(immaginiData) ? immaginiData : []);
        } else {
          setImmagini([]);
        }
      } catch (error) {
        console.error("Errore nel caricamento immagini:", error);
        setImmagini([]);
      }
    };

    fetchVisualizzazioni();
    fetchImmagini();
  }, [comunicazione]);

  return (
    <div className="comunicazione border p-3 mb-3 rounded shadow-sm bg-white">
      <p>{comunicazione.testo}</p>
      <p style={{ fontWeight: "bold" }}>👁️ Visualizzazioni: {visualizzazioni}</p>

      {immagini.length > 0 ? (
        <div className="immagini-container d-flex flex-wrap gap-3">
          {immagini.map((imgSrc, idx) => (
            <img
              key={idx}
              src={imgSrc}
              alt={`Immagine ${idx + 1}`}
              style={{
                maxWidth: "150px",
                maxHeight: "150px",
                objectFit: "cover",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => setZoomImg(imgSrc)}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted">Nessuna immagine disponibile</p>
      )}

      {zoomImg && (
        <div
          onClick={() => setZoomImg(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "zoom-out",
            zIndex: 9999,
          }}
        >
          <img
            src={zoomImg}
            alt="Immagine ingrandita"
            style={{ maxHeight: "90vh", maxWidth: "90vw", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}

export default Comunicazione;
