
import {$, $$} from "./utils/domUtils.js"

$("#user__input__form__submit").addEventListener("click", async function(event) {
    event.preventDefault()

    const username = $("#user__input__form__input").value

    if (!username) return
    
    await fetch("http://localhost:3000/players", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name: username})
    }).then(response => {
        if (response.ok) window.location.href = "/play"
    })

})