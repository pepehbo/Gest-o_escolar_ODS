import { db } from '../index';
import type { Attendance } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const attendanceModel = {
  async create(data: Omit<Attendance, 'id'>): Promise<Attendance> {
    const attendance: Attendance = {
      id: uuidv4(),
      ...data,
    };
    await db.add('attendance', attendance);
    return attendance;
  },

  async update(id: string, data: Partial<Omit<Attendance, 'id'>>): Promise<Attendance> {
    const attendance = await db.get('attendance', id);
    if (!attendance) throw new Error('Attendance record not found');
    
    const updatedAttendance = { ...attendance, ...data };
    await db.put('attendance', updatedAttendance);
    return updatedAttendance;
  },

  async delete(id: string): Promise<void> {
    await db.delete('attendance', id);
  },

  async getById(id: string): Promise<Attendance | undefined> {
    return db.get('attendance', id);
  },

  async getByStudentAndDate(studentId: string, date: string): Promise<Attendance[]> {
    const tx = db.transaction('attendance', 'readonly');
    const studentIndex = tx.store.index('by-student');
    const dateIndex = tx.store.index('by-date');
    
    const studentAttendance = await studentIndex.getAll(studentId);
    return studentAttendance.filter(record => record.date === date);
  },

  async getBySubjectAndDate(subjectId: string, date: string): Promise<Attendance[]> {
    const tx = db.transaction('attendance', 'readonly');
    const subjectIndex = tx.store.index('by-subject');
    const dateIndex = tx.store.index('by-date');
    
    const subjectAttendance = await subjectIndex.getAll(subjectId);
    return subjectAttendance.filter(record => record.date === date);
  },

  async getAll(): Promise<Attendance[]> {
    return db.getAll('attendance');
  }
};