package com.landregistry.backend.controller;

import com.landregistry.backend.dto.LandHistoryResponse;
import com.landregistry.backend.service.LandHistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final LandHistoryService service;

    public HistoryController(LandHistoryService service) {
        this.service = service;
    }

    @GetMapping("/{landId}")
    public List<LandHistoryResponse> getLandHistory(@PathVariable String landId) {
        return service.getHistory(landId);
    }
}
