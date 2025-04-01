import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/landingPage";

const App = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
        </Routes>
      </Router>
    </Box>
  );
};

export default App;