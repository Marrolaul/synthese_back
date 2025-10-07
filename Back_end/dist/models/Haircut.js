import db from "../config/db.js";
import createError from "../utils/createError.js";
import validate from "../utils/validate.js";
export default class Haircut {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name;
        this.price = data.price;
        this.duration = data.duration;
        this.isAvailable = data.isAvailable ?? true;
    }
    validate() {
        if (!validate.isValidString(this.name))
            throw createError(400, "invalid_haircut_name", "Invalid haircut name");
        const err = validate.isValidNumberAdv([
            { value: this.price, min: 0.1 },
            { value: this.duration, min: 0 }
        ]);
        if (err)
            throw err;
        if (typeof this.isAvailable !== 'boolean') {
            throw createError(400, "invalid_haircut_isAvailable", "isAvailable must be a boolean");
        }
        return null;
    }
    static async getMany(limit, skip) {
        const [result] = await db.query("SELECT * FROM haircuts LIMIT ? OFFSET ?", [limit, skip]);
        const count = await this.getAllCount();
        return {
            haircuts: result,
            count
        };
    }
    static async getById(id) {
        const [result] = await db.query("SELECT * FROM haircuts WHERE id = ?", [id]);
        return result;
    }
    static async create(haircut) {
        const { name, price, duration, isAvailable } = haircut;
        const [result] = await db.query("INSERT INTO haircuts (name, price, duration, isAvailable) VALUES (?, ?, ?, ?)", [name, price, duration, isAvailable]);
        haircut.id = result.insertId;
        return haircut;
    }
    static async update(haircut) {
        const { id, name, price, duration, isAvailable } = haircut;
        const [result] = await db.query("UPDATE haircuts SET name = ?, price = ?, duration = ?, isAvailable = ? WHERE id = ?", [name, price, duration, isAvailable, id]);
        return result;
    }
    static async delete(id) {
        const [result] = await db.query("DELETE FROM haircuts WHERE id = ?", [id]);
        return result;
    }
    static getAllAvailableHaircuts() {
        return new Promise((res, rej) => {
            db.query("SELECT * FROM haircuts WHERE isAvailable = true").then(([result]) => {
                if (!result) {
                    return rej(createError(404, "haircut_not_found", "No available haircuts"));
                }
                let haircutList = [];
                result.forEach((haircutInDb) => {
                    haircutList.push(Haircut.getDescHaircut(haircutInDb));
                });
                return res(haircutList);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getDescHaircut(haircut) {
        let haircutToReturn = {
            id: haircut.id,
            name: haircut.name,
            price: haircut.price,
            duration: haircut.duration
        };
        return haircutToReturn;
    }
    static async getAllCount() {
        const [result] = await db.query("SELECT COUNT(*) AS value FROM haircuts");
        return Number(result[0].value);
    }
}
