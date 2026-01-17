// نظام البحث والفلترة
class SearchManager {
  constructor() {
    this.searchInput = null;
    this.filters = {
      skill: null,
      status: null,
      month: null,
      week: null
    };
  }

  init() {
    this.createSearchUI();
    this.attachEventHandlers();
  }

  createSearchUI() {
    // البحث في لوحة التحكم
    const dashboard = document.querySelector("#week-container");
    if (dashboard && !document.getElementById("search-container")) {
      const searchContainer = document.createElement("div");
      searchContainer.id = "search-container";
      searchContainer.className = "search-container";
      searchContainer.innerHTML = `
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="search-input" placeholder="ابحث في الدروس...">
          <button class="btn-clear-search" id="clear-search" style="display: none;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="filters-container">
          <select id="filter-skill" class="filter-select">
            <option value="">جميع المهارات</option>
            <option value="قواعد">القواعد</option>
            <option value="قراءة">القراءة</option>
            <option value="استماع">الاستماع</option>
            <option value="محادثة">المحادثة</option>
            <option value="صوتيات">الصوتيات</option>
            <option value="كتابة">الكتابة</option>
          </select>
          <select id="filter-status" class="filter-select">
            <option value="">جميع الحالات</option>
            <option value="completed">مكتمل</option>
            <option value="pending">غير مكتمل</option>
          </select>
          <select id="filter-month" class="filter-select">
            <option value="">جميع الأشهر</option>
            ${learningPlan.months.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}
          </select>
        </div>
      `;
      const container = document.querySelector(".container");
      if (container) {
        const weekSelector = container.querySelector(".week-selector");
        if (weekSelector) {
          weekSelector.parentNode.insertBefore(searchContainer, weekSelector);
        }
      }
    }
  }

  attachEventHandlers() {
    const searchInput = document.getElementById("search-input");
    const clearBtn = document.getElementById("clear-search");
    const filterSkill = document.getElementById("filter-skill");
    const filterStatus = document.getElementById("filter-status");
    const filterMonth = document.getElementById("filter-month");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.performSearch(e.target.value);
        if (e.target.value) {
          if (clearBtn) clearBtn.style.display = "block";
        } else {
          if (clearBtn) clearBtn.style.display = "none";
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          clearBtn.style.display = "none";
          this.performSearch("");
        }
      });
    }

    if (filterSkill) {
      filterSkill.addEventListener("change", (e) => {
        this.filters.skill = e.target.value || null;
        this.applyFilters();
      });
    }

    if (filterStatus) {
      filterStatus.addEventListener("change", (e) => {
        this.filters.status = e.target.value || null;
        this.applyFilters();
      });
    }

    if (filterMonth) {
      filterMonth.addEventListener("change", (e) => {
        this.filters.month = e.target.value || null;
        this.applyFilters();
      });
    }
  }

  performSearch(query) {
    if (!query.trim()) {
      this.clearSearchResults();
      return;
    }

    const results = this.searchLessons(query);
    this.displaySearchResults(results);
  }

  searchLessons(query) {
    const results = [];
    const searchTerm = query.toLowerCase();

    learningPlan.months.forEach((month) => {
      month.weeksData.forEach((week) => {
        week.days.forEach((day) => {
          day.lessons.forEach((lesson, index) => {
            if (lesson.toLowerCase().includes(searchTerm)) {
              results.push({
                monthId: month.id,
                monthName: month.name,
                weekNumber: week.week,
                day: day.day,
                lesson: lesson,
                lessonIndex: index,
                isComplete: progressManager.isLessonComplete(
                  month.id,
                  week.week,
                  day.day,
                  index
                )
              });
            }
          });
        });
      });
    });

    return results;
  }

  displaySearchResults(results) {
    const container = document.getElementById("week-container");
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search"></i>
          <p>لا توجد نتائج للبحث</p>
        </div>
      `;
      return;
    }

    let html = `<div class="search-results-header">
      <h3>نتائج البحث (${results.length})</h3>
    </div>`;

    results.forEach((result) => {
      const dayClass = getDayClass(result.day);
      html += `
        <div class="search-result-item ${dayClass}">
          <div class="result-lesson">
            <input type="checkbox" class="lesson-checkbox" 
              data-month="${result.monthId}" 
              data-week="${result.weekNumber}" 
              data-day="${result.day}" 
              data-lesson="${result.lessonIndex}"
              ${result.isComplete ? "checked" : ""}>
            <span>${result.lesson}</span>
          </div>
          <div class="result-info">
            <span class="result-month">${result.monthName}</span>
            <span class="result-week">الأسبوع ${result.weekNumber}</span>
            <span class="result-day">${result.day}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  applyFilters() {
    const allLessons = this.getAllLessons();
    const filtered = allLessons.filter(lesson => {
      if (this.filters.skill && !lesson.lesson.toLowerCase().includes(this.filters.skill.toLowerCase())) {
        return false;
      }
      if (this.filters.status) {
        if (this.filters.status === "completed" && !lesson.isComplete) return false;
        if (this.filters.status === "pending" && lesson.isComplete) return false;
      }
      if (this.filters.month && lesson.monthId !== parseInt(this.filters.month)) {
        return false;
      }
      return true;
    });

    this.displaySearchResults(filtered);
  }

  getAllLessons() {
    const lessons = [];
    learningPlan.months.forEach((month) => {
      month.weeksData.forEach((week) => {
        week.days.forEach((day) => {
          day.lessons.forEach((lesson, index) => {
            lessons.push({
              monthId: month.id,
              monthName: month.name,
              weekNumber: week.week,
              day: day.day,
              lesson: lesson,
              lessonIndex: index,
              isComplete: progressManager.isLessonComplete(
                month.id,
                week.week,
                day.day,
                index
              )
            });
          });
        });
      });
    });
    return lessons;
  }

  clearSearchResults() {
    // إعادة تحميل العرض العادي
    if (typeof loadWeek === "function") {
      const weekSelect = document.querySelector(".week-btn.active");
      if (weekSelect) {
        const weekNumber = parseInt(weekSelect.dataset.week);
        loadWeek(weekNumber);
      }
    }
  }
}

const searchManager = new SearchManager();

// تهيئة البحث عند تحميل لوحة التحكم
if (window.location.pathname.includes("dashboard.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      searchManager.init();
    }, 500);
  });
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

