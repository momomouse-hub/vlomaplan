import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Homepage from "./pages/HomePage";
import SearchResultPage from "./pages/SearchResultPage";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/search" element={<SearchResultPage />} />
      </Routes>
    </Router>
  );
};

export default App;