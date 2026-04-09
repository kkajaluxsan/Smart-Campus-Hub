package com.campus.hub.service;

import com.campus.hub.config.GoogleOAuthProperties;
import com.campus.hub.dto.GoogleUserInfo;
import com.campus.hub.exception.ApiException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final GoogleOAuthProperties properties;

    public GoogleUserInfo verify(String idTokenString) {
        if (properties.clientId() == null || properties.clientId().isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured on this server");
        }
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(properties.clientId()))
                    .build();
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google credential");
            }
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String sub = payload.getSubject();
            if (email == null || sub == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google token payload");
            }
            Boolean verified = payload.getEmailVerified();
            boolean emailVerified = Boolean.TRUE.equals(verified);
            String name = (String) payload.get("name");
            if (name == null || name.isBlank()) {
                int at = email.indexOf('@');
                name = at > 0 ? email.substring(0, at) : email;
            }
            return new GoogleUserInfo(email, sub, name, emailVerified);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Could not verify Google credential");
        }
    }
}
