"""
Script to remove emoji from run.py for Windows compatibility
"""

import re

def fix_emoji_in_file(filename):
    """Remove emoji from file and replace with text equivalents."""
    
    # Read the file
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Define emoji replacements
    emoji_replacements = {
        '🚀': '[START]',
        '✅': '[PASS]',
        '❌': '[FAIL]',
        '⚠️': '[WARN]',
        '🔍': '[INFO]',
        '🔗': '[LINK]',
        '💡': '[TIP]',
        '📧': '[EMAIL]',
        '🔄': '[PROCESS]',
        '🏠': '[LOCAL]',
        '📍': '[LOCATION]',
        '🎉': '[SUCCESS]',
        '🌐': '[URL]',
        '🖥️': '[SERVER]',
        '⌨️': '[INPUT]'
    }
    
    # Replace emoji
    for emoji, replacement in emoji_replacements.items():
        content = content.replace(emoji, replacement)
    
    # Remove emoji patterns that might be repeated
    content = re.sub(r'✅+', '[SUCCESS]', content)
    content = re.sub(r'❌+', '[FAIL]', content)
    
    # Write back to file
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed emoji in {filename}")

if __name__ == "__main__":
    fix_emoji_in_file("run.py")