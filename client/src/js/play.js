import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js"
import { $ } from "./utils/domUtils.js"

const username = getCookie("username")

const socket = io({
    auth: {
        username
    }
})

const self = {
    id: undefined,
    name: username
}

//TODO:
// function displayRoomInfo() {

// }

function displaySelfInfo() {
    $("#self__info__name").textContent = self.name
}

function displayEnemyInfo(enemy) {
    if (!enemy) return $("#enemy__info__name").textContent = "-"

    $("#enemy__info__name").textContent = enemy.name
}

socket.on("connect", () => {
    self.id = socket.id
})

socket.on("room-created", ({id}) => {
    $("#room__info__id").textContent = id

    displaySelfInfo()
    displayEnemyInfo()
})

socket.on("room-joined", (event) => {
    if (event.player.id === self.id) {
        $("#room__info__id").textContent = event.room.id
    }
    const enemy = event.room.players.find(player => player.id !== self.id)

    displayEnemyInfo(enemy)
})

socket.on("room-leaved", ({playerId}) => {
    displayEnemyInfo()
})

socket.on("round-started", ({roundNumber, roundTime}) => {
    // $("#result__text").textContent = "-"

    let seconds = roundTime / 1000

    const timer = setInterval(() => {
        seconds--

        if (seconds < 0) {
            clearInterval(timer)
            $(".timer__time").textContent = 10
            return;
        }

        $(".timer__time").textContent = seconds;
        
    }, 1000)
})


socket.on("round-won", () => {
    $("#rounds__result").textContent = "Round won"
})

socket.on("round-tied", () => {
    $("#rounds__result").textContent = "Round tied"
})

socket.on("round-lost", () => {
    $("#rounds__result").textContent = "Round lost"
})


socket.on("match-won", () => {
    $("#match__result").textContent = "Match won"
})

socket.on("match-tied", () => {
    $("#match__result").textContent = "Match tied"
})

socket.on("match-lost", () => {
    $("#match__result").textContent = "Match lost"
})
 
socket.on("error", ({error}) => {
    $(".error").textContent = error

    setTimeout(() => {
        $(".error").textContent = ""
    }, 3000)
})

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

$("#room__connection__join").addEventListener("click", (event) => {
    event.preventDefault()

    const roomId = $("#room__connection__search").value

    if (!roomId) return

    $("#room__connection__search").value = ""

    socket.emit("room-join", {id: roomId})
})

$("#play__button").addEventListener("click", () => {
    socket.emit("match-start")
})

$("#choice__send").addEventListener("click", () => { 
    const choiceId = $("#choice__select").value

    socket.emit("round-movement", choiceId)
})

$("#room__connection__leave").addEventListener("click", (event) => {
    event.preventDefault()
    
    socket.emit("room-leave")
})
