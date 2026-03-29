package com.landregistry.backend.controller;

import com.landregistry.backend.model.LandHistory;
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
    public List<LandHistory> getLandHistory(@PathVariable String landId) {
        return service.getHistory(landId);
    }
}
