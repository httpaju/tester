
import { createSocket } from './socket.js'

const $ = (x) => document.querySelector(x)
const esc = (x) => {
  const txt = document.createTextNode(x)
  const p = document.createElement('p')
  p.appendChild(txt)
  return p.innerHTML
}

const ws = await createSocket()
const debounceTime = 1000



let timeout
let pc, ls

const $peopleOnline = $('#peopleOnline p span')
const $msgs = $('#messages')
const $msgArea = $('#message-area')
const $typing = $('#typing')
const $videoPeer = $('#video-peer')
const $loader = $('#peer-video-loader')
const $skipBtn = $('#skip-btn')
const $sendBtn = $('#send-btn')
const $input = $('#message-input')

function configureChat() {
  $input.focus()

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      $skipBtn.click()
      e.preventDefault()
    }
  })
  $input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      clearInterval(timeout)
      ws.emit('typing', false)
      $sendBtn.click()
      return e.preventDefault()
    }
    ws.emit('typing', true)
  })
  $input.addEventListener('keyup', function (e) {
    clearInterval(timeout)
    timeout = setTimeout(() => {
      ws.emit('typing', false)
    }, debounceTime)
  })
}

// hide loader when video connected
$videoPeer.addEventListener('play', () => {
  $loader.style.display = 'none'
})

const initializeConnection = async () => {
  $msgs.innerHTML = `
    <div class="message-status">Looking for people online...</div>
  `
  $sendBtn.disabled = true
  $input.value = ''
  $input.readOnly = true

  const iceConfig = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
      },
    ],
  }

  pc = new RTCPeerConnection(iceConfig)
  pc.sentDescription = false

  pc.onicecandidate = (e) => {
    if (!e.candidate) return

    if (!pc.sentRemoteDescription) {
      pc.sentRemoteDescription = true
      
      ws.emit('description', pc.localDescription)
    }
   
    ws.emit('iceCandidate', e.candidate)
  }

  pc.oniceconnectionstatechange = async function () {
    if (
      pc.iceConnectionState === 'disconnected' ||
      pc.iceConnectionState === 'closed'
    ) {
    
      pc.close()
      await initializeConnection()
    }
  }

  const rs = new MediaStream()

  $videoPeer.srcObject = rs
  $loader.style.display = 'inline-block' // show loader

  ls.getTracks().forEach((track) => {
   
    pc.addTrack(track, ls)
  })

  pc.ontrack = (event) => {
   
    event.streams[0].getTracks().forEach((track) => {
      rs.addTrack(track)
    })
  }

  
  ws.emit('peopleOnline')
  const params = new URLSearchParams(window.location.search)
  const interests =
    params
      .get('interests')
      ?.split(',')
      .filter((x) => !!x)
      .map((x) => x.trim()) || []
  ws.emit('match', { data: 'video', interests })
}

$skipBtn.addEventListener('click', async () => {
  ws.emit('disconnect')
  pc.close()
  await initializeConnection()
})

$sendBtn.addEventListener('click', () => {
  const msg = $input.value.trim()
  if (!msg) return

  const msgE = document.createElement('div')
  msgE.className = 'message'
  msgE.innerHTML = `<span class="you">You:</span> ${esc(msg)}`

  $msgs.appendChild(msgE)
  $msgArea.scrollTop = $msgArea.scrollHeight
  $input.value = ''

  ws.emit('message', esc(msg))
})

ws.register('begin', async () => {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
})



