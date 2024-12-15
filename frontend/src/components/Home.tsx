import React, { useEffect, useState } from "react";

interface Data {
    Name: string;
    Age: string;
    Date: string;
    programming: string;
}

const Home: React.FC = () => {
    const [data, setData] = useState<Data | null>(null);
    const [vek, setVek] = useState<number>(0);
    useEffect(() => {
        fetch("http://localhost:5000/data")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: Data) => {
                console.log(data);
                setData(data);
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }, []);
    useEffect(() => {
        fetch("http://localhost:5000/vek")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((vek: number) => {
                console.log(vek);
                setVek(vek);
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
