# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Build stage - compiles and packages the fat jar. Not used at runtime; only
# target/pharmachain-backend-*.jar survives into the final image below.
# ---------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21-noble AS build
WORKDIR /build

# Copy the POM first and resolve dependencies before copying source, so that a source-only
# change doesn't bust the dependency-download layer cache (this is the single biggest lever
# for fast repeat builds with Maven in Docker).
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src

# Tests are NOT run here on purpose: BusinessRuleIntegrationTest needs a real Docker daemon
# (Testcontainers), which a Docker build sandbox doesn't give you without extra plumbing
# (docker-in-docker / mounting the host socket) that isn't worth the complexity or the
# security trade-off for a build step. Tests run as their own CI job instead, directly on the
# runner, against the runner's native Docker - see .github/workflows/ci.yml.
#
# spring-boot-maven-plugin's repackage goal leaves the original thin jar behind as
# *.jar.original; deleting it means the COPY --from=build below can never accidentally grab
# the wrong one.
RUN mvn -B -q clean package -DskipTests \
    && rm -f target/*.jar.original

# ---------------------------------------------------------------------------
# Runtime stage - just a JRE and the jar. No Maven, no source, no build cache.
# ---------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-noble
WORKDIR /app

# Run as an unprivileged user rather than the image's default root.
RUN groupadd --system spring && useradd --system --gid spring --no-create-home spring

COPY --from=build /build/target/pharmachain-backend-*.jar app.jar
RUN chown spring:spring app.jar
USER spring:spring

EXPOSE 8080

# Real HTTP health check against Actuator's /actuator/health, sent by hand over bash's
# /dev/tcp pseudo-device rather than via curl/wget - the noble-based JRE image doesn't ship
# either of those by default, and installing one just for this felt like the wrong trade-off.
# Checks the response body for a literal "UP" status rather than just "is port 8080 open".
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD bash -c '\
        exec 3<>/dev/tcp/127.0.0.1/8080 && \
        printf "GET /actuator/health HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n" >&3 && \
        grep -q "\"status\":\"UP\"" <&3' || exit 1

# Shell form so JAVA_OPTS (e.g. "-Xmx256m") can be supplied at `docker run` time without
# rebuilding the image; expands to nothing, harmlessly, if unset.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
