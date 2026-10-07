import React, { useEffect, useState, useRef } from 'react';

/**
 * WaveVisualizer
 * Real-time audio waveform visualizer:
 * - When user is speaking / giving response: bars dynamically bounce with voice frequency & volume.
 * - When user is NOT speaking (silence / pause): bars remain flat (stationary) and inactive.
 */
export const WaveVisualizer = ({ isActive = false }) => {
  const [heights, setHeights] = useState([4, 4, 4, 4, 4]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setHeights([4, 4, 4, 4, 4]);
      setIsVoiceActive(false);
      return;
    }

    let isMounted = true;

    const initAudioAnalyser = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.45;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const monitorAudio = () => {
          if (!isMounted) return;
          analyser.getByteFrequencyData(dataArray);

          // Calculate average vocal energy in human voice spectrum
          let voiceEnergy = 0;
          let count = 0;
          for (let i = 2; i < 14; i++) {
            voiceEnergy += dataArray[i];
            count++;
          }
          const avg = count > 0 ? voiceEnergy / count : 0;

          // Threshold for actual speech detection
          if (avg > 15) {
            setIsVoiceActive(true);
            // Dynamic heights matching vocal frequencies
            const h1 = Math.min(22, Math.max(5, (dataArray[2] / 255) * 24));
            const h2 = Math.min(26, Math.max(7, (dataArray[4] / 255) * 28));
            const h3 = Math.min(30, Math.max(9, (dataArray[6] / 255) * 32));
            const h4 = Math.min(26, Math.max(7, (dataArray[8] / 255) * 28));
            const h5 = Math.min(22, Math.max(5, (dataArray[10] / 255) * 24));
            setHeights([h1, h2, h3, h4, h5]);
          } else {
            // Silence / paused / no response: Wave is NOT working (flat rest bars)
            setIsVoiceActive(false);
            setHeights([4, 4, 4, 4, 4]);
          }

          animFrameRef.current = requestAnimationFrame(monitorAudio);
        };

        monitorAudio();
      } catch (err) {
        console.warn('Microphone stream for WaveVisualizer audio analysis not accessible:', err);
        setHeights([4, 4, 4, 4, 4]);
      }
    };

    initAudioAnalyser();

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
    };
  }, [isActive]);

  return (
    <div
      className="wave-container"
      title={isVoiceActive ? 'Voice speaking...' : 'Silent / Paused'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        height: '28px',
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: '3.5px',
            height: `${h}px`,
            backgroundColor: isVoiceActive ? '#4F46E5' : '#CBD5E1',
            borderRadius: '2px',
            transition: 'height 0.08s ease, background-color 0.15s ease',
          }}
        />
      ))}
    </div>
  );
};
