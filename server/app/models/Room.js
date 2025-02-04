import { PlayerList } from "./PlayerList.js"
import { Match } from "./Match.js";

export class Room {
    static MIN_PLAYERS = 1
    static MAX_PLAYERS = 2
    static ID_LENGHT = 6

    constructor(id, creator) {
        this.id = id;
        this.players = new PlayerList(creator);
        this.match = new Match();
    }

    isFull() {
        return this.players.length === Room.MAX_PLAYERS
    }

    static generateId(rooms) {
        let id = Math.random().toString(36).slice(2, Room.ID_LENGHT + 2)

        const alreadyExists = rooms.has(id)

        if (alreadyExists) id = Room.generateId(rooms)

        return id
    }
}