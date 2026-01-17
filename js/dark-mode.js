// نظام الوضع الليلي (Dark Mode)
class DarkModeManager {
  constructor() {
    this.storageKey = "darkMode";
    this.isDarkMode = this.getInitialMode();
    this.init();
  }

  // تحديد الوضع الابتدائي (من التخزين أو تفضيل النظام)
  getInitialMode() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored !== null) {
      return stored === "true";
    }
    // استخدام تفضيل النظام كافتراضي
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  init() {
    // تطبيق الوضع الأولي
    if (this.isDarkMode) {
      document.body.classList.add("dark-mode");
    }

    // إنشاء أزرار التبديل
    this.createToggleButton();

    // مراقبة تغيير تفضيل النظام
    this.watchSystemPreference();
  }

  // مراقبة تغيير تفضيل النظام
  watchSystemPreference() {
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        // فقط إذا لم يكن المستخدم قد اختار يدوياً
        if (localStorage.getItem(this.storageKey) === null) {
          this.toggle(e.matches, false);
        }
      });
    }
  }

  createToggleButton() {
    // إضافة زر في الإعدادات
    const settingsSection = document.querySelector(".settings-section");
    if (settingsSection && !document.getElementById("dark-mode-toggle")) {
      const darkModeCard = document.createElement("div");
      darkModeCard.className = "settings-card";
      darkModeCard.innerHTML = `
        <h2><i class="fas fa-moon"></i> الوضع الليلي</h2>
        <p>تبديل بين الوضع الفاتح والداكن</p>
        <label class="switch">
          <input type="checkbox" id="dark-mode-toggle" ${this.isDarkMode ? "checked" : ""}>
          <span class="slider"></span>
        </label>
      `;
      settingsSection.insertBefore(darkModeCard, settingsSection.firstChild);

      const toggle = document.getElementById("dark-mode-toggle");
      if (toggle) {
        toggle.addEventListener("change", (e) => {
          this.toggle(e.target.checked);
        });
      }
    }

    // إضافة زر سريع في الهيدر
    const header = document.querySelector(".main-header .container");
    if (header && !document.getElementById("dark-mode-header-toggle")) {
      const toggleBtn = document.createElement("button");
      toggleBtn.id = "dark-mode-header-toggle";
      toggleBtn.className = "dark-mode-toggle-header";
      toggleBtn.innerHTML = `<i class="fas ${this.isDarkMode ? "fa-sun" : "fa-moon"}"></i>`;
      toggleBtn.title = this.isDarkMode ? "الوضع الفاتح" : "الوضع الليلي";
      toggleBtn.setAttribute("aria-label", this.isDarkMode ? "تبديل للوضع الفاتح" : "تبديل للوضع الليلي");
      toggleBtn.addEventListener("click", () => {
        this.toggle(!this.isDarkMode);
        this.animateToggle(toggleBtn);
      });
      header.insertBefore(toggleBtn, header.querySelector(".main-nav"));
    }
  }

  // أنيميشن عند التبديل
  animateToggle(button) {
    button.style.transform = "rotate(360deg) scale(1.2)";
    setTimeout(() => {
      button.style.transform = "";
    }, 300);
  }

  toggle(enable, savePreference = true) {
    this.isDarkMode = enable;

    // حفظ التفضيل
    if (savePreference) {
      localStorage.setItem(this.storageKey, enable.toString());
    }

    // تطبيق/إزالة الـ class
    if (enable) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // تحديث زر الهيدر
    const headerToggle = document.getElementById("dark-mode-header-toggle");
    if (headerToggle) {
      const icon = headerToggle.querySelector("i");
      if (icon) {
        icon.className = enable ? "fas fa-sun" : "fas fa-moon";
      }
      headerToggle.title = enable ? "الوضع الفاتح" : "الوضع الليلي";
      headerToggle.setAttribute("aria-label", enable ? "تبديل للوضع الفاتح" : "تبديل للوضع الليلي");
    }

    // تحديث زر الإعدادات
    const settingsToggle = document.getElementById("dark-mode-toggle");
    if (settingsToggle) {
      settingsToggle.checked = enable;
    }

    // إرسال حدث مخصص
    document.dispatchEvent(new CustomEvent("darkModeChanged", {
      detail: { isDarkMode: enable }
    }));
  }
}

const darkModeManager = new DarkModeManager();

