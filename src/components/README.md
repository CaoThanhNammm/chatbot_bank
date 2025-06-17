# Components Structure

Tổ chức lại cấu trúc thư mục components để dễ dàng quản lý và tái sử dụng.

## Cấu trúc thư mục

```
src/components/
├── ui/                    # Basic UI components
│   ├── Button.jsx         # Button component with variants
│   ├── Input.jsx          # Input component with validation
│   ├── Modal.jsx          # Modal dialog component
│   ├── Spinner.jsx        # Loading spinner component
│   └── index.js           # Export all UI components
├── layout/               # Layout components
│   ├── Header.jsx         # Main website header (for public pages)
│   ├── Footer.jsx         # Main website footer (for public pages)
│   ├── AuthLayout.jsx     # Layout for login/register pages
│   └── index.js           # Export all layout components
├── Chat/                 # Chat-related components (Note: Capital C for legacy compatibility)
│   ├── ChatWindow.jsx     # Main chat message display area
│   ├── ChatInput.jsx      # Chat input field with send functionality
│   ├── MessageBubble.jsx  # Individual message bubble component
│   ├── TypingIndicator.jsx # Typing animation indicator
│   ├── SettingsModal.jsx  # Chat settings modal
│   ├── SidePanel.jsx      # Chat sidebar with quick prompts
│   ├── Header.jsx         # Chat-specific header (different from main Header)
│   └── index.js           # Export all chat components
├── common/               # Common/shared components and re-exports
│   └── index.js           # Re-export components for convenience
└── index.js              # Main components index (exports everything)
```

## Cách sử dụng

### Import từ category cụ thể:
```jsx
import { Button, Input } from '../components/ui';
import { Header, Footer } from '../components/layout';
import { ChatWindow, ChatInput } from '../components/Chat';
```

### Import từ main index (recommended):
```jsx
import { Button, Input, Header, Footer, ChatWindow } from '../components';
```

### Import individual component:
```jsx
import Button from '../components/ui/Button';
```

## Quy tắc đặt tên

- **ui/**: Components cơ bản, tái sử dụng cao (Button, Input, Modal, etc.)
- **layout/**: Components layout chính (Header, Footer, AuthLayout)
- **Chat/**: Components chuyên dụng cho chat (với Header riêng cho chat)
- **common/**: Re-exports và shared utilities

## Lưu ý

- Chat có Header riêng (`ChatHeader`) khác với Header chính của website
- Tất cả components đều có thể import từ `../components` main index
- Sử dụng named exports cho performance tốt hơn
- Folder names sử dụng camelCase trừ `Chat/` (giữ nguyên để tương thích)

## Migration Notes

Tất cả import statements trong pages đã được cập nhật để sử dụng cấu trúc mới:
- HomePage, AboutPage, ContactPage: Sử dụng main Header/Footer
- LoginPage, RegisterPage: Sử dụng AuthLayout  
- ChatPage, ProfilePage: Sử dụng ChatHeader riêng
