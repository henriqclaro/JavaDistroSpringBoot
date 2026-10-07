package com.cti.distro.infrastructure.repository;

import com.cti.distro.infrastructure.entities.Distro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface DistroRepository extends JpaRepository<Distro, Integer> {
    Optional<Distro> findByName(String name);

    @Transactional
    void deleteByName(String name);
}
