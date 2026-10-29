// Each game: start(area) builds the game inside `area` and returns a stop() function.
const games = {
  snake: {
    name: "Snake",
    icon: "🐍",
    color: "#3ddbb0",
    desc: "Eat, grow, don't crash.",
    start: snake,
  },
  memory: {
    name: "Memory Match",
    icon: "🃏",
    color: "#ffd23f",
    desc: "Find all 8 pairs.",
    start: memory,
  },
  ttt: {
    name: "Tic-Tac-Toe",
    icon: "⭕",
    color: "#ff5c7a",
    desc: "You are X. Beat the computer.",
    start: ttt,
  },
  g2048: {
    name: "2048",
    icon: "🔢",
    color: "#ff9f43",
    desc: "Slide and merge tiles.",
    start: g2048,
  },
  mines: {
    name: "Minesweeper",
    icon: "💣",
    color: "#8f7bff",
    desc: "Clear the board, avoid 10 mines.",
    start: mines,
  },
  flappy: {
    name: "Flappy Dot",
    icon: "🐤",
    color: "#5ec8ff",
    desc: "Tap to flap through the gaps.",
    start: flappy,
  },
  mole: {
    name: "Whack-a-Mole",
    icon: "🐹",
    color: "#c98b5a",
    desc: "30 seconds. Hit as many as you can.",
    start: mole,
  },
};

const $ = (id) => document.getElementById(id);
let stop = null;

// Build the game cards
$("grid").innerHTML = Object.entries(games)
  .map(
    ([k, g]) =>
      `<button class="game" style="--c:${g.color}" data-game="${k}"><span class="ico">${g.icon}</span><b>${g.name}</b><small>${g.desc}</small></button>`,
  )
  .join("");

$("grid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-game]");
  if (b) open(b.dataset.game);
});
$("back").addEventListener("click", close);

function open(key) {
  const g = games[key];
  $("title").textContent = g.name;
  $("area").innerHTML = "";
  $("stage").classList.add("on");
  stop = g.start($("area"));
}
function close() {
  if (stop) stop();
  stop = null;
  $("area").innerHTML = "";
  $("stage").classList.remove("on");
}

