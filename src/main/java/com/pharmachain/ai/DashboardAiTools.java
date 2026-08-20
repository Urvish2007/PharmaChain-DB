package com.pharmachain.ai;

import com.pharmachain.dto.response.ExpiryRiskRow;
import com.pharmachain.dto.response.InventoryShortageRow;
import com.pharmachain.dto.response.TraceabilityRow;
import com.pharmachain.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * These methods are what the compliance copilot calls to answer questions about current data,
 * instead of being handed raw SQL access. Each one just delegates to DashboardService - the same
 * read layer the REST dashboard endpoints use - so the model can never see or touch anything the
 * API itself couldn't already return, and every number it reports traces back to one of the
 * three SQL views, not to something it inferred or made up.
 */
@Component
@RequiredArgsConstructor
public class DashboardAiTools {

    private final DashboardService dashboardService;

    @Tool(description = "Get every raw material whose warehouse stock has dropped to or below "
            + "its configured reorder level, i.e. what needs to be reordered right now")
    public List<InventoryShortageRow> getInventoryShortage() {
        return dashboardService.inventoryShortage();
    }

    @Tool(description = "Get every unsold finished-goods batch along with how many days remain "
            + "until it expires, i.e. what's at risk of expiring before it's sold")
    public List<ExpiryRiskRow> getExpiryRisk() {
        return dashboardService.expiryRisk();
    }

    @Tool(description = "Get the full traceability record for one production batch: product, "
            + "manufacturing/expiry dates, QC status, raw materials used, and units sold so far")
    public List<TraceabilityRow> getBatchTraceability(
            @ToolParam(description = "The batch number to trace, e.g. 5001") Long batchNo) {
        return dashboardService.traceability(batchNo);
    }
}
