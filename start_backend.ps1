$ErrorActionPreference = "Stop"
if (-not (Test-Path "apache-maven-3.9.6")) {
    Write-Host "Downloading Maven..."
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile "maven.zip"
    Write-Host "Extracting Maven..."
    Expand-Archive -Path "maven.zip" -DestinationPath "."
}
$env:PATH = "$PWD\apache-maven-3.9.6\bin;" + $env:PATH
Write-Host "Building project..."
.\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
Write-Host "Starting Spring Boot app..."
.\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
