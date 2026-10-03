import React, { useState, useEffect, useRef } from 'react';
import { FiMic, FiMicOff, FiLoader } from 'react-icons/fi';

/**
 * VoiceInputButton: Mobil ve Masaüstü için Türkçe Sesle Yazdırma Bileşeni
 * Web Speech API (webkitSpeechRecognition) kullanarak mikrofondan gelen
 * Türkçe konuşmayı metne çevirir ve onTranscript callback'ine aktarır.
 */
export default function VoiceInputButton({ 
  onTranscript, 
  className = '', 
  size = 'md',
  title = 'Konuşarak sesli not ekle' 
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript && onTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Mikrofon izni verilmedi');
        } else if (event.error === 'no-speech') {
          setErrorMessage('Ses algılanamadı');
        } else {
          setErrorMessage('Ses tanıma hatası');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Speech recognition init error:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      alert('Tarayıcınız sesli yazdırmayı desteklemiyor. Lütfen Safari, Chrome veya Edge kullanın.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        setErrorMessage(null);
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Recognition start error:', e);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base'
  }[size] || 'p-2 text-sm';

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size] || 'w-4 h-4';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Dinlemeyi durdur' : (errorMessage || title)}
        className={`relative inline-flex items-center justify-center rounded-lg transition-all active:scale-95 ${
          isListening 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
            : errorMessage
            ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-400'
            : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700'
        } ${sizeClasses} ${className}`}
      >
        {isListening ? (
          <>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <FiMic className={`${iconSizes} animate-bounce`} />
          </>
        ) : (
          <FiMic className={iconSizes} />
        )}
      </button>

      {isListening && (
        <span className="ml-2 text-xs font-medium text-red-600 dark:text-red-400 animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Dinleniyor (Konuşun)...
        </span>
      )}
    </div>
  );
}
