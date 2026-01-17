// المنطق الرئيسي للتطبيق
document.addEventListener("DOMContentLoaded", function () {
  // تهيئة القائمة المنبثقة
  initMobileMenu();
  
  // تحديث الروابط النشطة
  updateActiveNavLink();

  // تهيئة الصفحات المختلفة
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  
  if (currentPage === "dashboard.html") {
    initDashboard();
  } else if (currentPage === "weekly-plan.html") {
    initWeeklyPlan();
  } else if (currentPage === "statistics.html") {
    initStatistics();
  } else if (currentPage === "settings.html") {
    initSettings();
  }
});

// تهيئة القائمة المنبثقة للهواتف
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      mainNav.classList.toggle("active");
      const icon = this.querySelector("i");
      if (icon) {
        if (mainNav.classList.contains("active")) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-times");
        } else {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }
    });
    
    // إغلاق القائمة عند النقر على رابط
    const navLinks = mainNav.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mainNav.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      });
    });
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener("click", function (e) {
      if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        mainNav.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }
    });
  }
}

// تحديث الرابط النشط في القائمة
function updateActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");
  
  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

// تهيئة لوحة التحكم
function initDashboard() {
  if (typeof getCurrentWeek === "undefined") return;
  
  const currentWeek = getCurrentWeek();
  loadWeekData(currentWeek);
  updateProgressBar();
  
  // معالج اختيار الأسبوع
  const weekButtons = document.querySelectorAll(".week-btn");
  weekButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const weekNumber = parseInt(this.dataset.week);
      loadWeekData(weekNumber);
      
      // تحديث الأزرار النشطة
      weekButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

// تحميل بيانات أسبوع
function loadWeekData(weekNumber) {
  const allWeeks = getAllWeeks();
  const week = allWeeks.find((w) => w.weekNumber === weekNumber);
  
  if (!week) return;
  
  // عرض بيانات الأسبوع
  const weekContainer = document.getElementById("week-container");
  if (weekContainer) {
    weekContainer.innerHTML = renderWeekSchedule(week);
  }
  
  // تحديث عنوان الأسبوع
  const weekTitle = document.getElementById("week-title");
  if (weekTitle) {
    weekTitle.textContent = `الأسبوع ${weekNumber} - ${week.monthName}`;
  }
}

// عرض جدول الأسبوع
function renderWeekSchedule(week) {
  const { weekData, monthId, weekNumber } = week;
  let html = "";
  
  weekData.days.forEach((day) => {
    const dayClass = getDayClass(day.day);
    html += `<div class="day-row ${dayClass}">`;
    html += `<div class="day-name">${day.day}</div>`;
    html += `<div class="lesson-content">`;
    
    day.lessons.forEach((lesson, index) => {
      const isComplete = progressManager.isLessonComplete(
        monthId,
        weekNumber,
        day.day,
        index
      );
      
      html += `<div class="lesson-item">`;
      html += `<input type="checkbox" class="lesson-checkbox" 
                data-month="${monthId}" 
                data-week="${weekNumber}" 
                data-day="${day.day}" 
                data-lesson="${index}"
                ${isComplete ? "checked" : ""}>`;
      html += `<span>${lesson}</span>`;
      html += `</div>`;
    });
    
    html += `</div>`;
    html += `</div>`;
  });
  
  return html;
}

// الحصول على class اليوم
function getDayClass(day) {
  const dayMap = {
    السبت: "saturday",
    الأحد: "sunday",
    الاثنين: "monday",
    الثلاثاء: "tuesday",
    الأربعاء: "wednesday",
    الخميس: "thursday",
  };
  return dayMap[day] || "";
}

// تحديث شريط التقدم
function updateProgressBar() {
  const overallProgress = progressManager.getOverallProgress();
  const progressBar = document.querySelector(".progress-bar");
  const progressText = document.querySelector(".progress-text");
  
  if (progressBar) {
    progressBar.style.width = `${overallProgress}%`;
    progressBar.textContent = `${overallProgress}%`;
  }
  
  if (progressText) {
    const stats = progressManager.getStatistics();
    progressText.textContent = `${stats.completedLessons} من ${stats.totalLessons} درس مكتمل`;
  }
}

// تهيئة صفحة الخطة الأسبوعية
function initWeeklyPlan() {
  // سيتم تنفيذها في ملف weekly-plan.js
}

// تهيئة صفحة الإحصائيات
function initStatistics() {
  updateStatistics();
}

// تحديث الإحصائيات
function updateStatistics() {
  const stats = progressManager.getStatistics();
  
  // تحديث الإحصائيات العامة
  const totalLessonsEl = document.getElementById("total-lessons");
  const completedLessonsEl = document.getElementById("completed-lessons");
  const progressEl = document.getElementById("overall-progress");
  
  if (totalLessonsEl) totalLessonsEl.textContent = stats.totalLessons;
  if (completedLessonsEl) completedLessonsEl.textContent = stats.completedLessons;
  if (progressEl) progressEl.textContent = `${stats.overallProgress}%`;
  
  // تحديث تقدم المهارات
  updateSkillsProgress(stats.skillsProgress);
}

// تحديث تقدم المهارات
function updateSkillsProgress(skillsProgress) {
  const skillsContainer = document.getElementById("skills-progress");
  if (!skillsContainer) return;
  
  let html = "";
  Object.keys(skillsProgress).forEach((skill) => {
    const { completed, total, percentage } = skillsProgress[skill];
    html += `
      <div class="skill-progress-item">
        <div class="skill-name">${skill}</div>
        <div class="skill-bar-container">
          <div class="skill-bar" style="width: ${percentage}%"></div>
        </div>
        <div class="skill-stats">${completed}/${total} (${percentage}%)</div>
      </div>
    `;
  });
  
  skillsContainer.innerHTML = html;
}

// تهيئة صفحة الإعدادات
function initSettings() {
  // معالج تصدير البيانات
  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      const data = progressManager.exportProgress();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "zamerican-progress.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  
  // معالج استيراد البيانات
  const importBtn = document.getElementById("import-btn");
  const importInput = document.getElementById("import-input");
  if (importBtn && importInput) {
    importBtn.addEventListener("click", function () {
      importInput.click();
    });
    
    importInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          if (progressManager.importProgress(event.target.result)) {
            alert("تم استيراد البيانات بنجاح!");
            location.reload();
          } else {
            alert("حدث خطأ في استيراد البيانات!");
          }
        };
        reader.readAsText(file);
      }
    });
  }
  
  // معالج الإشعارات
  const notificationsToggle = document.getElementById("notifications-toggle");
  if (notificationsToggle) {
    // تحميل الحالة المحفوظة
    const notificationsEnabled = localStorage.getItem("notifications_enabled") === "true";
    notificationsToggle.checked = notificationsEnabled;
    
    notificationsToggle.addEventListener("change", function () {
      const enabled = this.checked;
      localStorage.setItem("notifications_enabled", enabled);
      
      if (enabled && typeof notificationManager !== "undefined") {
        notificationManager.requestPermission().then((granted) => {
          if (granted) {
            notificationManager.scheduleDailyNotifications();
            alert("تم تفعيل الإشعارات!");
          } else {
            alert("لم يتم منح إذن الإشعارات. يرجى التحقق من إعدادات المتصفح.");
            this.checked = false;
          }
        });
      }
    });
  }
  
  // معالج حذف البيانات
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (progressManager.resetProgress()) {
        alert("تم حذف جميع البيانات!");
        location.reload();
      }
    });
  }
}

