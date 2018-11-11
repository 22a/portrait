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

const videoElement = document.querySelector('#videoh')

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
  if (!track) {
    console.log('grabFrameFromVideoStream, track does not exist')
    return null
  }
  console.log({ track })

  if ('ImageCapture' in window) {
    const capture = new ImageCapture(track)
    console.log({ capture })
    const frameBlob = await capture.takePhoto(userMediaSettings)
    console.log({ frameBlob })
    return frameBlob
  } else {
    const canvas = document.createElement('canvas');
    // TODO: pull these widths and heights from the stream / track
    canvas.width = 640;
    canvas.height = 480;
    console.log({ canvas })
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    console.log({ ctx })
    const frameBlob = await new Promise(resolve => {
      canvas.toBlob(blob => {
        return resolve(blob);
      });
    });
    console.log({ frameBlob })
    return frameBlob
  }
}

const setupUserMediaStream = () => {
  navigator.mediaDevices.getUserMedia(userMediaSettings)
    .then(stream => {
      console.log({ stream })
      userMediaStream = stream
      videoElement.srcObject = stream
      console.log({ videoElement })
      return true
    })
    .catch(err => {
      console.error(err)
      return false
    })
}

window.startVideoStream = setupUserMediaStream
window.sendFrame = sendFrameForProcessing
window.switchCamera = switchPreferredUserMediaVideoSettings
