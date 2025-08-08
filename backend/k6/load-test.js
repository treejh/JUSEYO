import http from 'k6/http';
import ws from 'k6/ws';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '20s', target: 100 },    // 빠른 증가
        { duration: '30s', target: 300 },    // 중간 단계 유지
        { duration: '30s', target: 600 },    // 고부하 도달
        { duration: '30s', target: 1000 },   // 최대 부하
        { duration: '20s', target: 1000 },   // 안정적 유지
        { duration: '20s', target: 500 },    // 점진적 감소
        { duration: '20s', target: 100 },
        { duration: '10s', target: 0 },      // 종료
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
    return { accessToken };
}

export default function (data) {
    const roomId = 11;
    const userId = 9;
    const url = `${WS_ENDPOINT}?accessToken=${data.accessToken}`;

    ws.connect(url, {
        headers: {
            Origin: 'http://localhost:3000',
            accessToken: data.accessToken,
        },
    }, function (socket) {
        socket.on('open', function () {
            socket.send(
                'CONNECT\n' +
                'accept-version:1.1,1.0\n' +
                'heart-beat:10000,10000\n\n\0'
            );

            let isConnected = false;
            let messageSent = false;
            let messageCount = 0;

            socket.on('message', function (msg) {
                const parts = msg.split('\n\n');
                const bodyRaw = parts[1] || '';
                const body = bodyRaw.replace('\0', '').trim();

                try {
                    if (body) {
                        const dataJson = JSON.parse(body);

                        check(dataJson, {
                            '✅ 메시지 저장 성공': (d) => d.statusCode === 200,
                        });
                    }
                } catch (_) {}

                if (!isConnected && msg.includes('CONNECTED')) {
                    isConnected = true;

                    socket.send(`SUBSCRIBE\nid:sub-0\ndestination:/sub/chat/${roomId}\n\n\0`);

                    // 다수 메시지 반복 전송
                    socket.setInterval(() => {
                        if (messageCount >= 5) return; // 한 VU당 5개 메시지 전송

                        const message = {
                            type: 'TALK',
                            userId: userId,
                            roomId: roomId,
                            message: `📨 [${__VU}] 메시지 ${messageCount + 1}`,
                        };

                        const stompSend =
                            `SEND\ndestination:/pub/chat/${roomId}\ncontent-type:application/json\n\n` +
                            JSON.stringify(message) + '\0';

                        socket.send(stompSend);
                        messageCount++;
                    }, 500);
                }
            });

            socket.setTimeout(() => {
                socket.close();
            }, 8000); // 8초 후 종료
        });

        socket.on('close', () => {
           // console.log(`🚪 WebSocket 종료 (VU ${__VU})`);
        });

        socket.on('error', (e) => {
            console.error('❌ WebSocket 에러:', e.error());
        });
    });

    sleep(1);
}
