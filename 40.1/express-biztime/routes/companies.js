const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../express-error');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('select * from companies');
        if (results.rows.length === 0) {
            throw new ExpressError(`unable to find page`, 404)
        };
        return res.send({
            companies: results.rows
        });
    } catch (e) {
        return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const results = await db.query('select * from companies where id=$1', [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`unable to find company with id ${id}`, 404)
        };
        return res.send({
            company: results.rows[0]
        });
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    console.log(req.body);
    try {
        const {
            code,
            name,
            description
        } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) returning *', [code, name, description]);
        // console.log(res);
        return res.json({
            company: results.rows[0]
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.patch('/:code', async (req, res, next) => {
    try {
        const {
            code
        } = req.params;
        const {
            name,
            description
        } = req.body;
        const results = await db.query('update companies set name=$1, description=$2 where code=$3 returning *', [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`can't update company with id ${id}`, 404)
        };
        return res.json({
            company: results.rows[0]
        });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        let code = req.params.code;
        const result = await db.query('delete from companies where code = $1 returning code', [code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`no company found with code ${code}`, 404)
        } else {
            return res.json({
                msg: 'deleted'
            });
        }
    } catch (e) {
        return next(e);
    }
});

module.exports = router;