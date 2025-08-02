import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 100,
    duration: '10s',
};

const BASE_URL = 'http://host.docker.internal:8080';
const LOGIN_ENDPOINT = `${BASE_URL}/api/v1/users/login`;
const CHAT_ENDPOINT = (roomId, page, size = 20) => `${BASE_URL}/api/v1/chats/${roomId}?page=${page}&size=${size}`;

// 로그인 후 Authorization 헤더에서 accessToken 추출
export function setup() {
    const payload = JSON.stringify({
        email: 'test@email.com',
        password: '0b146162-3',
    });

    const res = http.post(LOGIN_ENDPOINT, payload, {
        headers: { 'Content-Type': 'application/json' },
    });

    const authHeader = res.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('❌ Authorization 헤더가 없거나 형식이 잘못됨:', authHeader);
        return;
    }

    const accessToken = authHeader.replace('Bearer ', '');
    console.log(`✅ 추출된 accessToken: ${accessToken}`);

    return { accessToken };
}

export default function (data) {
    const roomId = 1;
    const page = Math.floor(Math.random() * 3); // page=0~2

    const res = http.get(CHAT_ENDPOINT(roomId, page), {
        headers: {
            'Authorization': `Bearer ${data.accessToken}`,
        },
    });

    check(res, {
        '✅ 200 OK': (r) => r.status === 200,
        '✅ contains messages': (r) =>
            r.body && (r.body.includes('message') || r.body.includes('content')),
    });
    sleep(1);
}


