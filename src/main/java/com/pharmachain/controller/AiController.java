package com.pharmachain.controller;

import com.pharmachain.ai.ComplianceCopilotService;
import com.pharmachain.ai.RecallNoticeDraft;
import com.pharmachain.ai.RecallNoticeService;
import com.pharmachain.dto.request.AskRequest;
import com.pharmachain.dto.response.AskResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "Compliance copilot (RAG + tool-calling) and recall-notice drafting, powered by Spring AI")
public class AiController {

    private final ComplianceCopilotService copilotService;
    private final RecallNoticeService recallNoticeService;

    /**
     * Any authenticated role can ask - this is meant to be a general operational aid (why is
     * something blocked, what needs reordering, trace this batch), not a privileged action.
     */
    @PostMapping("/ask")
    public AskResponse ask(@Valid @RequestBody AskRequest request) {
        return new AskResponse(copilotService.ask(request.question()));
    }

    /** Drafting a formal recall notice is QC/Admin territory, same as initiating the recall itself. */
    @GetMapping("/recall-notice/{recallId}")
    @PreAuthorize("hasAnyRole('ADMIN','QC_ANALYST')")
    public RecallNoticeDraft recallNotice(@PathVariable String recallId) {
        return recallNoticeService.draftNotice(recallId);
    }
}
