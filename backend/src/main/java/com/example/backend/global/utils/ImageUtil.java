package com.example.backend.global.utils;

public class ImageUtil {

    public static final String DEFAULT_USER_IMAGE = "https://booktree-s3-bucket.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%A1%E1%84%8B%E1%85%AD%E1%86%BC%E1%84%8C%E1%85%A1%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%E1%84%8B%E1%85%B5%E1%84%86%E1%85%B5%E1%84%8C%E1%85%B5.png";
    public static final String DEFAULT_POST_IMAGE="https://booktree-s3-bucket.s3.ap-northeast-2.amazonaws.com/BookTree+%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB+%E1%84%8B%E1%85%B5%E1%84%86%E1%85%B5%E1%84%8C%E1%85%B5+%E1%84%8E%E1%85%AC%E1%84%8C%E1%85%A9%E1%86%BC%E1%84%87%E1%85%A9%E1%86%AB.png";


    // 입력된 이미지가 null이거나 비어있으면 기본 이미지 반환
    public static String getValidProfileImage(String image) {
        if (image == null || image.isEmpty()) {
            return DEFAULT_USER_IMAGE;
        }
        return image;
    }
}
