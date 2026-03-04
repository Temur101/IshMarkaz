import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ModalProvider } from './context/ModalContext';
import { TaskProvider } from './context/TaskContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import HowItWorks from './pages/HowItWorks';
import Formats from './pages/Formats';
import ForEmployers from './pages/ForEmployers';
import MyJobs from './pages/MyJobs';
import InterestedJobs from './pages/InterestedJobs';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatProvider } from './context/ChatContext';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TaskProvider>
          <ChatProvider>
            <ModalProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<Navigate to="/jobs/all" replace />} />
                  <Route path="/jobs/:category" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/task/:id" element={
                    <ProtectedRoute>
                      <TaskDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-jobs" element={
                    <ProtectedRoute>
                      <MyJobs />
                    </ProtectedRoute>
                  } />
                  <Route path="/interested" element={
                    <ProtectedRoute>
                      <InterestedJobs />
                    </ProtectedRoute>
                  } />
                  {/* Fallback routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/formats" element={<Formats />} />
                  <Route path="/for-employers" element={<ForEmployers />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </ModalProvider>
          </ChatProvider>
        </TaskProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
