import React, { useEffect } from "react";

function App() {
    useEffect(() => {
        fetch("http://localhost:5000/data")  // Replace with the URL of your API
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);  // Print data to console
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>React Data Fetching</h1>
                <p>Check the console for data output.</p>
            </header>
        </div>
    );
}

export default App;
