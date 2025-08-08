import http from 'k6/http';
import ws from 'k6/ws';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 10 }, // 10초 동안 10명의 사용자 유지
    ],
};

const BASE_URL = 'http://host.docker.internal:8080';
const WS_ENDPOINT = `${BASE_URL.replace('http', 'ws')}/ws-stomp`;
const LOGIN_ENDPOINT = `${BASE_URL}/api/v1/users/login`;

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
        console.error('❌ Authorization 헤더 없음:', authHeader);
        return;
    }

    const accessToken = authHeader.replace('Bearer ', '');
    console.log(`✅ 추출된 accessToken: ${accessToken}`);
    return { accessToken };
}

export default function (data) {
    const roomId = 11;
    const userId = 9;
    const url = `${WS_ENDPOINT}?accessToken=${data.accessToken}`; // 쿼리 파라미터로 토큰 전달

    ws.connect(url, {
        headers: {
            Origin: 'http://localhost:3000',
            accessToken: data.accessToken,  // 토큰을 헤더에 직접 넣음
        },
    }, function (socket) {
        socket.on('open', function () {
            console.log('✅ WebSocket 연결됨');

            // STOMP CONNECT 프레임 전송
            socket.send(
                'CONNECT\n' +
                'accept-version:1.1,1.0\n' +
                'heart-beat:10000,10000\n\n\0'
            );

            let isConnected = false;

            socket.on('message', function (msg) {
                console.log('📩 수신 메시지:', msg);

                // 서버에서 받은 메시지에서 JSON 바디 파싱 시도
                try {
                    // STOMP 프레임 구조: 헤더와 바디가 \n\n로 구분됨
                    const parts = msg.split('\n\n');
                    const bodyRaw = parts[1] || '';
                    const body = bodyRaw.replace('\0', '').trim();

                    if (body) {
                        const dataJson = JSON.parse(body);

                        // 메시지 저장 성공 여부 체크 (서버 응답 형태에 맞게 조건 수정 가능)
                        const checkResult = check(dataJson, {
                            '서버 메시지 저장 응답 성공': (d) => d.statusCode === 200 && d.message === '메시지 확인',
                        });

                        if (!checkResult) {
                            console.error('❌ 메시지 저장 응답 검증 실패:', dataJson);
                        }
                    }
                } catch (e) {
                    // JSON 파싱 실패 시 로그 출력
                    // 정상적인 STOMP 프레임 외에 다른 메시지(예: CONNECTED)도 오므로 예외는 무시 가능
                }

                // CONNECTED 응답 오면 구독 + 메시지 전송
                if (!isConnected && msg.includes('CONNECTED')) {
                    isConnected = true;

                    // SUBSCRIBE
                    socket.send(`SUBSCRIBE\nid:sub-0\ndestination:/sub/chat/${roomId}\n\n\0`);
                    console.log('🔔 구독 완료');

                    // SEND
                    socket.setTimeout(() => {
                        const message = {
                            type: 'TALK',
                            userId: userId,
                            roomId: roomId,
                            message: `Hello from k6 at ${new Date().toISOString()}`,
                        };

                        const stompSend =
                            `SEND\ndestination:/pub/chat/${roomId}\ncontent-type:application/json\n\n` +
                            JSON.stringify(message) + '\0';

                        socket.send(stompSend);
                        console.log('📨 메시지 전송됨', stompSend);
                    }, 500);
                }
            });

            socket.setTimeout(() => {
                socket.close();
            }, 3000);
        });

        socket.on('close', () => {
            console.log('🚪 WebSocket 닫힘');
        });

        socket.on('error', (e) => {
            console.error('❌ WebSocket 에러:', e.error());
        });
    });

    sleep(1);
}
