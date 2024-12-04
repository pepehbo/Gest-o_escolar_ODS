import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import type { Teacher } from '../types';
import { TeacherModal } from '../components/TeacherModal';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { teacherModel } from '../database/models/teacher';

export function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const result = await teacherModel.getAll();
      setTeachers(result);
    } catch (error) {
      console.error('Error loading teachers:', error);
      alert('Erro ao carregar professores. Por favor, recarregue a página.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    try {
      await teacherModel.create(teacherData);
      await loadTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Erro ao adicionar professor. Por favor, tente novamente.');
    }
  };

  const handleEditTeacher = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      const row = document.querySelector(`[data-teacher-id="${teacherToDelete.id}"]`);
      if (row) {
        row.classList.add('table-row-remove');
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for animation
      }

      await teacherModel.delete(teacherToDelete.id);
      await loadTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Erro ao excluir professor. Por favor, tente novamente.');
    } finally {
      setTeacherToDelete(null);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    try {
      if (term.trim()) {
        const result = await teacherModel.search(term);
        setTeachers(result);
      } else {
        await loadTeachers();
      }
    } catch (error) {
      console.error('Error searching teachers:', error);
      alert('Erro ao buscar professores. Por favor, tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Professores</h1>
        <button
          onClick={() => {
            setSelectedTeacher(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Professor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm animate-fade-in">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar professores..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disciplinas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} data-teacher-id={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {teacher.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {teacher.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {teacher.subjects.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTeacher(teacher)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TeacherModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTeacher(undefined);
        }}
        onSubmit={handleAddTeacher}
        teacher={selectedTeacher}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Professor"
        message="Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita."
      />
    </div>
  );
}