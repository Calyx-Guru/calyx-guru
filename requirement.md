Tóm tắt yêu cầu
Bạn cần localize (dịch đa ngôn ngữ) cho một ứng dụng, gồm 2 phần chính:

Phần 1: Localization (UI text — button, label, v.v.)
Mục tiêu: Dịch toàn bộ text trong app sang các ngôn ngữ khác (Nhật, Hàn, Trung, v.v.)
Cách làm:

Setup admin dashboard

Copy file .env.local vào đúng folder (/admin và /root)
Chạy npm run admin:dev → vào localhost:5173 → login
Vào mục Localization

Duyệt toàn bộ màn hình/component, tìm tất cả text đang dùng
Thêm entry vào bảng localization theo cú pháp:

${page_name}.${component}.${description}
Ví dụ: main_menu.kaucim_orb.label

Translate từng entry sang các ngôn ngữ cần thiết (dùng AI dịch hàng loạt)
Sync về code:

bash npx tsx ./tools/SyncTranslation.ts download

Phần 2: Story (nội dung bài/câu chuyện)
Mục tiêu: Dịch nội dung story sang các ngôn ngữ khác
Cách làm:

Paste nhiều story một lúc vào AI để dịch hàng loạt
Lưu ý về title: Yêu cầu AI dịch theo kiểu Hán Việt (Nhật/Hàn thì tương đồng, ít cần chú thích thêm)
Copy kết quả vào admin dashboard → save
Sync về code:

bash npx tsx ./tools/SyncMasterdata.ts download

Lưu ý thêm

Lịch âm đang hiển thị sai (hôm nay là mùng 2 tháng 4) — cần fix riêng
Phần useAppTheme / hàm translate trong code đã được anh Chung setup sẵn, bạn chỉ cần lo phần content/data trong dashboard

Thứ tự ưu tiên nên làm:

Setup dashboard → vào được Localization
Localize UI text (thêm key + dịch)
Dịch Story
Sync cả 2 phần về code
