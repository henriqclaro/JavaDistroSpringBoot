package com.cti.distro.business;

import com.cti.distro.infrastructure.entities.Distro;
import com.cti.distro.infrastructure.repository.DistroRepository;
import org.springframework.stereotype.Service;

@Service
public class DistroService {
    private final DistroRepository repository;

    public DistroService(DistroRepository repository) {
        this.repository = repository;
    }

    public void registerDistro(Distro distro) {
        repository.saveAndFlush(distro);
    }

    public Distro findByName(String name) {
        return repository.findByName(name).orElseThrow(
                () -> new RuntimeException("Nome não encontrado")
        );
    }

    public void updateById(Integer id, Distro distro) {
        Distro distroEntity = repository.findById(id).orElseThrow(
                () -> new RuntimeException("Distro não encontrada")
        );
        Distro updatedDistro = Distro.builder()
                .name(distro.getName() != null ? distro.getName() : distroEntity.getName())
                .base(distro.getBase() != null ? distro.getBase() : distroEntity.getBase())
                .packageManager(distro.getPackageManager() != null ? distro.getPackageManager() : distroEntity.getPackageManager())
                .environment(distro.getEnvironment() != null ? distro.getEnvironment() : distroEntity.getEnvironment())
                .id(id)
                .build();

        repository.saveAndFlush(updatedDistro);
    }

    public void deleteByName(String name) {
        repository.deleteByName(name);
    }
}
