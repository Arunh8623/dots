import { useState, useCallback } from 'react';
import { streamVisualization } from '../services/api';

const INITIAL_STATE = {
  status: 'idle',      // idle | loading | done | error
  stage: '',
  stageMsg: '',
  videoUrl: null,
  currentPrompt: '',
  error: '',
};

export function useVideoGeneration() {
  const [state, setState] = useState(INITIAL_STATE);

  const setPartial = (partial) =>
    setState(prev => ({ ...prev, ...partial }));

  const generate = useCallback(async (prompt) => {
    if (!prompt?.trim() || state.status === 'loading') return;

    setPartial({
      status: 'loading',
      stage: 'engineering',
      stageMsg: '',
      error: '',
      videoUrl: null,
      currentPrompt: prompt.trim(),
    });

    try {
      await streamVisualization(prompt.trim(), (event) => {
        if (event.stage === 'completed') {
          setPartial({
            status: 'done',
            stage: 'completed',
            stageMsg: event.message,
            videoUrl: event.videoUrl,
          });
        } else if (event.stage === 'error') {
          setPartial({
            status: 'error',
            stage: 'error',
            error: event.message || 'Something went wrong. Please try again.',
          });
        } else {
          // Intermediate progress stage
          setPartial({
            stage: event.stage,
            stageMsg: event.message,
          });
        }
      });
    } catch (err) {
      setPartial({
        status: 'error',
        error: 'Connection error. Make sure the server is running on port 5000.',
      });
    }
  }, [state.status]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    generate,
    reset,
  };
}