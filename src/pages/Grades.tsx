import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { Student, Grade } from '../types';
import { studentModel } from '../database/models/student';
import { gradeModel } from '../database/models/grade';

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
const PERIODS = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];
const MAX_A1 = 5;
const MAX_A2 = 10;
const MAX_NOTEBOOK = 5;
const MAX_ASSIGNMENTS = 5;
const MAX_TOTAL = MAX_A1 + MAX_A2 + MAX_NOTEBOOK + MAX_ASSIGNMENTS;
const PASSING_GRADE = 15;

interface StudentGrades {
  a1: number;
  a2: number;
  notebook: number;
  assignments: number;
}

export function Grades() {
  const [selectedGrade, setSelectedGrade] = useState(GRADE_LEVELS[0]);
  const [selectedSection, setSelectedSection] = useState(GRADE_SECTIONS[GRADE_LEVELS[0]][0]);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, StudentGrades>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const userType = localStorage.getItem('userType');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    setSelectedSection(GRADE_SECTIONS[selectedGrade][0]);
  }, [selectedGrade]);

  useEffect(() => {
    loadStudents();
  }, [selectedGrade, selectedSection]);

  const loadStudents = async () => {
    try {
      if (userType === 'student' && userId) {
        // If user is a student, only load their own grades
        const student = await studentModel.getById(userId);
        setStudents(student ? [student] : []);
      } else {
        // For teachers, load all students in the selected section
        const allStudents = await studentModel.getAll();
        const filteredStudents = allStudents.filter(
          (student) => student.class === selectedSection
        );
        setStudents(filteredStudents);
      }
      
      // Initialize grades
      const gradesMap: Record<string, StudentGrades> = {};
      students.forEach((student) => {
        gradesMap[student.id] = { a1: 0, a2: 0, notebook: 0, assignments: 0 };
      });
      setGrades(gradesMap);
      
      // Load existing grades
      await loadGrades(students);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Erro ao carregar alunos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGrades = async (studentsList: Student[]) => {
    try {
      const gradesMap: Record<string, StudentGrades> = {};
      for (const student of studentsList) {
        const studentGrades = await gradeModel.getByStudentAndPeriod(student.id, selectedPeriod);
        if (studentGrades.length > 0) {
          const total = studentGrades[0].value;
          gradesMap[student.id] = {
            a1: Math.min(MAX_A1, total),
            a2: Math.min(MAX_A2, Math.max(0, total - MAX_A1)),
            notebook: Math.min(MAX_NOTEBOOK, Math.max(0, total - MAX_A1 - MAX_A2)),
            assignments: Math.min(MAX_ASSIGNMENTS, Math.max(0, total - MAX_A1 - MAX_A2 - MAX_NOTEBOOK))
          };
        } else {
          gradesMap[student.id] = { a1: 0, a2: 0, notebook: 0, assignments: 0 };
        }
      }
      setGrades(gradesMap);
    } catch (error) {
      console.error('Error loading grades:', error);
      alert('Erro ao carregar notas. Por favor, tente novamente.');
    }
  };

  const handleGradeChange = (studentId: string, type: keyof StudentGrades, value: string) => {
    if (userType === 'student') return; // Students can't modify grades

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const maxValues = {
      a1: MAX_A1,
      a2: MAX_A2,
      notebook: MAX_NOTEBOOK,
      assignments: MAX_ASSIGNMENTS
    };

    if (numValue >= 0 && numValue <= maxValues[type]) {
      setGrades((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [type]: numValue
        }
      }));
    }
  };

  const calculateTotal = (studentGrades: StudentGrades) => {
    return studentGrades.a1 + studentGrades.a2 + studentGrades.notebook + studentGrades.assignments;
  };

  const saveGrades = async () => {
    if (userType === 'student') return; // Students can't save grades

    try {
      for (const studentId in grades) {
        const total = calculateTotal(grades[studentId]);
        const gradeData: Omit<Grade, 'id'> = {
          studentId,
          subjectId: '', // This should be set based on selected subject
          value: total,
          period: selectedPeriod,
        };
        await gradeModel.create(gradeData);
      }
      alert('Notas salvas com sucesso!');
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Erro ao salvar notas. Por favor, tente novamente.');
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
        <h1 className="text-2xl font-bold text-gray-800">Notas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {userType === 'teacher' && (
          <>
            {/* Grade Level Tabs - Only visible to teachers */}
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

            {/* Section Tabs - Only visible to teachers */}
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
          </>
        )}

        {/* Controls */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
            {userType === 'teacher' && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar alunos..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Grades Table */}
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
                  A1 (5 pts)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  A2 (10 pts)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caderno (5 pts)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trabalhos (5 pts)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Situação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const studentGrades = grades[student.id];
                const total = calculateTotal(studentGrades);
                
                return (
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
                      {userType === 'teacher' ? (
                        <input
                          type="number"
                          min="0"
                          max={MAX_A1}
                          step="0.5"
                          value={studentGrades.a1}
                          onChange={(e) => handleGradeChange(student.id, 'a1', e.target.value)}
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{studentGrades.a1}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userType === 'teacher' ? (
                        <input
                          type="number"
                          min="0"
                          max={MAX_A2}
                          step="0.5"
                          value={studentGrades.a2}
                          onChange={(e) => handleGradeChange(student.id, 'a2', e.target.value)}
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{studentGrades.a2}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userType === 'teacher' ? (
                        <input
                          type="number"
                          min="0"
                          max={MAX_NOTEBOOK}
                          step="0.5"
                          value={studentGrades.notebook}
                          onChange={(e) => handleGradeChange(student.id, 'notebook', e.target.value)}
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{studentGrades.notebook}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userType === 'teacher' ? (
                        <input
                          type="number"
                          min="0"
                          max={MAX_ASSIGNMENTS}
                          step="0.5"
                          value={studentGrades.assignments}
                          onChange={(e) => handleGradeChange(student.id, 'assignments', e.target.value)}
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{studentGrades.assignments}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {total.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          total >= PASSING_GRADE
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {total >= PASSING_GRADE ? 'Aprovado' : 'Reprovado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Nenhum aluno encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Save Button - Only visible to teachers */}
        {userType === 'teacher' && (
          <div className="p-4 border-t">
            <button
              onClick={saveGrades}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar Notas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}