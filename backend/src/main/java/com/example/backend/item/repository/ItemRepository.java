package com.example.backend.item.repository;

import com.example.backend.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    boolean existsBySerialNumber(String serialNumber);
    Optional<Item> findByName(String name);
}