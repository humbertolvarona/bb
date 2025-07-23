function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  document.getElementById("logo-light").style.display =
    theme === "dark" ? "none" : "";
  document.getElementById("logo-dark").style.display =
    theme === "dark" ? "" : "none";
  document.getElementById("icon-sun").style.display =
    theme === "dark" ? "none" : "";
  document.getElementById("icon-moon").style.display =
    theme === "dark" ? "" : "none";
}

function getPreferredTheme() {
  return (
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
}

document.getElementById("theme-toggle").onclick = function () {
  const curr = document.documentElement.getAttribute("data-theme") || "light";
  setTheme(curr === "light" ? "dark" : "light");
};

setTheme(getPreferredTheme());

function escapeBadgeText(txt) {
  return encodeURIComponent(
    txt.replace(/-/g, "--").replace(/_/g, "__").replace(/ /g, "_")
  );
}

function makeBadgeURL({ label, message, color, style, logo }) {
  let url = `https://img.shields.io/badge/${escapeBadgeText(
    label
  )}-${escapeBadgeText(message)}-${color.slice(1)}?style=${style}`;
  if (logo && logo.trim()) url += `&logo=${encodeURIComponent(logo.trim())}`;
  return url;
}

function makeMarkdown(url, alt, link) {
  if (link && link.trim()) return `[![${alt}](${url})](${link})`;
  return `![${alt}](${url})`;
}

function makeHTML(url, alt, link) {
  if (link && link.trim())
    return `<a href="${link}" target="_blank" rel="noopener"><img alt="${alt}" src="${url}" /></a>`;
  return `<img alt="${alt}" src="${url}" />`;
}

const badges = [];
let editingIdx = null;

function renderBadges() {
  const cont = document.getElementById("badges-list");
  cont.innerHTML = "";
  if (badges.length === 0) {
    cont.innerHTML = '<div style="opacity:.7;">No badges yet.</div>';
    return;
  }
  badges.forEach((b, i) => {
    const url = makeBadgeURL(b);
    const alt = b.label + " badge";
    const block = document.createElement("div");
    block.className = "badge-block";
    block.innerHTML = `
      <a href="${b.link || "#"}" ${
      b.link ? 'target="_blank" rel="noopener"' : ""
    }>
        <img class="badge-img" src="${url}" alt="${alt}">
      </a>
      <div class="badge-actions">
        <button data-action="copy-md" data-i="${i}">Copy Markdown</button>
        <button data-action="copy-html" data-i="${i}">Copy HTML</button>
        <button data-action="edit" data-i="${i}" style="background:#f6b859;color:#253342;">Edit</button>
        <button data-action="delete" data-i="${i}" style="background:#e84d4d;color:#fff;">Delete</button>
      </div>
      <div class="badge-code" id="md-code-${i}">${makeMarkdown(
      url,
      alt,
      b.link
    )}</div>
      <div class="badge-code" id="html-code-${i}" style="display:none;">${makeHTML(
      url,
      alt,
      b.link
    )}</div>
    `;
    cont.appendChild(block);
  });

  cont.querySelectorAll('button[data-action="copy-md"]').forEach((btn) => {
    btn.onclick = function () {
      const i = btn.dataset.i;
      const code = document.getElementById(`md-code-${i}`).innerText;
      navigator.clipboard.writeText(code);
      btn.innerText = "Copied!";
      setTimeout(() => (btn.innerText = "Copy Markdown"), 1200);
    };
  });
  cont.querySelectorAll('button[data-action="copy-html"]').forEach((btn) => {
    btn.onclick = function () {
      const i = btn.dataset.i;
      const code = document.getElementById(`html-code-${i}`).innerText;
      navigator.clipboard.writeText(code);
      btn.innerText = "Copied!";
      setTimeout(() => (btn.innerText = "Copy HTML"), 1200);
    };
  });
  cont.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
    btn.onclick = function () {
      const i = +btn.dataset.i;
      badges.splice(i, 1);
      if (editingIdx === i) resetEditForm();
      renderBadges();
    };
  });
  cont.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
    btn.onclick = function () {
      const i = +btn.dataset.i;
      loadBadgeToForm(i);
    };
  });
}

function loadBadgeToForm(idx) {
  const badge = badges[idx];
  document.getElementById("label").value = badge.label;
  document.getElementById("message").value = badge.message;
  document.getElementById("color").value = badge.color;
  document.getElementById("style").value = badge.style;
  document.getElementById("logo").value = badge.logo || "";
  document.getElementById("link").value = badge.link || "";
  editingIdx = idx;
  document.getElementById("form-title").innerText = "Edit Badge";
  document.getElementById("submit-btn").innerText = "Update Badge";
  document.getElementById("cancel-edit").style.display = "";
  document.getElementById("label").focus();
}

function resetEditForm() {
  document.getElementById("badge-form").reset();
  document.getElementById("color").value = "#007ec6";
  editingIdx = null;
  document.getElementById("form-title").innerText = "Create a Badge";
  document.getElementById("submit-btn").innerText = "Add Badge";
  document.getElementById("cancel-edit").style.display = "none";
}

document.getElementById("badge-form").onsubmit = function (e) {
  e.preventDefault();
  const label = document.getElementById("label").value.trim();
  const message = document.getElementById("message").value.trim();
  const color = document.getElementById("color").value;
  const style = document.getElementById("style").value;
  const logo = document.getElementById("logo").value.trim();
  const link = document.getElementById("link").value.trim();
  if (!label || !message) return;
  const data = { label, message, color, style, logo, link };
  if (editingIdx !== null) {
    badges[editingIdx] = data;
    resetEditForm();
  } else {
    badges.push(data);
  }
  renderBadges();
  document.getElementById("label").focus();
};

document.getElementById("cancel-edit").onclick = function () {
  resetEditForm();
};

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) setTheme(e.matches ? "dark" : "light");
  });

renderBadges();
