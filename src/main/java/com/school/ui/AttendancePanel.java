// Update the AttendancePanel with enhanced functionality
package com.school.ui;

import com.school.dao.AttendanceDAO;
import com.school.model.Attendance;
import com.school.model.Student;
import com.school.model.Subject;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class AttendancePanel extends JPanel {
    private final AttendanceDAO attendanceDAO;
    private JTable attendanceTable;
    private DefaultTableModel tableModel;
    private JComboBox<Subject> subjectComboBox;
    private JDateChooser dateChooser;
    
    public AttendancePanel() {
        this.attendanceDAO = new AttendanceDAO();
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Header
        JPanel headerPanel = new JPanel(new BorderLayout());
        
        // Title
        JLabel titleLabel = new JLabel("Controle de Frequência");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 20));
        headerPanel.add(titleLabel, BorderLayout.WEST);
        
        // Date selection
        JPanel datePanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        dateChooser = new JDateChooser();
        dateChooser.setDate(new Date());
        datePanel.add(new JLabel("Data:"));
        datePanel.add(dateChooser);
        headerPanel.add(datePanel, BorderLayout.EAST);
        
        add(headerPanel, BorderLayout.NORTH);

        // Subject selection and filters
        JPanel filtersPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        
        // Subject dropdown
        subjectComboBox = new JComboBox<>();
        loadSubjects();
        filtersPanel.add(new JLabel("Disciplina:"));
        filtersPanel.add(subjectComboBox);
        
        JButton loadButton = new JButton("Carregar Lista");
        loadButton.addActionListener(e -> loadAttendance());
        filtersPanel.add(loadButton);
        
        add(filtersPanel, BorderLayout.CENTER);

        // Attendance table
        String[] columns = {
            "Matrícula", "Nome do Aluno", "Presente", "Justificativa"
        };
        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return column == 2 || column == 3; // Only presence and justification are editable
            }
            
            @Override
            public Class<?> getColumnClass(int column) {
                return column == 2 ? Boolean.class : String.class;
            }
        };
        
        attendanceTable = new JTable(tableModel);
        attendanceTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        
        JScrollPane scrollPane = new JScrollPane(attendanceTable);
        add(scrollPane, BorderLayout.CENTER);

        // Buttons panel
        JPanel buttonsPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        
        JButton markAllPresentButton = new JButton("Marcar Todos Presentes");
        markAllPresentButton.addActionListener(e -> markAllPresent());
        buttonsPanel.add(markAllPresentButton);
        
        JButton saveButton = new JButton("Salvar Frequência");
        saveButton.addActionListener(e -> saveAttendance());
        buttonsPanel.add(saveButton);
        
        add(buttonsPanel, BorderLayout.SOUTH);

        // Load initial data
        loadAttendance();
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

    private void loadAttendance() {
        tableModel.setRowCount(0);
        try {
            Subject selectedSubject = (Subject) subjectComboBox.getSelectedItem();
            LocalDate selectedDate = LocalDate.now(); // Get from dateChooser
            
            if (selectedSubject != null) {
                List<Attendance> attendanceList = attendanceDAO
                    .findBySubjectAndDate(selectedSubject.getId(), selectedDate);
                
                // If no attendance records exist for this date, load all students
                if (attendanceList.isEmpty()) {
                    List<Student> students = new StudentDAO().findAll();
                    for (Student student : students) {
                        tableModel.addRow(new Object[]{
                            student.getRegistration(),
                            student.getName(),
                            false,
                            ""
                        });
                    }
                } else {
                    for (Attendance attendance : attendanceList) {
                        addAttendanceToTable(attendance);
                    }
                }
            }
        } catch (Exception e) {
            showError("Erro ao carregar frequência", e);
        }
    }

    private void addAttendanceToTable(Attendance attendance) {
        Student student = attendance.getStudent();
        tableModel.addRow(new Object[]{
            student.getRegistration(),
            student.getName(),
            attendance.getPresent(),
            attendance.getJustification()
        });
    }

    private void markAllPresent() {
        for (int i = 0; i < tableModel.getRowCount(); i++) {
            tableModel.setValueAt(true, i, 2);
        }
    }

    private void saveAttendance() {
        try {
            Subject selectedSubject = (Subject) subjectComboBox.getSelectedItem();
            LocalDate selectedDate = LocalDate.now(); // Get from dateChooser
            
            if (selectedSubject == null) {
                showError("Selecione uma disciplina", null);
                return;
            }
            
            List<Attendance> attendanceList = new ArrayList<>();
            
            for (int i = 0; i < tableModel.getRowCount(); i++) {
                String registration = (String) tableModel.getValueAt(i, 0);
                Boolean present = (Boolean) tableModel.getValueAt(i, 2);
                String justification = (String) tableModel.getValueAt(i, 3);
                
                Student student = new StudentDAO().findByRegistration(registration);
                
                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setSubject(selectedSubject);
                attendance.setDate(selectedDate);
                attendance.setPresent(present);
                attendance.setJustification(justification);
                
                attendanceList.add(attendance);
            }
            
            attendanceDAO.saveAll(attendanceList);
            showSuccess("Frequência salva com sucesso!");
            
        } catch (Exception e) {
            showError("Erro ao salvar frequência", e);
        }
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