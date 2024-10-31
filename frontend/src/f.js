import Home from "./Component/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function F() {


    return (
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Router>

    );
}


export default App;
