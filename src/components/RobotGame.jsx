import React, { useRef, useEffect, useState, useCallback } from "react";
import "../styles/RobotGame.css";

const SCALE    = 2;
const PX_W     = 16;
const PX_H     = 21;
const BLOB_W   = PX_W * SCALE;
const BLOB_H   = PX_H * SCALE;

// mini-me head: pre-cropped square face asset
const faceImg = new Image();
faceImg.src = "/assets/game-face.png";
const FACE_SRC = { sx: 0, sy: 0, s: 512 };

const GRAVITY        = 0.22;
const JUMP_FORCE     = -7;
const MAX_SPEED      = 2.16;
const FRICTION       = 0.82;
const BLOCK_H        = 8;
const SPAWN_INTERVAL = 22;
const CELL_COUNT     = 5;

function drawBlob(ctx, x, y, frame, onGround, isIdle) {
  const B = "#ccd6f6";

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(SCALE, SCALE);

  const wf  = !isIdle && onGround ? Math.floor(frame / 10) % 2 : 0;
  const bob = isIdle ? (Math.sin(frame * 0.06) > 0.3 ? 0.6 : 0) : 0;
  const sw  = wf === 0 ? 1 : -1;
  const air = !onGround;

  const hx = 8, hy = 5.5 + bob, hr = 5.5;

  ctx.lineCap  = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = B;
  ctx.lineWidth = 1.4;

  // torso
  ctx.beginPath();
  ctx.moveTo(8, hy + hr);
  ctx.lineTo(8, 16 + bob);
  ctx.stroke();

  // arms (swing when walking, raised when airborne)
  ctx.beginPath();
  if (air) {
    ctx.moveTo(8, 12.5 + bob); ctx.lineTo(3.5, 10.5);
    ctx.moveTo(8, 12.5 + bob); ctx.lineTo(12.5, 10.5);
  } else {
    ctx.moveTo(8, 12.5 + bob); ctx.lineTo(4, 14.5 + sw);
    ctx.moveTo(8, 12.5 + bob); ctx.lineTo(12, 14.5 - sw);
  }
  ctx.stroke();

  // legs (alternating walk stride)
  ctx.beginPath();
  if (air) {
    ctx.moveTo(8, 16 + bob); ctx.lineTo(4.5, 19.5);
    ctx.moveTo(8, 16 + bob); ctx.lineTo(11.5, 19.5);
  } else {
    ctx.moveTo(8, 16 + bob); ctx.lineTo(5 - sw, 20.5);
    ctx.moveTo(8, 16 + bob); ctx.lineTo(11 + sw, 20.5);
  }
  ctx.stroke();

  // head: the mini-me face, circle-clipped
  if (faceImg.complete && faceImg.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      faceImg,
      FACE_SRC.sx, FACE_SRC.sy, FACE_SRC.s, FACE_SRC.s,
      hx - hr, hy - hr, hr * 2, hr * 2
    );
    ctx.restore();
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.strokeStyle = B;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  } else {
    ctx.fillStyle = B;
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a192f";
    ctx.fillRect(5.5, hy - 1.5, 1.5, 1.5);
    ctx.fillRect(9, hy - 1.5, 1.5, 1.5);
    ctx.fillRect(6, hy + 2, 4, 1);
  }

  ctx.restore();
}

function drawBlock(ctx, bx, by, bw, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(bx + 2, by + BLOCK_H, bw - 2, 3);
  ctx.fillStyle = "#112240";
  ctx.fillRect(bx, by, bw, BLOCK_H);
  ctx.fillStyle = "rgba(100,255,218,0.6)";
  ctx.fillRect(bx, by, bw, 2);
  ctx.fillStyle = "rgba(100,255,218,0.09)";
  for (let px = bx + 6; px < bx + bw - 3; px += 10)
    ctx.fillRect(px, by + 3, 2, 2);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(bx, by + BLOCK_H - 1, bw, 1);
  ctx.restore();
}

