import React, { useEffect, useState } from "react";

// Definovanie typu pre dáta, ktoré očakávaš z API
interface Data {
    Name: string;
    Age: string;
    Date: string;
    programming: string;
}

const Home: React.FC = () => {
    const [data, setData] = useState<Data | null>(null); // Typ stavu, buď Data alebo null
    const [vek, setVek] = useState<number>(0);
    useEffect(() => {
        fetch("http://localhost:5000/data")  // URL API
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: Data) => { // Typ pre dáta, ktoré prichádzajú z API
                console.log(data);
                setData(data); // Vypíše dáta do konzoly
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }, []);
    useEffect(() => {
        fetch("http://localhost:5000/vek")  // URL API
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((vek: number) => { // Typ pre dáta, ktoré prichádzajú z API
                console.log(vek);
                setVek(vek); // Vypíše dáta do konzoly
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }, []);

    return (
        <div className="F">
            <header className="F-header">
                <h1>Meno je {data ? data.Name : "Loading..."}</h1>
                <p>React data: {vek !== 0 ? vek : "No vek data"}</p>
                <p>Check the consdwqdqwole for data output.</p>
            </header>
        </div>
    );
};

export default Home;
