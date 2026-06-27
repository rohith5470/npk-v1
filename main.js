// ── CROP DATA ───────────────────────────────────────────────
// Recommended NPK application ranges in kg/hectare (kg/ha)
const cropData = {
  rice:      { name: "Rice",      N: [100, 150], P: [40, 60],  K: [80, 120] },
  wheat:     { name: "Wheat",     N: [120, 160], P: [50, 70],  K: [60, 90] },
  maize:     { name: "Maize",     N: [150, 200], P: [60, 80],  K: [80, 120] },
  cotton:    { name: "Cotton",    N: [80, 120],  P: [30, 50],  K: [60, 100] },
  sugarcane: { name: "Sugarcane", N: [200, 280], P: [60, 90],  K: [150, 200] },
  soybean:   { name: "Soybean",   N: [20, 40],   P: [50, 70],  K: [80, 120] }
};

// ── FERTILIZER SUGGESTIONS ──────────────────────────────────
const fertilizerMap = {
  N: {
    low: "Urea (46% N) or Ammonium Nitrate",
    optimal: "Maintain current nitrogen schedule",
    high: "Reduce nitrogen inputs; avoid excess urea"
  },
  P: {
    low: "Single Super Phosphate (SSP) or DAP",
    optimal: "Maintain current phosphorus schedule",
    high: "Skip phosphorus application this season"
  },
  K: {
    low: "Muriate of Potash (MOP) or SOP",
    optimal: "Maintain current potassium schedule",
    high: "Avoid additional potassium fertilizers"
  }
};

// Fixed display maximums for progress bars
const NUTRIENT_MAX = {
  N: 350,
  P: 120,
  K: 280
};

// ── HELPER FUNCTIONS ────────────────────────────────────────
function classify(value, range) {
  if (value < range[0]) return "low";
  if (value > range[1]) return "high";
  return "optimal";
}

function statusLabel(status) {
  const labels = {
    low: "⬇ Deficient",
    optimal: "✔ Optimal",
    high: "⬆ Excess"
  };

  return labels[status];
}

function barColor(status) {
  const colors = {
    low: "#1565c0",
    optimal: "#2e7d32",
    high: "#e65100"
  };

  return colors[status];
}

function barWidth(value, nutrientKey) {
  const max = NUTRIENT_MAX[nutrientKey];
  return Math.min(100, Math.round((value / max) * 100));
}

function actionText(nutrientLabel, status) {
  if (status === "low") {
    return `Apply additional ${nutientLabel}`;
  }

  if (status === "high") {
    return `Reduce or skip ${nutrientLabel} application`;
  }

  return "No action needed";
}

// ── MAIN ANALYSIS FUNCTION ──────────────────────────────────
function analyze() {
  const crop = document.getElementById("cropType").value;
  const N = parseFloat(document.getElementById("nitrogen").value);
  const P = parseFloat(document.getElementById("phosphorus").value);
  const K = parseFloat(document.getElementById("potassium").value);
  const area = parseFloat(document.getElementById("area").value);
  const ph = parseFloat(document.getElementById("ph").value);

  // Basic validation
  if (!crop) {
    alert("Please select a crop type.");
    return;
  }

  if (isNaN(N) || isNaN(P) || isNaN(K)) {
    alert("Please enter all NPK values.");
    return;
  }

  if (N < 0 || P < 0 || K < 0) {
    alert("NPK values cannot be negative.");
    return;
  }

  if (!isNaN(ph) && (ph < 0 || ph > 14)) {
    alert("Soil pH must be between 0 and 14.");
    return;
  }

  if (!isNaN(area) && area <= 0) {
    alert("Field area must be greater than 0.");
    return;
  }

  const data = cropData[crop];

  const nutrients = [
    {
      key: "N",
      label: "Nitrogen",
      value: N,
      range: data.N,
      status: classify(N, data.N)
    },
    {
      key: "P",
      label: "Phosphorus",
      value: P,
      range: data.P,
      status: classify(P, data.P)
    },
    {
      key: "K",
      label: "Potassium",
      value: K,
      range: data.K,
      status: classify(K, data.K)
    }
  ];

  renderBanner(data.name, nutrients);
  renderNPKCards(nutrients);
  renderTable(nutrients);
  renderNote(data.name, ph, area);

  const resultsEl = document.getElementById("results");
  resultsEl.style.display = "block";
  resultsEl.scrollIntoView({ behavior: "smooth" });
}

