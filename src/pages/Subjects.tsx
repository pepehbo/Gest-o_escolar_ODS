import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import type { Subject } from '../types';
import { subjectModel } from '../database/models/subject';
import { SubjectModal } from '../components/SubjectModal';

const defaultSubjects = [
  'Língua Portuguesa',
  'Língua Inglesa',
  'Literatura',
  'História',
  'Geografia',
  'Sociologia',
  'Filosofia',
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'Artes',
  'Educação Física'
];

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const result = await subjectModel.getAll();
      setSubjects(result);
    } catch (error) {
      console.error('Error loading subjects:', error);
      alert('Erro ao carregar disciplinas. Por favor, recarregue a página.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async (subjectData: Omit<Subject, 'id'>) => {
    try {
      await subjectModel.create(subjectData);
      await loadSubjects();
      alert('Disciplina adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Erro ao adicionar disciplina. Por favor, tente novamente.');
    }
  };

  const handleAddDefaultSubjects = async () => {
    try {
      for (const subjectName of defaultSubjects) {
        await subjectModel.create({
          name: subjectName,
          teacherId: '',
          workload: 80
        });
      }
      await loadSubjects();
      alert('Disciplinas padrão adicionadas com sucesso!');
    } catch (error) {
      console.error('Error adding default subjects:', error);
      alert('Erro ao adicionar disciplinas padrão. Por favor, tente novamente.');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
      try {
        await subjectModel.delete(id);
        await loadSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Erro ao excluir disciplina. Por favor, tente novamente.');
      }
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    try {
      if (term.trim()) {
        const result = await subjectModel.search(term);
        setSubjects(result);
      } else {
        await loadSubjects();
      }
    } catch (error) {
      console.error('Error searching subjects:', error);
      alert('Erro ao buscar disciplinas. Por favor, tente novamente.');
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
        <h1 className="text-2xl font-bold text-gray-800">Disciplinas</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nova Disciplina
          </button>
          <button
            onClick={handleAddDefaultSubjects}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Adicionar Disciplinas Padrão
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar disciplinas..."
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
                  Nome da Disciplina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professor Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carga Horária
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subject.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {subject.teacherId ? 'Atribuído' : 'Não atribuído'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {subject.workload}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-800"
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

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubject}
      />
    </div>
  );
}