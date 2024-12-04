import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Subjects } from './pages/Subjects';
import { Attendance } from './pages/Attendance';
import { Grades } from './pages/Grades';
import { AuthGuard } from './components/AuthGuard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1">
                  <Header />
                  <main>
                    <Routes>
                      <Route
                        path="/students"
                        element={
                          <AuthGuard allowedUserTypes={['teacher']}>
                            <Students />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/teachers"
                        element={
                          <AuthGuard allowedUserTypes={['teacher']}>
                            <Teachers />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/subjects"
                        element={
                          <AuthGuard allowedUserTypes={['teacher']}>
                            <Subjects />
                          </AuthGuard>
                        }
                      />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/grades" element={<Grades />} />
                      <Route
                        path="/unauthorized"
                        element={
                          <div className="p-8 text-center">
                            <h1 className="text-2xl font-bold text-red-600">
                              Acesso não autorizado
                            </h1>
                          </div>
                        }
                      />
                      <Route path="*" element={<Navigate to="/students" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;