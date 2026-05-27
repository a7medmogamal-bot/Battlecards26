// ==================== نظام التخزين المحلي ====================

const STORAGE_KEY = 'battlecards26_save';
const STORAGE_VERSION = '1.0';

class StorageManager {
    constructor() {
        this.key = STORAGE_KEY;
    }

    // حفظ البيانات
    save(data) {
        try {
            const saveData = {
                version: STORAGE_VERSION,
                timestamp: new Date().toISOString(),
                data: data
            };
            localStorage.setItem(this.key, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('فشل في حفظ البيانات:', e);
            return false;
        }
    }

    // تحميل البيانات
    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw) return null;
            
            const saveData = JSON.parse(raw);
            if (saveData.version !== STORAGE_VERSION) {
                console.warn('إصدار التخزين مختلف، جاري التحديث...');
                // هنا ممكن نضيف منطق ترحيل البيانات
            }
            return saveData.data;
        } catch (e) {
            console.error('فشل في تحميل البيانات:', e);
            return null;
        }
    }

    // حذف البيانات
    clear() {
        try {
            localStorage.removeItem(this.key);
            return true;
        } catch (e) {
            console.error('فشل في حذف البيانات:', e);
            return false;
        }
    }

    // التحقق من وجود بيانات محفوظة
    exists() {
        return localStorage.getItem(this.key) !== null;
    }

    // حفظ تلقائي مع حماية من الأعطال
    autoSave(data) {
        // حفظ نسخة احتياطية أولاً
        const backup = this.load();
        if (backup) {
            try {
                localStorage.setItem(this.key + '_backup', JSON.stringify(backup));
            } catch (e) {}
        }
        
        // حفظ البيانات الجديدة
        const result = this.save(data);
        
        // حذف النسخة الاحتياطية إذا نجح الحفظ
        if (result) {
            localStorage.removeItem(this.key + '_backup');
        }
        
        return result;
    }

    // استعادة النسخة الاحتياطية
    restoreBackup() {
        try {
            const raw = localStorage.getItem(this.key + '_backup');
            if (!raw) return null;
            
            const backup = JSON.parse(raw);
            this.save(backup);
            localStorage.removeItem(this.key + '_backup');
            return backup;
        } catch (e) {
            console.error('فشل في استعادة النسخة الاحتياطية:', e);
            return null;
        }
    }

    // تصدير البيانات (للنسخ الاحتياطي اليدوي)
    exportData() {
        const data = this.load();
        if (!data) return null;
        return JSON.stringify(data, null, 2);
    }

    // استيراد البيانات
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.save(data);
            return true;
        } catch (e) {
            console.error('فشل في استيراد البيانات:', e);
            return false;
        }
    }
}

// إنشاء نسخة عامة من مدير التخزين
const storage = new StorageManager();