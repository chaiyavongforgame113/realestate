"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = EventTarget & {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: Event & { error?: string }) => void) | null;
  onstart: ((ev: Event) => void) | null;
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: {
    length: number;
    [i: number]: {
      isFinal: boolean;
      length: number;
      [j: number]: { transcript: string; confidence: number };
    };
  };
};

function getCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export type UseSpeechOptions = {
  lang?: string;
  continuous?: boolean;
  interim?: boolean;
  onFinalText?: (text: string) => void;
};

export function useSpeech(opts: UseSpeechOptions = {}) {
  const { lang = "th-TH", continuous = false, interim = true, onFinalText } = opts;
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    setSupported(!!getCtor());
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const abort = useCallback(() => {
    recRef.current?.abort();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError("เบราว์เซอร์ไม่รองรับการป้อนด้วยเสียง");
      return;
    }
    setError(null);
    finalRef.current = "";
    setTranscript("");

    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = interim;
    rec.continuous = continuous;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (ev) => {
      const e = (ev as Event & { error?: string }).error || "error";
      // "no-speech" is common and non-fatal
      if (e !== "no-speech" && e !== "aborted") setError(e);
      setListening(false);
    };
    rec.onresult = (ev) => {
      let interimText = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) {
          finalRef.current += r[0].transcript;
          onFinalText?.(r[0].transcript);
        } else {
          interimText += r[0].transcript;
        }
      }
      setTranscript(finalRef.current + interimText);
    };

    try {
      rec.start();
      recRef.current = rec;
    } catch {
      setError("ไม่สามารถเปิดไมค์ได้");
    }
  }, [lang, continuous, interim, onFinalText]);

  useEffect(() => {
    return () => {
      recRef.current?.abort?.();
    };
  }, []);

  return { supported, listening, transcript, error, start, stop, abort };
}
