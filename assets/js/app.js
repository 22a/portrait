import 'babel-polyfill';
import 'phoenix_html'
import uuid4 from "uuid4"

import css from '../css/app.css'
import channel from './socket'

channel.on('frame_resp', resp => {
  console.log({payloadIn: resp})
})

let userMediaSettings = {
  video: {
    facingMode: 'environment'
  }
}

const switchPreferredUserMediaVideoSettings = () => {
  if (userMediaSettings.video.facingMode === 'user') {
    userMediaSettings.video.facingMode = 'environment'
  } else {
    userMediaSettings.video.facingMode = 'user'
  }
  setupUserMediaStream()
}

const sendFrameForProcessing = async () => {
  const frameId = uuid4();
  logToPage('before grabFrameFromVideoStream')
  const frameContents = await grabFrameFromVideoStream()
  logToPage('after grabFrameFromVideoStream')
  const payload = {
    frameId,
    frameContents,
  }
  console.log({payloadOut: payload})
  logToPage(JSON.stringify(frameId))
  channel.push('frame_req', payload)
    .receive("ok", resp => {
      console.debug("frame request complete", resp)
      logToPage('frame request complete :' + JSON.stringify(resp))
    })
    .receive("error", resp => {
      console.error("frame request error", resp)
      logToPage('frame request error :' + JSON.stringify(resp))
    })
    .receive("timeout", resp => {
      console.error("frame request timeout", resp)
      logToPage('frame request timeout :' + JSON.stringify(resp))
    })
}

let userMediaStream

const grabFrameFromVideoStream = async () => {
  const track = userMediaStream.getVideoTracks()[0]
  logToPage(JSON.stringify({track}))
  console.log({ track })
  const capture = new ImageCapture(track)
  logToPage(JSON.stringify({capture}))
  console.log({ capture })
  const frameBlob = await capture.takePhoto(userMediaSettings)
  logToPage(JSON.stringify({frameBlob}))
  console.log({ frameBlob })
  logToPage('grabFrameFromVideoStream ok :' + JSON.stringify(frameBlob))
  return frameBlob
}

const logToPage = message => {
  const span = document.createElement('div')
  span.innerHTML = message
  document.body.appendChild(span)
}

const setupUserMediaStream = () => {
  navigator.mediaDevices.getUserMedia(userMediaSettings)
    .then(stream => {
      console.log({ stream })
      userMediaStream = stream

      const videoElement = document.querySelector('#videoh')
      videoElement.srcObject = stream
      console.log({ videoElement })
      logToPage('setupUserMediaStream ok :' + JSON.stringify(videoElement))
      logToPage('with settings ok :' + JSON.stringify(userMediaSettings))
      return true
    })
    .catch(err => {
      console.error(err)
      logToPage('setupUserMediaStream error :' + JSON.strin)
      return false
    })
}

window.startVideoStream = setupUserMediaStream
window.sendFrame = sendFrameForProcessing
window.switchCamera = switchPreferredUserMediaVideoSettings
