package com.school.ui;

import com.school.dao.StudentDAO;
import com.school.model.Student;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.time.LocalDate;
import java.util.List;

public class StudentsPanel extends JPanel {
    private final StudentDAO studentDAO;
    private JTable studentsTable;
    private DefaultTableModel tableModel;

    public StudentsPanel() {
        this.studentDAO = new StudentDAO();
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Header
        JPanel headerPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JLabel titleLabel = new JLabel("Alunos");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 20));
        headerPanel.add(titleLabel);

        // Add Student Button
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton addButton = new JButton("Novo Aluno");
        addButton.addActionListener(e -> showStudentDialog(null));
        buttonPanel.add(addButton);

        // Combine header and button
        JPanel topPanel = new JPanel(new BorderLayout());
        topPanel.add(headerPanel, BorderLayout.WEST);
        topPanel.add(buttonPanel, BorderLayout.EAST);
        add(topPanel, BorderLayout.NORTH);

        // Search Panel
        JPanel searchPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JTextField searchField = new JTextField(30);
        JButton searchButton = new JButton("Buscar");
        
        searchField.addActionListener(e -> searchStudents(searchField.getText()));
        searchButton.addActionListener(e -> searchStudents(searchField.getText()));
        
        searchPanel.add(new JLabel("Buscar: "));
        searchPanel.add(searchField);
        searchPanel.add(searchButton);
        add(searchPanel, BorderLayout.CENTER);

        // Students Table
        String[] columns = {"Nome", "Matrícula", "Email", "Data de Nascimento", "Turma", "Ações"};
        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        
        studentsTable = new JTable(tableModel);
        studentsTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        
        JScrollPane scrollPane = new JScrollPane(studentsTable);
        add(scrollPane, BorderLayout.SOUTH);

        // Load initial data
        loadStudents();
    }

    private void loadStudents() {
        tableModel.setRowCount(0);
        try {
            List<Student> students = studentDAO.findAll();
            for (Student student : students) {
                addStudentToTable(student);
            }
        } catch (Exception e) {
            showError("Erro ao carregar alunos", e);
        }
    }

    private void addStudentToTable(Student student) {
        tableModel.addRow(new Object[]{
            student.getName(),
            student.getRegistration(),
            student.getEmail(),
            student.getBirthDate(),
            student.getClassName(),
            "Ações"
        });
    }

    private void searchStudents(String query) {
        try {
            List<Student> students = studentDAO.search(query);
            tableModel.setRowCount(0);
            for (Student student : students) {
                addStudentToTable(student);
            }
        } catch (Exception e) {
            showError("Erro ao buscar alunos", e);
        }
    }

    private void showStudentDialog(Student student) {
        JDialog dialog = new JDialog((Frame) SwingUtilities.getWindowAncestor(this), 
            student == null ? "Novo Aluno" : "Editar Aluno", true);
        dialog.setLayout(new BorderLayout());
        dialog.setSize(400, 400);
        dialog.setLocationRelativeTo(this);

        JPanel formPanel = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(5, 5, 5, 5);

        // Form fields
        String[] labels = {"Nome:", "Email:", "Matrícula:", "Data de Nascimento:", "Turma:"};
        JTextField[] fields = new JTextField[5];
        
        for (int i = 0; i < labels.length; i++) {
            gbc.gridx = 0;
            gbc.gridy = i;
            formPanel.add(new JLabel(labels[i]), gbc);

            fields[i] = new JTextField(20);
            gbc.gridx = 1;
            formPanel.add(fields[i], gbc);
        }

        if (student != null) {
            fields[0].setText(student.getName());
            fields[1].setText(student.getEmail());
            fields[2].setText(student.getRegistration());
            fields[3].setText(student.getBirthDate().toString());
            fields[4].setText(student.getClassName());
        }

        dialog.add(formPanel, BorderLayout.CENTER);

        // Buttons
        JPanel buttonsPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton cancelButton = new JButton("Cancelar");
        cancelButton.addActionListener(e -> dialog.dispose());
        
        JButton saveButton = new JButton("Salvar");
        saveButton.addActionListener(e -> {
            try {
                if (validateFields(fields)) {
                    Student newStudent = student == null ? new Student() : student;
                    newStudent.setName(fields[0].getText().trim());
                    newStudent.setEmail(fields[1].getText().trim());
                    newStudent.setRegistration(fields[2].getText().trim());
                    newStudent.setBirthDate(LocalDate.parse(fields[3].getText().trim()));
                    newStudent.setClassName(fields[4].getText().trim());

                    if (student == null) {
                        studentDAO.save(newStudent);
                    } else {
                        studentDAO.update(newStudent);
                    }

                    loadStudents();
                    dialog.dispose();
                    showSuccess("Aluno salvo com sucesso!");
                }
            } catch (Exception ex) {
                showError("Erro ao salvar aluno", ex);
            }
        });

        buttonsPanel.add(cancelButton);
        buttonsPanel.add(saveButton);
        dialog.add(buttonsPanel, BorderLayout.SOUTH);

        dialog.setVisible(true);
    }

    private boolean validateFields(JTextField[] fields) {
        for (int i = 0; i < fields.length; i++) {
            if (fields[i].getText().trim().isEmpty()) {
                showError("Todos os campos são obrigatórios", null);
                fields[i].requestFocus();
                return false;
            }
        }
        return true;
    }

    private void showError(String message, Exception e) {
        JOptionPane.showMessageDialog(this,
            message + (e != null ? ": " + e.getMessage() : ""),
            "Erro",
            JOptionPane.ERROR_MESSAGE);
    }

    private void showSuccess(String message) {
        JOptionPane.showMessageDialog(this,
            message,
            "Sucesso",
            JOptionPane.INFORMATION_MESSAGE);
    }
}