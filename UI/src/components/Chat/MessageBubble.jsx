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
    // Enhanced markdown-like formatting with support for multiple formats and bullet lists
    const formatLine = (line, lineIndex, allLines) => {
      // Check if this line is a bullet point (starts with * followed by optional space)
      const bulletMatch = line.match(/^(\s*)\*\s*(.+)$/);
      if (bulletMatch) {
        const [, indent, content] = bulletMatch;
        const indentLevel = Math.floor(indent.length / 2); // 2 spaces = 1 indent level
        const marginLeft = indentLevel * 16; // 16px per indent level
        
        return (
          <div 
            key={`bullet-${lineIndex}`} 
            className="flex items-start my-1"
            style={{ marginLeft: `${marginLeft}px` }}
          >
            <span className="text-primary mr-2 mt-0.5 flex-shrink-0">•</span>
            <span className="flex-1">{formatInlineText(content)}</span>
          </div>
        );
      }
      
      // Check if this line is a numbered list (starts with + followed by optional space)
      const numberedMatch = line.match(/^(\s*)\+\s*(.+)$/);
      if (numberedMatch) {
        const [, indent, content] = numberedMatch;
        const indentLevel = Math.floor(indent.length / 2);
        const marginLeft = indentLevel * 16;
        
        // Count previous numbered items at the same level to get the number
        let itemNumber = 1;
        for (let i = lineIndex - 1; i >= 0; i--) {
          const prevLine = allLines[i];
          const prevMatch = prevLine.match(/^(\s*)\+\s*(.+)$/);
          if (prevMatch) {
            const prevIndent = Math.floor(prevMatch[1].length / 2);
            if (prevIndent === indentLevel) {
              itemNumber++;
            } else if (prevIndent < indentLevel) {
              break;
            }
          } else if (prevLine.trim() === '') {
            continue;
          } else {
            break;
          }
        }
        
        return (
          <div 
            key={`numbered-${lineIndex}`} 
            className="flex items-start my-1"
            style={{ marginLeft: `${marginLeft}px` }}
          >
            <span className="text-primary mr-2 mt-0.5 flex-shrink-0 font-medium">{itemNumber}.</span>
            <span className="flex-1">{formatInlineText(content)}</span>
          </div>
        );
      }
      
      // Regular line formatting
      return formatInlineText(line);
    };
    
    const formatInlineText = (text) => {
      // Define formatting patterns with priority order (longer patterns first to avoid conflicts)
      const patterns = [
        { regex: /\*\*\*(.*?)\*\*\*/g, tag: 'strongem', className: 'font-bold italic' },  // ***bold italic***
        { regex: /\*\*(.*?)\*\*/g, tag: 'strong', className: 'font-bold' },              // **bold**
        { regex: /__(.*?)__/g, tag: 'u', className: 'underline' },                       // __underline__
        { regex: /_(.*?)_/g, tag: 'em', className: 'italic' },                          // _italic_
        { regex: /~~(.*?)~~/g, tag: 'del', className: 'line-through opacity-75' },       // ~~strikethrough~~
        { regex: /`(.*?)`/g, tag: 'code', className: 'bg-red-100 px-1 py-0.5 rounded text-xs font-mono' }, // `code`
      ];
      
      // Find all matches without overlaps
      const matches = [];
      let workingText = text;
      
      patterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.regex.source, 'g');
        
        while ((match = regex.exec(workingText)) !== null) {
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
        return text;
      }
      
      const result = [];
      let currentIndex = 0;
      
      matches.forEach((match, index) => {
        // Add text before this match
        if (match.start > currentIndex) {
          result.push(text.slice(currentIndex, match.start));
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
      if (currentIndex < text.length) {
        result.push(text.slice(currentIndex));
      }
      
      return result;
    };
    
    // Split text into lines and process each line
    const lines = text.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const formattedLine = formatLine(line, i, lines);
      
      // Check if this is a bullet/numbered list item
      const isBulletPoint = line.match(/^(\s*)[*+]\s*(.+)$/);
      
      if (isBulletPoint) {
        processedLines.push(formattedLine);
      } else {
        // Regular line - add with line break if not the last line
        processedLines.push(
          <React.Fragment key={i}>
            {formattedLine}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }
    }
    
    return processedLines;
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
