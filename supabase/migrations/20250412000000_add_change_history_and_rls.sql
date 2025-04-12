-- Add deleted_at column to all tables for soft delete functionality
ALTER TABLE residents ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE bicycle_slots ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE stickers ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE violation_logs ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN deleted_at TIMESTAMP;

-- Create a single unified history table for all models (similar to Rails' Paper Trail)
CREATE TABLE model_versions (
    id SERIAL PRIMARY KEY,
    item_type VARCHAR(255) NOT NULL,  -- The model name (e.g., 'residents', 'bicycle_slots')
    item_id INTEGER NOT NULL,         -- The ID of the model record
    event VARCHAR(10) NOT NULL,       -- 'create', 'update', 'delete'
    whodunnit TEXT,                   -- User who made the change
    object JSONB,                     -- Current state of the object as JSON
    object_changes JSONB,             -- Previous state or changes as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_model_versions_item ON model_versions (item_type, item_id);
CREATE INDEX idx_model_versions_event ON model_versions (event);
CREATE INDEX idx_model_versions_created_at ON model_versions (created_at);

-- Create a generic function to record history for any table
CREATE OR REPLACE FUNCTION record_version()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB := NULL;
    new_data JSONB := NULL;
BEGIN
    IF TG_OP = 'INSERT' THEN
        new_data := to_jsonb(NEW);
        INSERT INTO model_versions (item_type, item_id, event, whodunnit, object, object_changes)
        VALUES (TG_TABLE_NAME, NEW.id, 'create', CURRENT_USER, new_data, NULL);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        INSERT INTO model_versions (item_type, item_id, event, whodunnit, object, object_changes)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', CURRENT_USER, new_data, old_data);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        INSERT INTO model_versions (item_type, item_id, event, whodunnit, object, object_changes)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', CURRENT_USER, NULL, old_data);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table to use the generic history recording function
CREATE TRIGGER residents_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON residents
FOR EACH ROW EXECUTE FUNCTION record_version();

CREATE TRIGGER bicycle_slots_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON bicycle_slots
FOR EACH ROW EXECUTE FUNCTION record_version();

CREATE TRIGGER stickers_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON stickers
FOR EACH ROW EXECUTE FUNCTION record_version();

CREATE TRIGGER violation_logs_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON violation_logs
FOR EACH ROW EXECUTE FUNCTION record_version();

CREATE TRIGGER payments_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION record_version();

CREATE OR REPLACE FUNCTION soft_delete_resident(p_id INTEGER)
RETURNS VOID AS $$
BEGIN
    -- 削除される居住者に紐づく駐輪枠を「空き」状態に更新
    UPDATE bicycle_slots 
    SET resident_id = NULL, status = 'available', updated_at = CURRENT_TIMESTAMP 
    WHERE resident_id = p_id;
    
    -- 居住者をソフトデリート
    UPDATE residents SET deleted_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_bicycle_slot(p_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE bicycle_slots SET deleted_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_sticker(p_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE stickers SET deleted_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_violation_log(p_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE violation_logs SET deleted_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_payment(p_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE payments SET deleted_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on all tables
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bicycle_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies to only show non-deleted records
CREATE POLICY "Show non-deleted residents" ON residents
FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Show non-deleted bicycle_slots" ON bicycle_slots
FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Show non-deleted stickers" ON stickers
FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Show non-deleted violation_logs" ON violation_logs
FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Show non-deleted payments" ON payments
FOR SELECT
USING (deleted_at IS NULL);

-- Create policies for insert, update, and delete operations (authenticated users only)
CREATE POLICY "Insert residents" ON residents
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update residents" ON residents
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Delete residents" ON residents
FOR DELETE
USING (auth.role() = 'authenticated');

-- Similar policies for bicycle_slots
CREATE POLICY "Insert bicycle_slots" ON bicycle_slots
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update bicycle_slots" ON bicycle_slots
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Delete bicycle_slots" ON bicycle_slots
FOR DELETE
USING (auth.role() = 'authenticated');

-- Similar policies for stickers
CREATE POLICY "Insert stickers" ON stickers
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update stickers" ON stickers
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Delete stickers" ON stickers
FOR DELETE
USING (auth.role() = 'authenticated');

-- Similar policies for violation_logs
CREATE POLICY "Insert violation_logs" ON violation_logs
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update violation_logs" ON violation_logs
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Delete violation_logs" ON violation_logs
FOR DELETE
USING (auth.role() = 'authenticated');

-- Similar policies for payments
CREATE POLICY "Insert payments" ON payments
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update payments" ON payments
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Delete payments" ON payments
FOR DELETE
USING (auth.role() = 'authenticated');