package com.example.backend.utils;

import java.util.UUID;

public class CreateRandomNumber {

    public static String randomNumber(){
        return UUID.randomUUID().toString().substring(0, 10);
    }
}
