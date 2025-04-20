const userVideo = document.getElementById("user-video");
const startButton = document.getElementById("start-btn");

// Additional Buttons
const pauseButton = document.createElement("button");
pauseButton.textContent = "Pause Stream";
document.body.appendChild(pauseButton);

const resumeButton = document.createElement("button");
resumeButton.textContent = "Resume Stream";
resumeButton.style.display = "none"; // Initially hidden
document.body.appendChild(resumeButton);

const stopButton = document.createElement("button");
stopButton.textContent = "Stop Stream";
document.body.appendChild(stopButton);

const muteButton = document.createElement("button");
muteButton.textContent = "Mute";
document.body.appendChild(muteButton);

const hideButton = document.createElement("button");
hideButton.textContent = "Hide Video";
document.body.appendChild(hideButton);

const connectionStatus = document.createElement("p");
connectionStatus.textContent = "Socket Disconnected";
connectionStatus.style.color = "red";
document.body.appendChild(connectionStatus);

const state = { media: null, mediaRecorder: null };
const socket = io();

// Handle WebSocket Connection
socket.on("connect", () => {
    connectionStatus.textContent = "Socket Connected";
    connectionStatus.style.color = "green";
});

socket.on("disconnect", () => {
    connectionStatus.textContent = "Socket Disconnected";
    connectionStatus.style.color = "red";
});

startButton.addEventListener("click", () => {
    if (!state.media) return alert("Camera & Mic access needed!");

    state.mediaRecorder = new MediaRecorder(state.media, {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        framerate: 25
    });

    state.mediaRecorder.ondataavailable = ev => {
        console.log("Binary Stream Available", ev.data);
        socket.emit("binarystream", ev.data);
    };

    state.mediaRecorder.start(25);
    startButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false;
});

// Pause Streaming
pauseButton.addEventListener("click", () => {
    if (state.mediaRecorder && state.mediaRecorder.state === "recording") {
        state.mediaRecorder.pause();
        pauseButton.style.display = "none";
        resumeButton.style.display = "inline-block";
    }
});

// Resume Streaming
resumeButton.addEventListener("click", () => {
    if (state.mediaRecorder && state.mediaRecorder.state === "paused") {
        state.mediaRecorder.resume();
        resumeButton.style.display = "none";
        pauseButton.style.display = "inline-block";
    }
});

// Stop Streaming
stopButton.addEventListener("click", () => {
    if (state.mediaRecorder) {
        state.mediaRecorder.stop();
        startButton.disabled = false;
        pauseButton.disabled = true;
        stopButton.disabled = true;
        resumeButton.style.display = "none";
        pauseButton.style.display = "inline-block";
    }
});

// Mute/Unmute Audio
muteButton.addEventListener("click", () => {
    state.media.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        muteButton.textContent = track.enabled ? "Mute" : "Unmute";
    });
});

// Hide/Show Video
hideButton.addEventListener("click", () => {
    state.media.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        hideButton.textContent = track.enabled ? "Hide Video" : "Show Video";
    });
});

window.addEventListener("load", async () => {
    try {
        const media = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        state.media = media;
        userVideo.srcObject = media;
    } catch (error) {
        console.error("Error accessing camera/microphone", error);
        alert("Failed to access camera/microphone. Please allow permissions.");
    }
});
