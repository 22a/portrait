import {Socket} from "phoenix"
import uuid4 from "uuid4"

let socket = new Socket("/socket", {params: {token: window.userToken}})
socket.connect()

// "private" subtopic
let channel = socket.channel(`frames:${uuid4()}`, {})

channel.join()
  .receive("ok", resp => {
    console.debug("successfully subscribed to frames channel", resp)
  })
  .receive("error", resp => {
    console.error("error subscribing to frames channel", resp)
  })
  .receive("timeout", resp => {
    console.error("timeout subscribing to frames channel", resp)
  })

export default channel
