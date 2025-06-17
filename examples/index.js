// Renderer side for examples – tweak liquid glass
const { ipcRenderer } = require("electron");

let viewId = null;

ipcRenderer.on("glass-ready", (_event, { viewId: id }) => {
  viewId = id;
});

function send(type, value) {
  if (viewId == null) return;
  ipcRenderer.send("glass-set", { type, value });
}

function buildButtons(containerId, type, values) {
  const container = document.getElementById(containerId);
  values.forEach((v) => {
    const btn = document.createElement("button");
    btn.textContent = String(v);
    btn.addEventListener("click", () => {
      send(type, v);
      [...container.children].forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
    container.appendChild(btn);
  });
}

// Only expose production-safe settings
buildButtons("variant-buttons", "variant", Array.from({ length: 16 }, (_, i) => i).concat([19]));
buildButtons("scrim-buttons", "scrim", [0, 1]);
buildButtons("subdued-buttons", "subdued", [0, 1]);
