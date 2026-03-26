package com.campus.hub.service;

import com.campus.hub.exception.ApiException;
import com.campus.hub.model.Ticket;
import com.campus.hub.model.TicketAttachment;
import com.campus.hub.repository.TicketAttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final TicketAttachmentRepository attachmentRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final long MAX_BYTES = 5 * 1024 * 1024;

    @Transactional
    public TicketAttachment storeAttachment(Long ticketId, MultipartFile file, Ticket ticket) throws IOException {
        if (attachmentRepository.countByTicketId(ticketId) >= 3) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Maximum 3 images per ticket");
        }
        String contentType = file.getContentType();
        if (contentType == null
                || (!contentType.equalsIgnoreCase("image/jpeg") && !contentType.equalsIgnoreCase("image/png"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG and PNG images are allowed");
        }
        String original = file.getOriginalFilename();
        if (original != null) {
            String lower = original.toLowerCase(Locale.ROOT);
            if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png")) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG and PNG images are allowed");
            }
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File size must be at most 5MB");
        }

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        String stored = UUID.randomUUID() + ".bin";
        Path target = dir.resolve(stored);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        TicketAttachment att = TicketAttachment.builder()
                .ticket(ticket)
                .storedFilename(stored)
                .originalFilename(original != null ? original : "image")
                .contentType(contentType)
                .sizeBytes(file.getSize())
                .uploadedAt(Instant.now())
                .build();
        return attachmentRepository.save(att);
    }

    public Path resolveFile(String storedFilename) {
        Path p = Paths.get(uploadDir).resolve(storedFilename).normalize();
        if (!p.startsWith(Paths.get(uploadDir).normalize())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid path");
        }
        return p;
    }
}
