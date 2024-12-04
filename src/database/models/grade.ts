import { db } from '../index';
import type { Grade } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const gradeModel = {
  async create(data: Omit<Grade, 'id'>): Promise<Grade> {
    const grade: Grade = {
      id: uuidv4(),
      ...data,
    };
    await db.add('grades', grade);
    return grade;
  },

  async update(id: string, data: Partial<Omit<Grade, 'id'>>): Promise<Grade> {
    const grade = await db.get('grades', id);
    if (!grade) throw new Error('Grade not found');
    
    const updatedGrade = { ...grade, ...data };
    await db.put('grades', updatedGrade);
    return updatedGrade;
  },

  async delete(id: string): Promise<void> {
    await db.delete('grades', id);
  },

  async getById(id: string): Promise<Grade | undefined> {
    return db.get('grades', id);
  },

  async getByStudentAndPeriod(studentId: string, period: string): Promise<Grade[]> {
    const tx = db.transaction('grades', 'readonly');
    const index = tx.store.index('by-student');
    const grades = await index.getAll(studentId);
    return grades.filter(grade => grade.period === period);
  },

  async getAll(): Promise<Grade[]> {
    return db.getAll('grades');
  }
};