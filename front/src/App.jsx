import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import TopPage from "./pages/TopPage";
import Homepage from "./pages/HomePage";
import SearchResultPage from "./pages/SearchResultPage";
import VideoDetailPage from "./pages/VideoDetailPage";

const App = () => {
  return (
    <Router>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/search" element={<SearchResultPage />} />
        <Route path="/video/:id" element={<VideoDetailPage />} />
      </Routes>
    </Router>
  );
};

export default App;