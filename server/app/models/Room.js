import { PlayerList } from "./PlayerList.js"
import { Match } from "./Match.js";

export class Room {
    static MIN_PLAYERS = 1
    static MAX_PLAYERS = 2

    constructor(id, creator) {
        this.id = id;
        this.players = new PlayerList(creator);
        this.match = new Match();
    }

    isFull() {
        return this.players.length === Room.MAX_PLAYERS
    }

    static generateId(length, rooms) {
        let id =  Math.random().toString(36).slice(2, length + 2)

        const alreadyExists = rooms.some(room => room.id === id)

        if (alreadyExists) id = this.generateId(length, rooms)

        return id
    }
}