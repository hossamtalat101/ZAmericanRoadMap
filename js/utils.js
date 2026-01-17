// دوال مساعدة عامة

// Toast Notifications
function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container") || createToastContainer();
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle"
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(toast);
  
  // إزالة تلقائية
  setTimeout(() => {
    toast.style.animation = "slideOutLeft 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, duration);
  
  // إزالة يدوية
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    toast.style.animation = "slideOutLeft 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  });
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

// Error Handling
function handleError(error, context = "") {
  console.error(`Error in ${context}:`, error);
  showToast(
    `حدث خطأ: ${error.message || "خطأ غير معروف"}`,
    "error",
    5000
  );
}

// Loading States
function showLoading(element = null) {
  if (element) {
    element.classList.add("loading");
    const loader = document.createElement("div");
    loader.className = "inline-loader";
    loader.innerHTML = '<div class="loader-spinner small"></div>';
    element.appendChild(loader);
  } else {
    const main = document.querySelector("main");
    if (main) {
      const loader = document.createElement("div");
      loader.id = "page-loader";
      loader.className = "page-loader";
      loader.innerHTML = `
        <div class="loader-spinner"></div>
        <p>جاري التحميل...</p>
      `;
      main.appendChild(loader);
    }
  }
}

function hideLoading(element = null) {
  if (element) {
    element.classList.remove("loading");
    const loader = element.querySelector(".inline-loader");
    if (loader) loader.remove();
  } else {
    const loader = document.getElementById("page-loader");
    if (loader) loader.remove();
  }
}

// Animations
function animateOnScroll() {
  const elements = document.querySelectorAll(".fade-in, .slide-in-right, .slide-in-left");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  elements.forEach(el => {
    el.style.opacity = "0";
    observer.observe(el);
  });
}

// عرض modal للدروس في تاريخ معين
function showLessonsModal(date, lessons) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "lessons-modal";
  
  const dateStr = date.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  let lessonsHtml = "";
  lessons.forEach(lesson => {
    lessonsHtml += `
      <div class="lesson-modal-item ${lesson.isComplete ? "completed" : ""}">
        <i class="fas ${lesson.isComplete ? "fa-check-circle" : "fa-circle"}"></i>
        <div class="lesson-modal-content">
          <h4>${lesson.lesson}</h4>
          <p>${lesson.month} - الأسبوع ${lesson.week}</p>
        </div>
      </div>
    `;
  });
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>دروس ${dateStr}</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="lessons-list">
          ${lessonsHtml}
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = "flex";
  
  const closeBtn = modal.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => {
    modal.remove();
  });
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// تهيئة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  animateOnScroll();
  createToastContainer();
});

