//package com.example.backend.redis;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.connection.RedisConnectionFactory;
//import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
//import org.springframework.data.redis.core.StringRedisTemplate;
//
//@Configuration
//public class RedisConfig {
//
//
//    @Value("${spring.data.redis.host}")
//    private String redisHost;
//
//    @Value("${spring.data.redis.port}")
//    private int redisPort;
//
//
//
//    @Bean
//    public RedisConnectionFactory redisConnectionFactory() {
//        return new LettuceConnectionFactory(redisHost, redisPort); // localhost:6379 기본 설정
//
//        // return new LettuceConnectionFactory("127.0.0.1", 6379); -> 커스터마이징
//
//    }
//
//    @Bean
//    public StringRedisTemplate redisTemplate(RedisConnectionFactory connectionFactory) {
//        return new StringRedisTemplate(connectionFactory);
//    }
//
//
//}
