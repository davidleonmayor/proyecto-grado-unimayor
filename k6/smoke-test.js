import http from 'k6/http';
import { check, group, sleep } from 'k6';

// ===============================================
// SMOKE TEST - Verificación rápida (5 usuarios, 30s)
// ===============================================

export const options = {
    vus: 5,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<5000'],
    },
};

const BASE_URL = 'http://localhost:5050';
const TEST_EMAIL = 'k6test@loadtest.com';
const TEST_PASSWORD = 'Password123!';

// setup() se ejecuta UNA sola vez antes de las pruebas
export function setup() {
    const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    console.log(`Login status: ${loginRes.status}`);

    if (loginRes.status === 200) {
        const token = loginRes.body.trim();
        console.log('Token obtenido exitosamente');
        return { token };
    }

    console.log(`Login error: ${loginRes.body}`);
    return { token: null };
}

export default function (data) {
    if (!data.token) {
        console.log('No hay token, saltando...');
        sleep(2);
        return;
    }

    const headers = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
        },
    };

    group('Proyectos', function () {
        const res = http.get(`${BASE_URL}/api/projects?page=1&limit=10`, headers);
        check(res, { 'proyectos OK': (r) => r.status === 200 });
    });

    sleep(0.3);

    group('Profesores', function () {
        const res = http.get(`${BASE_URL}/api/persons/teachers?page=1&limit=10`, headers);
        check(res, { 'profesores OK': (r) => r.status === 200 });
    });

    sleep(0.3);

    group('Estudiantes', function () {
        const res = http.get(`${BASE_URL}/api/persons/students?page=1&limit=10`, headers);
        check(res, { 'estudiantes OK': (r) => r.status === 200 });
    });

    sleep(0.3);

    group('Eventos', function () {
        const res = http.get(`${BASE_URL}/api/events?page=1&limit=10`, headers);
        check(res, { 'eventos OK': (r) => r.status === 200 });
    });

    sleep(1);
}
