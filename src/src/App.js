import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Camera from "./pages/Camera";
import Voice from "./pages/Voice";
import Results from "./pages/Results";
import Accessibility from "./pages/Accessibility";
import Chatbot from "./pages/Chatbot";
import { ResultsProvider } from "./ResultsContext";
import { UserProvider } from "./UserContext";
import "./App.css";

function App() {
  return (
    <ResultsProvider>
      <UserProvider>
        <Router>
          <div className="app-wrapper">
            <Header />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/camera" element={<Camera />} />
                <Route path="/voice" element={<Voice />} />
                <Route path="/results" element={<Results />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/chatbot" element={<Chatbot />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </UserProvider>
    </ResultsProvider>
  );
}

export default App;
