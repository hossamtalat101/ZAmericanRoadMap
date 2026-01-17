// منطق صفحة الإحصائيات
let progressChart, skillsChart, monthlyChart;

document.addEventListener("DOMContentLoaded", function () {
  showLoading();
  setTimeout(() => {
    updateAllStatistics();
    initCharts();
    updateAdvancedStats();
    hideLoading();
  }, 500);
});

function updateAllStatistics() {
  const stats = progressManager.getStatistics();
  
  // تحديث الإحصائيات العامة
  document.getElementById("total-lessons").textContent = stats.totalLessons;
  document.getElementById("completed-lessons").textContent = stats.completedLessons;
  document.getElementById("overall-progress").textContent = `${stats.overallProgress}%`;
  document.getElementById("achievements-count").textContent = stats.achievements;
  
  // تحديث تقدم المهارات
  updateSkillsProgress(stats.skillsProgress);
  
  // تحديث الإنجازات
  updateAchievements();
}

function updateSkillsProgress(skillsProgress) {
  const container = document.getElementById("skills-progress");
  if (!container) return;
  
  let html = "";
  Object.keys(skillsProgress).forEach((skill) => {
    const { completed, total, percentage } = skillsProgress[skill];
    html += `
      <div class="skill-progress-item">
        <div class="skill-header">
          <span class="skill-name">${skill}</span>
          <span class="skill-stats">${completed}/${total}</span>
        </div>
        <div class="skill-bar-container">
          <div class="skill-bar" style="width: ${percentage}%">
            <span class="skill-percentage">${percentage}%</span>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function updateAchievements() {
  const achievements = progressManager.getAchievements();
  const container = document.getElementById("achievements-list");
  if (!container) return;
  
  if (achievements.length === 0) {
    container.innerHTML = "<p class='text-center'>لا توجد إنجازات بعد. استمر في التعلم!</p>";
    return;
  }
  
  let html = "";
  achievements.forEach((achievementId) => {
    const achievement = parseAchievementId(achievementId);
    if (achievement) {
      html += `
        <div class="achievement-card">
          <i class="fas fa-trophy achievement-icon"></i>
          <h3>${achievement.title}</h3>
          <p>${achievement.description}</p>
        </div>
      `;
    }
  });
  
  container.innerHTML = html;
}

function parseAchievementId(achievementId) {
  if (achievementId.startsWith("week_")) {
    const parts = achievementId.split("_");
    const monthId = parseInt(parts[1]);
    const weekNumber = parseInt(parts[2]);
    const month = getMonthById(monthId);
    return {
      title: "أسبوع مكتمل!",
      description: `لقد أكملت الأسبوع ${weekNumber} من ${month ? month.name : ""}`,
    };
  } else if (achievementId.startsWith("month_")) {
    const parts = achievementId.split("_");
    const monthId = parseInt(parts[1]);
    const month = getMonthById(monthId);
    return {
      title: "شهر مكتمل!",
      description: `لقد أكملت ${month ? month.name : ""}`,
    };
  }
  return null;
}

// إنشاء الرسوم البيانية
function initCharts() {
  const stats = progressManager.getStatistics();
  
  // رسم تطور التقدم
  initProgressChart();
  
  // رسم توزيع المهارات
  initSkillsChart(stats.skillsProgress);
  
  // رسم مقارنة الأداء الشهري
  initMonthlyChart();
}

function initProgressChart() {
  const ctx = document.getElementById("progressChart");
  if (!ctx) return;
  
  const allWeeks = getAllWeeks();
  const weeks = [];
  const progress = [];
  
  allWeeks.forEach((week) => {
    weeks.push(`أسبوع ${week.weekNumber}`);
    const weekProgress = progressManager.getWeekProgress(week.monthId, week.weekNumber);
    progress.push(weekProgress);
  });
  
  if (progressChart) {
    progressChart.destroy();
  }
  
  progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: weeks.slice(0, 12), // أول 12 أسبوع
      datasets: [{
        label: "التقدم %",
        data: progress.slice(0, 12),
        borderColor: "#c49b66",
        backgroundColor: "rgba(196, 155, 102, 0.1)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
          rtl: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

function initSkillsChart(skillsProgress) {
  const ctx = document.getElementById("skillsChart");
  if (!ctx) return;
  
  const labels = Object.keys(skillsProgress);
  const data = Object.values(skillsProgress).map(s => s.percentage);
  
  if (skillsChart) {
    skillsChart.destroy();
  }
  
  skillsChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "#c49b66",
          "#d4af37",
          "#003b46",
          "#07575b",
          "#ffd93d",
          "#a8e6cf"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          rtl: true
        }
      }
    }
  });
}

function initMonthlyChart() {
  const ctx = document.getElementById("monthlyChart");
  if (!ctx) return;
  
  const months = [];
  const progress = [];
  
  learningPlan.months.forEach((month) => {
    months.push(month.name);
    const monthProgress = progressManager.getMonthProgress(month.id);
    progress.push(monthProgress);
  });
  
  if (monthlyChart) {
    monthlyChart.destroy();
  }
  
  monthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        label: "التقدم %",
        data: progress,
        backgroundColor: "#c49b66",
        borderColor: "#d4af37",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
          rtl: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// إحصائيات متقدمة
function updateAdvancedStats() {
  const stats = progressManager.getStatistics();
  const advancedStats = calculateAdvancedStats();
  
  document.getElementById("streak-days").textContent = advancedStats.streak;
  document.getElementById("avg-lessons").textContent = advancedStats.avgLessonsPerDay.toFixed(1);
  document.getElementById("best-day").textContent = advancedStats.bestDay || "-";
  document.getElementById("estimated-completion").textContent = advancedStats.estimatedCompletion || "-";
}

function calculateAdvancedStats() {
  const completedDates = progressManager.progress.completedDates;
  const dates = Object.values(completedDates).map(d => new Date(d));
  
  // حساب الأيام المتتالية
  let streak = 0;
  if (dates.length > 0) {
    const sortedDates = dates.sort((a, b) => b - a);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const hasLesson = sortedDates.some(d => {
        const dStr = d.toISOString().split("T")[0];
        return dStr === dateStr;
      });
      
      if (hasLesson) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    streak = currentStreak;
  }
  
  // حساب المتوسط اليومي
  const totalDays = Math.max(1, Math.floor((new Date() - new Date(Math.min(...dates.map(d => d.getTime())))) / (1000 * 60 * 60 * 24)));
  const avgLessonsPerDay = dates.length / totalDays;
  
  // أفضل يوم (حسب عدد الدروس)
  const dayCounts = {};
  dates.forEach(d => {
    const dayName = d.toLocaleDateString("ar-SA", { weekday: "long" });
    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
  });
  const bestDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b, null);
  
  // التاريخ المتوقع للإكمال
  const totalLessons = getTotalLessons();
  const completed = dates.length;
  const remaining = totalLessons - completed;
  let estimatedCompletion = null;
  
  if (avgLessonsPerDay > 0 && remaining > 0) {
    const daysNeeded = Math.ceil(remaining / avgLessonsPerDay);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);
    estimatedCompletion = completionDate.toLocaleDateString("ar-SA");
  }
  
  return {
    streak,
    avgLessonsPerDay,
    bestDay,
    estimatedCompletion
  };
}

// Loading states
function showLoading() {
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

function hideLoading() {
  const loader = document.getElementById("page-loader");
  if (loader) {
    loader.remove();
  }
}

