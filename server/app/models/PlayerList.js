import { Room } from "./Room.js"

export class PlayerList {
    constructor(creator) {
        this.players = [creator]
    }

    add(player) {
        if (this.players.length >= Room.MAX_PLAYERS) throw new Error("Room is full.")

        this.players.push(player)
    }

    remove(player) {
        const exists = this.players.find(p => p.id === player)
    }
}