function drawCoconut(ctx, ex, ey, scrollY, idx) {
  const sy = ey - scrollY;
  if (sy < -24 || sy > ctx.canvas.height + 24) return;

  const t   = Date.now() * 0.002 + idx * 1.4;
  const bob = Math.sin(t) * 2;
  const cx  = Math.round(ex + 6);
  const cy  = Math.round(sy + bob + 7);

  ctx.save();

  // soft green glow
  ctx.globalAlpha = 0.12 + 0.06 * Math.sin(t * 1.6);
  ctx.fillStyle = "#7ec850";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 14, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  // straw (pink, with a bendy elbow)
  ctx.strokeStyle = "#ff8fb3";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + 1.5, cy - 6);
  ctx.lineTo(cx + 4.5, cy - 13);
  ctx.lineTo(cx + 7.5, cy - 15);
  ctx.stroke();

  // green coconut body
  ctx.fillStyle = "#4c9e3f";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 8, 8.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // lower shading
  ctx.fillStyle = "#3a7d30";
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy + 2.8, 6, 5.2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // cut top (cream flesh where the straw goes in)
  ctx.fillStyle = "#f5e9d0";
  ctx.beginPath();
  ctx.ellipse(cx + 0.5, cy - 6, 3.4, 2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e3d0ac";
  ctx.beginPath();
  ctx.ellipse(cx + 1.2, cy - 5.8, 1.2, 0.8, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // highlight
  ctx.fillStyle = "#8fd177";
  ctx.beginPath();
  ctx.ellipse(cx - 3.2, cy - 2.5, 2.2, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function generateCellLayout(nb, vw, avoidZones = []) {
  const clearZone = (docY) => {
    let y = docY;
    for (let pass = 0; pass < 8; pass++) {
      const hit = avoidZones.find((z) => y - 20 < z.bot && y + BLOCK_H + 4 > z.top);
      if (!hit) break;
      y = hit.bot + 10;
    }
    return y;
  };

  const cLeft  = Math.max(0, (vw - 1000) / 2);
  const cRight = Math.min(vw - 40, cLeft + 1000);

  const yZones = [
    [nb + 400,  nb + 620 ],
    [nb + 1000, nb + 1280],
    [nb + 1780, nb + 2100],
    [nb + 2700, nb + 3060],
    [nb + 3640, nb + 4160],
  ];

  const xTiers = [
    50,
    Math.round(cLeft + 90),
    Math.round(vw / 2 - 20),
    Math.round(cRight - 180),
    Math.min(Math.round(vw * 0.88), vw - 100),
  ];
  const shuffled = [...xTiers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const cells       = [];
  const extraLedges = [];
  const mk = (x, docY, w) => ({
    x, docY, w, isSpawn: false, isGoal: false, alpha: 0, revealed: false,
  });

  yZones.forEach(([yMin, yMax], i) => {
    const ledgeDocY = clearZone(yMin + Math.random() * (yMax - yMin));
    const cellX     = shuffled[i];
    const approachY = ledgeDocY + 80;

    cells.push({ x: cellX, docY: ledgeDocY - 16, collected: false });
    extraLedges.push(mk(cellX - 8, ledgeDocY, 72));

    if (cellX <= 230) return;

    let x     = 230;
    let count = 0;
    const maxChain = cellX > cRight - 20 ? 14 : 8;
    while (x + 80 < cellX && count < maxChain) {
      extraLedges.push(mk(x, approachY, 68));
      x    += 90;
      count += 1;
    }
  });

  return { cells, extraLedges };
}

const PLATFORM_SELECTORS = [
  ".section-title", ".intro-title", ".intro-desc",
  ".intro-contact", ".joblist-job-title", ".joblist-job-company",
  ".card-title", ".ending-credits",
  "h3", "p", "li",
];

function getNavbarBottom() {
  const nb = document.querySelector(".navbar");
  return nb ? nb.getBoundingClientRect().bottom : 60;
}

const RobotGame = ({ active }) => {
  const canvasRef    = useRef(null);
  const animRef      = useRef(null);
  const blobRef      = useRef(null);
  const blocksRef    = useRef([]);
  const cellsRef     = useRef([]);
  const keysRef      = useRef(new Set());
  const jumpLatchRef = useRef(false);
  const frameRef     = useRef(0);
  const popupsRef    = useRef([]);

  const [gameStatus,      setGameStatus]      = useState("playing");
  const [restartKey,      setRestartKey]      = useState(0);
  const [cellsCollected,  setCellsCollected]  = useState(0);

  const restart = useCallback(() => setRestartKey((k) => k + 1), []);

  const getPlatforms = useCallback(() => {
    const scrollY   = window.scrollY;
    const platforms = blocksRef.current
      .filter((b) => b.alpha > 0.5)
      .map((b) => ({ x: b.x, y: b.docY, w: b.w }));
    PLATFORM_SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 60 || r.height > 100) return;
        const docTop = r.top + scrollY;
        if (docTop > scrollY + window.innerHeight + 200 || docTop + r.height < scrollY - 200) return;
        platforms.push({ x: r.left, y: docTop, w: r.width });
      });
    });
    return platforms;
  }, []);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(animRef.current); return; }

    window.scrollTo(0, 0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx     = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const nb = getNavbarBottom();
    frameRef.current = 0;
    popupsRef.current = [];
    setCellsCollected(0);

    const allDomZones  = [];
    const textZones    = [];
    PLATFORM_SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 60 || r.height < 4) return;
        allDomZones.push({ top: r.top - 4, bot: r.bottom + 4 });
        if (r.height <= 55) textZones.push({ top: r.top - 4, bot: r.bottom + 4 });
      });
    });
    const adjustForText = (docY) => {
      let y = docY;
      for (let i = 0; i < 4; i++) {
        const hit = textZones.find((z) => y < z.bot && y + BLOCK_H > z.top);
        if (!hit) break;
        y = hit.bot + 5;
      }
      return y;
    };

    const { cells, extraLedges } = generateCellLayout(nb, canvas.width, allDomZones);
    cellsRef.current = cells;

    const mkS = (b) => ({ ...b, isSpawn: false, isGoal: false, alpha: 0, revealed: false });

    const rawScatter = [
      { x: 20,  docY: nb + 320  }, { x: 120, docY: nb + 355  },
      { x: 200, docY: nb + 570  }, { x: 110, docY: nb + 605  }, { x: 20,  docY: nb + 640  },
      { x: 20,  docY: nb + 850  }, { x: 120, docY: nb + 885  },
      { x: 210, docY: nb + 1100 }, { x: 110, docY: nb + 1135 }, { x: 20,  docY: nb + 1170 },
      { x: 20,  docY: nb + 1380 }, { x: 130, docY: nb + 1415 },
      { x: 200, docY: nb + 1640 }, { x: 110, docY: nb + 1675 }, { x: 20,  docY: nb + 1710 },
      { x: 20,  docY: nb + 1920 }, { x: 120, docY: nb + 1955 },
      { x: 210, docY: nb + 2180 }, { x: 110, docY: nb + 2215 }, { x: 20,  docY: nb + 2250 },
      { x: 20,  docY: nb + 2460 }, { x: 130, docY: nb + 2495 },
      { x: 200, docY: nb + 2720 }, { x: 110, docY: nb + 2755 }, { x: 20,  docY: nb + 2790 },
      { x: 20,  docY: nb + 3000 }, { x: 120, docY: nb + 3035 },
      { x: 210, docY: nb + 3260 }, { x: 110, docY: nb + 3295 }, { x: 20,  docY: nb + 3330 },
      { x: 20,  docY: nb + 3540 }, { x: 130, docY: nb + 3575 },
      { x: 200, docY: nb + 3800 }, { x: 110, docY: nb + 3835 }, { x: 20,  docY: nb + 3870 },
      { x: 20,  docY: nb + 4080 }, { x: 120, docY: nb + 4115 },
      { x: 210, docY: nb + 4340 }, { x: 110, docY: nb + 4375 }, { x: 20,  docY: nb + 4410 },
      { x: 20,  docY: nb + 4620 }, { x: 130, docY: nb + 4655 },
      { x: 200, docY: nb + 4880 }, { x: 110, docY: nb + 4915 }, { x: 20,  docY: nb + 4950 },
    ].map((b) => ({ ...b, w: 72 }));

    blocksRef.current = [
      { x: 30,  docY: nb + 200, w: 80, isSpawn: true, spawnIdx: 0, isGoal: false, alpha: 0, revealed: false },
      { x: 170, docY: nb + 155, w: 76, isSpawn: true, spawnIdx: 1, isGoal: false, alpha: 0, revealed: false },
      { x: 315, docY: nb + 235, w: 76, isSpawn: true, spawnIdx: 2, isGoal: false, alpha: 0, revealed: false },
      { x: 450, docY: nb + 175, w: 76, isSpawn: true, spawnIdx: 3, isGoal: false, alpha: 0, revealed: false },
      ...[...rawScatter]
        .map((b) => ({ ...b, docY: adjustForText(b.docY) }))
        .map(mkS),
      ...extraLedges,
    ];

    const b0 = blocksRef.current[0];
    blobRef.current = {
      x:        Math.round(b0.x + b0.w / 2 - BLOB_W / 2),
      docY:     b0.docY - BLOB_H - 280,
      vx:       0,
      vy:       0,
      onGround: false,
      frame:    0,
      status:   "playing",
      spawning: true,
      bounces:  0,
    };

    setGameStatus("playing");

    const onKeyDown = (e) => {
      if (e.code === "Space" && blobRef.current?.status === "dead") {
        restart();
        return;
      }
      keysRef.current.add(e.code);
      if (["Space","ArrowUp","ArrowLeft","ArrowRight","ArrowDown"].includes(e.code))
        e.preventDefault();
    };
    const onKeyUp = (e) => keysRef.current.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    const loop = () => {
      const a = blobRef.current;
      if (!a || a.status !== "playing") return;

      if (canvas.width  !== window.innerWidth)  canvas.width  = window.innerWidth;
      if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;

      const scrollY = window.scrollY;
      frameRef.current++;

      blocksRef.current.forEach((b) => {
        if (!b.revealed) {
          if (b.isSpawn) {
            if (frameRef.current >= b.spawnIdx * SPAWN_INTERVAL) b.revealed = true;
          } else {
            if (b.docY - scrollY < canvas.height + 80) b.revealed = true;
          }
        }
        if (b.revealed && b.alpha < 0.62) b.alpha = Math.min(b.alpha + 0.05, 0.62);
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blocksRef.current.forEach((b) => {
        if (b.alpha <= 0) return;
        const sy = b.docY - scrollY;
        if (sy > -BLOCK_H - 4 && sy < canvas.height + 4)
          drawBlock(ctx, b.x, sy, b.w, b.alpha);
      });

      cellsRef.current.forEach((cell, idx) => {
        if (!cell.collected) drawCoconut(ctx, cell.x, cell.docY, scrollY, idx);
      });

      // "ty hehe" pop-ups: rise and fade after a coconut is collected
      popupsRef.current = popupsRef.current.filter((p) => frameRef.current - p.start < 70);
      popupsRef.current.forEach((p) => {
        const age   = frameRef.current - p.start;
        const alpha = age < 8 ? age / 8 : Math.max(0, 1 - (age - 8) / 62);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = "600 15px 'NTR', 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffb3d1";
        ctx.fillText("ty hehe", p.x, p.docY - scrollY - age * 0.35);
        ctx.restore();
      });

      if (a.spawning) {
        a.vy = Math.min(a.vy + GRAVITY, 8);
        a.docY += a.vy;
        a.frame++;

        const b = blocksRef.current[0];
        if (b.alpha > 0.5) {
          const rBot = a.docY + BLOB_H, prev = rBot - a.vy;
          if (a.x + BLOB_W > b.x && a.x < b.x + b.w &&
              prev <= b.docY + 4 && rBot >= b.docY && a.vy > 0) {
            a.docY = b.docY - BLOB_H;
            a.bounces++;
            if      (a.bounces === 1) { a.vy = -4.5; }
            else if (a.bounces === 2) { a.vy = -1.8; }
            else    { a.vy = 0; a.onGround = true; a.spawning = false; }
          }
        }

        const sy = a.docY - scrollY;
        if (sy > -BLOB_H && sy < canvas.height)
          drawBlob(ctx, a.x, sy, a.frame, a.onGround, false);
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      const keys  = keysRef.current;
      const left  = keys.has("ArrowLeft")  || keys.has("KeyA");
      const right = keys.has("ArrowRight") || keys.has("KeyD");
      const jump  = keys.has("Space") || keys.has("ArrowUp") || keys.has("KeyW");

      if (left)       a.vx = Math.max(a.vx - 0.38, -MAX_SPEED);
      else if (right) a.vx = Math.min(a.vx + 0.38,  MAX_SPEED);
      else            a.vx *= FRICTION;

      if (jump && a.onGround && !jumpLatchRef.current) {
        a.vy = JUMP_FORCE; a.onGround = false; jumpLatchRef.current = true;
      }
      if (!jump) jumpLatchRef.current = false;

      a.vy = Math.min(a.vy + GRAVITY, 8);
      a.x += a.vx;
      a.docY += a.vy;
      a.frame++;

      if (a.x < 0)                      { a.x = 0;                      a.vx = 0; }
      if (a.x + BLOB_W > canvas.width)  { a.x = canvas.width - BLOB_W;  a.vx = 0; }

      const platforms = getPlatforms();
      a.onGround = false;
      for (const p of platforms) {
        const rBot = a.docY + BLOB_H, prev = rBot - a.vy;
        if (a.x + BLOB_W > p.x + 2 && a.x < p.x + p.w - 2 &&
            prev <= p.y + 5 && rBot >= p.y - 1 && a.vy >= 0) {
          a.docY = p.y - BLOB_H; a.vy = 0; a.onGround = true; break;
        }
      }

      if (a.docY - scrollY > canvas.height + 100) {
        a.status = "dead"; setGameStatus("dead"); return;
      }

      const aCx = a.x + BLOB_W / 2;
      const aCy = a.docY + BLOB_H / 2;
      cellsRef.current.forEach((cell) => {
        if (cell.collected) return;
        const cCx = cell.x + 6;
        const cCy = cell.docY + 8;
        if (Math.abs(aCx - cCx) < 24 && Math.abs(aCy - cCy) < 26) {
          cell.collected = true;
          popupsRef.current.push({ x: cCx, docY: cCy - 16, start: frameRef.current });
          setCellsCollected((c) => c + 1);
        }
      });

      if (cellsRef.current.length > 0 && cellsRef.current.every((c) => c.collected)) {
        a.status = "won"; setGameStatus("won"); return;
      }

      const sy     = a.docY - scrollY;
      const isIdle = a.onGround && Math.abs(a.vx) < 0.25;
      if (sy > -BLOB_H && sy < canvas.height + 40)
        drawBlob(ctx, a.x, sy, a.frame, a.onGround, isIdle);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
      window.removeEventListener("resize",  onResize);
      keysRef.current.clear();
      jumpLatchRef.current = false;
    };
  }, [active, restartKey, getPlatforms, restart]);

  if (!active) return null;

  return (
    <>
      <canvas ref={canvasRef} className="robot-game-canvas" />

      {gameStatus === "playing" && (
        <div className="cell-counter">
          <svg
            className="cell-counter-pip"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M9 8 L11.5 2.5 L14 1"
              stroke="#ff8fb3"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="8" cy="9.2" rx="6.2" ry="6.6" fill="#4c9e3f" />
            <ellipse cx="9" cy="11.2" rx="4.4" ry="3.8" fill="#3a7d30" />
            <ellipse cx="8.5" cy="4.6" rx="2.6" ry="1.5" fill="#f5e9d0" />
            <ellipse cx="5.6" cy="7.4" rx="1.6" ry="2.2" fill="#8fd177" />
          </svg>
          <span className="cell-counter-text">{cellsCollected} / {CELL_COUNT}</span>
        </div>
      )}

      {gameStatus === "dead" && (
        <div className="robot-game-status robot-game-status--dead">
          <div className="robot-game-status-title">you fell</div>
          <div className="robot-game-status-sub">the coconuts roll further away</div>
          <button className="robot-game-status-btn" onClick={restart}>try again</button>
          <div className="robot-game-status-hint">or press space</div>
        </div>
      )}

      {gameStatus === "won" && (
        <div className="robot-game-status robot-game-status--won">
          <div className="robot-game-status-title">coconut haul complete</div>
          <div className="robot-game-status-sub">all {CELL_COUNT} coconuts collected</div>
          <button className="robot-game-status-btn" onClick={restart}>play again</button>
        </div>
      )}
    </>
  );
};

export default RobotGame;
