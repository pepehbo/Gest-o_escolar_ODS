package com.school.dao;

import com.school.model.Attendance;
import com.school.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import java.time.LocalDate;
import java.util.List;

public class AttendanceDAO {
    public void save(Attendance attendance) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.persist(attendance);
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            throw e;
        }
    }

    public void saveAll(List<Attendance> attendanceList) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            for (Attendance attendance : attendanceList) {
                session.persist(attendance);
            }
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            throw e;
        }
    }

    public List<Attendance> findBySubjectAndDate(Long subjectId, LocalDate date) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery(
                "FROM Attendance a WHERE a.subject.id = :subjectId AND a.date = :date",
                Attendance.class)
                .setParameter("subjectId", subjectId)
                .setParameter("date", date)
                .list();
        }
    }
}