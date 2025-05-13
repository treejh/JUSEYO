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

    //시큐리티 의존성
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.thymeleaf.extras:thymeleaf-extras-springsecurity6:3.1.2.RELEASE")

    //jwt 의존성
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // Gson - JSON 메시지를 다루기 위한 라이브러리
    implementation("com.google.code.gson:gson")

    //JSON 데이터 역직렬화, 자바 객체 직렬화
    implementation ("com.fasterxml.jackson.core:jackson-databind")

    //Valid
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // excel
    implementation ("org.apache.poi:poi-ooxml:5.2.3")

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

