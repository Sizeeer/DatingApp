"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_1 = require("../models/user");
class UserController {
    constructor() { }
    readAll(req, res) {
        user_1.User.findAll()
            .then((users) => {
            res.json(users);
        })
            .catch((err) => {
            res.json(err);
        });
    }
    read(req, res) {
        user_1.User.findById(req.params.id)
            .then((user) => {
            if (user) {
                res.json(user);
            }
            else {
                res.status(204).send();
            }
        })
            .catch((err) => {
            res.json(err);
        });
    }
    create(req, res) {
        user_1.User.create(req.body)
            .then((user) => {
            res.json(user);
        })
            .catch((err) => {
            res.json(err);
        });
    }
    update(req, res) {
        user_1.User.update(req.body, {
            fields: Object.keys(req.body),
            where: { id: req.params.id }
        }).then((affectedRows) => {
            res.json({
                affectedRows: Number(affectedRows)
            });
        }).catch((err) => {
            res.json(err);
        });
    }
    delete(req, res) {
        user_1.User.destroy({
            where: { id: req.params.id }
        })
            .then((removedRows) => {
            res.json({
                removedRows: removedRows
            });
        }).catch((err) => {
            res.json(err);
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.js.map