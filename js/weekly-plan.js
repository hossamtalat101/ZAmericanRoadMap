// منطق صفحة الخطة الأسبوعية
document.addEventListener("DOMContentLoaded", function () {
  initWeeklyPlanPage();
});

function initWeeklyPlanPage() {
  const monthSelect = document.getElementById("month-select");
  const weekSelect = document.getElementById("week-select");
  
  // تحديث قائمة الأسابيع عند تغيير الشهر
  monthSelect.addEventListener("change", function () {
    updateWeekSelect(parseInt(this.value));
    loadPlan(parseInt(this.value), 1);
  });
  
  // تحديث الخطة عند تغيير الأسبوع
  weekSelect.addEventListener("change", function () {
    const monthId = parseInt(monthSelect.value);
    const weekNumber = parseInt(this.value);
    loadPlan(monthId, weekNumber);
  });
  
  // تحميل الخطة الافتراضية
  updateWeekSelect(1);
  loadPlan(1, 1);
}

function updateWeekSelect(monthId) {
  const month = getMonthById(monthId);
  const weekSelect = document.getElementById("week-select");
  
  if (!month) return;
  
  weekSelect.innerHTML = "";
  month.weeksData.forEach((week) => {
    const option = document.createElement("option");
    option.value = week.week;
    option.textContent = `الأسبوع ${week.week}`;
    weekSelect.appendChild(option);
  });
}

function loadPlan(monthId, weekNumber) {
  const weekData = getWeekData(monthId, weekNumber);
  const month = getMonthById(monthId);
  
  if (!weekData || !month) {
    document.getElementById("plan-content").innerHTML = 
      "<p class='loading'>لا توجد بيانات لهذا الأسبوع</p>";
    return;
  }
  
  renderWeeklyPlan(month, weekNumber, weekData);
}

let currentLessonData = null;

function renderWeeklyPlan(month, weekNumber, weekData) {
  const container = document.getElementById("plan-content");
  
  let html = `
    <div class="plan-header fade-in">
      <div class="month-calendar-icon">
        <div class="calendar-icon">
          <div class="calendar-tab"></div>
          <div class="calendar-number">${month.id}</div>
        </div>
        <p class="month-name">${month.name}</p>
      </div>
      <div class="week-banner">
        <h2>الأسبوع ${getWeekName(weekNumber)}</h2>
      </div>
    </div>
    
    <div class="weekly-schedule-wrapper">
      <div class="weekly-schedule">
  `;
  
  weekData.days.forEach((day, dayIndex) => {
    const dayClass = getDayClass(day.day);
    html += `<div class="day-row ${dayClass} fade-in" style="animation-delay: ${dayIndex * 0.1}s">`;
    
    // Checkboxes للدروس على اليسار
    html += `<div class="lessons-column">`;
    day.lessons.forEach((lesson, index) => {
      const isComplete = progressManager.isLessonComplete(
        month.id,
        weekNumber,
        day.day,
        index
      );
      const hasNote = progressManager.getNote(month.id, weekNumber, day.day, index);
      
      html += `<div class="lesson-row-item">`;
      html += `<input type="checkbox" class="lesson-checkbox" 
                data-month="${month.id}" 
                data-week="${weekNumber}" 
                data-day="${day.day}" 
                data-lesson="${index}"
                ${isComplete ? "checked" : ""}>`;
      html += `<span class="lesson-text">${lesson}</span>`;
      if (hasNote) {
        html += `<i class="fas fa-sticky-note note-indicator" title="يوجد ملاحظات"></i>`;
      }
      html += `<button class="btn-note" 
                data-month="${month.id}" 
                data-week="${weekNumber}" 
                data-day="${day.day}" 
                data-lesson="${index}"
                title="إضافة ملاحظة">
                <i class="fas fa-edit"></i>
              </button>`;
      html += `</div>`;
    });
    html += `</div>`;
    
    // خط فاصل
    html += `<div class="day-separator"></div>`;
    
    // اسم اليوم على اليمين
    html += `<div class="day-name">${day.day}</div>`;
    html += `</div>`;
  });
  
  html += `</div></div>`;
  
  // إضافة ملاحظات جانبية إذا لزم الأمر
  const sideNotes = addSideNotes(month.id, weekNumber);
  if (sideNotes) {
    html += `<div class="side-notes-container">${sideNotes}</div>`;
  }
  
  container.innerHTML = html;
  
  // إضافة معالجات الأحداث للملاحظات
  attachNotesHandlers();
}

