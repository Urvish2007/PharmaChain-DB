package com.pharmachain.dto.response;

/** Small acknowledgement body for actions that don't return a resource (e.g. recall initiated). */
public record ApiMessage(String message) {
}
