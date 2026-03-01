const yourState = {};
const theirState = {};

const yourGrid = document.getElementById("yourGrid");
const theirGrid = document.getElementById("theirGrid");
const tradeText = document.getElementById("tradeText");

const yourMissingLine = document.getElementById("yourMissingLine");
const yourSurplusLine = document.getElementById("yourSurplusLine");
const theirMissingLine = document.getElementById("theirMissingLine");
const theirSurplusLine = document.getElementById("theirSurplusLine");

function parseNumbers(text) {
  return text
    .split(/[^0-9]+/)
    .map((n) => parseInt(n))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 200);
}

function getList(state, type) {
  return Object.keys(state)
    .filter((n) => state[n] == type)
    .map(Number)
    .sort((a, b) => a - b);
}

function intersect(a, b) {
  return a.filter((x) => b.includes(x));
}

function update() {
  const yourMissing = getList(yourState, 1);
  const yourSurplus = getList(yourState, 2);

  const theirMissing = getList(theirState, 1);
  const theirSurplus = getList(theirState, 2);

  // Update number lines
  document.getElementById("yourMissingLine").textContent = yourMissing.join(
    ", "
  );
  document.getElementById("yourSurplusLine").textContent = yourSurplus.join(
    ", "
  );
  document.getElementById("theirMissingLine").textContent = theirMissing.join(
    ", "
  );
  document.getElementById("theirSurplusLine").textContent = theirSurplus.join(
    ", "
  );

  // Update trade
  const asking = intersect(yourMissing, theirSurplus);
  const offering = intersect(yourSurplus, theirMissing);

  tradeText.textContent =
    "Kérem: " + asking.join(", ") + "\n" + "Adom: " + offering.join(", ");
}

function copyText(el) {
  navigator.clipboard.writeText(el.textContent);
}

function copyTrade() {
  navigator.clipboard.writeText(tradeText.textContent);
}

async function pasteList(type, target) {
  const text = await navigator.clipboard.readText();
  const nums = parseNumbers(text);

  const state = target === "your" ? yourState : theirState;

  nums.forEach((n) => {
    state[n] = type;
  });

  if (target === "their") refreshTheirGrid();
  if (target === "your") refreshYourGrid();

  update();
}

function createTri(stateObj, number) {
  const el = document.createElement("div");
  el.className = "tristate";
  el.dataset.state = 0;

  el.onclick = () => {
    let s = (Number(el.dataset.state) + 1) % 3;
    el.dataset.state = s;
    stateObj[number] = s;

    el.classList.remove("missing", "surplus");
    el.textContent = "";

    if (s == 1) {
      el.classList.add("missing");
      el.textContent = "−";
    }

    if (s == 2) {
      el.classList.add("surplus");
      el.textContent = "+";
    }

    update();
  };

  return el;
}

const theirCells = {};

function refreshTheirGrid() {
  Object.entries(theirCells).forEach(([n, el]) => {
    const s = theirState[n] || 0;

    el.dataset.state = s;
    el.classList.remove("missing", "surplus");
    el.textContent = "";

    if (s == 1) {
      el.classList.add("missing");
      el.textContent = "−";
    }

    if (s == 2) {
      el.classList.add("surplus");
      el.textContent = "+";
    }
  });
}

function refreshYourGrid() {
  Object.keys(yourState).forEach((n) => {
    const tri = Array.from(document.querySelectorAll("#yourGrid .item")).find(
      (item) => Number(item.querySelector(".number").textContent) === Number(n)
    )?.querySelector(".tristate");

    if (tri) {
      const s = yourState[n] || 0;
      tri.dataset.state = s;
      tri.classList.remove("missing", "surplus");
      tri.textContent = "";
      if (s == 1) {
        tri.classList.add("missing");
        tri.textContent = "−";
      }
      if (s == 2) {
        tri.classList.add("surplus");
        tri.textContent = "+";
      }
    }
  });
}

function buildGrid(gridEl, stateObj, isTheir) {
  for (let row = 1; row <= 50; row++) {
    for (let col = 0; col < 4; col++) {
      const n = row + col * 50;

      const item = document.createElement("div");
      item.className = "item";

      const num = document.createElement("div");
      num.className = "number";
      num.textContent = n;

      const tri = createTri(stateObj, n);

      if (isTheir) theirCells[n] = tri;

      item.appendChild(num);
      item.appendChild(tri);

      gridEl.appendChild(item);
    }
  }
}

buildGrid(yourGrid, yourState, false);
buildGrid(theirGrid, theirState, true);
