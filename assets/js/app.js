import 'babel-polyfill';
import 'phoenix_html'
import uuid4 from "uuid4"

import css from '../css/app.css'
import channel from './socket'

channel.on('frame_resp', resp => {
  console.log({payloadIn: resp})
})

const sendFrameForProcessing = async () => {
  const frameId = uuid4();
  const frameContents = await grabFrameFromVideoStream()
  const payload = {
    frameId,
    frameContents,
  }
  console.log({payloadOut: payload})
  channel.push('frame_req', payload)
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

let userMediaStream

const grabFrameFromVideoStream = async () => {
  const track = userMediaStream.getVideoTracks()[0]
  console.log({ track })
  const capture = new ImageCapture(track)
  console.log({ capture })
  const settings = {}
  console.log({ settings })
  const frameBlob = await capture.takePhoto(settings)
  console.log({ frameBlob })
  return frameBlob
}

const setupuserMediaStream = () => {
  navigator.mediaDevices.getUserMedia({video: true})
    .then(stream => {
      console.log({ stream })
      userMediaStream = stream

      const videoElement = document.querySelector('#videoh')
      videoElement.srcObject = stream
      console.log({ videoElement })
      return true
    })
    .catch(err => {
      console.error(err)
      return false
    })
}

setupuserMediaStream()

window.coolClickHandler = sendFrameForProcessing
