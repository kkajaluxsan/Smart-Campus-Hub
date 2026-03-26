package com.campus.hub.controller;

import com.campus.hub.dto.*;
import com.campus.hub.service.CurrentUserService;
import com.campus.hub.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<TicketDto> list() {
        return ticketService.list(currentUserService.requireCurrentUser());
    }

    @GetMapping("/{id}")
    public TicketDto get(@PathVariable Long id) {
        return ticketService.get(id, currentUserService.requireCurrentUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketDto create(@Valid @RequestBody CreateTicketRequest req) {
        return ticketService.create(req, currentUserService.requireCurrentUser());
    }

    @PatchMapping("/{id}")
    public TicketDto update(@PathVariable Long id, @Valid @RequestBody UpdateTicketRequest req) {
        return ticketService.update(id, req, currentUserService.requireCurrentUser());
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public TicketDto assign(@PathVariable Long id, @Valid @RequestBody AssignTechnicianRequest req) {
        return ticketService.assignTechnician(id, req, currentUserService.requireCurrentUser());
    }

    @PostMapping("/{ticketId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentDto addComment(@PathVariable Long ticketId, @Valid @RequestBody CreateCommentRequest req) {
        return ticketService.addComment(ticketId, req, currentUserService.requireCurrentUser());
    }

    @PatchMapping("/{ticketId}/comments/{commentId}")
    public CommentDto updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody CreateCommentRequest req
    ) {
        return ticketService.updateComment(ticketId, commentId, req, currentUserService.requireCurrentUser());
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long ticketId, @PathVariable Long commentId) {
        ticketService.deleteComment(ticketId, commentId, currentUserService.requireCurrentUser());
    }

    @PostMapping("/{ticketId}/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentDto upload(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ticketService.uploadAttachment(ticketId, file, currentUserService.requireCurrentUser());
    }
}
