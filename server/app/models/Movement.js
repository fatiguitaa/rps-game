export class Movement {
    static ROCK = 0
    static PAPER = 1
    static SCISSORS = 2

    constructor(playerId, choiceId) {
        this.playerId = playerId
        this.choiceId = choiceId
    }
}