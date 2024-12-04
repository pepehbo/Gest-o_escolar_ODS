// Update the GradesPanel with enhanced functionality
package com.school.ui;

import com.school.dao.GradeDAO;
import com.school.model.Grade;
import com.school.model.Student;
import com.school.model.Subject;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class GradesPanel extends JPanel {
    private final GradeDAO gradeDAO;
    private JTable gradesTable;
    private DefaultTableModel tableModel;
    private JComboBox<Subject> subjectComboBox;
    private JComboBox<String> periodComboBox;
    
    public GradesPanel() {
        this.gradeDAO = new GradeDAO();
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Header with title and period selection
        JPanel headerPanel = new JPanel(new BorderLayout());
        
        // Title
        JLabel titleLabel = new JLabel("Gerenciamento de Notas");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 20));
        headerPanel.add(titleLabel, BorderLayout.WEST);
        
        // Period selection
        JPanel periodPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        periodComboBox = new JComboBox<>(new String[]{
            "1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"
        });
        periodPanel.add(new JLabel("Período:"));
        periodPanel.add(periodComboBox);
        headerPanel.add(periodPanel, BorderLayout.EAST);
        
        add(headerPanel, BorderLayout.NORTH);

        // Subject selection and filters
        JPanel filtersPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        
        // Subject dropdown
        subjectComboBox = new JComboBox<>();
        loadSubjects();
        filtersPanel.add(new JLabel("Disciplina:"));
        filtersPanel.add(subjectComboBox);
        
        // Search field
        JTextField searchField = new JTextField(20);
        filtersPanel.add(new JLabel("Buscar aluno:"));
        filtersPanel.add(searchField);
        
        JButton searchButton = new JButton("Buscar");
        searchButton.addActionListener(e -> searchGrades(searchField.getText()));
        filtersPanel.add(searchButton);
        
        add(filtersPanel, BorderLayout.CENTER);

        // Grades table
        String[] columns = {
            "Matrícula", "Nome do Aluno", "Nota 1", "Nota 2", "Nota 3", "Média", "Situação"
        };
        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return column >= 2 && column <= 4; // Only grades are editable
            }
            
            @Override
            public Class<?> getColumnClass(int column) {
                return column >= 2 && column <= 5 ? Double.class : String.class;
            }
        };
        
        gradesTable = new JTable(tableModel);
        gradesTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        
        // Add table listener for automatic average calculation
        tableModel.addTableModelListener(e -> {
            if (e.getType() == TableModelEvent.UPDATE) {
                int row = e.getFirstRow();
                if (row >= 0) {
                    calculateAverage(row);
                }
            }
        });
        
        JScrollPane scrollPane = new JScrollPane(gradesTable);
        add(scrollPane, BorderLayout.SOUTH);

        // Load initial data
        loadGrades();
        
        // Add change listeners
        subjectComboBox.addActionListener(e -> loadGrades());
        periodComboBox.addActionListener(e -> loadGrades());
    }

    private void loadSubjects() {
        try {
            List<Subject> subjects = new SubjectDAO().findAll();
            for (Subject subject : subjects) {
                subjectComboBox.addItem(subject);
            }
        } catch (Exception e) {
            showError("Erro ao carregar disciplinas", e);
        }
    }

    private void loadGrades() {
        tableModel.setRowCount(0);
        try {
            Subject selectedSubject = (Subject) subjectComboBox.getSelectedItem();
            String selectedPeriod = (String) periodComboBox.getSelectedItem();
            
            if (selectedSubject != null && selectedPeriod != null) {
                List<Grade> grades = gradeDAO.findBySubjectAndPeriod(
                    selectedSubject.getId(), selectedPeriod);
                
                for (Grade grade : grades) {
                    addGradeToTable(grade);
                }
            }
        } catch (Exception e) {
            showError("Erro ao carregar notas", e);
        }
    }

    private void addGradeToTable(Grade grade) {
        Student student = grade.getStudent();
        double average = calculateGradeAverage(grade);
        String status = average >= 6.0 ? "Aprovado" : "Reprovado";
        
        tableModel.addRow(new Object[]{
            student.getRegistration(),
            student.getName(),
            grade.getValue1(),
            grade.getValue2(),
            grade.getValue3(),
            average,
            status
        });
    }

    private double calculateGradeAverage(Grade grade) {
        return (grade.getValue1() + grade.getValue2() + grade.getValue3()) / 3.0;
    }

    private void calculateAverage(int row) {
        try {
            double grade1 = (Double) tableModel.getValueAt(row, 2);
            double grade2 = (Double) tableModel.getValueAt(row, 3);
            double grade3 = (Double) tableModel.getValueAt(row, 4);
            
            double average = (grade1 + grade2 + grade3) / 3.0;
            String status = average >= 6.0 ? "Aprovado" : "Reprovado";
            
            tableModel.setValueAt(average, row, 5);
            tableModel.setValueAt(status, row, 6);
        } catch (Exception e) {
            // Ignore calculation if values are invalid
        }
    }

    private void searchGrades(String query) {
        // Implementation similar to other search methods
    }

    private void showError(String message, Exception e) {
        JOptionPane.showMessageDialog(this,
            message + (e != null ? ": " + e.getMessage() : ""),
            "Erro",
            JOptionPane.ERROR_MESSAGE);
    }
}