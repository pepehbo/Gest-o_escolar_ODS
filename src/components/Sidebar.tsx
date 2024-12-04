import React from 'react';
import { BookOpen, Users, GraduationCap, FileSpreadsheet, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const getMenuItems = (userType: string | null) => {
  const teacherItems = [
    { icon: Users, label: 'Alunos', path: '/students' },
    { icon: GraduationCap, label: 'Professores', path: '/teachers' },
    { icon: BookOpen, label: 'Disciplinas', path: '/subjects' },
    { icon: FileSpreadsheet, label: 'Notas', path: '/grades' },
    { icon: Calendar, label: 'Frequência', path: '/attendance' },
  ];

  const studentItems = [
    { icon: FileSpreadsheet, label: 'Notas', path: '/grades' },
    { icon: Calendar, label: 'Frequência', path: '/attendance' },
  ];

  return userType === 'teacher' ? teacherItems : studentItems;
};

export function Sidebar() {
  const location = useLocation();
  const userType = localStorage.getItem('userType');
  const menuItems = getMenuItems(userType);

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <BookOpen className="w-8 h-8" />
        <h1 className="text-xl font-bold">Gestão Escolar</h1>
      </div>
      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 p-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}