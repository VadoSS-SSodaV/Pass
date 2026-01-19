package com.company.passmanagement.repository;

import com.company.passmanagement.entity.Pass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassRepository extends JpaRepository<Pass, Long> {
    List<Pass> findByUserIdOrderByRequestedAtDesc(Long userId);
    List<Pass> findAllByOrderByRequestedAtDesc();
    List<Pass> findByStatusOrderByRequestedAtDesc(Pass.Status status);
}