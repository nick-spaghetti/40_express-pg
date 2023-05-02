const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../express-error');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
        select id, comp_code 
        from invoices
        order by id`);
        if (results.rows.length === 0) {
            throw new ExpressError(`unable to find page`, 404)
        };
        return res.json({
            invoices: results.rows
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const results = await db.query(`
        select i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
        from invoices as i
        inner join companies as c on (i.comp_code = c.code)
        where id=$1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`no invoice with id ${id}`, 404)
        };
        const data = results.rows[0];
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date
        };
        return res.json({
            "invoice": invoice
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    console.log(req.body);
    try {
        const {
            comp_code,
            amt
        } = req.body;
        const results = await db.query(`
        insert into invoices (comp_code, amt)
        values ($1, $2)
        returning id, comp_code, amt, paid, add_date, paid_date `, [comp_code, amt]);
        // console.log(res);
        return res.json({
            invoice: results.rows[0]
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const {
            amt,
            paid
        } = req.body;
        let paidDate = null;
        const cRes = await db.query(`
        select paid
        from invoices
        where id = $1
        `, [id]);
        if (cRes.rows.length === 0) {
            throw new ExpressError(`no invoice with id ${id}`, 404)
        };
        const cpd = cRes.rows[0].paid_date;
        if (!cpd && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = cpd;
        };
        const result = await db.query(`
        update invoices 
        set amt=$1, paid=$2, paid_date=$3
        where id=$4
        returning id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paidDate, id]);
        return res.json({
            invoice: result.rows[0]
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        const result = await db.query(`
        delete from invoices
        where id = $1
        returning id`, [id]);
        if (result.rows.length === 0) {
            throw new ExpressError(`no invoice with id ${id}`, 404)
        };
        return res.json({
            status: 'deleted'
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

module.exports = router;