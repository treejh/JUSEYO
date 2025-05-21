# 1. Python 이미지 사용
FROM python:3.12-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 파일 복사
COPY requirements.txt .
COPY app.py .

# 4. 라이브러리 설치
RUN pip install --no-cache-dir -r requirements.txt

# 5. 서버 실행 명령
CMD ["python", "app.py"]
