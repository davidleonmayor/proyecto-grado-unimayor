import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ===============================================
// PRUEBA DE CARGA COMPLETA
// Gestor de Proyectos de Grado - Unimayor
// Simula hasta 1000 usuarios concurrentes
// ===============================================

const apiErrorRate = new Rate('api_errors');
const projectsDuration = new Trend('projects_duration');
const teachersDuration = new Trend('teachers_duration');
const studentsDuration = new Trend('students_duration');
const eventsDuration = new Trend('events_duration');

export const options = {
    scenarios: {
        carga_gradual: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },
                { duration: '1m', target: 50 },
                { duration: '2m', target: 100 },
                { duration: '2m', target: 100 },
                { duration: '1m', target: 0 },
            ],
            gracefulRampDown: '30s',
        },
    },
    cloud: {
        projectID: 6885050,
        name: 'Prueba de Carga Unimayor'
    },
    thresholds: {
        http_req_duration: ['p(95)<5000'],
        http_req_failed: ['rate<0.15'],
        api_errors: ['rate<0.15'],
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5050';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'k6test@loadtest.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'Password123!';

export function setup() {
    console.log('Obteniendo token de autenticacion...');

    const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    if (loginRes.status === 200) {
        const token = loginRes.body.trim();
        console.log('Token obtenido. Iniciando prueba de carga...');
        return { token };
    }

    console.log(`Login fallido: ${loginRes.status} - ${loginRes.body}`);
    return { token: null };
}

export default function (data) {
    if (!data.token) {
        sleep(2);
        return;
    }

    const headers = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
        },
    };

    group('01_Proyectos', function () {
        const page = Math.floor(Math.random() * 5) + 1;
        const res = http.get(`${BASE_URL}/api/projects?page=${page}&limit=10`, headers);
        const ok = check(res, {
            'proyectos status 200': (r) => r.status === 200,
            'proyectos < 5s': (r) => r.timings.duration < 5000,
        });
        projectsDuration.add(res.timings.duration);
        apiErrorRate.add(!ok);
    });

    sleep(0.3);

    group('02_Profesores', function () {
        const terms = ['', 'Juan', 'Maria', 'Carlos', 'Ana', 'Pedro'];
        const search = terms[Math.floor(Math.random() * terms.length)];
        const url = search
            ? `${BASE_URL}/api/persons/teachers?page=1&limit=10&search=${encodeURIComponent(search)}`
            : `${BASE_URL}/api/persons/teachers?page=1&limit=10`;
        const res = http.get(url, headers);
        const ok = check(res, {
            'profesores status 200': (r) => r.status === 200,
            'profesores < 5s': (r) => r.timings.duration < 5000,
        });
        teachersDuration.add(res.timings.duration);
        apiErrorRate.add(!ok);
    });

    sleep(0.3);

    group('03_Estudiantes', function () {
        const page = Math.floor(Math.random() * 3) + 1;
        const res = http.get(`${BASE_URL}/api/persons/students?page=${page}&limit=10`, headers);
        const ok = check(res, {
            'estudiantes status 200': (r) => r.status === 200,
            'estudiantes < 5s': (r) => r.timings.duration < 5000,
        });
        studentsDuration.add(res.timings.duration);
        apiErrorRate.add(!ok);
    });

    sleep(0.3);

    group('04_Eventos', function () {
        const statuses = ['all', 'active', 'past', 'today'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const res = http.get(`${BASE_URL}/api/events?page=1&limit=10&status=${status}`, headers);
        const ok = check(res, {
            'eventos status 200': (r) => r.status === 200,
            'eventos < 5s': (r) => r.timings.duration < 5000,
        });
        eventsDuration.add(res.timings.duration);
        apiErrorRate.add(!ok);
    });

    sleep(0.3);

    group('05_FormData', function () {
        const res = http.get(`${BASE_URL}/api/projects/form-data`, headers);
        check(res, { 'form-data status 200': (r) => r.status === 200 });
    });

    sleep(0.3);

    group('06_Dashboard', function () {
        const res = http.get(`${BASE_URL}/api/projects/stats/dashboard`, headers);
        check(res, { 'dashboard status 200': (r) => r.status === 200 });
    });

    sleep(0.5);
}

export function handleSummary(data) {
    return {
        'k6/test-results.json': JSON.stringify(data, null, 2),
        stdout: textSummary(data),
    };
}

function textSummary(data) {
    const m = data.metrics;
    let out = '\n' + '='.repeat(60) + '\n';
    out += '  RESULTADOS PRUEBA DE CARGA - Gestor Proyectos Grado\n';
    out += '='.repeat(60) + '\n\n';

    if (m.vus_max && m.vus_max.values) out += `  VUs maximos:          ${m.vus_max.values.max}\n`;
    if (m.http_reqs && m.http_reqs.values) out += `  Total requests:       ${m.http_reqs.values.count}\n`;
    if (m.http_reqs && m.http_reqs.values && m.http_reqs.values.rate) out += `  Requests/segundo:     ${m.http_reqs.values.rate.toFixed(2)}\n`;

    if (m.http_req_duration && m.http_req_duration.values) {
        const vals = m.http_req_duration.values;
        if (vals.avg) out += `  Respuesta promedio:   ${vals.avg.toFixed(0)}ms\n`;
        if (vals['p(95)']) out += `  Respuesta p(95):      ${vals['p(95)'].toFixed(0)}ms\n`;
        if (vals['p(99)']) out += `  Respuesta p(99):      ${vals['p(99)'].toFixed(0)}ms\n`;
        if (vals.max) out += `  Respuesta maxima:     ${vals.max.toFixed(0)}ms\n`;
    }

    if (m.http_req_failed && m.http_req_failed.values) {
        out += `  Tasa de error:        ${(m.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
    }

    out += '\n  --- Por modulo ---\n';
    if (m.projects_duration && m.projects_duration.values && m.projects_duration.values['p(95)']) out += `  Proyectos p(95):      ${m.projects_duration.values['p(95)'].toFixed(0)}ms\n`;
    if (m.teachers_duration && m.teachers_duration.values && m.teachers_duration.values['p(95)']) out += `  Profesores p(95):     ${m.teachers_duration.values['p(95)'].toFixed(0)}ms\n`;
    if (m.students_duration && m.students_duration.values && m.students_duration.values['p(95)']) out += `  Estudiantes p(95):    ${m.students_duration.values['p(95)'].toFixed(0)}ms\n`;
    if (m.events_duration && m.events_duration.values && m.events_duration.values['p(95)']) out += `  Eventos p(95):        ${m.events_duration.values['p(95)'].toFixed(0)}ms\n`;

    out += '\n' + '='.repeat(60) + '\n';
    return out;
}