function attachNotesHandlers() {
  const noteButtons = document.querySelectorAll(".btn-note");
  const modal = document.getElementById("notes-modal");
  const closeBtn = document.querySelector(".modal-close");
  const saveBtn = document.getElementById("save-notes-btn");
  const cancelBtn = document.getElementById("cancel-notes-btn");
  const textarea = document.getElementById("notes-textarea");
  
  noteButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const monthId = parseInt(this.dataset.month);
      const weekNumber = parseInt(this.dataset.week);
      const day = this.dataset.day;
      const lessonIndex = parseInt(this.dataset.lesson);
      
      currentLessonData = { monthId, weekNumber, day, lessonIndex };
      
      // تحميل الملاحظة الحالية
      const currentNote = progressManager.getNote(monthId, weekNumber, day, lessonIndex);
      textarea.value = currentNote;
      
      // عرض الـ modal
      modal.style.display = "flex";
      textarea.focus();
    });
  });
  
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
      currentLessonData = null;
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
      currentLessonData = null;
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (currentLessonData) {
        progressManager.saveNote(
          currentLessonData.monthId,
          currentLessonData.weekNumber,
          currentLessonData.day,
          currentLessonData.lessonIndex,
          textarea.value
        );
        showToast("تم حفظ الملاحظة بنجاح", "success");
        modal.style.display = "none";
        
        // إعادة تحميل الخطة لعرض أيقونة الملاحظة
        const monthSelect = document.getElementById("month-select");
        const weekSelect = document.getElementById("week-select");
        loadPlan(parseInt(monthSelect.value), parseInt(weekSelect.value));
        
        currentLessonData = null;
      }
    });
  }
  
  // إغلاق عند النقر خارج الـ modal
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
        currentLessonData = null;
      }
    });
  }
}

function getWeekName(weekNumber) {
  const weekNames = {
    1: "الأول",
    2: "الثاني",
    3: "الثالث",
    4: "الرابع",
  };
  return weekNames[weekNumber] || weekNumber;
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

function addSideNotes(monthId, weekNumber) {
  // إضافة ملاحظات جانبية بناءً على الشهر والأسبوع
  let notes = "";
  
  if (monthId === 3 && weekNumber === 3) {
    notes = `
      <div class="side-note">
        <p>هنبدأ القواعد والكوميدي</p>
        <i class="fas fa-arrow-left"></i>
      </div>
    `;
  } else if (monthId === 4 && weekNumber === 2) {
    notes = `
      <div class="side-note">
        <p>ال bites هو كورس الأفعال المركبة والعامة</p>
        <i class="fas fa-arrow-left"></i>
      </div>
      <div class="side-note">
        <p>ال story هو كورس المصطلحات</p>
        <i class="fas fa-arrow-left"></i>
      </div>
    `;
  } else if (monthId === 4 && weekNumber === 3) {
    notes = `
      <div class="side-note">
        <p>كده خلصنا ال story وهنبدأ شفرة أمريكا</p>
        <i class="fas fa-arrow-left"></i>
      </div>
    `;
  } else if (monthId === 5 && weekNumber === 1) {
    notes = `
      <div class="side-note">
        <p>كده خلصنا شفرة أمريكا وهنبدأ الاستماع</p>
        <i class="fas fa-arrow-left"></i>
      </div>
    `;
  } else if (monthId === 5 && weekNumber === 2) {
    notes = `
      <div class="side-note">
        <p>كده خلصنا الاستماع وهنبدا المحادثة</p>
        <i class="fas fa-arrow-left"></i>
      </div>
    `;
  } else if (monthId === 5 && weekNumber === 3) {
    notes = `
      <div class="side-note">
        <p>كده خلصنا ال bites وهنبدأ التفكير</p>
        <i class="fas fa-arrow-left"></i>
      </div>
    `;
  }
  
  return notes;
}