/* ---------- SNAKE ---------- */
function snake(area) {
  const N = 18,
    S = 20;
  area.innerHTML = `<div class="score" id="sc">Score: 0</div><canvas width="${N * S}" height="${N * S}"></canvas>
  <div class="pad"><button data-d="0,-1">▲</button><button data-d="-1,0">◀</button><button data-d="0,1">▼</button><button data-d="1,0">▶</button></div>
  <div class="score">Arrow keys or WASD. Press Space to restart.</div>`;
  const cv = area.querySelector("canvas"),
    c = cv.getContext("2d");
  let body, dir, next, food, score, over, timer;

  function reset() {
    body = [
      { x: 9, y: 9 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
    ];
    dir = next = { x: 1, y: 0 };
    score = 0;
    over = false;
    placeFood();
    $("sc").textContent = "Score: 0";
    clearInterval(timer);
    timer = setInterval(tick, 110);
  }
  function placeFood() {
    do
      food = {
        x: Math.floor(Math.random() * N),
        y: Math.floor(Math.random() * N),
      };
    while (body.some((p) => p.x === food.x && p.y === food.y));
  }
  function turn(x, y) {
    if (x !== -dir.x || y !== -dir.y) next = { x, y };
  }
  function tick() {
    dir = next;
    const h = { x: body[0].x + dir.x, y: body[0].y + dir.y };
    if (
      h.x < 0 ||
      h.y < 0 ||
      h.x >= N ||
      h.y >= N ||
      body.some((p) => p.x === h.x && p.y === h.y)
    ) {
      over = true;
      clearInterval(timer);
      draw();
      return;
    }
    body.unshift(h);
    if (h.x === food.x && h.y === food.y) {
      score++;
      $("sc").textContent = "Score: " + score;
      placeFood();
    } else body.pop();
    draw();
  }
  function draw() {
    c.fillStyle = "#0d0b21";
    c.fillRect(0, 0, N * S, N * S);
    c.fillStyle = "#ff5c7a";
    c.beginPath();
    c.arc(food.x * S + S / 2, food.y * S + S / 2, S / 2 - 3, 0, 7);
    c.fill();
    body.forEach((p, i) => {
      c.fillStyle = i ? "#3ddbb0" : "#ffd23f";
      c.fillRect(p.x * S + 1, p.y * S + 1, S - 2, S - 2);
    });
    if (over) {
      c.fillStyle = "rgba(20,18,43,.8)";
      c.fillRect(0, 0, N * S, N * S);
      c.fillStyle = "#f3f1ff";
      c.font = "800 26px sans-serif";
      c.textAlign = "center";
      c.fillText("Game over: " + score, (N * S) / 2, (N * S) / 2 - 4);
      c.font = "16px sans-serif";
      c.fillText(
        "Press Space or tap to restart",
        (N * S) / 2,
        (N * S) / 2 + 24,
      );
    }
  }
  const keys = {
    ArrowUp: [0, -1],
    w: [0, -1],
    ArrowDown: [0, 1],
    s: [0, 1],
    ArrowLeft: [-1, 0],
    a: [-1, 0],
    ArrowRight: [1, 0],
    d: [1, 0],
  };
  function onKey(e) {
    if (e.key === " " && over) {
      e.preventDefault();
      reset();
      return;
    }
    const k = keys[e.key];
    if (k) {
      e.preventDefault();
      turn(...k);
    }
  }
  area
    .querySelectorAll(".pad button")
    .forEach(
      (b) => (b.onclick = () => turn(...b.dataset.d.split(",").map(Number))),
    );
  cv.onclick = () => {
    if (over) reset();
  };
  document.addEventListener("keydown", onKey);
  reset();
  return () => {
    clearInterval(timer);
    document.removeEventListener("keydown", onKey);
  };
}

/* ---------- MEMORY MATCH ---------- */
function memory(area) {
  const faces = ["🍕", "🚀", "🐙", "🎸", "🌵", "🍩", "👾", "⚽"];
  const deck = [...faces, ...faces].sort(() => Math.random() - 0.5);
  let open = [],
    moves = 0,
    found = 0,
    lock = false;
  area.innerHTML = `<div class="score" id="mv">Moves: 0</div><div class="cards">${deck.map((f, i) => `<button class="mem" data-i="${i}" aria-label="Card">${f}</button>`).join("")}</div>`;
  const cards = [...area.querySelectorAll(".mem")];
  cards.forEach(
    (b) =>
      (b.onclick = () => {
        if (lock || b.classList.contains("up") || b.classList.contains("done"))
          return;
        b.classList.add("up");
        open.push(b);
        if (open.length < 2) return;
        moves++;
        $("mv").textContent = "Moves: " + moves;
        const [a, d] = open;
        open = [];
        if (a.textContent === d.textContent) {
          a.className = d.className = "mem done";
          found++;
          if (found === 8) $("mv").textContent = `You won in ${moves} moves!`;
        } else {
          lock = true;
          setTimeout(() => {
            a.classList.remove("up");
            d.classList.remove("up");
            lock = false;
          }, 700);
        }
      }),
  );
  return () => {};
}

/* ---------- TIC-TAC-TOE ---------- */
function ttt(area) {
  const L = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  let b = Array(9).fill(""),
    done = false,
    t;
  area.innerHTML = `<div class="score" id="msg">Your turn</div><div class="ttt">${b.map((_, i) => `<button data-i="${i}" aria-label="Square ${i + 1}"></button>`).join("")}</div><button class="btn" id="again">New game</button>`;
  const cells = [...area.querySelectorAll(".ttt button")];
  const winner = (p) => L.some((l) => l.every((i) => b[i] === p));
  function put(i, p) {
    b[i] = p;
    cells[i].textContent = p;
    cells[i].className = p === "O" ? "o" : "";
  }
  function end() {
    if (winner("X")) return msg("You win!");
    if (winner("O")) return msg("Computer wins");
    if (b.every(Boolean)) return msg("It's a draw");
    return false;
  }
  function msg(m) {
    $("msg").textContent = m;
    done = true;
    return true;
  }
  function find(p) {
    // a square that completes a line for p
    for (const l of L) {
      const e = l.filter((i) => !b[i]);
      if (e.length === 1 && l.filter((i) => b[i] === p).length === 2)
        return e[0];
    }
    return -1;
  }
  function ai() {
    let m = find("O");
    if (m < 0) m = find("X");
    if (m < 0 && !b[4]) m = 4;
    if (m < 0) {
      const f = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      m = f[Math.floor(Math.random() * f.length)];
    }
    put(m, "O");
    if (!end()) $("msg").textContent = "Your turn";
  }
  cells.forEach(
    (el, i) =>
      (el.onclick = () => {
        if (done || b[i]) return;
        put(i, "X");
        if (end()) return;
        $("msg").textContent = "Thinking…";
        t = setTimeout(ai, 350);
      }),
  );
  $("again").onclick = () => {
    clearTimeout(t);
    close();
    open("ttt");
  };
  return () => clearTimeout(t);
}

/* ---------- 2048 ---------- */
function g2048(area) {
  let g,
    score,
    best = 0;
  area.innerHTML = `<div class="score" id="s48">Score: 0</div><div class="g2048" id="b48"></div><div class="score">Arrow keys or swipe.</div>`;
  const slide = (row) => {
    const r = row.filter(Boolean);
    for (let i = 0; i < r.length - 1; i++)
      if (r[i] === r[i + 1]) {
        r[i] *= 2;
        score += r[i];
        r.splice(i + 1, 1);
      }
    while (r.length < 4) r.push(0);
    return r;
  };
  function spawn() {
    const e = [];
    g.forEach((v, i) => {
      if (!v) e.push(i);
    });
    if (e.length)
      g[e[Math.floor(Math.random() * e.length)]] = Math.random() < 0.9 ? 2 : 4;
  }
  function draw() {
    $("b48").innerHTML = g
      .map(
        (v) =>
          `<div style="${v ? `background:hsl(${(Math.log2(v) * 35 + 20) % 360} 80% 62%)` : ""}">${v || ""}</div>`,
      )
      .join("");
    $("s48").textContent = "Score: " + score;
  }
  function canMove() {
    if (g.includes(0)) return true;
    return g.some(
      (v, i) => (i % 4 < 3 && v === g[i + 1]) || (i < 12 && v === g[i + 4]),
    );
  }
  function move(d) {
    // d: 0 left, 1 right, 2 up, 3 down
    const old = g.join();
    for (let k = 0; k < 4; k++) {
      const idx = [0, 1, 2, 3].map((j) => (d < 2 ? k * 4 + j : j * 4 + k));
      let row = idx.map((i) => g[i]);
      if (d % 2) row.reverse();
      row = slide(row);
      if (d % 2) row.reverse();
      idx.forEach((i, j) => (g[i] = row[j]));
    }
    if (g.join() !== old) spawn();
    draw();
    if (!canMove()) $("s48").textContent = "No moves left! Score: " + score;
  }
  const keys = {
    ArrowLeft: 0,
    a: 0,
    ArrowRight: 1,
    d: 1,
    ArrowUp: 2,
    w: 2,
    ArrowDown: 3,
    s: 3,
  };
  const onKey = (e) => {
    if (e.key in keys) {
      e.preventDefault();
      move(keys[e.key]);
    }
  };
  let sx, sy;
  const ts = (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  };
  const te = (e) => {
    const dx = e.changedTouches[0].clientX - sx,
      dy = e.changedTouches[0].clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 0) : dy > 0 ? 3 : 2);
  };
  g = Array(16).fill(0);
  score = 0;
  spawn();
  spawn();
  draw();
  document.addEventListener("keydown", onKey);
  $("b48").addEventListener("touchstart", ts, { passive: true });
  $("b48").addEventListener("touchend", te);
  return () => document.removeEventListener("keydown", onKey);
}

