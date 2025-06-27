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
    // Enhanced markdown-like formatting with better bullet point and line break handling
    const formatLine = (line, lineIndex, allLines) => {
      // Check if this line is a bullet point (starts with • followed by optional space)
      const bulletMatch = line.match(/^(\s*)•\s*(.+)$/);
      if (bulletMatch) {
        const [, indent, content] = bulletMatch;
        const indentLevel = Math.floor(indent.length / 2); // 2 spaces = 1 indent level
        const marginLeft = indentLevel * 16; // 16px per indent level
        
        return (
          <div 
            key={`bullet-${lineIndex}`} 
            className="flex items-start my-2"
            style={{ marginLeft: `${marginLeft}px` }}
          >
            <span className="text-red-600 mr-2 mt-0.5 flex-shrink-0 font-bold">•</span>
            <span className="flex-1">{formatInlineText(content)}</span>
          </div>
        );
      }
      
      // Check if this line is a markdown bullet point (starts with * followed by optional space)
      const markdownBulletMatch = line.match(/^(\s*)\*\s*(.+)$/);
      if (markdownBulletMatch) {
        const [, indent, content] = markdownBulletMatch;
        const indentLevel = Math.floor(indent.length / 2); // 2 spaces = 1 indent level
        const marginLeft = indentLevel * 16; // 16px per indent level
        
        return (
          <div 
            key={`bullet-${lineIndex}`} 
            className="flex items-start my-2"
            style={{ marginLeft: `${marginLeft}px` }}
          >
            <span className="text-red-600 mr-2 mt-0.5 flex-shrink-0 font-bold">•</span>
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
            className="flex items-start my-2"
            style={{ marginLeft: `${marginLeft}px` }}
          >
            <span className="text-red-600 mr-2 mt-0.5 flex-shrink-0 font-bold">{itemNumber}.</span>
            <span className="flex-1">{formatInlineText(content)}</span>
          </div>
        );
      }
      
      // Check for special patterns that should create line breaks
      const hasSpecialPattern = line.match(/👉|🚀|📄|📑|📈|🏦|📞|🏡|🚚|📝|📊|🕒|🌞|🌐|💻/);
      if (hasSpecialPattern && lineIndex > 0) {
        return (
          <div key={`special-${lineIndex}`} className="mt-3">
            {formatInlineText(line)}
          </div>
        );
      }
      
      // Regular line formatting
      return formatInlineText(line);
    };
    
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
      
      // Now clean up text - but avoid the problematic global replacements
      let cleanText = protectedText
        // Fix broken emoji first
        .replace(/� �️?/g, ' ')
        .replace(/� �/g, ' ')
        .replace('�', ' ')
        // Only replace standalone * + - that are not part of formatting, and not in protected URLs
        // Remove the problematic global replacements that were breaking URLs
        // .replace('*', ' ')  // REMOVED - this was breaking URLs
        // .replace('+', '\n') // REMOVED - this was breaking URLs  
        // .replace('-', '\n') // REMOVED - this was breaking URLs
        // Fix incomplete bold formatting patterns
        .replace(/:\*\*\s*([^*\n]+?)(?=\.|$)/g, ': **$1**')
        // Fix cases like "text**bold**text" -> "text **bold** text"
        .replace(/(\w)\*\*([^*]+)\*\*(\w)/g, '$1 **$2** $3')
        // Fix cases like "text*italic*text" -> "text *italic* text"  
        .replace(/(\w)\*([^*]+)\*(\w)/g, '$1 *$2* $3')
        // Remove orphaned *** that don't have proper pairs
        .replace(/\*{3,}/g, '**')
        // Remove orphaned ** that don't have closing pairs
        .replace(/\*\*\s*$/g, '')
        .replace(/^\s*\*\*$/g, '')
        // Remove orphaned * at the end
        .replace(/\*\s*$/g, '')
        .replace(/^\s*\*$/g, '')
        // Handle emoji arrows followed by text
        .replace(/👉\s*/g, '👉 ')
        // Handle other emojis that should have proper spacing
        .replace(/(🚀|📄|📑|📈|🏡|💵|📆|🏦|📞|🚚|📝|📊|🕒|🌞|🌐|💻)\s*/g, '$1 ');
      
      // Define formatting patterns with priority order (markdown links and URLs first)
      const patterns = [
        // Markdown links pattern - highest priority
        { regex: /__PROTECTED_MARKDOWN_LINK_(\d+)__/g, tag: 'markdown', className: 'text-blue-600 hover:text-blue-800 underline' },
        // URL pattern - second priority
        { regex: /__PROTECTED_URL_(\d+)__/g, tag: 'link', className: 'text-blue-600 hover:text-blue-800 underline break-all' },
        { regex: /\*\*\*(.*?)\*\*\*/g, tag: 'strongem', className: 'font-bold italic text-red-800' },  // ***bold italic***
        { regex: /\*\*(.*?)\*\*/g, tag: 'strong', className: 'font-bold text-red-800' },              // **bold**
        { regex: /__(.*?)__/g, tag: 'u', className: 'underline' },                       // __underline__
        { regex: /\*([^*\n]+)\*/g, tag: 'em', className: 'italic text-red-700' },                          // *italic*
        { regex: /~~(.*?)~~/g, tag: 'del', className: 'line-through opacity-75' },       // ~~strikethrough~~
        { regex: /`(.*?)`/g, tag: 'code', className: 'bg-red-100 px-1 py-0.5 rounded text-xs font-mono' }, // `code`
      ];
      
      // Find all matches without overlaps
      const matches = [];
      
      patterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.regex.source, 'g');
        
        while ((match = regex.exec(cleanText)) !== null) {
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
        let finalText = cleanText;
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
          result.push(cleanText.slice(currentIndex, match.start));
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
      if (currentIndex < cleanText.length) {
        let remainingText = cleanText.slice(currentIndex);
        
        // Replace any remaining protected placeholders in the remaining text
        urlProtectionMap.forEach((data, placeholder) => {
          if (remainingText.includes(placeholder)) {
            if (data.type === 'markdown') {
              remainingText = remainingText.replace(placeholder, 
                `<a href="${data.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${data.text}</a>`
              );
            } else if (data.type === 'url') {
              remainingText = remainingText.replace(placeholder,
                `<a href="${data.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">${data.url}</a>`
              );
            }
          }
        });
        
        // If we have HTML in remaining text, we need to parse it
        if (remainingText.includes('<a ')) {
          result.push(<span key="remaining" dangerouslySetInnerHTML={{ __html: remainingText }} />);
        } else {
          result.push(remainingText);
        }
      }
      
      return result;
    };
    
    // Pre-process text to handle better line breaks and fix common formatting issues
    let processedText = text
      // First, handle the most problematic patterns
      // Fix cases where text flows directly after emoji without space
      .replace(/(📑|🏡|🚚|📈|📝|📄|📊|📞|🏦|🕒|🌞|🌐|💻|🚀)([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸ])/g, '$1 $2')
      // Fix cases where sentences end and emoji starts without proper spacing
      .replace(/([.!?:])([📑🏡🚚📈📝📄📊📞🏦🕒🌞🌐💻🚀])/g, '$1 $2')
      // Fix broken emoji representations (� �) - replace with proper spacing
      .replace(/� �️?/g, '� ')
      .replace(/� �/g, '�📑 ')
      // Fix cases where broken emoji appears at start of line after bullet
      .replace(/^•\s*� �️?/gm, '• 🕒 ')
      .replace(/^•\s*� �/gm, '• 📑 ')
      // Fix cases where company name flows directly into other text
      .replace(/Agribank([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸ])/g, 'Agribank $1')
      // Fix cases where text flows together without spaces
      .replace(/([a-zàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ])([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸ])/g, '$1 $2')
      // Fix bullet points that are merged with formatting (e.g., "•*text*" -> "• *text*")
      .replace(/•\*([^*]+)\*/g, '• *$1*')
      .replace(/•\*\*([^*]+)\*\*/g, '• **$1**')
      // Fix bullet points with emoji directly attached (e.g., "•*🕒️" -> "• 🕒️")
      .replace(/•\*(🕒|🌞|🌐|💻|🚀|📑|🏡|🚚|📈|📝|📄|📊|📞|🏦)/g, '• $1')
      // Fix incomplete bold formatting (e.g., "text:** more text" -> "text: **more text**")
      .replace(/([^*]):\*\*\s*([^*\n]+?)([.!?])/g, '$1: **$2**$3')
      // Fix orphaned ** at end of lines (remove them)
      .replace(/\*\*\s*$/gm, '')
      // Fix orphaned ** at start of lines
      .replace(/^•\*\*\s*$/gm, '')
      .replace(/^\*\*\s*$/gm, '')
      // Fix orphaned ** in middle of text (remove them)
      .replace(/\s+\*\*\s+/g, ' ')
      // Fix cases like "text**. " -> "text. "
      .replace(/\*\*\s*([.!?])/g, '$1')
      // Fix cases like "text).** Text" -> "text). Text"
      .replace(/\)\.\*\*\s+/g, '). ')
      // Fix cases like "text.**" -> "text."
      .replace(/\.\*\*(?!\w)/g, '.')
      // Handle standalone bullet points followed by content on next line
      .replace(/^•\s*\n([^\n•])/gm, '• $1')
      // Handle bullet points followed by emoji content
      .replace(/^•\s*\n(📑|🏡|🚚|📈|📝|📄|📊|📞|🕒|🌞|🌐|💻|🚀)/gm, '• $1')
      // Handle bullet points followed by broken emoji content
      .replace(/^•\s*\n(� �️?)/gm, '• 🕒 ')
      // Remove empty bullet points that are truly empty
      .replace(/^•\s*\n\s*$/gm, '')
      // Fix cases where bullet points have no space after them
      .replace(/^•([^\s])/gm, '• $1')
      // Fix cases where emoji content flows together without proper spacing
      .replace(/(📑|🏡|🚚|📈|📝|📄|📊|📞)([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸ])/g, '$1 $2')
      // Handle specific problematic patterns from the example
      .replace(/📝 Hồ sơ vay:([A-Z])/g, '📝 Hồ sơ vay: $1')
      .replace(/📞 Yêu cầu hỗ trợ:([A-Z])/g, '📞 Yêu cầu hỗ trợ: $1')
      // Fix specific patterns from the examples
      .replace(/🕒️ Thời gian làm việc:/g, '🕒️ Thời gian làm việc:')
      .replace(/🕒️ Giờ làm việc:/g, '🕒️ Giờ làm việc:')
      .replace(/🌞️ Ngừng hoạt động:/g, '🌞️ Ngừng hoạt động:')
      // Fix dashes that should be bullet points
      .replace(/- 🕒️/g, '• 🕒️')
      .replace(/- 🌞️/g, '• 🌞️')
      .replace(/- 📑/g, '• 📑')
      .replace(/- 🏡/g, '• 🏡')
      // Fix spacing issues around colons
      .replace(/([^:\s]):([^\s])/g, '$1: $2')
      // Fix text that gets merged together (add space before uppercase letters that follow lowercase)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Add line breaks before emoji arrows if they're not already on new lines
      .replace(/([^\n\s])👉/g, '$1\n👉')
      // Add line breaks before other important emojis
      .replace(/([^\n\s])(🚀|📄|📑|📈|🏡|💵|📆|🏦|📞|🚚|📝|📊|🕒|🌞|🌐|💻)/g, '$1\n$2')
      // Handle cases where bullet points are not properly separated
      .replace(/([.!?])(\*[^*])/g, '$1\n$2')
      // Handle cases where text flows directly into bullet points
      .replace(/([a-zA-Z0-9])(\*\s*[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸ])/g, '$1\n$2')
      // Fix cases where sentences end and new bullet points start
      .replace(/([.!?])•/g, '$1\n•')
      // Handle cases where emoji appears right after punctuation without space
      .replace(/([.!?])([📑🏡🚚📈📝📄📊📞🏦🕒🌞🌐💻🚀])/g, '$1 $2')
      // Handle cases where multiple emojis appear together
      .replace(/([📑🏡🚚📈📝📄📊📞🏦🕒🌞🌐💻🚀])\s*([📑🏡🚚📈📝📄📊📞🏦🕒🌞🌐💻🚀])/g, '$1 $2')
      // Fix website URLs that got broken
      .replace(/\[Website chính thức của Agribank\]\(http: \/\/www\.agribank\.com\.vn\)/g, '[Website chính thức của Agribank](http://www.agribank.com.vn)')
      // Fix URLs with broken spacing (e.g., "https: //www.google.com" -> "https://www.google.com")
      .replace(/(https?): \/\//g, '$1://')
      // Fix URLs wrapped in parentheses with spaces (e.g., "(https: //www.google.com)" -> "https://www.google.com")
      .replace(/\(\s*(https?): \/\/([^)]+)\s*\)/g, '$1://$2')
      .replace(/www\.agribank\.com\.vn\*\*/g, 'www.agribank.com.vn')
      // Fix phone numbers with formatting issues
      .replace(/1900 55 88 18\*\*/g, '1900 55 88 18')
      // Clean up multiple consecutive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Final cleanup - ensure proper spacing around colons in emoji contexts
      .replace(/(📑|🏡|🚚|📈|📝|📄|📊|📞|🏦|🕒|🌞|🌐|💻|🚀)\s*([^:\s])/g, '$1 $2')
      // Final pass to clean up any remaining formatting issues
      .replace(/\*\*+/g, '') // Remove any remaining ** patterns
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Split text into lines and process each line
    const lines = processedText.split('\n');
    const processedLines = [];
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development' && text.includes('📑')) {
      console.log('Processing message with emoji:', {
        original: text,
        processed: processedText,
        lines: lines
      });
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines but add some spacing
      if (line === '') {
        if (i > 0 && i < lines.length - 1) {
          processedLines.push(<div key={`empty-${i}`} className="h-2"></div>);
        }
        continue;
      }
      
      // Skip standalone bullet points (just • with no content)
      if (line === '•' || line === '*' || line === '+') {
        continue;
      }
      
      const formattedLine = formatLine(line, i, lines);
      
      // Check if this is a bullet/numbered list item or has special emoji
      const isBulletPoint = line.match(/^(\s*)[*•+]\s*(.+)$/);
      const hasSpecialEmoji = line.match(/👉|🚀|📄|📑|📈|🏦|📞|🏡|🚚|📝|📊|🕒|🌞|🌐|💻/);
      
      if (isBulletPoint || hasSpecialEmoji) {
        processedLines.push(formattedLine);
      } else {
        // Regular line - add with line break if not the last line and next line isn't empty
        processedLines.push(
          <React.Fragment key={i}>
            {formattedLine}
            {i < lines.length - 1 && lines[i + 1].trim() !== '' && <br />}
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
