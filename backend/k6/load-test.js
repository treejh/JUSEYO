import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10, // 가상 유저 10명
    duration: '30s', // 30초 동안 테스트
};

export default function () {
    const res = http.get('http://host.docker.internal:8080/api/v1/some-endpoint');
    check(res, { 'status was 200': (r) => r.status === 200 });
    sleep(1); // 1초 대기
}
