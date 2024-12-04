import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Lock } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [credentials, setCredentials] = useState({
    registration: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Using the new credentials (473800/473800)
    if (credentials.registration === '473800' && credentials.password === '473800') {
      localStorage.setItem('userType', userType);
      localStorage.setItem('userId', credentials.registration);
      navigate(userType === 'teacher' ? '/students' : '/grades');
    } else {
      setError('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 text-white p-4 rounded-full">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Sistema de Gestão Escolar
        </h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUserType('student')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              userType === 'student'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Aluno
          </button>
          <button
            onClick={() => setUserType('teacher')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              userType === 'teacher'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Professor
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {userType === 'student' ? 'Matrícula' : 'Registro'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={credentials.registration}
                onChange={(e) =>
                  setCredentials({ ...credentials, registration: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Use a matrícula 473800 e senha 473800 para acessar o sistema
        </p>
      </div>
    </div>
  );
}