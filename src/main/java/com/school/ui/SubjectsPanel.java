package com.school.ui;

import com.school.dao.SubjectDAO;
import com.school.model.Subject;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class SubjectsPanel extends JPanel {
    private final SubjectDAO subjectDAO;
    private JTable subjectsTable;
    private DefaultTableModel tableModel;
    private final String[] defaultSubjects = {
        "Língua Portuguesa",
        "Língua Inglesa",
        "Literatura",
        "História",
        "Geografia",
        "Sociologia",
        "Filosofia",
        "Matemática",
        "Física",
        "Química",
        "Biologia",
        "Artes",
        "Educação Física"
    };

    public SubjectsPanel() {
        this.subjectDAO = new SubjectDAO();
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Title Panel
        JPanel titlePanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JLabel titleLabel = new JLabel("Disciplinas");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 20));
        titlePanel.add(titleLabel);

        // Button Panel
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton initializeButton = new JButton("Adicionar Disciplinas Padrão");
        initializeButton.addActionListener(e -> initializeDefaultSubjects());
        buttonPanel.add(initializeButton);

        // Top Panel combining title and button
        JPanel topPanel = new JPanel(new BorderLayout());
        topPanel.add(titlePanel, BorderLayout.WEST);
        topPanel.add(buttonPanel, BorderLayout.EAST);
        add(topPanel, BorderLayout.NORTH);

        // Table
        String[] columns = {"Disciplina", "Carga Horária"};
        tableModel = new DefaultTableModel(columns, 0);
        subjectsTable = new JTable(tableModel);
        JScrollPane scrollPane = new JScrollPane(subjectsTable);
        add(scrollPane, BorderLayout.CENTER);

        // Load existing subjects
        loadSubjects();
    }

    private void loadSubjects() {
        tableModel.setRowCount(0);
        try {
            for (Subject subject : subjectDAO.findAll()) {
                tableModel.addRow(new Object[]{
                    subject.getName(),
                    subject.getWorkload()
                });
            }
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this,
                "Erro ao carregar disciplinas: " + e.getMessage(),
                "Erro",
                JOptionPane.ERROR_MESSAGE);
        }
    }

    private void initializeDefaultSubjects() {
        try {
            for (String subjectName : defaultSubjects) {
                Subject subject = new Subject();
                subject.setName(subjectName);
                subject.setWorkload(80); // Default workload
                subjectDAO.save(subject);
            }
            loadSubjects();
            JOptionPane.showMessageDialog(this,
                "Disciplinas adicionadas com sucesso!",
                "Sucesso",
                JOptionPane.INFORMATION_MESSAGE);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this,
                "Erro ao adicionar disciplinas: " + e.getMessage(),
                "Erro",
                JOptionPane.ERROR_MESSAGE);
        }
    }
}