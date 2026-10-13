package com.cti.distro.controller;

import com.cti.distro.business.DistroService;
import com.cti.distro.infrastructure.entities.Distro;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/distro")
@RequiredArgsConstructor
public class DistroController {

    private final DistroService distroService;

    @PostMapping
    public ResponseEntity<Void> createDistro(@RequestBody Distro distro) {
        distroService.registerDistro(distro);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Distro> searchDistroByName(@RequestParam String name) {
        return ResponseEntity.ok(distroService.findByName(name));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteDistroByName(@RequestParam String name) {
        distroService.deleteByName(name);
        return ResponseEntity.ok().build();
    }

    @PutMapping
    public ResponseEntity<Void> updateDistroById(@RequestParam Integer id, @RequestBody Distro distro) {
        distroService.updateById(id, distro);
        return ResponseEntity.ok().build();
    }
}