/**
 * At this phase I store activities only in memory.
 * That means refreshing the page clears them (localStorage comes later).
 * In Phase 2, I add delete because:
 * - it's a common CRUD feature
 * - it teaches me DOM events on dynamically generated elements
 *
 * In Phase 1-2, I used an in-memory array for activities.
 * In Phase 3, I switch to localStorage so the data persists
 * even after page refresh.
 * localStorage stores only strings, so we convert objects/arrays
 * using JSON.stringify() and JSON.parse().
 *
 * In Phase 4 i add edit functionality.
 * The flow I want:
 * 1) Click edit on a card
 * 2) Form fills with that activity's values
 * 3) Submit updates the activity
 * 4) Cancel exits edit mode
 *
 * In Phase 5 i add stats bar.
 * I want to show basic statistics:
 * 1) Total activities
 * 2) Activities this week
 * 3) Activities this month
 * 4) Average duration
 *
 * In Phase 6 I add filter and search
 */

const STORAGE_KEYS = {
  // I keep keys here so I don't accidentally typo them later
  ACTIVITIES: "fittrack_activities",
};

/**
 * Convert a Date object to YYYY-MM-DD.
 * I use this so the <input type="date"> can be defaulted to today.
 */
function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * User-friendly formatting for showing a date on the card.
 * Adding 'T00:00:00' avoids timezone weirdness in some browsers.
 */
function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeHtml(text) {
  // Security + correctness: prevents breaking HTML when users type special characters.
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

/**
 * Small feedback message under the form.
 * I keep it simple and auto-hide after a short time.
 * I also support error styling (optional) because storage can fail.
 */
function showSuccessMessage(message, isError = false) {
  const el = document.getElementById("successMessage");
  if (!el) return;

  el.textContent = message;
  el.style.display = "block";
  // Quick styling swap (I keep it simple at this phase)
  if (isError) {
    el.style.background = "#fee2e2";
    el.style.color = "#991b1b";
  } else {
    el.style.background = "";
    el.style.color = "";
  }
  setTimeout(() => {
    el.style.display = "none";
  }, 2500);
}

/* ==========================================================
   localStorage layer (this becomes the "source of truth")
   ========================================================== */

/**
 * Load activities from localStorage.
 * I wrap in try/catch because JSON.parse can throw if data is corrupted.
 * I used AI assistance to validate the error-handling approach.
 */
function loadActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error loading activities:", err);
    return [];
  }
}

function saveActivities(activities) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (err) {
    console.error("Error saving activities:", err);
    showSuccessMessage("Error saving data (storage may be full).", true);
  }
}

/**
 * Add activity into storage.
 * I do: load then update then save.
 */
function addActivity(activity) {
  const activities = loadActivities();
  activities.push(activity);
  saveActivities(activities);
}

/**
 * update activity by id.
 * replace only the changed fields, then save.
 */
function updateActivity(id, updatedData) {
  const activities = loadActivities();
  const index = activities.findIndex((a) => a.id === id);
  if (index === -1) return;

  activities[index] = { ...activities[index], ...updatedData };
  saveActivities(activities);
}

/**
 * Delete activity from storage by id.
 */

function deleteActivity(id) {
  const activities = loadActivities();
  const filtered = activities.filter((a) => a.id !== id);
  saveActivities(filtered);
}

/* ---------- Form Validation (basic but clear) ---------- */

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = "";
  });
}

/**
 * Validate form inputs.
 * I show individual messages so the user knows exactly what to fix.
 */
function validateForm() {
  clearErrors();

  let ok = true;

  const type = document.getElementById("activityType").value;
  const name = document.getElementById("activityName").value.trim();
  const duration = document.getElementById("activityDuration").value;
  const date = document.getElementById("activityDate").value;

  if (!type) {
    document.getElementById("typeError").textContent = "Please select a type";
    ok = false;
  }

  if (!name) {
    document.getElementById("nameError").textContent = "Please enter a name";
    ok = false;
  }

  // duration is numeric but comes as string from input
  if (!duration || parseInt(duration, 10) < 1) {
    document.getElementById("durationError").textContent =
      "Please enter a valid number (1 or more)";
    ok = false;
  }

  if (!date) {
    document.getElementById("dateError").textContent = "Please select a date";
    ok = false;
  }

  return ok;
}

/* ---------- Date range helpers (stats depend on these) ---------- */

