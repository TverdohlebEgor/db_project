import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registriamo i componenti di chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StatisticheRimborsi() {
  const [andamentoMensile, setAndamentoMensile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDati() {
      try {
        const response = await fetch("http://localhost:8080/api/statisticheRimborsi");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAndamentoMensile(data.andamentoMensile || []);
      } catch (error) {
        console.error("Errore nel caricamento dati:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDati();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-2">Caricamento dati andamento rimborsi...</span>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger mt-4 text-center" role="alert">
        Errore nel caricamento dati: {error}
      </div>
    );

  // Preparo dati per il grafico
  const labels = andamentoMensile.map((item) =>
    new Date(item.mese).toLocaleDateString("it-IT", { year: "numeric", month: "short" })
  );
  const numeroRimborsiData = andamentoMensile.map((item) => item.numero_rimborsi);
  const valoreMedioData = andamentoMensile.map((item) => parseFloat(item.valore_medio));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Numero Rimborsi",
        data: numeroRimborsiData,
        backgroundColor: "rgba(0, 116, 194, 0.7)",
      },
      {
        label: "Valore Medio (€)",
        data: valoreMedioData,
        backgroundColor: "rgb(255, 0, 55)",
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Numero Rimborsi",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Valore Medio (€)",
        },
      },
    },
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Andamento Rimborsi Approvati (per mese)</h3>

      <div className="card shadow-sm p-3 mb-4">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="card shadow-sm p-3">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Mese</th>
              <th>Numero Rimborsi</th>
              <th>Valore Medio (€)</th>
            </tr>
          </thead>
          <tbody>
            {andamentoMensile.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  Nessun dato disponibile
                </td>
              </tr>
            ) : (
              andamentoMensile.map((item, i) => {
                const mese = new Date(item.mese).toLocaleDateString("it-IT", {
                  year: "numeric",
                  month: "long",
                });
                return (
                  <tr key={i}>
                    <td>{mese}</td>
                    <td>
                      <span className="badge bg-primary fs-6">{item.numero_rimborsi}</span>
                    </td>
                    <td>
                      <span className="badge bg-success fs-6">
                        € {parseFloat(item.valore_medio).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StatisticheRimborsi;
