
<img width="1497" alt="스크린샷 2025-06-02 오후 2 52 33" src="https://github.com/user-attachments/assets/b1e3a8d2-259b-4338-99ea-4f7ff70d73fa" />





<br/>
<br/>

# 0. 서비스 주소  
```bash
$ npm install
$ npm run dev
```
[서비스 링크](https://www.app.jusey0.site/)

[유튜브 링크](https://youtu.be/FELFFBucDe0?si=ci7a4VYie4QFQ7VA)

<br/>

# 1. 서비스 개요

## 🛠️ 서비스명: **Juseyo**

**Juseyo**는 자산과 재고를 효율적으로 관리하고, 요청 및 승인 프로세스를 자동화하는 **재고 관리 플랫폼**입니다.  
단순한 자산 등록/조회 기능을 넘어, 부서별 자산 분류, 체계적인 요청 흐름, 실시간 재고 현황 파악까지 하나의 시스템 안에서 통합 관리할 수 있도록 설계되었습니다.



## 🔍 기획 배경

기존 재고 관리 방식은 Excel이나 수기 문서에 의존하고 있어 다음과 같은 문제가 있었습니다:

- 반복적인 요청 및 승인 누락
- 실시간 재고 현황 파악의 어려움
- 사용자와 관리자의 커뮤니케이션 부재
- 이력 및 상태 흐름 추적의 비효율

저희는 이러한 비효율을 해결하고자, **기업 조직 구조에 맞춘 재고 흐름 관리 시스템**을 직접 설계하고 구현했습니다.



## 💡 주요 포인트

- 부서 기반 자산 관리 및 역할(Role)별 기능 구분
- 요청 → 승인 → 반납까지 명확한 프로세스 흐름 제공
- 실시간 재고 현황 및 상태 추적
- Excel 업로드 및 내보내기 기능
- 실시간 알림(SSE) 및 채팅 기능을 통한 커뮤니케이션 강화



<br/>
<br/>

# 2. 팀원 소개


| <img src="https://github.com/codefish-sea.png" width="100" > |<img width="100" alt="스크린샷 2025-06-02 오후 5 55 11" src="https://github.com/user-attachments/assets/0be9b10c-8dce-43be-ac78-1a48e6d9cbb8" /> | <img src="https://github.com/user-attachments/assets/2f199c6f-19d1-4072-adc9-bb3d88f5bd04" width="100" > | <img src="https://github.com/user-attachments/assets/903c4fd8-1c47-46e9-a660-2c42d2d0c3be" width="100"> |  <img src="https://github.com/user-attachments/assets/0a5f26dd-ed7d-4904-9365-f2a91f21bdec" width="100">|
|-------------------------------|-------------------------------|-------------------------------|-------------------------------|-------------------------------|
| **황지윤** | **장지현** | **홍보람** | **근하람** | **이현석** |
| 팀장       | 개발팀장     | 팀원       | 팀원       | 팀원       |
| [GitHub](https://github.com/jiyuuuuun) | [GitHub](https://github.com/treejh) | [GitHub](https://github.com/researcherrabbit) | [GitHub](https://github.com/gkfka9901) | [GitHub](https://github.com/hsle95) |

<br/>
<br/>




# 3. Key Features (주요 기능)


## 👥 회원가입 및 인증

역할 기반 회원가입 및 JWT 인증 방식을 적용하여 보안성과 관리 편의성을 높였습니다.

- 역할(Role)에 따른 회원가입:  
  - 관리자(Admin), 일반 사용자(User)  
  - 최초 매니저(Initial Manager), 일반 매니저(Manager)

- JWT 기반 인증 및 권한 관리
- 이메일 인증 / 휴대폰 인증 구현
- Refresh Token을 Redis에 저장하여, RTR 방식(Refresh Token Rotation)으로 Access Token 재발급



## 📑 비품 관리

비품 CRUD: 비품 추가, 수정, 삭제, 조회 기능

비품요청 관리: 사용자별 요청 생성, 수정, 승인, 반려

대여 처리: 대여 승인 시 출고 상태 변경 및 재고 차감

반납 처리: 반납 승인 시 입고 상태 변경 및 재고 복구

개별자산 관리: 비품의 인스턴스 단위 등록 및 상태 관리

비품추적: 요청 처리 시 이력 기록 및 상태 변경 추적

엑셀 내보내기: 데이터 다운로드

## 💬 채팅 기능
STOMP 기반 WebSocket으로 구현한 실시간 채팅 기능입니다.  
1:1, 고객센터, 그룹 채팅을 지원하며, JWT 인증과 Redis, RDS를 활용한 구조입니다.

- STOMP + SockJS 기반 실시간 메시지 전송
- 1:1 / 고객센터 / 그룹 채팅방 생성 및 관리
- JWT 쿠키 인증 기반 세션 사용자 메시지 처리
- 메시지 RDS 저장, 채팅방 상태 Redis 관리
- 미확인 메시지 'NEW' 뱃지 표시
- 중복 채팅방 생성 방지

## ✨알림 기능
권한(Role)에 따라 다양한 이벤트 발생 시 알림을 전송하도록 옵저버 패턴과 스케줄러 기반 로직을 조합하여 구현했습니다.

- **역할 기반 알림 시스템**: 권한(Role)에 따라 다양한 이벤트에 대해 알림을 전송
- **옵저버 패턴 적용**: 비품 요청/반납, 회원 가입 등 실시간 이벤트 발생 시 즉시 알림 발송
- **스케줄러 기반 알림**: 지정 반납일 초과, 요청 지연 등 주기적 검사에 따른 알림 발송
- **SSE(Server-Sent Events)** 기반 실시간 알림 전달



## 🔍 검색 기능
비품 검색 : 관리페이지 등록 비품 검색 기능
추천 검색어 : 관리페이지 등록 비품 추천 검색어 기능

<br/>
<br/>

# 4. Tasks & Responsibilities (작업 및 역할 분담)
## 4.1 백엔드
|  |  |
|-----------------|-----------------|
| 황지윤   | 	<ul><li>비품 통계</li><ul><li>카테고리 별 분석</li><li>월별 출고량 / 입고량</li><li>품목별 사용 빈도</li></ul><li>관리페이지</li><ul><li>관리페이지 CRUD</li></ul><li>비품 추천</li><li>비품 관리</li><ul><li>반납 요청</li><li>입고 내역</li><li>비품 구매</ul></li></ul>   |
| 장지현    | <ul><li>회원</li><ul><li>최고 관리자, 매니저, 일반 회원 CRUD</li><li>회원/매니저 승인 · 반려</li><li>이메일/휴대폰 인증</li></ul><li>로그인 / 로그아웃</li><li>채팅</li><ul><li>1:1</li><li>고객센터</li><li>단체</li></ul><li>S3 이미지 CRUD</li></ul>   |
|  홍보람  |	<ul><li>검색</li><ul><li>비품명 검색</li><li>회원 검색</li><li>대시보드별 검색 제한</li></ul><li>카테고리</li><ul><li>카테고리 CRUD</li><li>카테고리별 비품 수 집계</li><li>회원구분별 기능 차등</li></ul></ul>  |
| 이현석    | <ul><li>비품</li><ul><li>비품CRUD</li><li>출고내역</li><li>비품 요청서</li><li>개별자산</li><li>비품추적</li></ul><li>엑셀</li><ul><li>내보내기</li>
| 근하람    | <ul><li>부서</li><ul><li>부서 CRUD</li></ul><li>알림</li><ul><li>알림 CRUD</li><li>비품 관련</li><li>재고 관련</li><li>채팅</li><li>승인/거절</li><li>스케줄러</li></ul></ul>    |

## 4.2 프론트
|  |  |
|-----------------|-----------------|
| 황지윤   | <ul><li>메인 페이지 / 대시보드</li><li>비품 반납</li><li>비품 반납 내역 페이지</li><li>입/출고 페이지</li><li>ADMIN 페이지</li><li>전체적인 디자인 담당</li></ul>
| 장지현    | 	<ul><li>회원가입 페이지</li><li>로그인 / 로그아웃<ul><li>이메일, 비밀번호 찾기</li></ul></li><li>사용자 관리 페이지</li><li>채팅 페이지<ul><li>1:1, 고객, 단체</li></ul></li><li>부서 페이지</li></ul>
|  홍보람  |	<ul><li>검색<ul><li>비품명 검색 기능</li><li>추천 검색어 기능</li></ul></li><li>카테고리<ul><li>카테고리 관리 페이지</li><li>카테고리 추가, 수정하기 페이지</li><li>카테고리 삭제 기능 구현</li><li>카테고리별 비품 수 집계</li></ul></li></ul>  |
| 이현석    | 	<ul><li>비품<ul><li>비품 추가, 조회, 수정 페이지</li><li>비품 상세 페이지</li><li>비품 추적 페이지</li><li>개별 자산 페이지</li><li>비품요청 추가, 조회, 수정 페이지</li></ul></li></ul>  |
| 근하람    | 	<ul><li>알림<ul><li>알림 페이지</li><li>헤더 알림 목록</li></ul></li></ul>    |

<br/>
<br/>

# 5. Technology Stack (기술 스택)

## 🛠️ Tech Stack

| 분류 | 기술 스택 |
|------|-----------|
| **Frontend** | ![React](https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) |
| **Backend** | ![Spring Boot](https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white) ![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white) ![MySQL](https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white) |
| **DevOps / Infra** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Amazon EC2](https://img.shields.io/badge/Amazon%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white) ![Amazon S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white) ![NGINX](https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=nginx&logoColor=white) ![Terraform](https://img.shields.io/badge/Terraform-844FBA?style=for-the-badge&logo=terraform&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) |
| **Collaboration** | ![Git](https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white) ![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white) |
| **Documentation/Test** | ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white) |


<br/>
<br/>
    
# 6. 프로젝트 개요



## 6-1 api 명세서(스웨거)
    
    
    
## 6-2 ERD
![Image](https://github.com/user-attachments/assets/db0a298f-f5e6-4a5c-917a-ea8923600a3e)
<br/>
<br/>
# 7. Project Structure (프로젝트 구조) 


## 📂 7-1 백엔드 프로젝트 구조 
```
JUSEYO-main/
├── .github/
├── .idea/
├── backend/
│ ├── .gradle/
│ ├── build/
│ ├── gradle/
│ ├── out/
│ ├── recommendation-app/
│ ├── src/
│ │ └── main/
│ │ └── java/
│ │ └── com/
│ │ └── example/
│ │ └── backend/
│ │ ├── base/
│ │ ├── domain/
│ │ │ ├── analysis/
│ │ │ ├── category/
│ │ │ ├── chaseItem/
│ │ │ ├── chat/
│ │ │ ├── department/
│ │ │ ├── excel/
│ │ │ ├── inventory/
│ │ │ ├── item/
│ │ │ ├── itemInstance/
│ │ │ ├── mainDashboard/
│ │ │ ├── managementDashboard/
│ │ │ ├── notification/
│ │ │ ├── recommendation/
│ │ │ ├── registerItem/
│ │ │ ├── role/
│ │ │ ├── search/
│ │ │ ├── supply/
│ │ │ └── user/
│ │ ├── enums/
│ │ ├── global/
│ │ └── BackendApplication.java
│ ├── resources/
│ └── test/
├── .gitattributes
├── .gitignore
├── build.gradle.kts
├── docker-compose.yml
├── Dockerfile
├── gradlew
├── gradlew.bat
└── settings.gradle.kts
```
## 📂 7-2 프론트 프로젝트 구조 


```
src/
├── app/
│ ├── admin/
│ ├── chat/
│ │ ├── group/
│ │ ├── select/
│ │ ├── support/
│ │ └── user/
│ ├── components/
│ ├── dashboard/
│ ├── find/
│ ├── inbound/
│ ├── item/
│ │ ├── chase/
│ │ ├── detail/
│ │ ├── iteminstance/
│ │ ├── manage/
│ │ ├── purchaserequest/
│ │ ├── return/
│ │ ├── supplyreturn/
│ │ ├── supplyrequest/
│ │ └── user/
│ ├── itemDetail/
│ ├── itemview/
│ ├── login/
│ ├── notifications/
│ ├── outbound/
│ ├── privacy/
│ ├── search/
│ ├── settings/
│ ├── signup/
│ │ ├── info/
│ │ ├── initial/
│ │ ├── manager/
│ │ ├── managerinfo/
│ │ ├── member/
│ │ ├── select/
│ │ └── page.tsx
│ ├── support/
│ ├── terms/
│ ├── toast-example/
│ ├── user/
│ └── withdraw/
│ ├── ClientLayout.tsx
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
├── components/
├── services/
└── stores/
```
## 📂 7-3 배포 프로젝트 구조 

```
infra/
├── .gitignore
├── main.tf
├── secrets.tf.default
└── variables.tf
```



<br/>
<br/>

# 8. Development Workflow (개발 워크플로우)

## 8-1 브랜치 전략 (Branch Strategy)
브랜치 전략은 Git Flow를 기반으로 하며, 다음과 같은 브랜치를 사용합니다.
- **Main Branch**
     - `main`  
       - 배포 가능한 상태의 코드를 유지합니다.
       - 모든 배포는 이 브랜치에서 이루어집니다.


- **프론트 단독 개발**  
    - `front/style/이슈번호-브랜치이름`  
      - **프론트엔드(html, css 등) 단독 작업 시 사용합니다.**  
      - 배포 가능한 상태의 코드를 유지해야 하며, 배포는 이 브랜치에서 직접 이루어집니다.

  
- **프론트 + 백엔드 기능 연결**
    - `front/[type]/이슈번호-브랜치이름` 
      - **프론트와 백엔드 기능이 함께 연결되는 작업 시 사용합니다.**
      - 팀원 각자의 기능 개발용 브랜치입니다.
      - 기능 개발, 테스트, UI/서버 연동 등이 이 브랜치에서 이루어집니다.
      - 완료 시 main 혹은 다른 상위 브랜치에 병합합니다.

- **백엔드 기능 개발**
    - `back/[type]/이슈번호-브랜치이름 `
      - **백엔드 API, 서비스 로직, DB 처리 등 백엔드 중심 작업 시 사용합니다.**
      - 팀원 각자의 기능 개발용 브랜치입니다.
      - 모든 기능 개발은 이 브랜치에서 진행되며, 완료 시 병합 요청합니다.

</br>

## 8-2 커밋 컨벤션
```
[ back or front / type ]  [ 이슈 번호 ] : 커밋 내용
```

- 예시
    - [front / feat]  139 : 로그인 페이지 UI 구현
 
## 8-3 PR 컨벤션
```
[ back or front / type ]  [ 이슈 번호 ]  :  PR 내용
```
- 예시 
    - [ back / feat ]  3  : 회원가입 API 구현

## 8-4 Issue 컨벤션

```
[ back or front / type ]  :  이슈 내용
```
- 작업 목적 + 대상 + 내용을 포함해 작성합니다.
- 예시
    - [ front / refact ] : 메인페이지 인기 게시글, 블로그 페이지 팔로우, 팔로우 페이지 블로그 연동
    - [ front / feat ] : 댓글버튼 숨기기
    - [ feat ] : 이메일 인증 구현 


</br>


## 8-4 태그 타입 종류 및 사용 예시

| 태그     | 의미 및 사용 시점 |
|----------|-------------------|
| `feat`   | **새로운 기능 추가** <br> 사용자에게 보이는 기능/화면 등 새로운 기능 개발 시 사용 |
| `fix`    | **버그 수정** <br> 의도와 다르게 동작하는 코드 수정, 예외/오류 처리 등 |
| `refact` | **리팩토링** <br> 코드 구조 개선, 성능 향상 등 기능 변화 없이 내부 개선 시 |
| `docs`   | **문서 변경** <br> README, 주석, API 문서, PR/Issue 템플릿 등 코드 외 문서 수정 시 |
| `style`  | **코드 스타일 변경** <br> 세미콜론, 들여쓰기, 줄 바꿈 등 로직 변경 없이 포맷 수정 시 |
| `test`   | **테스트 코드 추가/변경** <br> JUnit, Mock 객체 등 테스트 관련 작업 시 |
| `chore`  | **환경설정/기타 작업** <br> 빌드/패키지 관련 작업, 테스트 외 설정 수정 등 |
| `ci`     | **CI/CD 설정 변경** <br> GitHub Actions, Jenkins 등 자동화 관련 설정 수정 시 |
| `build`  | **빌드 시스템/의존성 변경** <br> Gradle, npm, Docker 설정 등 수정 시 |
| `perf`   | **성능 개선** <br> 속도 향상, 메모리 최적화 등 성능 관련 작업 시 |


<br/>