/**
 * Start of current week (Monday at 00:00).
 * This part is tricky because JS getDay() returns:
 * Sun=0, Mon=1, ... Sat=6.
 *
 * So for Monday-based week:
 * - if today is Sunday (0), we go back 6 days
 * - else go back (day - 1)
 * I used AI and online references to
 * confirm the logic and edge cases.
 */
function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);

  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/* ---------- Statistics calculation ---------- */

/**
 * Calculates stats based on activities in localStorage.
 * Returns an object that can be used by renderStatsBar().
 */
function calculateStats() {
  const activities = loadActivities();

  const weekStart = getStartOfWeek();
  const monthStart = getStartOfMonth();

  const weekActivities = activities.filter((a) => {
    const d = new Date(a.date + "T00:00:00");
    return d >= weekStart;
  });

  const monthActivities = activities.filter((a) => {
    const d = new Date(a.date + "T00:00:00");
    return d >= monthStart;
  });

  const totalDuration = activities.reduce(
    (sum, a) => sum + (a.duration || 0),
    0,
  );
  const avgDuration =
    activities.length > 0 ? Math.round(totalDuration / activities.length) : 0;

  return {
    total: activities.length,
    weekly: weekActivities.length,
    monthly: monthActivities.length,
    avgDuration,
  };
}

/**
 * Reset form to default "Add" state.
 * I keep this as a function so I can call it after submit and after cancel.
 * Ai assistance helped me ensure I reset all relevant fields and
 * UI texts to avoid confusion when switching between add/edit modes.
 */
function resetForm() {
  const form = document.getElementById("activityForm");
  if (!form) return;

  form.reset();

  // clear edit mode
  document.getElementById("editId").value = "";

  // update UI texts
  document.getElementById("formTitle").textContent = "Add Activity";
  document.getElementById("submitBtn").textContent = "Add Activity";
  document.getElementById("cancelBtn").style.display = "none";

  // set date back to today (nice UX)
  document.getElementById("activityDate").value = toDateString(new Date());

  clearErrors();
}

/**
 * Fill form with an existing activity and switch UI to edit mode.
 */
function startEditActivity(id) {
  const activities = loadActivities();
  const activity = activities.find((a) => a.id === id);
  if (!activity) return;

  document.getElementById("editId").value = String(id);

  document.getElementById("activityType").value = activity.type;
  document.getElementById("activityName").value = activity.name;
  document.getElementById("activityDuration").value = activity.duration;
  document.getElementById("activityDate").value = activity.date;
  document.getElementById("activityNotes").value = activity.notes || "";

  document.getElementById("formTitle").textContent = "Edit Activity";
  document.getElementById("submitBtn").textContent = "Update Activity";
  document.getElementById("cancelBtn").style.display = "inline-flex";

  // Scroll to form so user sees the edit fields immediately
  document.getElementById("activityForm").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Filtering + Search

/**
 * It read UI controls and return a filtered/sorted list.
 * I keep this as a separate function because:
 * - It's easier to debug
 * - It's easier to extend later (like adding more filters)
 */
function getFilteredActivities() {
  let activities = loadActivities();

  const filterType = document.getElementById("filterType").value;
  const filterDate = document.getElementById("filterDate").value;
  const searchText = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  // Filter 1: type
  if (filterType !== "all") {
    activities = activities.filter((a) => a.type === filterType);
  }

  // Filter 2: period
  if (filterDate === "week") {
    const weekStart = getStartOfWeek();
    activities = activities.filter(
      (a) => new Date(a.date + "T00:00:00") >= weekStart,
    );
  } else if (filterDate === "month") {
    const monthStart = getStartOfMonth();
    activities = activities.filter(
      (a) => new Date(a.date + "T00:00:00") >= monthStart,
    );
  }

  // Filter 3: search by name
  if (searchText) {
    activities = activities.filter((a) =>
      (a.name || "").toLowerCase().includes(searchText),
    );
  }

  // Sorting: newest first
  activities.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.id - a.id;
  });

  return activities;
}

/* ---------- Rendering ---------- */