// معالج الأحداث العامة للـ checkboxes
document.addEventListener("change", function (e) {
  if (e.target.classList.contains("lesson-checkbox")) {
    try {
      const { month, week, day, lesson } = e.target.dataset;
      const monthId = parseInt(month);
      const weekNumber = parseInt(week);
      const lessonIndex = parseInt(lesson);
      
      if (e.target.checked) {
        progressManager.markLessonComplete(monthId, weekNumber, day, lessonIndex);
        
        // إشعار إكمال الدرس
        if (typeof notificationManager !== "undefined") {
          const lessonName = e.target.nextElementSibling?.textContent || "درس";
          notificationManager.notifyLessonComplete(lessonName);
        }
        
        // Toast notification
        if (typeof showToast !== "undefined") {
          showToast("تم إكمال الدرس بنجاح! 🎉", "success");
        }
        
        // التحقق من الإنجازات
        const achievements = progressManager.checkAchievements(monthId, weekNumber);
        if (achievements.length > 0) {
          showAchievements(achievements);
          
          // إشعار الإنجازات
          if (typeof notificationManager !== "undefined") {
            achievements.forEach((achievement) => {
              notificationManager.notifyAchievement(achievement);
            });
          }
          
          // Toast للإنجازات
          if (typeof showToast !== "undefined") {
            achievements.forEach((achievement) => {
              showToast(`إنجاز جديد: ${achievement.title} 🏆`, "success", 5000);
            });
          }
        }
      } else {
        progressManager.markLessonIncomplete(monthId, weekNumber, day, lessonIndex);
        if (typeof showToast !== "undefined") {
          showToast("تم إلغاء إكمال الدرس", "info");
        }
      }
      
      // تحديث شريط التقدم
      updateProgressBar();
      
      // إعادة تحميل البيانات إذا كنا في صفحة الإحصائيات
      if (window.location.pathname.includes("statistics.html")) {
        if (typeof updateAllStatistics !== "undefined") {
          updateAllStatistics();
        }
        if (typeof initCharts !== "undefined") {
          initCharts();
        }
        if (typeof updateAdvancedStats !== "undefined") {
          updateAdvancedStats();
        }
      }
      
      // تحديث لوحة التحكم إذا كنا فيها
      if (window.location.pathname.includes("dashboard.html")) {
        if (typeof updateSkillsProgress !== "undefined") {
          updateSkillsProgress();
        }
        if (typeof updateOverallProgress !== "undefined") {
          updateOverallProgress();
        }
        // تحديث التقويم إذا كان مرئياً
        if (typeof calendarManager !== "undefined" && document.getElementById("calendar-tab")?.classList.contains("active")) {
          const today = new Date();
          calendarManager.renderCalendar("calendar-container", today.getMonth(), today.getFullYear());
        }
      }
    } catch (error) {
      if (typeof handleError !== "undefined") {
        handleError(error, "checkbox change");
      } else {
        console.error("Error:", error);
      }
    }
  }
});

// عرض الإنجازات
function showAchievements(achievements) {
  achievements.forEach((achievement) => {
    // يمكن إضافة نافذة منبثقة أو إشعار للإنجاز
    console.log("Achievement:", achievement);
    // يمكن استخدام toast notification هنا
  });
}

