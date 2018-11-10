import css from '../css/app.css'
import 'phoenix_html'
import channel from './socket'

channel.on('pong', msg => {
  console.log(msg);
})

window.cheese = () => {
  // fire and forget ping
  channel.push('ping', {you: 'betchya'})
}
