package com.example.backend.supplyRequest.repository;

import com.example.backend.supplyRequest.entity.SupplyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplyRequestRepository extends JpaRepository<SupplyRequest, Long> {}
