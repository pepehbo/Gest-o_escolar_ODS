import { db } from '../index';
import type { Student } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const studentModel = {
  async create(data: Omit<Student, 'id'>): Promise<Student> {
    const student: Student = {
      id: uuidv4(),
      ...data,
    };
    await db.add('students', student);
    return student;
  },

  async update(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student> {
    const student = await db.get('students', id);
    if (!student) throw new Error('Student not found');
    
    const updatedStudent = { ...student, ...data };
    await db.put('students', updatedStudent);
    return updatedStudent;
  },

  async delete(id: string): Promise<void> {
    await db.delete('students', id);
  },

  async getById(id: string): Promise<Student | undefined> {
    return db.get('students', id);
  },

  async getAll(): Promise<Student[]> {
    return db.getAll('students');
  },

  async search(query: string): Promise<Student[]> {
    const students = await db.getAll('students');
    const lowerQuery = query.toLowerCase();
    return students.filter(student => 
      student.name.toLowerCase().includes(lowerQuery) ||
      student.email.toLowerCase().includes(lowerQuery) ||
      student.registration.toLowerCase().includes(lowerQuery)
    );
  },
};