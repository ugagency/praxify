import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRec = EventTarget & { stop: () => void; start?: () => void };

export function useSpeechRecognition(params: {
    enabled: boolean;
    initialText: string;
    onText: (text: string) => void;
    onError?: (message: string) => void;
}) {
    const { enabled, initialText, onText, onError } = params;

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRec | null>(null);
    const recordingRef = useRef(false);

    useEffect(() => {
        recordingRef.current = isRecording;
    }, [isRecording]);

    useEffect(() => {
        // Se modal fechar, para gravação
        if (!enabled && isRecording) {
            try {
                recognitionRef.current?.stop();
            } catch {
                // ignore
            }
            setIsRecording(false);
        }
    }, [enabled, isRecording]);

    const toggle = useCallback(() => {
        if (isRecording) {
            try {
                recognitionRef.current?.stop();
            } catch {
                // ignore
            }
            setIsRecording(false);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            onError?.("Seu navegador não suporta transcrição de áudio.");
            return;
        }

        const rec = new SpeechRecognition();
        rec.lang = "pt-BR";
        rec.continuous = true;
        rec.interimResults = true;

        const startText = initialText;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (event: any) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = 0; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                else interimTranscript += event.results[i][0].transcript;
            }

            const merged = startText + (startText ? " " : "") + finalTranscript + interimTranscript;
            onText(merged);
        };

        rec.onerror = (e: { error: string }) => {
            if (e.error === "not-allowed") {
                setIsRecording(false);
                onError?.("Permissão do microfone negada.");
            }
        };

        rec.onend = () => {
            // tenta religar se ainda estiver gravando
            if (recordingRef.current) {
                setTimeout(() => {
                    if (!recordingRef.current) return;
                    try {
                        rec.start();
                    } catch {
                        setIsRecording(false);
                    }
                }, 800);
            }
        };

        try {
            rec.start();
            recognitionRef.current = rec;
            setIsRecording(true);
        } catch {
            onError?.("Erro ao iniciar microfone.");
            setIsRecording(false);
        }
    }, [isRecording, initialText, onText, onError]);

    return { isRecording, toggle };
}