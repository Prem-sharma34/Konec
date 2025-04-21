import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Random from "./components/Random";
import RandomChat from "./components/RandomChat";
import RandomCall from "./components/RandomCall";
import { RandomProvider } from "./context/RandomContext";

const App = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Router>
        <RandomProvider>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/random" element={<Random />} />
              <Route path="/random-chat" element={<RandomChat />} />
              <Route path="/random-call" element={<RandomCall />} />
            </Route>
          </Routes>
        </RandomProvider>
      </Router>
    </Box>
  );
};

export default App;