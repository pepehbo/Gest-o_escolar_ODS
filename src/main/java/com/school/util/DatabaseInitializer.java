package com.school.util;

import org.hibernate.Session;
import org.hibernate.Transaction;

public class DatabaseInitializer {
    public static void initialize() {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            
            // Test database connection
            session.createNativeQuery("SELECT 1").uniqueResult();
            
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            throw new RuntimeException("Failed to initialize database: " + e.getMessage(), e);
        }
    }
}