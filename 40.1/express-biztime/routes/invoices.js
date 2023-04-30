const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../express-error');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('select * from invoices');
        if (results.rows.length === 0) {
            throw new ExpressError(`unable to find page`, 404)
        };
        return res.send({
            invoices: results.rows
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
        const results = await db.query('select * from invoices where id=$1', [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id ${id}`, 404)
        };
        return res.send({
            invoice: results.rows[0]
        });
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    console.log(req.body);
    try {
        const {
            comp_code,
            amt,
            paid,
            add_date,
            paid_date
        } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, $4, $5) returning *', [comp_code, amt, paid, add_date, paid_date]);
        // console.log(res);
        return res.json({
            invoice: results.rows[0]
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.patch('/:id', async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const {
            comp_code,
            amt,
            paid,
            add_date,
            paid_date
        } = req.body;
        const results = await db.query('update invoices set comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5 where id=$6 returning *', [comp_code, amt, paid, add_date, paid_date, id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`can't update invoice with id ${id}`, 404)
        };
        return res.json({
            invoice: results.rows[0]
        });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        const result = await db.query('delete from invoices where id = $1 returning id', [id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`no invoice found with id ${id}`, 404)
        };
        return res.json({
            msg: 'deleted'
        });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;