package com.campus.hub.service;

import com.campus.hub.dto.*;
import com.campus.hub.exception.ApiException;
import com.campus.hub.model.*;
import com.campus.hub.repository.CampusResourceRepository;
import com.campus.hub.repository.CommentRepository;
import com.campus.hub.repository.TicketAttachmentRepository;
import com.campus.hub.repository.TicketRepository;
import com.campus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CampusResourceRepository campusResourceRepository;
    private final CommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public TechnicianWorkloadDto workloadForTechnician(User tech) {
        if (tech.getRole() != Role.TECHNICIAN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Technicians only");
        }
        List<TicketDto> tickets = list(tech).stream()
                .filter(t -> t.status() == TicketStatus.OPEN || t.status() == TicketStatus.IN_PROGRESS)
                .toList();
        long breached = tickets.stream()
                .filter(t -> Boolean.TRUE.equals(t.slaBreached()))
                .count();
        return new TechnicianWorkloadDto(tickets.size(), breached, tickets);
    }

    @Transactional(readOnly = true)
    public List<TicketDto> list(User currentUser) {
        List<Ticket> tickets = switch (currentUser.getRole()) {
            case ADMIN -> ticketRepository.findAllByOrderByUpdatedAtDesc();
            case TECHNICIAN -> ticketRepository.findByAssignedTechnicianIdOrderByUpdatedAtDesc(currentUser.getId());
            case USER -> ticketRepository.findByCreatedByIdOrderByUpdatedAtDesc(currentUser.getId());
        };
        return tickets.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public TicketDto get(Long id, User currentUser) {
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ticket not found"));
        assertTicketAccess(t, currentUser);
        return toDto(t);
    }

    @Transactional
    public TicketDto create(CreateTicketRequest req, User currentUser) {
        CampusResource resource = campusResourceRepository.findById(req.resourceId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));
        Instant now = Instant.now();
        Ticket ticket = Ticket.builder()
                .resource(resource)
                .createdBy(currentUser)
                .description(req.description())
                .priority(req.priority())
                .status(TicketStatus.OPEN)
                .createdAt(now)
                .updatedAt(now)
                .slaDueAt(TicketSlaCalculator.computeDue(now, req.priority()))
                .build();
        ticketRepository.save(ticket);
        auditService.log(currentUser, "TICKET_CREATED", "Ticket", ticket.getId(), null);
        return toDto(ticket);
    }

    @Transactional
    public TicketDto update(Long id, UpdateTicketRequest req, User currentUser) {
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ticket not found"));
        assertTicketAccess(t, currentUser);
        TicketStatus oldStatus = t.getStatus();
        if (currentUser.getRole() == Role.USER) {
            if (req.status() != null || req.priority() != null) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Cannot change status or priority");
            }
            if (req.description() != null) {
                t.setDescription(req.description());
            }
        } else {
            if (req.status() != null) {
                t.setStatus(req.status());
            }
            if (req.priority() != null) {
                t.setPriority(req.priority());
                t.setSlaDueAt(TicketSlaCalculator.computeDue(t.getCreatedAt(), req.priority()));
            }
            if (req.description() != null) {
                t.setDescription(req.description());
            }
        }
        t.setUpdatedAt(Instant.now());
        ticketRepository.save(t);
        if (req.status() != null && req.status() != oldStatus) {
            notifyTicketParticipants(t, "Ticket #" + t.getId() + " status changed to " + t.getStatus());
            auditService.log(currentUser, "TICKET_STATUS_UPDATE", "Ticket", t.getId(), oldStatus + " -> " + t.getStatus());
        }
        return toDto(t);
    }

    @Transactional
    public TicketDto assignTechnician(Long id, AssignTechnicianRequest req, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin only");
        }
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ticket not found"));
        User tech = userRepository.findById(req.technicianId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Technician not found"));
        if (tech.getRole() != Role.TECHNICIAN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User is not a technician");
        }
        t.setAssignedTechnician(tech);
        t.setUpdatedAt(Instant.now());
        notificationService.notify(tech,
                "You were assigned to ticket #" + t.getId(),
                NotificationType.TICKET, "TICKET", t.getId());
        return toDto(ticketRepository.save(t));
    }

    @Transactional
    public CommentDto addComment(Long ticketId, CreateCommentRequest req, User currentUser) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ticket not found"));
        assertTicketAccess(t, currentUser);
        Comment c = Comment.builder()
                .ticket(t)
                .user(currentUser)
                .content(req.content())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        commentRepository.save(c);
        notifyComment(t, currentUser, c.getId());
        return toCommentDto(c);
    }

    @Transactional
    public CommentDto updateComment(Long ticketId, Long commentId, CreateCommentRequest req, User currentUser) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!c.getTicket().getId().equals(ticketId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        if (!c.getUser().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the author can edit this comment");
        }
        c.setContent(req.content());
        c.setUpdatedAt(Instant.now());
        return toCommentDto(commentRepository.save(c));
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId, User currentUser) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!c.getTicket().getId().equals(ticketId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        if (!c.getUser().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the author can delete this comment");
        }
        commentRepository.delete(c);
    }

    @Transactional
    public AttachmentDto uploadAttachment(Long ticketId, MultipartFile file, User currentUser) throws IOException {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ticket not found"));
        assertTicketAccess(t, currentUser);
        TicketAttachment att = fileStorageService.storeAttachment(ticketId, file, t);
        return toAttachmentDto(att);
    }

    private void notifyComment(Ticket t, User author, Long commentId) {
        String msg = author.getFullName() + " commented on ticket #" + t.getId();
        if (!t.getCreatedBy().getId().equals(author.getId())) {
            notificationService.notify(t.getCreatedBy(), msg, NotificationType.COMMENT, "COMMENT", commentId);
        }
        if (t.getAssignedTechnician() != null
                && !t.getAssignedTechnician().getId().equals(author.getId())) {
            notificationService.notify(t.getAssignedTechnician(), msg, NotificationType.COMMENT, "COMMENT", commentId);
        }
    }

    private void notifyTicketParticipants(Ticket t, String message) {
        notificationService.notify(t.getCreatedBy(), message, NotificationType.TICKET, "TICKET", t.getId());
        if (t.getAssignedTechnician() != null) {
            notificationService.notify(t.getAssignedTechnician(), message, NotificationType.TICKET, "TICKET", t.getId());
        }
    }

    private void assertTicketAccess(Ticket t, User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }
        if (currentUser.getRole() == Role.TECHNICIAN
                && t.getAssignedTechnician() != null
                && t.getAssignedTechnician().getId().equals(currentUser.getId())) {
            return;
        }
        if (t.getCreatedBy().getId().equals(currentUser.getId())) {
            return;
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "No access to this ticket");
    }

    private TicketDto toDto(Ticket t) {
        List<CommentDto> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(t.getId()).stream()
                .map(this::toCommentDto)
                .toList();
        List<AttachmentDto> attachments = attachmentRepository.findByTicketId(t.getId()).stream()
                .map(this::toAttachmentDto)
                .toList();
        boolean open = t.getStatus() != TicketStatus.CLOSED && t.getStatus() != TicketStatus.RESOLVED;
        Instant sla = t.getSlaDueAt();
        boolean breached = open && sla != null && Instant.now().isAfter(sla);
        return new TicketDto(
                t.getId(),
                t.getResource().getId(),
                t.getResource().getName(),
                t.getCreatedBy().getId(),
                t.getCreatedBy().getEmail(),
                t.getAssignedTechnician() != null ? t.getAssignedTechnician().getId() : null,
                t.getAssignedTechnician() != null ? t.getAssignedTechnician().getEmail() : null,
                t.getDescription(),
                t.getPriority(),
                t.getStatus(),
                t.getCreatedAt(),
                t.getUpdatedAt(),
                sla,
                breached,
                comments,
                attachments
        );
    }

    private CommentDto toCommentDto(Comment c) {
        return new CommentDto(
                c.getId(),
                c.getUser().getId(),
                c.getUser().getEmail(),
                c.getContent(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }

    private AttachmentDto toAttachmentDto(TicketAttachment a) {
        String base = "/api/files/" + a.getStoredFilename();
        return new AttachmentDto(
                a.getId(),
                a.getOriginalFilename(),
                a.getContentType(),
                a.getSizeBytes(),
                a.getUploadedAt(),
                base
        );
    }
}
