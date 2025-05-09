package com.example.backend.supplyrequest.repository;

import com.example.backend.supplyrequest.entity.SupplyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplyRequestRepository extends JpaRepository<SupplyRequest, String> {}
