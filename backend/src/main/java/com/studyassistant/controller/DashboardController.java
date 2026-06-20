package com.studyassistant.controller;

import com.studyassistant.dto.response.DashboardStatsResponse;
import com.studyassistant.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * DashboardController — REST API layer for dashboard statistics.
 *
 * Exposes:
 *   GET /api/dashboard/stats
 *
 * Auth: JWT required — Spring Security enforces this before the method runs.
 * The user identity comes from the JWT token, not from a path variable or
 * request parameter, so there is nothing to tamper with at the URL level.
 *
 * This controller intentionally has only one endpoint.
 * Future dashboard features (activity feed, streaks, recommendations)
 * can be added here without touching any other controller.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    // ─────────────────────────────────────────
    // GET /api/dashboard/stats
    // ─────────────────────────────────────────

    /**
     * Returns aggregate statistics for the currently authenticated user.
     *
     * HTTP Method : GET
     * URL         : /api/dashboard/stats
     * Auth        : Required (JWT Bearer token in Authorization header)
     * Returns     : 200 OK + DashboardStatsResponse
     *
     * The user is identified from the JWT — no userId is needed or accepted
     * in the URL. This prevents any possibility of querying another user's stats.
     */
    @GetMapping("/stats")
    // Maps GET /api/dashboard/stats
    // "/stats" appended to the class-level /api/dashboard base path.
    // Structured as /stats (not just /api/dashboard) to leave room for
    // future endpoints like /api/dashboard/activity, /api/dashboard/streak.

    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        log.info("GET /api/dashboard/stats called");

        DashboardStatsResponse response = dashboardService.getDashboardStats();

        return ResponseEntity.ok(response);
        // 200 OK — the stats were found and assembled successfully.
        // This endpoint never returns 404 — a user with zero topics/notes/materials
        // still gets a valid response with all counts at 0.
    }
}