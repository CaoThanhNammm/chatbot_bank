/**
 * Custom hook for optimized streaming message handling
 */
import { useCallback, useRef } from 'react';
import { formatResponseText, formatStreamingChunk } from '../utils/textFormatter';

export const useStreamingMessage = () => {
  const streamingRef = useRef({
    isStreaming: false,
    messageId: null,
    content: ''
  });

  const startStreaming = useCallback((messageId) => {
    streamingRef.current = {
      isStreaming: true,
      messageId,
      content: ''
    };
  }, []);

  const updateStreamingContent = useCallback((chunk, setMessages) => {
    if (!streamingRef.current.isStreaming) return;

    // Format the chunk before adding to content
    const formattedChunk = formatStreamingChunk(chunk);
    streamingRef.current.content += formattedChunk;
    const { messageId, content } = streamingRef.current;

    // Optimized state update - only update the last message if it matches
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.id === messageId) {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, text: content, isStreaming: true }
        ];
      }
      return prev;
    });
  }, []);

  const finishStreaming = useCallback((setMessages, finalContent = null) => {
    if (!streamingRef.current.isStreaming) return;

    const { messageId, content } = streamingRef.current;
    const rawText = finalContent || content;
    
    // Format the final text after streaming is complete
    const formattedText = formatResponseText(rawText);

    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.id === messageId) {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, text: formattedText, isStreaming: false }
        ];
      }
      return prev;
    });

    streamingRef.current = {
      isStreaming: false,
      messageId: null,
      content: ''
    };
  }, []);

  const isCurrentlyStreaming = useCallback((messageId) => {
    return streamingRef.current.isStreaming && streamingRef.current.messageId === messageId;
  }, []);

  return {
    startStreaming,
    updateStreamingContent,
    finishStreaming,
    isCurrentlyStreaming
  };
};

export default useStreamingMessage;