// ── CROP DATA ────────────────────────────────────────────────────────────────
// Optimal NPK ranges per crop (kg/ha)
const cropData = {
  rice:      { name: "Rice",      N: [100, 150], P: [40, 60],  K: [80,  120] },
  wheat:     { name: "Wheat",     N: [120, 160], P: [50, 70],  K: [60,  90]  },
  maize:     { name: "Maize",     N: [150, 200], P: [60, 80],  K: [80,  120] },
  cotton:    { name: "Cotton",    N: [80,  120], P: [30, 50],  K: [60,  100] },
  sugarcane: { name: "Sugarcane", N: [200, 280], P: [60, 90],  K: [150, 200] },
  soybean:   { name: "Soybean",   N: [20,  40],  P: [50, 70],  K: [80,  120] }
};

// Fertilizer suggestions per nutrient & status
const fertilizerMap = {
  N: {
    low:     "Urea (46% N) or Ammonium Nitrate",
    optimal: "Maintain current N schedule",
    high:    "Reduce N inputs; avoid urea application"
  },
  P: {
    low:     "Single Super Phosphate (SSP) or DAP",
    optimal: "Maintain current P schedule",
    high:    "Skip P application this season"
  },
  K: {
    low:     "Muriate of Potash (MOP) or SOP",
    optimal: "Maintain current K schedule",
    high:    "Avoid additional K fertilizers"
  }
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function classify(val, range) {
  if (val < range[0]) return "low";
  if (val > range[1]) return "high";
  return "optimal";
}

function statusLabel(status) {
  const labels = { low: "⬇ Deficient", optimal: "✔ Optimal", high: "⬆ Excess" };
  return labels[status];
}

function barColor(status) {
  const colors = { low: "#1565c0", optimal: "#2e7d32", high: "#e65100" };
  return colors[status];
}

function barWidth(val, range) {
  const max = range[1] * 1.8;
  return Math.min(100, Math.round((val / max) * 100));
}

function actionText(nutrientLabel, status) {
  if (status === "low")     return `Apply additional ${nutrientLabel}`;
  if (status === "high")    return `Reduce / skip ${nutrientLabel} application`;
  return "No action needed";
}

// ── MAIN ANALYZE FUNCTION ─────────────────────────────────────────────────────
function analyze() {
  const crop = document.getElementById("cropType").value;
  const N    = parseFloat(document.getElementById("nitrogen").value);
  const P    = parseFloat(document.getElementById("phosphorus").value);
  const K    = parseFloat(document.getElementById("potassium").value);
  const area = document.getElementById("area").value;
  const ph   = document.getElementById("ph").value;

  // Validation
  if (!crop) { alert("Please select a crop type."); return; }
  if (isNaN(N) || isNaN(P) || isNaN(K)) { alert("Please enter all NPK values."); return; }

  const data = cropData[crop];

  const nutrients = [
    { key: "N", label: "Nitrogen",    val: N, range: data.N, status: classify(N, data.N) },
    { key: "P", label: "Phosphorus",  val: P, range: data.P, status: classify(P, data.P) },
    { key: "K", label: "Potassium",   val: K, range: data.K, status: classify(K, data.K) }
  ];

  renderBanner(data.name, nutrients);
  renderNPKCards(nutrients);
  renderTable(nutrients);
  renderNote(data.name, ph, area);

  const resultsEl = document.getElementById("results");
  resultsEl.style.display = "block";
  resultsEl.scrollIntoView({ behavior: "smooth" });
}

// ── RENDER: SUMMARY BANNER ───────────────────────────────────────────────────
function renderBanner(cropName, nutrients) {
  const issues = nutrients.filter(n => n.status !== "optimal").length;
  const banner = document.getElementById("statusBanner");

  if (issues === 0) {
    banner.className = "status-banner status-ok";
    banner.innerHTML = `✅ <span>All NPK levels are within optimal range for ${cropName}. Continue current fertilizer practices.</span>`;
  } else if (issues === 1) {
    banner.className = "status-banner status-warn";
    banner.innerHTML = `⚠️ <span>${issues} nutrient imbalance detected for ${cropName}. Review the recommendation below.</span>`;
  } else {
    banner.className = "status-banner status-bad";
    banner.innerHTML = `❗ <span>${issues} nutrient imbalances detected for ${cropName}. Immediate corrective action recommended.</span>`;
  }
}

// ── RENDER: NPK CARDS ────────────────────────────────────────────────────────
function renderNPKCards(nutrients) {
  document.getElementById("npkCards").innerHTML = nutrients.map(n => `
    <div class="npk-result-card status-${n.status}">
      <div class="label">${n.label}</div>
      <div class="value">${n.val}</div>
      <div class="range">Optimal: ${n.range[0]}–${n.range[1]} kg/ha</div>
      <div class="bar-container">
        <div class="bar-bg">
          <div class="bar-fill" style="width:${barWidth(n.val, n.range)}%; background:${barColor(n.status)};"></div>
        </div>
      </div>
      <br>
      <span class="status-pill">${statusLabel(n.status)}</span>
    </div>
  `).join("");
}

// ── RENDER: RECOMMENDATIONS TABLE ───────────────────────────────────────────
function renderTable(nutrients) {
  document.getElementById("recTableBody").innerHTML = nutrients.map(n => `
    <tr>
      <td><strong>${n.key} – ${n.label}</strong></td>
      <td>
        <span class="status-pill status-${n.status}" style="padding:3px 10px;border-radius:12px;font-size:0.76rem;font-weight:700;">
          ${statusLabel(n.status)}
        </span>
      </td>
      <td>${actionText(n.label, n.status)}</td>
      <td>${fertilizerMap[n.key][n.status]}</td>
    </tr>
  `).join("");
}

// ── RENDER: GENERAL NOTE ─────────────────────────────────────────────────────
function renderNote(cropName, ph, area) {
  let note = `<strong>Note:</strong> Recommendations are based on rule-based guidelines for ${cropName}.`;

  if (ph) {
    const phVal = parseFloat(ph);
    if (phVal < 6.0)      note += ` Soil pH (${phVal}) is acidic — consider liming to improve nutrient availability.`;
    else if (phVal > 7.5) note += ` Soil pH (${phVal}) is alkaline — phosphorus availability may be reduced.`;
    else                  note += ` Soil pH (${phVal}) is within the acceptable range.`;
  }

  if (area) {
    note += ` Scale fertilizer quantities proportionally for your field area of ${area} acres.`;
  }

  document.getElementById("generalNote").innerHTML = note;
}
