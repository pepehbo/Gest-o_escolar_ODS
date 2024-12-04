export interface Student {
  id: string;
  name: string;
  email: string;
  registration: string;
  birthDate: string;
  class: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  department: string;
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
  workload: number;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  value: number;
  period: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  present: boolean;
}