/* ---------- MINESWEEPER ---------- */
function mines(area) {
  const N = 9,
    M = 10;
  let cells,
    placed,
    over,
    flagMode = false,
    revealed;
  area.innerHTML = `<div class="score" id="ms">Mines: ${M}</div><div class="mines" id="mb"></div>
  <button class="btn" id="fl">Flag mode: off</button><div class="score">Right-click or use flag mode to mark mines.</div>`;
  const nb = (i) => {
    const x = i % N,
      y = Math.floor(i / N),
      o = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const a = x + dx,
          b = y + dy;
        if ((dx || dy) && a >= 0 && b >= 0 && a < N && b < N) o.push(b * N + a);
      }
    return o;
  };
  const btns = [];
  $("mb").innerHTML = Array.from(
    { length: N * N },
    (_, i) => `<button data-i="${i}" aria-label="Square"></button>`,
  ).join("");
  $("mb")
    .querySelectorAll("button")
    .forEach((b) => btns.push(b));
  function reset() {
    cells = Array.from({ length: N * N }, () => ({
      m: false,
      r: false,
      f: false,
      n: 0,
    }));
    placed = false;
    over = false;
    revealed = 0;
    btns.forEach((b) => {
      b.textContent = "";
      b.className = "";
    });
    $("ms").textContent = "Mines: " + M;
  }
  function place(safe) {
    let n = 0;
    while (n < M) {
      const i = Math.floor(Math.random() * N * N);
      if (i !== safe && !cells[i].m) {
        cells[i].m = true;
        n++;
      }
    }
    cells.forEach((c, i) => (c.n = nb(i).filter((j) => cells[j].m).length));
    placed = true;
  }
  function reveal(i) {
    const c = cells[i];
    if (c.r || c.f) return;
    c.r = true;
    revealed++;
    btns[i].className = "r";
    btns[i].textContent = c.n || "";
    if (!c.n) nb(i).forEach(reveal);
  }
  function lose() {
    over = true;
    cells.forEach((c, i) => {
      if (c.m) {
        btns[i].textContent = "💣";
        btns[i].className = "x";
      }
    });
    $("ms").textContent = "Boom! Click New game to retry.";
  }
  function flag(i) {
    const c = cells[i];
    if (c.r) return;
    c.f = !c.f;
    btns[i].textContent = c.f ? "🚩" : "";
  }
  $("mb").onclick = (e) => {
    const b = e.target.closest("button");
    if (!b || over) return;
    const i = +b.dataset.i;
    if (flagMode) return flag(i);
    if (cells[i].f) return;
    if (!placed) place(i);
    if (cells[i].m) return lose();
    reveal(i);
    if (revealed === N * N - M) {
      over = true;
      $("ms").textContent = "You cleared the board!";
    }
  };
  $("mb").oncontextmenu = (e) => {
    e.preventDefault();
    const b = e.target.closest("button");
    if (b && !over) flag(+b.dataset.i);
  };
  $("fl").onclick = () => {
    flagMode = !flagMode;
    $("fl").textContent = "Flag mode: " + (flagMode ? "on" : "off");
  };
  const nw = document.createElement("button");
  nw.className = "btn";
  nw.textContent = "New game";
  nw.onclick = reset;
  area.appendChild(nw);
  reset();
  return () => {};
}

