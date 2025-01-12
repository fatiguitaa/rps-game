import { Movement } from "./Movement.js"
import { MovementList } from "./MovementList.js"

export class Match {
    static MATCH_TIME = 10000 // 10 seconds

    constructor() {
        this.started = false
        this.movements = new MovementList()
    }

    winner() {
        let winnerId

        const player1Movement = this.movements[0]
        const player2Movement = this.movements[1]

        if (!player1Movement) {
            return undefined
        }

        if (player1Movement && !player2Movement){
            winnerId = player1Movement.playerId
        }
        else if (player1Movement.choiceId == Movement.ROCK && player2Movement.choiceId == Movement.SCISSORS){
            winnerId = player1Movement.playerId
        }
        else if (player1Movement.choiceId == Movement.PAPER && player2Movement.choiceId == Movement.ROCK){
            winnerId = player1Movement.playerId
        }
        else if (player1Movement.choiceId == Movement.SCISSORS && player2Movement.choiceId == Movement.PAPER){
            winnerId = player1Movement.playerId
        }

        else if (player2Movement.choiceId == Movement.ROCK && player1Movement.choiceId == Movement.SCISSORS){
            winnerId = player2Movement.playerId
        }
        else if (player2Movement.choiceId == Movement.PAPER && player1Movement.choiceId == Movement.ROCK){
            winnerId = player2Movement.playerId
        }
        else if (player2Movement.choiceId == Movement.SCISSORS && player1Movement.choiceId == Movement.PAPER){
            winnerId = player2Movement.playerId
        }

        else {
            winnerId = undefined
        }

        return winnerId
    }

    finish() {
        this.started = false
        const winnerId = this.winner()
        this.movements = []

        return winnerId
    }

    start() {
        if (this.started) throw new Error("Match has already started.")
        this.started = true
    }
}