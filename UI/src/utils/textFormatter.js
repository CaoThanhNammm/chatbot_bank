/**
 * Text formatting utilities for chat responses
 */

/**
 * Clean and format response text from API
 * @param {string} text - Raw text from API response
 * @returns {string} - Cleaned and formatted text
 */
export const formatResponseText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Handle escaped newlines
    .replace(/\\n/g, '\n')
    // Handle escaped quotes
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    // Handle Unicode escape sequences (for emojis)
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      try {
        return String.fromCharCode(parseInt(code, 16));
      } catch (e) {
        return match; // Return original if conversion fails
      }
    })
    // Handle other common escape sequences
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    // Handle escaped backslashes (should be last)
    .replace(/\\\\/g, '\\')
    // Clean up any trailing JSON artifacts
    .replace(/"}$/, '')
    .replace(/^"/, '')
    // Normalize multiple consecutive newlines to maximum 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace from start and end
    .trim();
};

/**
 * Process streaming chunk and format it properly
 * @param {string} chunk - Raw chunk from streaming response
 * @returns {string} - Formatted chunk
 */
export const formatStreamingChunk = (chunk) => {
  if (!chunk || typeof chunk !== 'string') {
    return '';
  }

  // For streaming, we want to preserve the raw format but clean up escape sequences
  return chunk
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      try {
        return String.fromCharCode(parseInt(code, 16));
      } catch (e) {
        return match;
      }
    })
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\');
};

/**
 * Extract content from JSON response string
 * @param {string} jsonString - JSON string from API
 * @returns {string} - Extracted and formatted content
 */
export const extractResponseContent = (jsonString) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return '';
  }

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(jsonString);
    if (parsed.response) {
      return formatResponseText(parsed.response);
    }
    if (parsed.message) {
      return formatResponseText(parsed.message);
    }
    return formatResponseText(jsonString);
  } catch (e) {
    // If not valid JSON, treat as raw text
    return formatResponseText(jsonString);
  }
};

/**
 * Validate if text contains proper emoji rendering
 * @param {string} text - Text to validate
 * @returns {boolean} - True if emojis are properly rendered
 */
export const hasProperEmojiRendering = (text) => {
  if (!text) return false;
  
  // Check for common emoji patterns
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
};

/**
 * Debug function to log text formatting issues
 * @param {string} original - Original text
 * @param {string} formatted - Formatted text
 */
export const debugTextFormatting = (original, formatted) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('Text Formatting Debug');
    console.log('Original:', original);
    console.log('Formatted:', formatted);
    console.log('Has Emojis:', hasProperEmojiRendering(formatted));
    console.log('Length Change:', original.length, '->', formatted.length);
    console.groupEnd();
  }
};

/**
 * Test function to validate JSON response parsing
 * @param {string} testResponse - Test JSON response
 */
export const testResponseParsing = (testResponse) => {
  console.group('Response Parsing Test');
  console.log('Input:', testResponse);
  
  // Test regex matching
  const jsonMatch = testResponse.match(/\{"success":\s*true,\s*"response":\s*"(.*?)"\}/);
  if (jsonMatch) {
    console.log('Regex Match Found:', jsonMatch[1]);
    const formatted = formatStreamingChunk(jsonMatch[1]);
    console.log('Formatted:', formatted);
  } else {
    console.log('No regex match found');
  }
  
  // Test JSON parsing
  try {
    const parsed = JSON.parse(testResponse);
    console.log('JSON Parsed:', parsed);
    if (parsed.response) {
      const formatted = formatStreamingChunk(parsed.response);
      console.log('Response Content:', formatted);
    }
  } catch (e) {
    console.log('JSON Parse Error:', e.message);
  }
  
  console.groupEnd();
};