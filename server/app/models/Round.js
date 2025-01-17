import { MovementList } from "./MovementList.js"

export class Round {
    static ROUND_TIME = 10000 // 10 Seconds

    constructor (roundNumber) {
        this.roundNumber = roundNumber
        this.movements = new MovementList()
        this.winnerId = undefined
    }

    winner() {
        const player1Movement = this.movements[0]
        const player2Movement = this.movements.find(movement => movement.playerId !== player1Movement.playerId)

        if (!player1Movement) {
            this.winnerid = undefined
        }

        if (player1Movement && !player2Movement){
            this.winnerid = player1Movement.playerId
        }
        else if (player1Movement.choiceId == Movement.ROCK && player2Movement.choiceId == Movement.SCISSORS){
            this.winnerid = player1Movement.playerId
        }
        else if (player1Movement.choiceId == Movement.PAPER && player2Movement.choiceId == Movement.ROCK){
            this.winnerid = player1Movement.playerId
        }
        else if (player1Movement.choiceId == Movement.SCISSORS && player2Movement.choiceId == Movement.PAPER){
            this.winnerid = player1Movement.playerId
        }

        else if (player2Movement.choiceId == Movement.ROCK && player1Movement.choiceId == Movement.SCISSORS){
            this.winnerid = player2Movement.playerId
        }
        else if (player2Movement.choiceId == Movement.PAPER && player1Movement.choiceId == Movement.ROCK){
            this.winnerid = player2Movement.playerId
        }
        else if (player2Movement.choiceId == Movement.SCISSORS && player1Movement.choiceId == Movement.PAPER){
            this.winnerid = player2Movement.playerId
        }

        else {
            this.winnerid = undefined
        }

        return this.winnerid
    }
}