async function getAudioOutputDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');
        return audioOutputDevices;
    } catch (error) {
        console.error('Error getting audio output devices:', error);
        return [];
    }
}

async function playAudioFromUrl(url, deviceId) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        await audioContext.setSinkId(deviceId);

        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.start(0);

        const mediaStream = destination.stream;
        const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
        mediaStreamSource.connect(audioContext.destination);

        console.log('Audio is playing on device:', deviceId);
    } catch (error) {
        console.error('Error playing audio:', error);
    }
}

async function listAudioOutputDevices() {
    const devices = await getAudioOutputDevices();
    const deviceList = document.getElementById('deviceList');
    deviceList.innerHTML = ''; // 기존 목록 초기화

    devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Device ${device.deviceId}`;
        deviceList.appendChild(option);
    });
}

async function startPlaying() {
    const devices = await getAudioOutputDevices();
    
    if (devices.length > 0) {
        const deviceList = document.getElementById('deviceList');
        const selectedDeviceId = deviceList.value; // 선택된 장치 ID
        await playAudioFromUrl('https://raw.githubusercontent.com/ellen24k/ellen24k/main/snd_bg.wav', selectedDeviceId);
    } else {
        console.log('No audio output devices found.');
    }
}

// HTML 요소 설정
document.addEventListener('DOMContentLoaded', async () => {
    await listAudioOutputDevices();

    const playButton = document.getElementById('playButton');
    playButton.addEventListener('click', startPlaying);
});
