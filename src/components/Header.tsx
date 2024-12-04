import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">
          Sistema de Gestão Escolar
        </h2>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {userType === 'teacher' ? 'Professor' : 'Aluno'}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}