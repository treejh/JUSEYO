package com.example.backend.global.config.converter;

import com.example.backend.enums.Inbound;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToInboundConverter implements Converter<String, Inbound> {

    @Override
    public Inbound convert(String source) {
        try {
            return Inbound.valueOf(source.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Inbound value: " + source);
        }
    }
}
