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
  };

  const formatMessage = (text) => {
    // Simple function to handle URLs and markdown links only, preserve raw text otherwise
    const formatInlineText = (text) => {
      // First, protect URLs and markdown links from being modified
      const urlProtectionMap = new Map();
      let protectedText = text;
      let protectionCounter = 0;
      
      // Protect markdown links [text](url) first
      protectedText = protectedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        const placeholder = `__PROTECTED_MARKDOWN_LINK_${protectionCounter}__`;
        urlProtectionMap.set(placeholder, { type: 'markdown', text: linkText, url: url.trim() });
        protectionCounter++;
        return placeholder;
      });
      
      // Protect standalone URLs
      protectedText = protectedText.replace(/(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g, (match, url) => {
        const placeholder = `__PROTECTED_URL_${protectionCounter}__`;
        urlProtectionMap.set(placeholder, { type: 'url', url: url.trim() });
        protectionCounter++;
        return placeholder;
      });
      
      // Define formatting patterns - only URLs and markdown links
      const patterns = [
        // Markdown links pattern - highest priority
        { regex: /__PROTECTED_MARKDOWN_LINK_(\d+)__/g, tag: 'markdown', className: 'text-blue-600 hover:text-blue-800 underline' },
        // URL pattern - second priority
        { regex: /__PROTECTED_URL_(\d+)__/g, tag: 'link', className: 'text-blue-600 hover:text-blue-800 underline break-all' },
      ];
      
      // Find all matches without overlaps
      const matches = [];
      
      patterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.regex.source, 'g');
        
        while ((match = regex.exec(protectedText)) !== null) {
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
        // Even if no matches, we still need to restore protected URLs/links
        let finalText = protectedText;
        const result = [];
        let currentPos = 0;
        
        // Find all placeholders and replace them with proper React elements
        urlProtectionMap.forEach((data, placeholder) => {
          const placeholderIndex = finalText.indexOf(placeholder, currentPos);
          if (placeholderIndex !== -1) {
            // Add text before placeholder
            if (placeholderIndex > currentPos) {
              result.push(finalText.slice(currentPos, placeholderIndex));
            }
            
            // Add link element
            if (data.type === 'markdown') {
              result.push(
                <a 
                  key={`link-${result.length}`}
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 underline"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(data.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {data.text}
                </a>
              );
            } else if (data.type === 'url') {
              result.push(
                <a 
                  key={`link-${result.length}`}
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(data.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {data.url}
                </a>
              );
            }
            
            currentPos = placeholderIndex + placeholder.length;
          }
        });
        
        // Add remaining text
        if (currentPos < finalText.length) {
          result.push(finalText.slice(currentPos));
        }
        
        return result.length > 0 ? result : finalText;
      }
      
      const result = [];
      let currentIndex = 0;
      
      matches.forEach((match, index) => {
        // Add text before this match
        if (match.start > currentIndex) {
          result.push(protectedText.slice(currentIndex, match.start));
        }
        
        // Add the formatted match
        const key = `format-${index}`;
        
        switch (match.tag) {
          case 'markdown':
            // Handle protected markdown links
            const markdownData = urlProtectionMap.get(match.fullMatch);
            if (markdownData) {
              result.push(
                <a 
                  key={key} 
                  href={markdownData.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={match.className}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(markdownData.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {markdownData.text}
                </a>
              );
            } else {
              result.push(match.fullMatch);
            }
            break;
          case 'link':
            // Handle protected URLs
            const urlData = urlProtectionMap.get(match.fullMatch);
            if (urlData) {
              result.push(
                <a 
                  key={key} 
                  href={urlData.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={match.className}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(urlData.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {urlData.url}
                </a>
              );
            } else {
              result.push(match.fullMatch);
            }
            break;
          default:
            result.push(match.content);
        }
        
        currentIndex = match.end;
      });
      
      // Add remaining text
      if (currentIndex < protectedText.length) {
        result.push(protectedText.slice(currentIndex));
      }
      
      return result;
    };
    
    // Simply return the formatted text with URLs and markdown links processed
    return formatInlineText(text);
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
