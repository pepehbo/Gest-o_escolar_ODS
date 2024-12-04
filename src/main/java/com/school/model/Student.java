package com.school.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String registration;

    @Column(nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false)
    private String className;

    @OneToMany(mappedBy = "student")
    private Set<Grade> grades;

    @OneToMany(mappedBy = "student")
    private Set<Attendance> attendanceRecords;
}