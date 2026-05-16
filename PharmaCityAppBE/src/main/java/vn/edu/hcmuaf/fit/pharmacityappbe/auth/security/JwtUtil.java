package vn.edu.hcmuaf.fit.pharmacityappbe.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET = "my_secret_key_123456789012345678901234";
    private final long EXPIRATION = 1000 * 60 * 60 * 24;

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(int userId, String role) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extract(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public int getUserId(String token) {
        return Integer.parseInt(extract(token).getSubject());
    }

    public String getRole(String token) {
        return extract(token).get("role", String.class);
    }

    public boolean isValid(String token) {
        try {
            extract(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}