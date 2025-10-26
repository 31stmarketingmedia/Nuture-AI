import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from "@google/genai";

// --- Audio Encoding/Decoding Helpers ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Component ---

const PulsatingMic = () => (
    <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute w-full h-full bg-brand-secondary rounded-full animate-ping opacity-75"></div>
        <div className="relative w-20 h-20 bg-brand-secondary rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zm0 12a5 5 0 0 1-5-5V5a5 5 0 0 1 10 0v6a5 5 0 0 1-5 5z"/>
                <path d="M19 11a1 1 0 0 1 2 0v1a7 7 0 0 1-14 0v-1a1 1 0 0 1 2 0v1a5 5 0 0 0 10 0v-1z"/>
            </svg>
        </div>
    </div>
);


interface Transcript {
    id: number;
    text: string;
    source: 'user' | 'model';
    isFinal: boolean;
}

interface LiveChatProps {
    onClose: () => void;
}

const LiveChat: React.FC<LiveChatProps> = ({ onClose }) => {
    const [status, setStatus] = useState('Connecting...');
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const transcriptEndRef = useRef<null | HTMLDivElement>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);

    let currentInputTranscription = '';
    let currentOutputTranscription = '';
    let nextTranscriptId = 0;
    
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcripts]);

    useEffect(() => {
        let sessionCleanup: (() => void) | null = null;

        const setupSession = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStatus('Initializing...');

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                let nextStartTime = 0;
                const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const outputNode = outputAudioContext.createGain();
                outputNode.connect(outputAudioContext.destination);
                const sources = new Set<AudioBufferSourceNode>();

                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            setStatus('Listening... Speak now!');
                            const source = inputAudioContext.createMediaStreamSource(stream);
                            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                
                                sessionPromise.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            
                            source.connect(scriptProcessor);
                            scriptProcessor.connect(inputAudioContext.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            // Handle transcriptions
                            if (message.serverContent?.inputTranscription) {
                                const text = message.serverContent.inputTranscription.text;
                                currentInputTranscription += text;
                                setTranscripts(prev => {
                                    const last = prev[prev.length - 1];
                                    if(last && last.source === 'user' && !last.isFinal) {
                                        return [...prev.slice(0, -1), {...last, text: currentInputTranscription}];
                                    }
                                    return [...prev, {id: nextTranscriptId++, text: currentInputTranscription, source: 'user', isFinal: false}];
                                });
                            }
                            if (message.serverContent?.outputTranscription) {
                                const text = message.serverContent.outputTranscription.text;
                                currentOutputTranscription += text;
                                setTranscripts(prev => {
                                    const last = prev[prev.length - 1];
                                    if(last && last.source === 'model' && !last.isFinal) {
                                        return [...prev.slice(0, -1), {...last, text: currentOutputTranscription}];
                                    }
                                    return [...prev, {id: nextTranscriptId++, text: currentOutputTranscription, source: 'model', isFinal: false}];
                                });
                            }
                            if (message.serverContent?.turnComplete) {
                                setTranscripts(prev => prev.map(t => ({...t, isFinal: true})));
                                currentInputTranscription = '';
                                currentOutputTranscription = '';
                            }

                            // Handle audio playback
                            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                            if (base64EncodedAudioString) {
                                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);
                                const source = outputAudioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputNode);
                                source.addEventListener('ended', () => {
                                    sources.delete(source);
                                });
                                source.start(nextStartTime);
                                nextStartTime += audioBuffer.duration;
                                sources.add(source);
                            }
                            
                            const interrupted = message.serverContent?.interrupted;
                            if (interrupted) {
                                for (const source of sources.values()) {
                                    source.stop();
                                    sources.delete(source);
                                }
                                nextStartTime = 0;
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                           console.error(e)
                           setStatus(`Connection error. Please try again. ${e.message}`);
                        },
                        onclose: (e: CloseEvent) => {
                            setStatus('Session closed.');
                        },
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                        systemInstruction: 'You are a friendly, knowledgeable, and supportive parenting guide from Nurture AI. Provide helpful advice, creative activity ideas, and answer questions for parents of children from birth to 12 years old. Keep your responses encouraging, concise, and easy to understand.',
                    },
                });
                
                sessionPromiseRef.current = sessionPromise;

                sessionCleanup = () => {
                    stream.getTracks().forEach(track => track.stop());
                    inputAudioContext.close();
                    outputAudioContext.close();
                    sessionPromise.then(session => session.close()).catch(console.error);
                };

            } catch (error) {
                console.error('Failed to start live session:', error);
                setStatus('Error: Could not access microphone.');
            }
        };

        setupSession();

        return () => {
            sessionCleanup?.();
        };
    }, []);
    
    const handleClose = () => {
        if(sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
        }
        onClose();
    }


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col p-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-2xl font-extrabold text-brand-primary">Nurture AI Assistant</h2>
                     <button onClick={handleClose} className="text-gray-400 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                     {transcripts.map((t) => (
                        <div key={t.id} className={`flex ${t.source === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <p className={`max-w-[80%] p-3 rounded-2xl ${t.source === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-gray-200 text-text-dark rounded-bl-none'} ${!t.isFinal ? 'opacity-70' : ''}`}>
                                {t.text}
                            </p>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>
                
                <div className="flex flex-col items-center justify-center pt-6 space-y-4">
                    <PulsatingMic />
                    <p className="text-text-medium font-semibold">{status}</p>
                </div>

                 <div className="mt-auto pt-4 text-center">
                     <button
                        onClick={handleClose}
                        className="w-full max-w-xs mx-auto px-4 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-accent-pink hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-pink disabled:bg-gray-400"
                    >
                        End Conversation
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LiveChat;
