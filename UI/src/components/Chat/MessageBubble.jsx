import React, { memo } from 'react';
import '../../styles/streaming.css';

const MessageBubble = memo(({ message, isBot, timestamp, isStreaming = false }) => {
  const formatTime = (timestamp) => {
    try {
      // Ensure timestamp is a valid Date object
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Vừa xong';
      }
      
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Vừa xong';
    }
  };  const formatMessage = (text) => {
    // Enhanced markdown-like formatting with support for multiple formats
    const formatLine = (line) => {
      // Define formatting patterns with priority order (longer patterns first to avoid conflicts)
      const patterns = [
        { regex: /\*\*\*(.*?)\*\*\*/g, tag: 'strongem', className: 'font-bold italic' },  // ***bold italic***
        { regex: /\*\*(.*?)\*\*/g, tag: 'strong', className: 'font-bold' },              // **bold**
        { regex: /\*(.*?)\*/g, tag: 'em', className: 'italic' },                         // *italic*
        { regex: /__(.*?)__/g, tag: 'u', className: 'underline' },                       // __underline__
        { regex: /_(.*?)_/g, tag: 'em', className: 'italic' },                          // _italic_ (alternative)
        { regex: /~~(.*?)~~/g, tag: 'del', className: 'line-through opacity-75' },       // ~~strikethrough~~
        { regex: /`(.*?)`/g, tag: 'code', className: 'bg-red-100 px-1 py-0.5 rounded text-xs font-mono' }, // `code`
      ];
      
      // Find all matches without overlaps
      const matches = [];
      let workingLine = line;
      
      patterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.regex.source, 'g');
        
        while ((match = regex.exec(workingLine)) !== null) {
          // Check if this match overlaps with existing matches
          const start = match.index;
          const end = match.index + match[0].length;
          
          const hasOverlap = matches.some(existingMatch => 
            (start < existingMatch.end && end > existingMatch.start)
          );
          
          if (!hasOverlap) {
            matches.push({
              start,
              end,
              content: match[1],
              tag: pattern.tag,
              className: pattern.className,
              fullMatch: match[0],
              priority: patterns.indexOf(pattern)
            });
          }
        }
      });
      
      // Sort matches by start position
      matches.sort((a, b) => {
        if (a.start !== b.start) return a.start - b.start;
        return a.priority - b.priority; // If same start, prioritize by pattern order
      });
      
      // Build formatted content
      if (matches.length === 0) {
        return line;
      }
      
      const result = [];
      let currentIndex = 0;
      
      matches.forEach((match, index) => {
        // Add text before this match
        if (match.start > currentIndex) {
          result.push(line.slice(currentIndex, match.start));
        }
        
        // Add the formatted match
        const key = `format-${index}`;
        
        switch (match.tag) {
          case 'strongem':
            result.push(
              <strong key={key} className={match.className}>
                <em>{match.content}</em>
              </strong>
            );
            break;
          case 'strong':
            result.push(<strong key={key} className={match.className}>{match.content}</strong>);
            break;
          case 'em':
            result.push(<em key={key} className={match.className}>{match.content}</em>);
            break;
          case 'u':
            result.push(<u key={key} className={match.className}>{match.content}</u>);
            break;
          case 'del':
            result.push(<del key={key} className={match.className}>{match.content}</del>);
            break;
          case 'code':
            result.push(<code key={key} className={match.className}>{match.content}</code>);
            break;
          default:
            result.push(match.content);
        }
        
        currentIndex = match.end;
      });
      
      // Add remaining text
      if (currentIndex < line.length) {
        result.push(line.slice(currentIndex));
      }
      
      return result;
    };
    
    // Process each line and handle line breaks
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {formatLine(line)}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 message-enter message-container`}>
      <div        className={`
          max-w-xs sm:max-w-sm md:max-md lg:max-w-lg xl:max-w-xl
          px-4 py-3 rounded-2xl shadow-sm message-bubble
          ${isBot 
            ? 'bg-white text-red-900 mr-auto border border-red-200' 
            : 'bg-red-800 text-white ml-auto'
          }
        `.trim().replace(/\s+/g, ' ')}
      >
        <div className={`text-sm leading-relaxed font-body message-bubble-content ${isStreaming ? 'streaming-text' : ''}`}>
          {formatMessage(message)}          {isStreaming && isBot && (
            <span className="inline-block ml-1 w-2 h-4 bg-red-700 opacity-75 streaming-cursor"></span>
          )}
        </div>        <div 
          className={`
            text-xs mt-2 opacity-70 flex items-center justify-between
            ${isBot ? 'text-red-600' : 'text-red-200'}
          `.trim()}
        >
          <span>{formatTime(timestamp)}</span>          {isStreaming && isBot && (
            <span className="text-xs text-red-700 animate-pulse">Đang trả lời...</span>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
