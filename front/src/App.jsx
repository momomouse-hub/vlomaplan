import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import TopLayout from "./components/layouts/TopLayout";
import MainLayout from "./components/layouts/MainLayout";
import TopPage from "./pages/TopPage";
import Homepage from "./pages/HomePage";
import SearchResultPage from "./pages/SearchResultPage";
import VideoDetailPage from "./pages/VideoDetailPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<TopLayout />}>
          <Route path="/" element={<TopPage />} />
          <Route path="/home" element={<Homepage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/search" element={<SearchResultPage />} />
          <Route path="/video/:id" element={<VideoDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;