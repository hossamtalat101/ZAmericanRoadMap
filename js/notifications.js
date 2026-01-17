// نظام الإشعارات
class NotificationManager {
  constructor() {
    this.permission = null;
    this.checkPermission();
  }

  // التحقق من إذن الإشعارات
  async checkPermission() {
    if (!("Notification" in window)) {
      console.log("هذا المتصفح لا يدعم الإشعارات");
      return;
    }

    this.permission = Notification.permission;
    return this.permission;
  }

  // طلب إذن الإشعارات
  async requestPermission() {
    if (!("Notification" in window)) {
      return false;
    }

    if (this.permission === "default") {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === "granted";
  }

  // إرسال إشعار
  sendNotification(title, options = {}) {
    if (!("Notification" in window)) {
      return false;
    }

    if (this.permission !== "granted") {
      console.log("لم يتم منح إذن الإشعارات");
      return false;
    }

    const defaultOptions = {
      body: "",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "zamerican-notification",
      requireInteraction: false,
    };

    const notification = new Notification(title, { ...defaultOptions, ...options });

    notification.onclick = function () {
      window.focus();
      notification.close();
    };

    return true;
  }

  // إشعار درس اليوم
  notifyTodayLessons() {
    const today = new Date();
    const dayName = this.getDayName(today.getDay());
    
    // البحث عن دروس اليوم
    const todayLessons = this.getTodayLessons(dayName);
    
    if (todayLessons.length > 0) {
      const lessonNames = todayLessons.map((l) => l.lesson).join("، ");
      this.sendNotification("دروس اليوم", {
        body: `لديك ${todayLessons.length} درس اليوم: ${lessonNames}`,
        requireInteraction: true,
      });
    }
  }

  // الحصول على اسم اليوم
  getDayName(dayIndex) {
    // تحويل من نظام JavaScript (0=الأحد) إلى نظامنا (السبت=0)
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayIndex];
  }

  // الحصول على دروس اليوم
  getTodayLessons(dayName) {
    const lessons = [];
    const allWeeks = getAllWeeks();
    
    // الحصول على الأسبوع الحالي (يمكن تحسينه)
    const currentWeek = getCurrentWeek();
    const week = allWeeks.find((w) => w.weekNumber === currentWeek);
    
    if (week) {
      const dayData = week.weekData.days.find((d) => d.day === dayName);
      if (dayData) {
        dayData.lessons.forEach((lesson, index) => {
          lessons.push({
            lesson,
            monthId: week.monthId,
            weekNumber: week.weekNumber,
            day: dayName,
            index,
          });
        });
      }
    }
    
    return lessons;
  }

  // جدولة الإشعارات اليومية
  scheduleDailyNotifications() {
    // إرسال إشعار في الساعة 9 صباحاً كل يوم
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(9, 0, 0, 0);

    // إذا كانت الساعة 9 قد مرت اليوم، جدولها لليوم التالي
    if (now > notificationTime) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const timeUntilNotification = notificationTime.getTime() - now.getTime();

    setTimeout(() => {
      this.notifyTodayLessons();
      // جدولة الإشعار التالي (كل 24 ساعة)
      setInterval(() => {
        this.notifyTodayLessons();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilNotification);
  }

  // إشعار إكمال درس
  notifyLessonComplete(lessonName) {
    this.sendNotification("درس مكتمل! 🎉", {
      body: `لقد أكملت درس: ${lessonName}`,
    });
  }

  // إشعار إنجاز
  notifyAchievement(achievement) {
    this.sendNotification("إنجاز جديد! 🏆", {
      body: achievement.title + ": " + achievement.description,
      requireInteraction: true,
    });
  }
}

// إنشاء instance عام
const notificationManager = new NotificationManager();

// تهيئة الإشعارات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  // التحقق من الإعدادات المحفوظة
  const notificationsEnabled = localStorage.getItem("notifications_enabled") === "true";
  
  if (notificationsEnabled) {
    notificationManager.requestPermission().then((granted) => {
      if (granted) {
        notificationManager.scheduleDailyNotifications();
      }
    });
  }
});

