import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { Student, Teacher, Subject, Grade, Attendance } from '../types';

interface SchoolDB extends DBSchema {
  students: {
    key: string;
    value: Student;
    indexes: {
      'by-email': string;
      'by-registration': string;
    };
  };
  teachers: {
    key: string;
    value: Teacher;
    indexes: {
      'by-email': string;
    };
  };
  subjects: {
    key: string;
    value: Subject;
    indexes: {
      'by-teacher': string;
    };
  };
  grades: {
    key: string;
    value: Grade;
    indexes: {
      'by-student': string;
      'by-subject': string;
    };
  };
  attendance: {
    key: string;
    value: Attendance;
    indexes: {
      'by-student': string;
      'by-subject': string;
      'by-date': string;
    };
  };
}

export const db = await openDB<SchoolDB>('school-db', 1, {
  upgrade(db) {
    // Students store
    const studentStore = db.createObjectStore('students', { keyPath: 'id' });
    studentStore.createIndex('by-email', 'email', { unique: true });
    studentStore.createIndex('by-registration', 'registration', { unique: true });

    // Teachers store
    const teacherStore = db.createObjectStore('teachers', { keyPath: 'id' });
    teacherStore.createIndex('by-email', 'email', { unique: true });

    // Subjects store
    const subjectStore = db.createObjectStore('subjects', { keyPath: 'id' });
    subjectStore.createIndex('by-teacher', 'teacherId');

    // Grades store
    const gradeStore = db.createObjectStore('grades', { keyPath: 'id' });
    gradeStore.createIndex('by-student', 'studentId');
    gradeStore.createIndex('by-subject', 'subjectId');

    // Attendance store
    const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' });
    attendanceStore.createIndex('by-student', 'studentId');
    attendanceStore.createIndex('by-subject', 'subjectId');
    attendanceStore.createIndex('by-date', 'date');
  },
});