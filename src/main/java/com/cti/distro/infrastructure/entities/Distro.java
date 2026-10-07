package com.cti.distro.infrastructure.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "distro")
@Entity
public class Distro {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "name", unique = true, length = 50, nullable = false)
    private String name;

    @Column(name = "base", length = 50)
    private String base;

    @Column(name = "package_manager", length = 30)
    private String packageManager;

    @Column(name = "environment", length = 50)
    private String environment;

}
