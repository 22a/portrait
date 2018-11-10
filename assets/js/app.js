import 'phoenix_html'
import uuid4 from "uuid4"

import css from '../css/app.css'
import channel from './socket'

channel.on('frame_resp', resp => {
  console.log(resp);
})

const sendFrameForProcessing = () => {
  const frameId = uuid4();
  const frameContents = "todo";
  channel.push('frame_req', {
    frameId,
    frameContents
  })
    .receive("ok", resp => {
      console.debug("frame request complete", resp)
    })
    .receive("error", resp => {
      console.error("frame request error", resp)
    })
    .receive("timeout", resp => {
      console.error("frame request timeout", resp)
    })
}

window.coolClickHandler = sendFrameForProcessing
