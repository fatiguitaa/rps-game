import crypto from "node:crypto"

export class User {
    constructor(name) {
        this.id = crypto.randomUUID();
        this.name = name;
    }
}