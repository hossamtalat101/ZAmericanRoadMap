// منطق التقويم التفاعلي
class CalendarManager {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
  }

  // إنشاء تقويم شهري
  renderCalendar(containerId, month, year) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    let html = `
      <div class="calendar-header">
        <button class="calendar-nav-btn" data-action="prev">
          <i class="fas fa-chevron-right"></i>
        </button>
        <h3>${this.getMonthName(month)} ${year}</h3>
        <button class="calendar-nav-btn" data-action="next">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day-name">أحد</div>
        <div class="calendar-day-name">إثنين</div>
        <div class="calendar-day-name">ثلاثاء</div>
        <div class="calendar-day-name">أربعاء</div>
        <div class="calendar-day-name">خميس</div>
        <div class="calendar-day-name">جمعة</div>
        <div class="calendar-day-name">سبت</div>
    `;

    // إضافة أيام فارغة في البداية
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="calendar-day empty"></div>`;
    }

    // إضافة أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = this.isSameDay(date, today);
      const hasLessons = this.hasLessonsOnDate(date);
      const completedLessons = this.getCompletedLessonsOnDate(date);

      let dayClass = "calendar-day";
      if (isToday) dayClass += " today";
      if (hasLessons) dayClass += " has-lessons";
      if (completedLessons > 0) dayClass += " has-completed";

      html += `
        <div class="${dayClass}" data-date="${date.toISOString()}">
          <span class="day-number">${day}</span>
          ${hasLessons ? `<span class="lessons-indicator">${completedLessons}</span>` : ""}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // إضافة معالجات الأحداث
    this.attachEventListeners(containerId, month, year);
  }

  // التحقق من وجود دروس في تاريخ معين
  hasLessonsOnDate(date) {
    const dayName = this.getDayName(date.getDay());
    const allWeeks = getAllWeeks();
    
    // البحث عن دروس في هذا اليوم من الأسبوع
    for (const week of allWeeks) {
      const dayData = week.weekData.days.find(d => d.day === dayName);
      if (dayData && dayData.lessons.length > 0) {
        return true;
      }
    }
    return false;
  }

  // الحصول على عدد الدروس المكتملة في تاريخ معين
  getCompletedLessonsOnDate(date) {
    const dayName = this.getDayName(date.getDay());
    const allWeeks = getAllWeeks();
    let completed = 0;
    
    for (const week of allWeeks) {
      const dayData = week.weekData.days.find(d => d.day === dayName);
      if (dayData) {
        dayData.lessons.forEach((lesson, index) => {
          if (progressManager.isLessonComplete(
            week.monthId,
            week.weekNumber,
            dayName,
            index
          )) {
            completed++;
          }
        });
      }
    }
    return completed;
  }

  // الحصول على اسم اليوم
  getDayName(dayIndex) {
    // تحويل من نظام JavaScript (0=الأحد) إلى نظامنا
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayIndex];
  }

  // التحقق من أن التاريخين في نفس اليوم
  isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // الحصول على اسم الشهر
  getMonthName(month) {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    return months[month];
  }

  // إضافة معالجات الأحداث
  attachEventListeners(containerId, month, year) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // معالج التنقل بين الأشهر
    const navButtons = container.querySelectorAll(".calendar-nav-btn");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "prev") {
          const newDate = new Date(year, month - 1, 1);
          this.renderCalendar(containerId, newDate.getMonth(), newDate.getFullYear());
        } else if (btn.dataset.action === "next") {
          const newDate = new Date(year, month + 1, 1);
          this.renderCalendar(containerId, newDate.getMonth(), newDate.getFullYear());
        }
      });
    });

    // معالج النقر على يوم
    const dayElements = container.querySelectorAll(".calendar-day:not(.empty)");
    dayElements.forEach((day) => {
      day.addEventListener("click", () => {
        const date = new Date(day.dataset.date);
        this.selectDate(date);
      });
    });
  }

  // تحديد تاريخ
  selectDate(date) {
    this.selectedDate = date;
    const dayName = this.getDayName(date.getDay());
    const allWeeks = getAllWeeks();
    const lessons = [];
    
    // جمع جميع الدروس في هذا اليوم
    allWeeks.forEach(week => {
      const dayData = week.weekData.days.find(d => d.day === dayName);
      if (dayData) {
        dayData.lessons.forEach((lesson, index) => {
          const isComplete = progressManager.isLessonComplete(
            week.monthId,
            week.weekNumber,
            dayName,
            index
          );
          lessons.push({
            lesson,
            month: week.monthName,
            week: week.weekNumber,
            isComplete
          });
        });
      }
    });
    
    if (lessons.length > 0) {
      showLessonsModal(date, lessons);
    } else {
      showToast("لا توجد دروس في هذا اليوم", "info");
    }
  }
}

// إنشاء instance عام
const calendarManager = new CalendarManager();

