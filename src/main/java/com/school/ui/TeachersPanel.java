package com.school.ui;

import com.school.dao.TeacherDAO;
import com.school.model.Teacher;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class TeachersPanel extends JPanel {
    private final TeacherDAO teacherDAO;
    private JTable teachersTable;
    private DefaultTableModel tableModel;

    public TeachersPanel() {
        this.teacherDAO = new TeacherDAO();
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Header
        JPanel headerPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JLabel titleLabel = new JLabel("Professores");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 20));
        headerPanel.add(titleLabel);

        // Add Teacher Button
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton addButton = new JButton("Novo Professor");
        addButton.addActionListener(e -> showTeacherDialog(null));
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
        
        searchField.addActionListener(e -> searchTeachers(searchField.getText()));
        searchButton.addActionListener(e -> searchTeachers(searchField.getText()));
        
        searchPanel.add(new JLabel("Buscar: "));
        searchPanel.add(searchField);
        searchPanel.add(searchButton);
        add(searchPanel, BorderLayout.CENTER);

        // Teachers Table
        String[] columns = {"Nome", "Email", "Departamento", "Disciplinas", "Ações"};
        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        
        teachersTable = new JTable(tableModel);
        teachersTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        
        // Add action buttons to the table
        addTableButtons();
        
        JScrollPane scrollPane = new JScrollPane(teachersTable);
        add(scrollPane, BorderLayout.SOUTH);

        // Load initial data
        loadTeachers();
    }

    private void addTableButtons() {
        teachersTable.getColumn("Ações").setCellRenderer(new ButtonRenderer());
        teachersTable.getColumn("Ações").setCellEditor(new ButtonEditor(new JCheckBox()) {
            @Override
            protected void editItem(int row) {
                Teacher teacher = getTeacherAtRow(row);
                if (teacher != null) {
                    showTeacherDialog(teacher);
                }
            }

            @Override
            protected void deleteItem(int row) {
                Teacher teacher = getTeacherAtRow(row);
                if (teacher != null && confirmDelete()) {
                    try {
                        teacherDAO.delete(teacher.getId());
                        loadTeachers();
                        showSuccess("Professor removido com sucesso!");
                    } catch (Exception e) {
                        showError("Erro ao remover professor", e);
                    }
                }
            }
        });
    }

    private Teacher getTeacherAtRow(int row) {
        try {
            String email = (String) tableModel.getValueAt(row, 1);
            return teacherDAO.findByEmail(email);
        } catch (Exception e) {
            showError("Erro ao recuperar dados do professor", e);
            return null;
        }
    }

    private void loadTeachers() {
        tableModel.setRowCount(0);
        try {
            List<Teacher> teachers = teacherDAO.findAll();
            for (Teacher teacher : teachers) {
                addTeacherToTable(teacher);
            }
        } catch (Exception e) {
            showError("Erro ao carregar professores", e);
        }
    }

    private void addTeacherToTable(Teacher teacher) {
        tableModel.addRow(new Object[]{
            teacher.getName(),
            teacher.getEmail(),
            teacher.getDepartment(),
            String.join(", ", teacher.getSubjects().stream()
                .map(subject -> subject.getName())
                .toList()),
            "Ações"
        });
    }

    private void searchTeachers(String query) {
        try {
            List<Teacher> teachers = teacherDAO.search(query);
            tableModel.setRowCount(0);
            for (Teacher teacher : teachers) {
                addTeacherToTable(teacher);
            }
        } catch (Exception e) {
            showError("Erro ao buscar professores", e);
        }
    }

    private void showTeacherDialog(Teacher teacher) {
        JDialog dialog = new JDialog((Frame) SwingUtilities.getWindowAncestor(this), 
            teacher == null ? "Novo Professor" : "Editar Professor", true);
        dialog.setLayout(new BorderLayout());
        dialog.setSize(400, 300);
        dialog.setLocationRelativeTo(this);

        JPanel formPanel = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(5, 5, 5, 5);

        // Form fields
        String[] labels = {"Nome:", "Email:", "Departamento:"};
        JTextField[] fields = new JTextField[3];
        
        for (int i = 0; i < labels.length; i++) {
            gbc.gridx = 0;
            gbc.gridy = i;
            formPanel.add(new JLabel(labels[i]), gbc);

            fields[i] = new JTextField(20);
            gbc.gridx = 1;
            formPanel.add(fields[i], gbc);
        }

        if (teacher != null) {
            fields[0].setText(teacher.getName());
            fields[1].setText(teacher.getEmail());
            fields[2].setText(teacher.getDepartment());
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
                    Teacher newTeacher = teacher == null ? new Teacher() : teacher;
                    newTeacher.setName(fields[0].getText().trim());
                    newTeacher.setEmail(fields[1].getText().trim());
                    newTeacher.setDepartment(fields[2].getText().trim());

                    if (teacher == null) {
                        teacherDAO.save(newTeacher);
                    } else {
                        teacherDAO.update(newTeacher);
                    }

                    loadTeachers();
                    dialog.dispose();
                    showSuccess("Professor salvo com sucesso!");
                }
            } catch (Exception ex) {
                showError("Erro ao salvar professor", ex);
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

    private boolean confirmDelete() {
        return JOptionPane.showConfirmDialog(this,
            "Tem certeza que deseja remover este professor?",
            "Confirmar Exclusão",
            JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION;
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

class ButtonRenderer extends JPanel implements TableCellRenderer {
    private JButton editButton;
    private JButton deleteButton;

    public ButtonRenderer() {
        setLayout(new FlowLayout(FlowLayout.CENTER, 5, 0));
        
        editButton = new JButton("Editar");
        deleteButton = new JButton("Excluir");
        
        add(editButton);
        add(deleteButton);
    }

    @Override
    public Component getTableCellRendererComponent(JTable table, Object value,
            boolean isSelected, boolean hasFocus, int row, int column) {
        return this;
    }
}

abstract class ButtonEditor extends DefaultCellEditor {
    protected JButton editButton;
    protected JButton deleteButton;
    protected int row;

    public ButtonEditor(JCheckBox checkBox) {
        super(checkBox);
        
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 5, 0));
        
        editButton = new JButton("Editar");
        editButton.addActionListener(e -> editItem(row));
        
        deleteButton = new JButton("Excluir");
        deleteButton.addActionListener(e -> deleteItem(row));
        
        panel.add(editButton);
        panel.add(deleteButton);
        
        editorComponent = panel;
    }

    @Override
    public Component getTableCellEditorComponent(JTable table, Object value,
            boolean isSelected, int row, int column) {
        this.row = row;
        return editorComponent;
    }

    protected abstract void editItem(int row);
    protected abstract void deleteItem(int row);
}