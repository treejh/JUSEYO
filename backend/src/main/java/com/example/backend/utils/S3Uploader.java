package com.example.backend.utils;


import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Uploader {

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    private final AmazonS3 amazonS3;


    // S3에 이미지 등록
    public String uploadFile(MultipartFile multipartFile) throws IOException {
        String fileName = multipartFile.getOriginalFilename();

        //파일 형식 구하기
        String ext = fileName.split("\\.")[1];
        log.info("fileName 확인 !!" + fileName);
        log.info("파일 형식 확인 !! " + ext);

        // 랜덤한 UUID를 이용한 고유 파일명 생성
        String uniqueFileName = CreateRandomNumber.timeBasedRandomName() + "." + ext;

        String contentType = "";

        //content type을 지정해서 올려주지 않으면 자동으로 "application/octet-stream"으로 고정이 되서 링크 클릭시 웹에서 열리는게 아니라 자동 다운이 시작됨.
        switch (ext) {
            case "jpeg":
                contentType = "image/jpeg";
                break;
            case "png":
                contentType = "image/png";
                break;
            case "txt":
                contentType = "text/plain";
                break;
            case "csv":
                contentType = "text/csv";
                break;
        }

        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(contentType);

            //S3에 파일 업로드
            amazonS3.putObject(new PutObjectRequest(bucket, uniqueFileName, multipartFile.getInputStream(), metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));
        } catch (AmazonServiceException e) {
            e.printStackTrace();
        } catch (SdkClientException e) {
            e.printStackTrace();
        }

//        //object 정보 가져오기 (디버깅용) 데이터 잘 들어갔는지 확인하려고
//        ListObjectsV2Result listObjectsV2Result = amazonS3.listObjectsV2(bucket);
//        List<S3ObjectSummary> objectSummaries = listObjectsV2Result.getObjectSummaries();
//
//        for (S3ObjectSummary object: objectSummaries) {
//            log.info("object = " + object.toString());
//        }
        return amazonS3.getUrl(bucket, uniqueFileName).toString();
    }

    // S3에 이미지 삭제
    public void deleteFile(String imageUrl) {
        try {
            String key = imageUrl.contains(".com/") ? imageUrl.split(".com/")[1] : imageUrl;
            amazonS3.deleteObject(bucket, key);

        } catch (AmazonServiceException e) {
           // System.err.println(e.getErrorMessage());
        } catch (Exception exception) {
            throw new BusinessLogicException(ExceptionCode.S3_DELETE_ERROR);
        }
    }

}
