package com.pharmachain.service;

import com.pharmachain.dto.response.ExpiryRiskRow;
import com.pharmachain.dto.response.InventoryShortageRow;
import com.pharmachain.dto.response.TraceabilityRow;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Thin read layer over the three reporting views that already live in the database
 * (Views.sql). No business logic belongs here - the SQL views already do the joins and
 * aggregation; this class just runs them and maps each row onto a response record.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;

    public List<InventoryShortageRow> inventoryShortage() {
        return jdbcTemplate.query(
                "SELECT item_id, material_name, material_type, current_stock, "
                        + "minimum_required, units_to_order FROM pharma_manufacturing.v_inventory_shortage",
                (rs, rowNum) -> new InventoryShortageRow(
                        rs.getLong("item_id"),
                        rs.getString("material_name"),
                        rs.getString("material_type"),
                        rs.getBigDecimal("current_stock"),
                        rs.getBigDecimal("minimum_required"),
                        rs.getBigDecimal("units_to_order")
                ));
    }

    public List<ExpiryRiskRow> expiryRisk() {
        return jdbcTemplate.query(
                "SELECT batch_no, product_name, exp_date, days_remaining, risk_status, "
                        + "manufactured_qty, total_sold_qty, unsold_inventory "
                        + "FROM pharma_manufacturing.v_inventory_expiry_risk",
                (rs, rowNum) -> new ExpiryRiskRow(
                        rs.getLong("batch_no"),
                        rs.getString("product_name"),
                        rs.getObject("exp_date", LocalDate.class),
                        rs.getInt("days_remaining"),
                        rs.getString("risk_status"),
                        rs.getBigDecimal("manufactured_qty"),
                        rs.getBigDecimal("total_sold_qty"),
                        rs.getBigDecimal("unsold_inventory")
                ));
    }

    public List<TraceabilityRow> traceability(Long batchNo) {
        return jdbcTemplate.query(
                "SELECT batch_no, product_name, mfg_date, exp_date, qc_status, "
                        + "raw_materials_used, total_sold_to_market "
                        + "FROM pharma_manufacturing.v_fda_batch_traceability WHERE batch_no = ?",
                (rs, rowNum) -> new TraceabilityRow(
                        rs.getLong("batch_no"),
                        rs.getString("product_name"),
                        rs.getObject("mfg_date", LocalDate.class),
                        rs.getObject("exp_date", LocalDate.class),
                        rs.getString("qc_status"),
                        rs.getString("raw_materials_used"),
                        rs.getBigDecimal("total_sold_to_market")
                ),
                batchNo);
    }
}
