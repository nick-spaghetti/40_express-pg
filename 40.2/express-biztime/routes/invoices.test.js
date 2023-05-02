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
    test('it should respond with an array of invoices', async () => {
        const res = await request(app).get('/invoices');
        expect(res.body).toEqual({
            'invoices': [{
                    id: 1,
                    comp_code: 'apple'
                },
                {
                    id: 2,
                    comp_code: 'apple'
                },
                {
                    id: 3,
                    comp_code: 'ibm'
                }
            ]
        });
    });
});

describe('get /1', () => {
    test('it should return invoice info', async () => {
        const res = await request(app).get('/invoices/1');
        expect(res.body).toEqual({
            'invoice': {
                id: 1,
                amt: 100,
                add_date: '2018-01-01T06:00:00.000Z',
                paid: false,
                paid_date: null,
                company: {
                    code: 'apple',
                    name: 'Apple',
                    description: 'Maker of OSX'
                }
            }
        });
    });
    test('it should return 404 for no-such-invoice', async () => {
        const res = await request(app).get('/invoices/999');
        expect(res.status).toEqual(404);
    });
});

describe('post /', () => {
    test('it should add a new invoice', async () => {
        const res = await request(app).post('/invoices').send({
            amt: 400,
            comp_code: 'ibm'
        });
        expect(res.body).toEqual({
            "invoice": {
                id: 4,
                comp_code: 'ibm',
                amt: 400,
                add_date: expect.any(String),
                paid: false,
                paid_date: null
            }
        });
    });
});

describe('put /', () => {
    test('it should update an invoice', async () => {
        const res = await request(app).put('/invoices/1').send({
            amt: 1000,
            paid: false
        });
        expect(res.body).toEqual({
            "invoice": {
                id: 1,
                comp_code: "apple",
                paid: false,
                amt: 1000,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });
    test('it should return 404 for no-such-invoice', async () => {
        const res = await request(app).put('/invoices/9999').send({
            amt: 1000
        });
        expect(res.status).toEqual(404);
    });
    test('it should return 500 for missing data', async () => {
        const res = await request(app).put('/invoices/1').send({});
        expect(res.status).toEqual(500);
    });
});

describe('delete /', () => {
    test('it should delete invoice', async () => {
        const res = await request(app).delete('/invoices/1');
        expect(res.body).toEqual({
            'status': 'deleted'
        });
    });
    test('it should return 404 for no-such-invoice', async () => {
        const res = await request(app).delete('/invoices/999');
        expect(res.status).toEqual(404);
    });
});