ws.register('connected', async (data) => {
  const params = new URLSearchParams(window.location.search)
  const interests =
    params
      .get('interests')
      ?.split(',')
      .filter((x) => !!x)
      .map((x) => x.trim()) || []

  let commonInterests = data.at(-1) || ''
  const first = data.slice(0, -1)
  if (first.length) {
    commonInterests = `${first.join(', ')} and ${commonInterests}`
  }

  $msgs.innerHTML = ''
  const status = document.createElement('div')
  status.className = 'message-status'
  status.innerHTML = 'You are now talking to a random stranger'
  $msgs.appendChild(status)
  if (commonInterests) {
    const status = document.createElement('div')
    status.className = 'message-status'
    status.innerHTML = `You both like ${esc(commonInterests)}`
    $msgs.appendChild(status)
  } else if (interests.length) {
    const status = document.createElement('div')
    status.className = 'message-status'
    status.innerHTML =
      "Couldn't find anyone with similar interests, so this stranger is completely random. Try adding more interests!"
    $msgs.appendChild(status)
  }
  $msgArea.scrollTop = $msgArea.scrollHeight
  $sendBtn.disabled = false
  $input.readOnly = false
})

ws.register('message', async (msg) => {
  if (!msg) return

  const msgE = document.createElement('div')
  msgE.className = 'message'
  msgE.innerHTML = `<span class="strange">Stranger:</span> ${esc(msg)}`

  $msgs.appendChild(msgE)
  $msgArea.scrollTop = $msgArea.scrollHeight
})

ws.register('iceCandidate', async (data) => {
  // TODO: add a queueing mechanism to ensure remoteDescription is
  // set before adding ice candidate
  await pc.addIceCandidate(data)
})

ws.register('description', async (data) => {
  await pc.setRemoteDescription(data)
  if (!pc.localDescription) {
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
  }
})
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
 
  if (message.channel === 'peer') {
   if(message.data === 200) {
    alert('Reported successfully, Thanks for helping us keep the platform safe!');

   }else if(message.data === 400){
    alert('Failed to report User! !');

   }else if(message.data === 300){
    alert('User already reported!');
   } else if(message.data === 'ban') {
	       console.log('Banned');
    window.location.href = "https://lotta.lol/banned";
  }
  }
};
ws.register('typing', async (isTyping) => {
  $typing.style.display = isTyping ? 'block' : 'none'
  $msgArea.scrollTop = $msgArea.scrollHeight
})

ws.register('disconnect', async () => {

  pc.close()
  await initializeConnection()
})

try {
  ls = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
} catch (e) {
  alert('This website needs video and audio permission to work correctly')
}
$('#video-self').srcObject = ls

configureChat()
let userIP = null;
await initializeConnection()
// Add an event listener to the report button
document.getElementById('report-btn').addEventListener('click', async function() {
  // Show the report modal when the button is clicked
  document.getElementById('reportModal').style.display = 'block';
  try {
    // Only used for report tracking
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
     userIP = data.ip;
} catch (error) {
    return;
}

  
});
  
  // Close the report modal when the close button is clicked
  document.querySelector('#reportModal .close').addEventListener('click', function() {
    document.getElementById('reportModal').style.display = 'none';
  });
  
  // Close the report modal when the user clicks outside of it
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('reportModal');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });
  
  // Handle change event on the report reason dropdown
  document.getElementById('reportReason').addEventListener('change', function() {
    const otherReasonTextArea = document.getElementById('otherReason');
    if (this.value === 'other') {
      otherReasonTextArea.style.display = 'block';
    } else {
      otherReasonTextArea.style.display = 'none';
    }
  });
  




  // Handle the submit report button click event
  document.getElementById('submitReportBtn').addEventListener('click', async function() {

  
    // Retrieve the selected reason from the dropdown
  
  

    const selectedReason = document.getElementById('reportReason').value;
    
    // If "Other" is selected, get the custom reason from the text box
    let reason;
    if (selectedReason === 'other') {
      reason = document.getElementById('otherReason').value.trim();
    } else {
      reason = selectedReason;
    }
if(userIP === null){
   userIP == 'Fetch Failed';
}  

    const rs = {
      ip : userIP,
      reason: reason
     
    };
    ws.send(JSON.stringify({ channel: 'getPeer', data: rs }));
  }); 
 
    
    

   