/* ---------- FLAPPY DOT ---------- */
function flappy(area) {
  const W = 320,
    H = 420,
    G = 150; // G = size of the gap
  const GRAVITY = 0.2,
    FLAP = -4.4,
    MAXFALL = 4.5,
    SPEED = 1.5,
    SPACING = 190;
  area.innerHTML = `<div class="score" id="fs">Score: 0</div><canvas width="${W}" height="${H}"></canvas><div class="score">Space, click or tap to flap.</div>`;
  const cv = area.querySelector("canvas"),
    c = cv.getContext("2d");
  let y,
    v,
    pipes,
    score,
    over,
    started,
    raf,
    last = 0;
  function reset() {
    y = H / 2;
    v = 0;
    pipes = [];
    score = 0;
    over = false;
    started = false;
    $("fs").textContent = "Score: 0";
  }
  function flap() {
    if (over) {
      reset();
      return;
    }
    started = true;
    v = FLAP;
  }
  function loop(t) {
    // dt keeps the speed the same on 60Hz and 120Hz+ screens
    const dt = Math.min((t - last) / 16.67 || 1, 2.5);
    last = t;
    if (started && !over) {
      v = Math.min(v + GRAVITY * dt, MAXFALL);
      y += v * dt;
      const lastPipe = pipes[pipes.length - 1];
      if (!lastPipe || lastPipe.x < W - SPACING)
        pipes.push({
          x: W,
          gap: 50 + Math.random() * (H - G - 100),
          ok: false,
        });
      pipes.forEach((p) => (p.x -= SPEED * dt));
      pipes = pipes.filter((p) => p.x > -50);
      for (const p of pipes) {
        if (!p.ok && p.x + 44 < 80) {
          p.ok = true;
          score++;
          $("fs").textContent = "Score: " + score;
        }
        if (
          80 + 8 > p.x &&
          80 - 8 < p.x + 44 &&
          (y - 8 < p.gap || y + 8 > p.gap + G)
        )
          over = true;
      }
      if (y < 8 || y > H - 8) over = true;
    } else if (!started) {
      y = H / 2 + Math.sin(t / 300) * 6; // gentle bob before the first tap
    }
    c.fillStyle = "#0d0b21";
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#3ddbb0";
    pipes.forEach((p) => {
      c.fillRect(p.x, 0, 44, p.gap);
      c.fillRect(p.x, p.gap + G, 44, H);
    });
    c.fillStyle = "#ffd23f";
    c.beginPath();
    c.arc(80, y, 10, 0, 7);
    c.fill();
    c.textAlign = "center";
    c.fillStyle = "#f3f1ff";
    c.font = "800 22px sans-serif";
    if (!started) c.fillText("Tap to start", W / 2, H / 2 + 60);
    if (over) {
      c.fillText("Game over: " + score, W / 2, H / 2 - 10);
      c.font = "15px sans-serif";
      c.fillText("Tap to try again", W / 2, H / 2 + 18);
    }
    raf = requestAnimationFrame(loop);
  }
  const onKey = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      flap();
    }
  };
  cv.addEventListener("pointerdown", flap);
  document.addEventListener("keydown", onKey);
  reset();
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("keydown", onKey);
  };
}

