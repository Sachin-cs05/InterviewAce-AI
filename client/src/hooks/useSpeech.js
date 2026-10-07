import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenCharIndex, setSpokenCharIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const recognitionRef = useRef(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechRecognition(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup abort errors
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text to Speech
  const speak = useCallback((text, onFinish) => {
    if (!('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel(); // Stop prior speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onboundary = (event) => {
      if (event.name === 'word' || typeof event.charIndex === 'number') {
        setSpokenCharIndex(event.charIndex);
      }
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpokenCharIndex(0);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpokenCharIndex(text.length);
      if (onFinish) onFinish();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpokenCharIndex(text.length);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpokenCharIndex(-1);
    }
  }, []);

  // Speech to Text Controls
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start warning:', err.message);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Recognition stop warning:', err.message);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isSpeaking,
    spokenCharIndex,
    speak,
    cancelSpeech,
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    resetTranscript,
    hasSpeechRecognition,
  };
};
