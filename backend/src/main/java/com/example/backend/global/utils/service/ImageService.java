package com.example.backend.global.utils.service;



import com.example.backend.global.utils.S3Uploader;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Uploader s3Uploader;

    public String saveImage(MultipartFile multipartFile){
        try {
            return s3Uploader.uploadFile(multipartFile); // 업로드 후 URL 반환
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String updateImage(MultipartFile multipartFile,String beforeImageUrl){
        deleteImage(beforeImageUrl);
        return saveImage(multipartFile);
    }



    public void deleteImage(String fileName){
        s3Uploader.deleteFile(fileName);
    }



}
