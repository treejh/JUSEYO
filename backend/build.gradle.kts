plugins {
    java
    id("org.springframework.boot") version "3.4.5"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {

    //기본 의존성
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    compileOnly("org.projectlombok:lombok")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    //데이터베이스 관련 의존성
    runtimeOnly("com.mysql:mysql-connector-j")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")


    //swagger 의존성
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.5")

}


tasks.register<Exec>("dockerUp") {
    group = "docker"
    description = "Starts the Docker containers"

    commandLine("docker", "compose", "-f", "docker-compose.yml", "up", "-d")
}

tasks.register<Exec>("dockerDown") {
    group = "docker"
    description = "Stops the Docker containers"

    commandLine("docker", "compose", "-f", "docker-compose.yml", "down")
}

tasks.named("bootRun") {
    dependsOn("dockerUp")
    finalizedBy("dockerDown")
}



tasks.withType<Test> {
    useJUnitPlatform()
}

