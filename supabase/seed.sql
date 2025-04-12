-- 居住者のサンプルデータ
INSERT INTO residents (name, room_number, contact_info, status)
VALUES 
  ('山田太郎', '101', '090-1111-2222', 'active'),
  ('佐藤花子', '205', '080-3333-4444', 'active'),
  ('鈴木一郎', '308', '070-5555-6666', 'active'),
  ('田中雄一', '410', '090-7777-8888', 'active'),
  ('伊藤洋子', '512', '080-9999-0000', 'active');

-- 駐輪枠のサンプルデータ
INSERT INTO bicycle_slots (slot_code, location, status) 
VALUES
  ('A-01', '正面入口エリア', 'available'),
  ('A-02', '正面入口エリア', 'available'),
  ('A-03', '正面入口エリア', 'available'),
  ('B-01', '裏口エリア', 'available'),
  ('B-02', '裏口エリア', 'available'),
  ('B-03', '裏口エリア', 'available'),
  ('C-01', '地下エリア', 'available'),
  ('C-02', '地下エリア', 'available'),
  ('C-03', '地下エリア', 'available'),
  ('C-04', '地下エリア', 'available');

-- 駐輪枠の割り当て例
UPDATE bicycle_slots 
SET resident_id = 1, status = 'occupied' 
WHERE slot_code = 'A-01';

UPDATE bicycle_slots 
SET resident_id = 2, status = 'occupied' 
WHERE slot_code = 'B-02';

-- ステッカー発行例
INSERT INTO stickers (slot_id, sticker_number, issued_date)
VALUES
  (1, 'ST-2023-001', '2023-01-15'),
  (5, 'ST-2023-002', '2023-01-20');

-- 違反記録例
INSERT INTO violation_logs (location, memo, reported_at)
VALUES
  ('裏口エリア', '無許可の自転車が駐輪されていました', '2023-02-05'),
  ('地下エリア', 'ステッカーなしの自転車を発見', '2023-03-10');

-- 支払い記録例
INSERT INTO payments (resident_id, month, amount, status)
VALUES
  (1, '2023-01', 500, 'paid'),
  (1, '2023-02', 500, 'paid'),
  (1, '2023-03', 500, 'pending'),
  (2, '2023-01', 500, 'paid'),
  (2, '2023-02', 500, 'pending');