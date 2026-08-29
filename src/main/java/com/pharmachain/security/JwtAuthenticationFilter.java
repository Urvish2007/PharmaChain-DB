package com.pharmachain.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Runs once per request, before Spring Security's own UsernamePasswordAuthenticationFilter.
 * If a valid "Authorization: Bearer &lt;token&gt;" header is present, it authenticates the request;
 * otherwise it simply does nothing and lets the request continue unauthenticated, so that public
 * endpoints (/api/v1/auth/**, Swagger) still work and protected ones fall through to
 * RestAuthenticationEntryPoint for a clean 401.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String token = header.substring(BEARER_PREFIX.length());
            Optional<String> username = jwtService.extractUsername(token);

            if (username.isPresent()) {
                try {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username.get());
                    if (isUsable(userDetails)) {
                        var authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                    // else: account disabled/locked/expired. Leave the context unauthenticated so
                    // the request falls through to a normal 401 via RestAuthenticationEntryPoint,
                    // rather than silently authenticating an account that shouldn't be usable.
                } catch (UsernameNotFoundException e) {
                    // The token names a user that no longer exists (e.g. deleted after the token
                    // was issued). This filter runs *before* ExceptionTranslationFilter in the
                    // chain, so nothing downstream would catch this if it escaped - leave the
                    // context unauthenticated instead and let the normal 401 path handle it.
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isUsable(UserDetails userDetails) {
        return userDetails.isEnabled()
                && userDetails.isAccountNonLocked()
                && userDetails.isAccountNonExpired()
                && userDetails.isCredentialsNonExpired();
    }
}
