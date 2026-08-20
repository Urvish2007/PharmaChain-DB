package com.pharmachain.repository;

import com.pharmachain.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, String> {
    List<MaintenanceLog> findByEquipmentIdOrderByMaintenanceDateDesc(String equipmentId);
}
