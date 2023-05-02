const request = require('supertest');
const app = require('../app');
const {
    createData
} = require('../_test-common');
const db = require('../db');

beforeEach(createData);

afterAll(async () => {
    await db.end();
});

describe('get /', () => {
    test('it should respond with an array of companies', async () => {
        const res = await request(app).get('/companies');
        expect(res.body).toEqual({
            'companies': [{
                code: 'apple',
                name: 'Apple'
            }, {
                code: 'ibm',
                name: 'IBM'
            }]
        });
    });
});

describe('get /apple', () => {
    test('it returns company info', async () => {
        const res = await request(app).get('/companies/apple');
        expect(res.body).toEqual({
            'company': {
                code: 'apple',
                name: 'Apple',
                description: 'Maker of OSX',
                invoices: [1, 2]
            }
        });
    });
    test('it should return 404 for no-such-company', async () => {
        const res = await request(app).get('/companies/blargh');
        expect(res.status).toEqual(404);
    });
});

describe('post /', () => {
    test('it should add company', async () => {
        const res = await request(app).post('/companies').send({
            name: 'TacoTime',
            description: 'Yum!'
        });
        expect(res.body).toEqual({
            'company': {
                code: 'tacotime',
                name: 'TacoTime',
                description: 'Yum!'
            }
        });
    });
    test('it should return 500 for conflict', async () => {
        const res = await request(app).post('/companies').send({
            name: 'Apple',
            description: 'huh?'
        });
        expect(res.status).toEqual(500);
    });
});

describe('put /', () => {
    test('it should update company', async () => {
        const res = await request(app).put('/companies/apple').send({
            name: 'AppleEdit',
            description: 'new description'
        });
        expect(res.body).toEqual({
            'company': {
                code: 'apple',
                name: 'AppleEdit',
                description: 'new description'
            }
        });
    });
    test('it should return 404 for no-such-company', async () => {
        const res = await request(app).put('/companies/blargh').send({
            name: 'Blargh'
        });
        expect(res.status).toEqual(404);
    });
    test('it should return 500 for missing data', async () => {
        const res = await request(app).put('/companies/apple').send({});
        expect(res.body).toEqual(500);
    });
});

describe('delete /', () => {
    test('it should delete a company', async () => {
        const res = await request(app).delete('/companies/apple');
        expect(res.body).toEqual({
            'msg': 'deleted'
        });
    });
    test('it should return 404 for no-such-company', async () => {
        const res = await request(app).delete('/companies/blargh');
        expect(res.status).toEqual(404);
    });
});