package com.example.backend.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class CreateRandomNumber {
    public static String randomNumber(){
        return UUID.randomUUID().toString().substring(0, 10);
    }


    //날짜 + 시간 + 랜덤번호
    public static String timeBasedRandomName() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuidPart = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        return timestamp + "_" + uuidPart;
    }
}
