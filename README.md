# Tic-Tac-Toe AI — Minimax & Alpha-Beta

Demo web dùng **HTML + CSS + JavaScript thuần** để minh họa:

1. Đệ quy & cây trò chơi
2. Thuật toán Minimax
3. Alpha-Beta Pruning

## Chạy trên máy

Mở trực tiếp `index.html` bằng trình duyệt.

## Đưa lên GitHub Pages

1. Tạo repository mới trên GitHub, ví dụ: `tic-tac-toe-ai`.
2. Upload 3 file chính:
   - `index.html`
   - `style.css`
   - `script.js`
3. Vào **Settings → Pages**.
4. Ở **Build and deployment**, chọn **Deploy from a branch**.
5. Chọn branch `main` và thư mục `/(root)`.
6. Nhấn **Save**.
7. Sau khi deploy xong, link thường có dạng:
   `https://TEN-TAI-KHOAN.github.io/tic-tac-toe-ai/`

## Cách demo

- Chọn `Minimax`, chơi một nước và ghi lại số `Nút đã duyệt`.
- Chơi lại cùng cách với `Alpha-Beta Pruning`.
- So sánh số nút đã duyệt và số lần cắt nhánh.

## Quy ước điểm

- AI thắng: `10 - depth`
- Người chơi thắng: `depth - 10`
- Hòa: `0`

Điều này giúp AI ưu tiên thắng sớm và nếu buộc phải thua thì kéo dài ván hơn.
