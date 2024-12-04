import React, { useState, useEffect } from 'react';
import { Search, Calendar, Check, X } from 'lucide-react';
import type { Student, Attendance } from '../types';
import { attendanceModel } from '../database/models/attendance';
import { studentModel } from '../database/models/student';

const GRADE_SECTIONS = {
  '6º Ano': ['601', '602', '603', '604'],
  '7º Ano': ['701', '702', '703', '704'],
  '8º Ano': ['801', '802', '803', '804'],
  '9º Ano': ['901', '902', '903', '904'],
  '1º Ano EM': ['101', '102', '103', '104'],
  '2º Ano EM': ['201', '202', '203', '204'],
  '3º Ano EM': ['301', '302', '303', '304'],
};

const GRADE_LEVELS = Object.keys(GRADE_SECTIONS);

export function Attendance() {
  const [selectedGrade, setSelectedGrade] = useState(GRADE_LEVELS[0]);
  const [selectedSection, setSelectedSection] = useState(GRADE_SECTIONS[GRADE_LEVELS[0]][0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // When grade changes, reset section to first one of that grade
    setSelectedSection(GRADE_SECTIONS[selectedGrade][0]);
  }, [selectedGrade]);

  useEffect(() => {
    loadStudents();
  }, [selectedGrade, selectedSection]);

  const loadStudents = async () => {
    try {
      const allStudents = await studentModel.getAll();
      const filteredStudents = allStudents.filter(
        (student) => student.class === selectedSection
      );
      setStudents(filteredStudents);
      
      // Initialize attendance
      const attendanceMap: Record<string, boolean> = {};
      filteredStudents.forEach((student) => {
        attendanceMap[student.id] = true;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Erro ao carregar alunos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, boolean> = {};
    students.forEach((student) => {
      newAttendance[student.id] = true;
    });
    setAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance: Record<string, boolean> = {};
    students.forEach((student) => {
      newAttendance[student.id] = false;
    });
    setAttendance(newAttendance);
  };

  const saveAttendance = async () => {
    try {
      const attendanceRecords: Omit<Attendance, 'id'>[] = students.map((student) => ({
        studentId: student.id,
        subjectId: '', // This should be set based on selected subject
        date,
        present: attendance[student.id],
      }));

      for (const record of attendanceRecords) {
        await attendanceModel.create(record);
      }

      alert('Frequência salva com sucesso!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Erro ao salvar frequência. Por favor, tente novamente.');
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-800">Controle de Frequência</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Grade Level Tabs */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {GRADE_LEVELS.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  selectedGrade === grade
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex overflow-x-auto px-4">
            {GRADE_SECTIONS[selectedGrade].map((section) => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap mx-1 rounded-t-lg ${
                  selectedSection === section
                    ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Turma {section}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar alunos..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={markAllPresent}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Marcar Todos Presentes
            </button>
            <button
              onClick={markAllAbsent}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Marcar Todos Ausentes
            </button>
          </div>
        </div>

        {/* Attendance List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {student.registration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        attendance[student.id]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {attendance[student.id] ? 'Presente' : 'Ausente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAttendance(student.id)}
                      className={`p-1 rounded-full transition-colors ${
                        attendance[student.id]
                          ? 'text-green-600 hover:bg-green-100'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {attendance[student.id] ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum aluno encontrado nesta turma
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Save Button */}
        <div className="p-4 border-t">
          <button
            onClick={saveAttendance}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Salvar Frequência
          </button>
        </div>
      </div>
    </div>
  );
}