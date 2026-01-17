// منطق لوحة التحكم
document.addEventListener("DOMContentLoaded", function () {
  initDashboardPage();
  initTabs();
  initCalendar();
});

function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      // تحديث الأزرار
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // تحديث المحتوى
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${targetTab}-tab`) {
          content.classList.add("active");
        }
      });
    });
  });
}

function initCalendar() {
  if (typeof calendarManager !== "undefined") {
    const today = new Date();
    calendarManager.renderCalendar("calendar-container", today.getMonth(), today.getFullYear());
  }
}

function initDashboardPage() {
  // إنشاء أزرار الأسابيع ديناميكياً
  createWeekButtons();
  
  // تحميل الأسبوع الأول افتراضياً
  loadWeek(1);
  updateOverallProgress();
  updateSkillsProgress();
  
  // تحديث تقدم المهارات عند تغيير checkbox
  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("lesson-checkbox")) {
      updateOverallProgress();
      updateSkillsProgress();
    }
  });
}

function createWeekButtons() {
  const allWeeks = getAllWeeks();
  const weekSelector = document.querySelector(".week-selector");
  if (!weekSelector) return;
  
  weekSelector.innerHTML = "";
  
  allWeeks.forEach((week) => {
    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.dataset.week = week.weekNumber;
    btn.textContent = `الأسبوع ${week.weekNumber}`;
    
    if (week.weekNumber === 1) {
      btn.classList.add("active");
    }
    
    btn.addEventListener("click", function () {
      const weekNumber = parseInt(this.dataset.week);
      loadWeek(weekNumber);
      
      // تحديث الأزرار النشطة
      document.querySelectorAll(".week-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    });
    
    weekSelector.appendChild(btn);
  });
}

function loadWeek(weekNumber) {
  const allWeeks = getAllWeeks();
  const week = allWeeks.find((w) => w.weekNumber === weekNumber);
  
  if (!week) {
    document.getElementById("week-container").innerHTML = 
      "<p class='loading'>لا توجد بيانات لهذا الأسبوع</p>";
    return;
  }
  
  renderWeekSchedule(week);
  updateOverallProgress();
}

function renderWeekSchedule(week) {
  const { weekData, monthId, weekNumber, monthName } = week;
  const container = document.getElementById("week-container");
  
  let html = `<div class="week-header">
    <h2 id="week-title">الأسبوع ${weekNumber} - ${monthName}</h2>
    <div class="week-progress">
      <span>التقدم: ${progressManager.getWeekProgress(monthId, weekNumber)}%</span>
    </div>
  </div>`;
  
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
  
  container.innerHTML = html;
}

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

function updateOverallProgress() {
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

function updateSkillsProgress() {
  const skillsProgress = progressManager.getSkillsProgress();
  const skillCards = document.querySelectorAll(".skill-card");
  
  skillCards.forEach((card) => {
    const skillName = card.querySelector("h3").textContent.trim();
    const progressBar = card.querySelector(".skill-progress");
    const percentageEl = card.querySelector(".skill-percentage");
    
    if (skillsProgress[skillName]) {
      const percentage = skillsProgress[skillName].percentage;
      progressBar.style.width = `${percentage}%`;
      percentageEl.textContent = `${percentage}%`;
    }
  });
}

