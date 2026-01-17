// نظام إدارة التقدم والتتبع
class ProgressManager {
  constructor() {
    this.storageKey = "zamerican_progress";
    this.progress = this.loadProgress();
  }

  // تحميل التقدم من LocalStorage
  loadProgress() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
    return {
      completedLessons: [],
      notes: {},
      ratings: {},
      completedDates: {},
      achievements: [],
    };
  }

  // حفظ التقدم في LocalStorage
  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
      return true;
    } catch (error) {
      console.error("Error saving progress:", error);
      return false;
    }
  }

  // إنشاء معرف فريد للدرس
  getLessonId(monthId, weekNumber, day, lessonIndex) {
    return `${monthId}_${weekNumber}_${day}_${lessonIndex}`;
  }

  // تحديد درس كمكتمل
  markLessonComplete(monthId, weekNumber, day, lessonIndex) {
    const lessonId = this.getLessonId(monthId, weekNumber, day, lessonIndex);
    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);
      this.progress.completedDates[lessonId] = new Date().toISOString();
      this.checkAchievements(monthId, weekNumber);
      this.saveProgress();
      return true;
    }
    return false;
  }

  // إلغاء تحديد درس كمكتمل
  markLessonIncomplete(monthId, weekNumber, day, lessonIndex) {
    const lessonId = this.getLessonId(monthId, weekNumber, day, lessonIndex);
    const index = this.progress.completedLessons.indexOf(lessonId);
    if (index > -1) {
      this.progress.completedLessons.splice(index, 1);
      delete this.progress.completedDates[lessonId];
      this.saveProgress();
      return true;
    }
    return false;
  }

  // التحقق من إكمال درس
  isLessonComplete(monthId, weekNumber, day, lessonIndex) {
    const lessonId = this.getLessonId(monthId, weekNumber, day, lessonIndex);
    return this.progress.completedLessons.includes(lessonId);
  }

  // حفظ ملاحظة لدرس
  saveNote(monthId, weekNumber, day, lessonIndex, note) {
    const lessonId = this.getLessonId(monthId, weekNumber, day, lessonIndex);
    if (note && note.trim()) {
      this.progress.notes[lessonId] = note.trim();
    } else {
      delete this.progress.notes[lessonId];
    }
    this.saveProgress();
  }

  // الحصول على ملاحظة لدرس
  getNote(monthId, weekNumber, day, lessonIndex) {
    const lessonId = this.getLessonId(monthId, weekNumber, day, lessonIndex);
    return this.progress.notes[lessonId] || "";
  }

  // حفظ تقييم لدرس
  saveRating(monthId, weekNumber, day, lessonIndex, rating) {
    const lessonId = this.getLessonId(monthId, weekNumber, day, lessonIndex);
    if (rating >= 1 && rating <= 5) {
      this.progress.ratings[lessonId] = rating;
      this.saveProgress();
      return true;
    }
    return false;
  }

  // الحصول على تقييم لدرس
  getRating(monthId, weekNumber, day, lessonIndex) {
    const lessonId = this.getLessonId(monthId, weekNumber, day, lessonIndex);
    return this.progress.ratings[lessonId] || 0;
  }

  // حساب نسبة الإنجاز الإجمالية
  getOverallProgress() {
    const totalLessons = getTotalLessons();
    if (totalLessons === 0) return 0;
    return Math.round((this.progress.completedLessons.length / totalLessons) * 100);
  }

  // حساب نسبة إنجاز أسبوع
  getWeekProgress(monthId, weekNumber) {
    const weekData = getWeekData(monthId, weekNumber);
    if (!weekData) return 0;

    let completed = 0;
    let total = 0;

    weekData.days.forEach((day, dayIndex) => {
      day.lessons.forEach((lesson, lessonIndex) => {
        total++;
        if (this.isLessonComplete(monthId, weekNumber, day.day, lessonIndex)) {
          completed++;
        }
      });
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  // حساب نسبة إنجاز شهر
  getMonthProgress(monthId) {
    const month = getMonthById(monthId);
    if (!month) return 0;

    let completed = 0;
    let total = 0;

    month.weeksData.forEach((week) => {
      week.days.forEach((day) => {
        day.lessons.forEach((lesson, lessonIndex) => {
          total++;
          if (this.isLessonComplete(monthId, week.week, day.day, lessonIndex)) {
            completed++;
          }
        });
      });
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  // حساب تقدم المهارات
  getSkillsProgress() {
    const skills = {
      قواعد: { completed: 0, total: 0 },
      قراءة: { completed: 0, total: 0 },
      استماع: { completed: 0, total: 0 },
      محادثة: { completed: 0, total: 0 },
      صوتيات: { completed: 0, total: 0 },
      كتابة: { completed: 0, total: 0 },
    };

    learningPlan.months.forEach((month) => {
      month.weeksData.forEach((week) => {
        week.days.forEach((day) => {
          day.lessons.forEach((lesson, lessonIndex) => {
            const lessonName = lesson.toLowerCase();
            let skillFound = false;

            if (lessonName.includes("قواعد") || lessonName.includes("القواعد")) {
              skills.قواعد.total++;
              skillFound = true;
              if (this.isLessonComplete(month.id, week.week, day.day, lessonIndex)) {
                skills.قواعد.completed++;
              }
            }
            if (lessonName.includes("قراءة") || lessonName.includes("القراءة")) {
              skills.قراءة.total++;
              skillFound = true;
              if (this.isLessonComplete(month.id, week.week, day.day, lessonIndex)) {
                skills.قراءة.completed++;
              }
            }
            if (lessonName.includes("استماع") || lessonName.includes("الاستماع")) {
              skills.استماع.total++;
              skillFound = true;
              if (this.isLessonComplete(month.id, week.week, day.day, lessonIndex)) {
                skills.استماع.completed++;
              }
            }
            if (lessonName.includes("محادثة") || lessonName.includes("المحادثة")) {
              skills.محادثة.total++;
              skillFound = true;
              if (this.isLessonComplete(month.id, week.week, day.day, lessonIndex)) {
                skills.محادثة.completed++;
              }
            }
            if (lessonName.includes("صوتيات") || lessonName.includes("الصوتيات")) {
              skills.صوتيات.total++;
              skillFound = true;
              if (this.isLessonComplete(month.id, week.week, day.day, lessonIndex)) {
                skills.صوتيات.completed++;
              }
            }
            if (lessonName.includes("كتابة") || lessonName.includes("الكتابة")) {
              skills.كتابة.total++;
              skillFound = true;
              if (this.isLessonComplete(month.id, week.week, day.day, lessonIndex)) {
                skills.كتابة.completed++;
              }
            }
          });
        });
      });
    });

    // حساب النسب المئوية
    const skillsProgress = {};
    Object.keys(skills).forEach((skill) => {
      const { completed, total } = skills[skill];
      skillsProgress[skill] = {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    return skillsProgress;
  }

  // التحقق من الإنجازات
  checkAchievements(monthId, weekNumber) {
    const achievements = [];

    // إنجاز إكمال أسبوع
    const weekProgress = this.getWeekProgress(monthId, weekNumber);
    if (weekProgress === 100) {
      const achievementId = `week_${monthId}_${weekNumber}`;
      if (!this.progress.achievements.includes(achievementId)) {
        this.progress.achievements.push(achievementId);
        achievements.push({
          type: "week",
          title: "أسبوع مكتمل!",
          description: `لقد أكملت الأسبوع ${weekNumber} من ${getMonthById(monthId).name}`,
        });
      }
    }

    // إنجاز إكمال شهر
    const monthProgress = this.getMonthProgress(monthId);
    if (monthProgress === 100) {
      const achievementId = `month_${monthId}`;
      if (!this.progress.achievements.includes(achievementId)) {
        this.progress.achievements.push(achievementId);
        achievements.push({
          type: "month",
          title: "شهر مكتمل!",
          description: `لقد أكملت ${getMonthById(monthId).name}`,
        });
      }
    }

    if (achievements.length > 0) {
      this.saveProgress();
    }

    return achievements;
  }

  // الحصول على جميع الإنجازات
  getAchievements() {
    return this.progress.achievements;
  }

  // إحصائيات عامة
  getStatistics() {
    const totalLessons = getTotalLessons();
    const completedLessons = this.progress.completedLessons.length;
    const overallProgress = this.getOverallProgress();
    const skillsProgress = this.getSkillsProgress();
    const achievements = this.progress.achievements.length;

    return {
      totalLessons,
      completedLessons,
      remainingLessons: totalLessons - completedLessons,
      overallProgress,
      skillsProgress,
      achievements,
    };
  }

  // تصدير التقدم
  exportProgress() {
    return JSON.stringify(this.progress, null, 2);
  }

  // استيراد التقدم
  importProgress(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.progress = imported;
      this.saveProgress();
      return true;
    } catch (error) {
      console.error("Error importing progress:", error);
      return false;
    }
  }

  // حذف جميع البيانات
  resetProgress() {
    if (confirm("هل أنت متأكد من حذف جميع بيانات التقدم؟")) {
      this.progress = {
        completedLessons: [],
        notes: {},
        ratings: {},
        completedDates: {},
        achievements: [],
      };
      this.saveProgress();
      return true;
    }
    return false;
  }
}

// إنشاء instance عام
const progressManager = new ProgressManager();