// ── SUMMARY BANNER ──────────────────────────────────────────
function renderBanner(cropName, nutrients) {
  const issues = nutrients.filter(n => n.status !== "optimal").length;
  const banner = document.getElementById("statusBanner");

  if (issues === 0) {
    banner.className = "status-banner status-ok";
    banner.innerHTML = `
      ✅ <span>All NPK levels are within the optimal range for ${cropName}. Continue current fertilizer practices.</span>
    `;
  } else if (issues === 1) {
    banner.className = "status-banner status-warn";
    banner.innerHTML = `
      ⚠️ <span>1 nutrient imbalance detected for ${cropName}. Review the recommendation below.</span>
    `;
  } else {
    banner.className = "status-banner status-bad";
    banner.innerHTML = `
      ❗ <span>${issues} nutrient imbalances detected for ${cropName}. Corrective action is recommended.</span>
    `;
  }
}

// ── NPK RESULT CARDS ────────────────────────────────────────
function renderNPKCards(nutrients) {
  const cardsHTML = nutrients.map(n => `
    <div class="npk-result-card status-${n.status}">
      <div class="label">${n.label}</div>
      <div class="value">${n.value}</div>
      <div class="range">Optimal: ${n.range[0]}–${n.range[1]} kg/ha</div>

      <div class="bar-container">
        <div class="bar-bg">
          <div 
            class="bar-fill" 
            style="width:${barWidth(n.value, n.key)}%; background:${barColor(n.status)};">
          </div>
        </div>
      </div>

      <br>
      <span class="status-pill">${statusLabel(n.status)}</span>
    </div>
  `).join("");

  document.getElementById("npkCards").innerHTML = cardsHTML;
}

// ── RECOMMENDATION TABLE ────────────────────────────────────
function renderTable(nutrients) {
  const tableHTML = nutrients.map(n => `
    <tr>
      <td><strong>${n.key} – ${n.label}</strong></td>

      <td>
        <span class="status-pill status-${n.status}" 
          style="padding:3px 10px; border-radius:12px; font-size:0.76rem; font-weight:700;">
          ${statusLabel(n.status)}
        </span>
      </td>

      <td>${actionText(n.label, n.status)}</td>

      <td>${fertilizerMap[n.key][n.status]}</td>
    </tr>
  `).join("");

  document.getElementById("recTableBody").innerHTML = tableHTML;
}

// ── GENERAL NOTE ────────────────────────────────────────────
function renderNote(cropName, ph, area) {
  let note = `
    <strong>Note:</strong> These recommendations are generated using predefined rule-based NPK guidelines for 
    <strong>${cropName}</strong>. They are intended for educational and preliminary decision-support purposes.
    They should not replace professional soil testing or expert agronomic advice.
  `;

  if (!isNaN(ph)) {
    if (ph < 6.0) {
      note += ` Soil pH (${ph}) is acidic, which may reduce nutrient availability. Liming may help improve soil conditions.`;
    } else if (ph > 7.5) {
      note += ` Soil pH (${ph}) is alkaline, which may reduce phosphorus availability.`;
    } else {
      note += ` Soil pH (${ph}) is within the generally acceptable range for most crops.`;
    }
  }

  if (!isNaN(area)) {
    note += ` Field size entered: <strong>${area} acre${area === 1 ? "" : "s"}</strong>. Use this area only for scaling fertilizer quantities.`;
  }

  note += ` Please ensure that NPK values are entered in <strong>kg per hectare (kg/ha)</strong>.`;

  document.getElementById("generalNote").innerHTML = note;
}