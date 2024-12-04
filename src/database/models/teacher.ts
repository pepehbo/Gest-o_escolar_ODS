import { db } from '../index';
import type { Teacher } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const teacherModel = {
  async create(data: Omit<Teacher, 'id'>): Promise<Teacher> {
    const teacher: Teacher = {
      id: uuidv4(),
      ...data,
    };
    await db.add('teachers', teacher);
    return teacher;
  },

  async update(id: string, data: Partial<Omit<Teacher, 'id'>>): Promise<Teacher> {
    const teacher = await db.get('teachers', id);
    if (!teacher) throw new Error('Teacher not found');
    
    const updatedTeacher = { ...teacher, ...data };
    await db.put('teachers', updatedTeacher);
    return updatedTeacher;
  },

  async delete(id: string): Promise<void> {
    await db.delete('teachers', id);
  },

  async getById(id: string): Promise<Teacher | undefined> {
    return db.get('teachers', id);
  },

  async getAll(): Promise<Teacher[]> {
    return db.getAll('teachers');
  },

  async search(query: string): Promise<Teacher[]> {
    const teachers = await db.getAll('teachers');
    const lowerQuery = query.toLowerCase();
    return teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(lowerQuery) ||
      teacher.email.toLowerCase().includes(lowerQuery) ||
      teacher.department.toLowerCase().includes(lowerQuery)
    );
  },

  async getSubjects(teacherId: string): Promise<Subject[]> {
    const index = db.transaction('subjects').store.index('by-teacher');
    return index.getAll(teacherId);
  }
};