import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Homepage from "./pages/HomePage";
import SearchResultPage from "./pages/SearchResultPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import MapTestPage from "./pages/MapTestPage";

const App = () => {
  return (
    <Router>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/search" element={<SearchResultPage />} />
        <Route path="/video/:id" element={<VideoDetailPage />} />
        <Route path="/map-test" element={<MapTestPage />} />
      </Routes>
    </Router>
  );
};

export default App;