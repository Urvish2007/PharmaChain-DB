package com.pharmachain.service;

import com.pharmachain.dto.request.ESignatureRequest;
import com.pharmachain.exception.BusinessRuleViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ESignatureService {

    private final AuthenticationManager authenticationManager;
    private final AuditLedgerService auditLedgerService;

    @Transactional
    public void signRecord(ESignatureRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessRuleViolationException("Must be authenticated to provide an electronic signature.");
        }
        
        String username = authentication.getName();
        
        try {
            // Re-authenticate the user with the provided password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.password()));
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new BadCredentialsException("Invalid password for electronic signature re-authentication.");
        }

        // Action string combines the raw action and the meaning for 21 CFR Part 11 context
        String actionToLog = request.action() + " [E-SIGNATURE: " + request.meaning() + "]";

        // The payload can capture additional signature metadata
        Map<String, String> payload = Map.of(
            "signer", username,
            "meaning", request.meaning(),
            "compliance", "21 CFR Part 11 Electronic Signature"
        );

        auditLedgerService.logAction(
                actionToLog,
                request.entityName(),
                request.entityId(),
                payload
        );
    }
}
