import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js"
import {$, $$} from "./utils/domUtils.js"


const socket = io({
    auth: {
        username
    }
})

const self = {
    id: socket.id,
    name: getCookie("username")
}

function displayPlayersInfo(enemy) {
    console.log(self)
    if (!enemy) {
        return $("#self__info__name").textContent = self
    }

    $("#self__info__name").textContent = self.name
    $("#enemy__info__name").textContent = enemy.name
}

socket.on("room-created", ({id}) => {
    const selfName = getCookie("username")

    $("#room__info__id").textContent = id
    displayPlayersInfo(selfName)
})

socket.on("room-joined", (event) => {
    let enemy = event.room.players.find(player => player.id !== self.id)

    console.log(enemy)

    displayPlayersInfo(self, enemy)
})

socket.on("error", ({error}) => {
    console.error(error)
})

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

$("#room__connection__join").addEventListener("click", (event) => {
    event.preventDefault()
    const roomId = $("#room__connection__search").value

    socket.emit("room-join", {id: roomId})
})


