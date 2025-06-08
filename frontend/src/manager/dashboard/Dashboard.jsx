import StatistichePermessi from "./StatistichePermessi";
import StatisticheRimborsi from "./StatisticheRimborsi";
import StatisticheFerieAccumulate from "./StisticheFerieAccumulate";
import StatisticheProgetti from "./StisticheProgetti";

function Dashboard({ manager }) {
    return (

        <div>
            <StatistichePermessi />
            <StatisticheProgetti />
            <StatisticheFerieAccumulate />
            <StatisticheRimborsi />
        </div>
    );
}

export default Dashboard;