/* ---------- WHACK-A-MOLE ---------- */
function mole(area) {
  let score = 0,
    left = 30,
    cur = -1,
    tm,
    mv;
  area.innerHTML = `<div class="score" id="mt">Score: 0 | Time: 30</div><div class="moles">${Array.from({ length: 9 }, (_, i) => `<button data-i="${i}" aria-label="Hole ${i + 1}"></button>`).join("")}</div><button class="btn" id="mgo">Start</button>`;
  const holes = [...area.querySelectorAll(".moles button")];
  const info = () => ($("mt").textContent = `Score: ${score} | Time: ${left}`);
  function show() {
    if (cur >= 0) holes[cur].textContent = "";
    let n;
    do n = Math.floor(Math.random() * 9);
    while (n === cur);
    cur = n;
    holes[n].textContent = "🐹";
  }
  function end() {
    clearInterval(tm);
    clearInterval(mv);
    if (cur >= 0) holes[cur].textContent = "";
    cur = -1;
    $("mt").textContent = `Time's up! You hit ${score}.`;
    $("mgo").style.display = "";
  }
  holes.forEach(
    (h, i) =>
      (h.onclick = () => {
        if (i === cur && left > 0) {
          score++;
          h.textContent = "💥";
          cur = -1;
          info();
          setTimeout(() => {
            if (cur !== i) h.textContent = "";
          }, 200);
        }
      }),
  );
  $("mgo").onclick = () => {
    score = 0;
    left = 30;
    info();
    $("mgo").style.display = "none";
    show();
    mv = setInterval(show, 750);
    tm = setInterval(() => {
      left--;
      info();
      if (left <= 0) end();
    }, 1000);
  };
  return () => {
    clearInterval(tm);
    clearInterval(mv);
  };
}
