package com.campus.hub.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.google.oauth")
public record GoogleOAuthProperties(String clientId) {}
