import React, { useState, useEffect } from 'react';

function Noiserec() {
  const [averageNoiseLevel, setAverageNoiseLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  useEffect(() => {
    if (!audioContext) {
      setAudioContext(new AudioContext());
    }
  }, [audioContext]);

  useEffect(() => {
    if (audioContext && !analyser) {
      setAnalyser(audioContext.createAnalyser());
    }
  }, [audioContext, analyser]);

  useEffect(() => {
    if (isRecording && audioContext && !mediaStream) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setMediaStream(stream);
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
        })
        .catch(error => console.error(error));
    }
  }, [isRecording, audioContext, mediaStream, analyser]);

  useEffect(() => {
    if (isRecording && analyser) {
      const intervalId = setInterval(() => {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / bufferLength;
        const dB = 20 * Math.log10(avg / 1); // reference amplitude = 1
        setAverageNoiseLevel(dB.toFixed(2));
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isRecording, analyser]);

  function handleStartRecording() {
    setIsRecording(true);
  }

  function handleStopRecording() {
    setIsRecording(false);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setAnalyser(null);
    setAverageNoiseLevel(0);
  }
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#F5F5F5',
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '32px',
    },
    noiseLevel: {
      fontSize: '24px',
      marginBottom: '32px',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    startButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      fontSize: '20px',
      padding: '16px 32px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    stopButton: {
      backgroundColor: 'red',
      color: 'white',
      fontSize: '20px',
      padding: '16px 32px',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  }

  return (
    <div style={styles.container}>
    <p style={styles.title}>Noise Tracker</p>
    <p style={styles.noiseLevel}>Average noise level: {averageNoiseLevel} dB</p>
    <div style={styles.buttonContainer}>
      {isRecording ?
        <button style={styles.stopButton} onClick={handleStopRecording}>Stop recording</button> :
        <button style={styles.startButton} onClick={handleStartRecording}>Start recording</button>
      }
    </div>
  </div>
  );
  
}

export default Noiserec;
