import { PlayerList } from "./PlayerList.js"

export class Room {
    static MAX_PLAYERS = 2

    constructor(creator) {
        this.id = this.#generateId(6);
        this.playerList = new PlayerList(creator);
    }

    isFull() {
        return this.players.length === Room.MAX_PLAYERS
    }

    #generateId(length) {
        return Math.random().toString(36).slice(2, length + 2)
    }
}