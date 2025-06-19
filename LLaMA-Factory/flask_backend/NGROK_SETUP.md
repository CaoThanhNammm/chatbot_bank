# Ngrok Setup Guide

## Cài đặt và cấu hình Ngrok cho Flask Backend

### 1. Cài đặt Ngrok

#### Windows:
1. Tải ngrok từ: https://ngrok.com/download
2. Giải nén và đặt `ngrok.exe` vào thư mục có trong PATH
3. Hoặc đặt trong thư mục dự án và thêm vào PATH

#### Linux/Mac:
```bash
# Ubuntu/Debian
sudo apt install ngrok

# macOS với Homebrew
brew install ngrok/ngrok/ngrok
```

### 2. Lấy Auth Token

1. Đăng ký tài khoản tại: https://ngrok.com/
2. Lấy auth token từ: https://dashboard.ngrok.com/get-started/your-authtoken
3. Thêm token vào file `.env`:

```env
NGROK_AUTH_TOKEN_BE=your_token_here
```

### 3. Các cách chạy Ngrok

#### Cách 1: Tự động (khuyến nghị)
```bash
python run.py
```
Script sẽ tự động:
- Phát hiện tunnel ngrok đang chạy
- Tạo tunnel mới nếu cần
- Cấu hình Flask app với URL ngrok

#### Cách 2: Thủ công
```bash
# Terminal 1: Chạy ngrok
python ngrok_helper.py start

# Terminal 2: Chạy Flask app
python run.py
```

#### Cách 3: Đặt URL cố định
Nếu bạn đã có tunnel ngrok chạy sẵn, thêm vào `.env`:
```env
NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

### 4. Công cụ hỗ trợ

#### Kiểm tra trạng thái ngrok:
```bash
python ngrok_helper.py status
```

#### Dừng tất cả ngrok processes:
```bash
python ngrok_helper.py kill
```

#### Chạy ngrok thủ công:
```bash
python ngrok_helper.py start        # Port 5000
python ngrok_helper.py start 8000   # Port tùy chỉnh
```

### 5. Xử lý lỗi thường gặp

#### Lỗi "authentication failed"
- Kiểm tra NGROK_AUTH_TOKEN_BE trong file .env
- Đảm bảo token chính xác từ ngrok dashboard

#### Lỗi "limited to 1 simultaneous"
- Ngrok free plan chỉ cho phép 1 tunnel
- Chạy: `python ngrok_helper.py kill`
- Kiểm tra dashboard: https://dashboard.ngrok.com/agents

#### Lỗi "connection refused"
- Kiểm tra kết nối internet
- Thử chạy ngrok thủ công: `ngrok http 5000`

#### Lỗi "tunnel not found"
- Khởi động lại terminal/IDE
- Xóa cache ngrok: `ngrok kill`

### 6. Ngrok Dashboard

Truy cập: http://localhost:4040 để xem:
- Danh sách tunnels đang hoạt động
- Traffic logs
- Request/Response details

### 7. Lưu ý bảo mật

- Không chia sẻ auth token
- Ngrok URL có thể thay đổi mỗi lần khởi động
- Sử dụng HTTPS URLs cho production
- Cân nhắc nâng cấp lên ngrok paid plan cho stability

### 8. Troubleshooting

Nếu vẫn gặp lỗi, thử các bước sau:

1. **Reset hoàn toàn:**
   ```bash
   python ngrok_helper.py kill
   # Đợi 5 giây
   python run.py
   ```

2. **Kiểm tra processes:**
   ```bash
   # Windows
   tasklist | findstr ngrok
   
   # Linux/Mac
   ps aux | grep ngrok
   ```

3. **Chạy debug mode:**
   ```bash
   ngrok http 5000 --log=stdout
   ```

4. **Kiểm tra firewall/antivirus:**
   - Cho phép ngrok.exe qua firewall
   - Tạm thời tắt antivirus để test