function renderCurrentDate() {
  const el = document.getElementById("currentDate");
  if (!el) return;

  el.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderStatsBar() {
  // now stast are visible and updated on every render, based on current localStorage data
  const stats = calculateStats();

  document.getElementById("statTotal").textContent = stats.total;
  document.getElementById("statWeekly").textContent = stats.weekly;
  document.getElementById("statMonthly").textContent = stats.monthly;
  document.getElementById("statAvgDuration").textContent = stats.avgDuration;
}

/**
 * Render activities now from localStorage.
 * This is the main change from Phase 2: we do not use a global array anymore.
 */
function renderActivities() {
  const container = document.getElementById("activitiesList");
  const countEl = document.getElementById("activityCount");
  if (!container || !countEl) return;

  const activities = getFilteredActivities();
  countEl.textContent = `${activities.length} activit${
    activities.length === 1 ? "y" : "ies"
  }`;

  if (activities.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">&#128203;</span>
        <p>No activities found. Try changing filters or search!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = activities
    .map(
      (a) => `
      <div class="activity-card" data-id="${a.id}">
        <div class="activity-card-header">
          <div class="activity-card-title">
            ${escapeHtml(a.name)}
            <span style="color:#64748b; font-weight:600;">(${a.type})</span>
          </div>

          <!-- edit + delete button -->
          <div class="activity-card-actions">
            <button class="btn btn-secondary btn-icon edit-btn" data-id="${a.id}" title="Edit" type="button">
              &#9998;
            </button>
            <button
              class="btn btn-danger btn-icon delete-btn"
              data-id="${a.id}"
              title="Delete"
              type="button"
            >
              &#10005;
            </button>
          </div>
        </div>

        <div class="activity-card-details">
          <span>&#128197; ${formatDate(a.date)}</span>
          <span>&#9201; ${a.duration} ${
            a.type === "workout" ? "min" : "times"
          }</span>
        </div>

        ${
          a.notes
            ? `<div style="margin-top:0.5rem; color:#64748b; font-size:0.82rem; font-style:italic;">
                 ${escapeHtml(a.notes)}
               </div>`
            : ""
        }
      </div>
    `,
    )
    .join("");
}

function renderAll() {
  renderCurrentDate();
  renderStatsBar();
  renderActivities();
}

/* ---------- App Start ---------- */

document.addEventListener("DOMContentLoaded", () => {
  // Default date input to today (small UX improvement)
  const dateInput = document.getElementById("activityDate");
  if (dateInput) dateInput.value = toDateString(new Date());

  // add activity
  const form = document.getElementById("activityForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      // read values from form

      const editId = document.getElementById("editId").value;

      const type = document.getElementById("activityType").value;
      const name = document.getElementById("activityName").value.trim();
      const duration = parseInt(
        document.getElementById("activityDuration").value,
        10,
      );
      const date = document.getElementById("activityDate").value;
      const notes = document.getElementById("activityNotes").value;

      if (editId) {
        // Update existing activity
        updateActivity(parseInt(editId, 10), {
          type,
          name,
          duration,
          date,
          notes: (notes || "").trim(),
        });
        showSuccessMessage("Activity updated!");
      } else {
        // create a simple activity object
        addActivity({
          id: Date.now(),
          type,
          name,
          duration,
          date,
          notes: (notes || "").trim(),
          // I store createdAt now because it can be useful later (export feature)
          createdAt: new Date().toISOString(),
        });
        showSuccessMessage("Activity added!");
      }
      resetForm();
      renderAll();
    });
  }

  // Cancel button leaves edit mode
  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      resetForm();
      showSuccessMessage("Edit cancelled");
    });
  }

    //when filters change, just re-render list
  const filterType = document.getElementById("filterType");
  const filterDate = document.getElementById("filterDate");
  const searchInput = document.getElementById("searchInput");

  if (filterType) filterType.addEventListener("change", renderActivities);
  if (filterDate) filterDate.addEventListener("change", renderActivities);
  if (searchInput) searchInput.addEventListener("input", renderActivities);

  /*
   * Event delegation for Edit/Delete buttons.
   * This keeps code simpler because cards are generated dynamically.
   */
  const list = document.getElementById("activitiesList");
  if (list) {
    list.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-btn");
      const deleteBtn = e.target.closest(".delete-btn");

      if (editBtn) {
        const id = parseInt(editBtn.dataset.id, 10);
        startEditActivity(id);
      }

      if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id, 10);
        deleteActivity(id);
        showSuccessMessage("Activity deleted");
        renderActivities();

        // If user deletes the thing they're editing, reset form to avoid confusion
        const editId = document.getElementById("editId").value;
        if (editId && parseInt(editId, 10) === id) {
          resetForm();
        }

        renderAll();
      }
    });
  }

  // First render now loads activities from localStorage
  renderAll();
});
