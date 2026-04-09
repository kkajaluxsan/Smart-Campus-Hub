package com.campus.hub.security;

import com.campus.hub.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;

    public String createToken(String email, Long userId, Role role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtProperties.getExpirationMs());
        return Jwts.builder()
                .subject(email)
                .claim("uid", userId)
                .claim("role", role.name())
                .issuedAt(now)
                .expiration(exp)
                .signWith(key())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getEmail(String token) {
        return parse(token).getSubject();
    }

    public Role getRole(String token) {
        return Role.valueOf(parse(token).get("role", String.class));
    }

    public Long getUserId(String token) {
        Object uid = parse(token).get("uid");
        if (uid instanceof Number n) {
            return n.longValue();
        }
        throw new IllegalStateException("Invalid token uid");
    }

    private SecretKey key() {
        byte[] bytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes");
        }
        return Keys.hmacShaKeyFor(bytes);
    }
}
