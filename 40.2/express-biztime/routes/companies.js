const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const db = require('../db');
const ExpressError = require('../express-error');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
        select code, name
        from companies
        order by name`);
        if (results.rows.length === 0) {
            throw new ExpressError(`unable to find page`, 404)
        };
        return res.json({
            "companies": results.rows
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const {
            code
        } = req.params;
        const cRes = await db.query(`
        select code, name, description
        from companies
        where code=$1`, [code]);
        if (cRes.rows.length === 0) {
            throw new ExpressError(`unable to find company with code ${code}`, 404)
        };
        const iRes = await db.query(`
        select id
        from invoices
        where comp_code = $1
        `, [code]);
        if (iRes.rows.length === 0) {
            throw new ExpressError(`unable to find invoices for company code ${code}`, 404)
        };
        const company = cRes.rows[0];
        const invoices = iRes.rows;
        company.invoices = invoices.map(inv => inv.id);
        return res.json({
            "company": company
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    console.log(req.body);
    try {
        let {
            name,
            description
        } = req.body;
        let code = slugify(name, {
            lower: true
        });
        const result = await db.query(`
        insert into companies (code, name, description)
        values ($1, $2, $3)
        returning code, name, description`, [code, name, description]);
        // console.log(res);
        return res.status(201).json({
            "company": result.rows[0]
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        let {
            name,
            description
        } = req.body;
        let code = req.params.code;
        const result = await db.query(`
        update companies
        set name=$1, description=$2
        where code=$3
        returning code, name, description`, [name, description, code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`no company with code ${code}`, 404)
        };
        return res.json({
            "company": result.rows[0]
        });
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        let code = req.params.code;
        const result = await db.query(`
        delete from companies
        where code = $1
        returning code`, [code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`no company found with code ${code}`, 404)
        } else {
            return res.json({
                msg: 'deleted'
            });
        }
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

module.exports = router;