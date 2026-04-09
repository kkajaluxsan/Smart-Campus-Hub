package com.campus.hub.service;

import com.campus.hub.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationEmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@campus.edu}")
    private String mailFrom;

    @Value("${app.mail.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public void sendVerificationEmail(User user, String plainToken) {
        String base = frontendBaseUrl.replaceAll("/$", "");
        String link = base + "/verify-email?token=" + plainToken;
        String body = "Hello " + user.getFullName() + ",\n\n"
                + "Please verify your campus portal email by opening this link (valid 48 hours):\n\n"
                + link + "\n\n"
                + "If you did not create an account, you can ignore this message.\n";

        if (mailEnabled) {
            JavaMailSender ms = mailSenderProvider.getIfAvailable();
            if (ms != null) {
                try {
                    SimpleMailMessage m = new SimpleMailMessage();
                    m.setFrom(mailFrom);
                    m.setTo(user.getEmail());
                    m.setSubject("Verify your campus portal email");
                    m.setText(body);
                    ms.send(m);
                    log.info("Verification email sent to {}", user.getEmail());
                } catch (Exception e) {
                    log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
                    logFallbackLink(user.getEmail(), link);
                }
            } else {
                log.warn("Mail enabled but JavaMailSender not configured; logging link instead");
                logFallbackLink(user.getEmail(), link);
            }
        } else {
            log.debug("Mail disabled — verification email skipped for {}", user.getEmail());
        }
    }

    private void logFallbackLink(String email, String link) {
        log.debug("VERIFICATION LINK for {} has been generated (token redacted from logs)", email);
    }
}
