/** Reservation for Lunchly */

const moment = require("moment");
const expressError = require("../express-error");

const db = require("../db");


/** A reservation for a party */

class Reservation {
	constructor({
		id,
		customerId,
		numGuests,
		startAt,
		notes
	}) {
		this.id = id;
		this.customerId = customerId;
		this.numGuests = numGuests;
		this.startAt = startAt;
		this.notes = notes;
	}

	set numGuests(val) {
		if (val < 1) throw new expressError('unable to set fewer than 1 guest', 400);
		this._numGuests = val;
	};
	get numGuests() {
		return this._numGuests;
	};
	set startAt(val) {
		if (val instanceof Date && !isNaN(val)) this._startAt = val;
		else throw new expressError('not a valid startAt', 400);
	};
	get startAt() {
		return this._startAt;
	};

	/** formatter for startAt */

	get formattedStartAt() {
		return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
	}

	set notes(val) {
		this._notes = val || "";
	};
	get notes() {
		return this._notes;
	};
	set customerId(val) {
		if (this._customerId && this._customerId !== val) {
			throw new expressError('cannot change customer id', 400);
		};
		this._customerId = val;
	};
	get customerId() {
		return this._customerId;
	}

	/** given a customer id, find their reservations. */

	static async getReservationsForCustomer(customerId) {
		const results = await db.query(
			`SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
			[customerId]
		);

		return results.rows.map(row => new Reservation(row));
	}

	static async get(id) {
		const res = await db.query(`
		select id, 
		customer_id as "customerId", 
		num_guests as "numGuests",
		start_at as "startAt",
		notes
		from reservations
		where id = $1`, [id]);
		let reservation = res.row[0];
		if (reservation === undefined) {
			return new expressError(`no reservation found: ${id}`);
		};
		return new Reservation(reservation);
	};;

	async save() {
		if (this.id === undefined) {
			const result = await db.query(
				`INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
				[this.customerId, this.numGuests, this.startAt, this.notes]
			);
			this.id = result.rows[0].id;
		} else {
			await db.query(
				`UPDATE reservations SET num_guests=$1, start_at=$2, notes=$3
             WHERE id=$4`,
				[this.numGuests, this.startAt, this.notes, this.id]
			);
		}
	}
}


module.exports = Reservation;