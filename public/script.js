// script.js
const socket = io();

// Text chat functionality
const input = document.getElementById('input');
const sendButton = document.getElementById('send');
const messages = document.getElementById('messages');

sendButton.addEventListener('click', () => {
    const message = input.value;
    if (message.trim()) {
        socket.emit('chat message', message);
        input.value = ''; // Clear input
    }
});

// Listen for incoming chat messages
socket.on('chat message', (msg) => {
    const li = document.createElement('li');
    li.textContent = msg;
    messages.appendChild(li);
});

// Video chat functionality
let localStream;
let remoteStream;
let peerConnection;

const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Get local video stream
async function getLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error('Error accessing local media:', error);
    }
}

// Handle incoming call from another user
socket.on('offer', async (offer) => {
    peerConnection = new RTCPeerConnection(configuration);
    remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;

    // Add local stream to the peer connection
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    // Handle remote stream when received
    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    };

    // Set remote description
    await peerConnection.setRemoteDescription(offer);

    // Create an answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send the answer back to the initiator
    socket.emit('answer', answer);
});

// Handle ICE candidate
socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Send ICE candidates to other peers
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
    }
};

// Start video call
async function startCall() {
    peerConnection = new RTCPeerConnection(configuration);
    remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;

    // Add local stream to the peer connection
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    // Handle remote stream when received
    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    };

    // Create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send the offer to the other peer
    socket.emit('offer', offer);
}

// Initialize the local video stream
getLocalStream();
