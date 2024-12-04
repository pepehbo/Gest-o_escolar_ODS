import { db } from '../index';
import type { Subject } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const subjectModel = {
  async create(data: Omit<Subject, 'id'>): Promise<Subject> {
    const subject: Subject = {
      id: uuidv4(),
      ...data,
    };
    await db.add('subjects', subject);
    return subject;
  },

  async update(id: string, data: Partial<Omit<Subject, 'id'>>): Promise<Subject> {
    const subject = await db.get('subjects', id);
    if (!subject) throw new Error('Subject not found');
    
    const updatedSubject = { ...subject, ...data };
    await db.put('subjects', updatedSubject);
    return updatedSubject;
  },

  async delete(id: string): Promise<void> {
    await db.delete('subjects', id);
  },

  async getById(id: string): Promise<Subject | undefined> {
    return db.get('subjects', id);
  },

  async getAll(): Promise<Subject[]> {
    return db.getAll('subjects');
  },

  async search(query: string): Promise<Subject[]> {
    const subjects = await db.getAll('subjects');
    const lowerQuery = query.toLowerCase();
    return subjects.filter(subject => 
      subject.name.toLowerCase().includes(lowerQuery)
    );
  }
};