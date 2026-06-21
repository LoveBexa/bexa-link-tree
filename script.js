(function () {
  const container = document.getElementById("stars");
  if (container) {
    for (let i = 0; i < 25; i++) {
      const star = document.createElement("div");
      star.className = "bx-star-dot";
      const size = Math.random() < 0.3 ? 3 : 2;
      star.style.width = size + "px";
      star.style.height = size + "px";
      star.style.top = Math.random() * 60 + "%";
      star.style.left = Math.random() * 100 + "%";
      star.style.animation = "twinkle " + (1.5 + Math.random() * 3) + "s ease-in-out infinite";
      star.style.animationDelay = Math.random() * 3 + "s";
      star.style.opacity = String(0.4 + Math.random() * 0.6);
      container.appendChild(star);
    }
  }

  /* Start menu */
  const startBtn = document.getElementById("startBtn");
  const startMenu = document.getElementById("startMenu");

  function closeStartMenu() {
    if (!startMenu || !startBtn) return;
    startMenu.hidden = true;
    startBtn.classList.remove("is-open");
    startBtn.setAttribute("aria-expanded", "false");
  }

  function toggleStartMenu() {
    if (!startMenu || !startBtn) return;
    const isOpen = !startMenu.hidden;
    if (isOpen) {
      closeStartMenu();
    } else {
      startMenu.hidden = false;
      startBtn.classList.add("is-open");
      startBtn.setAttribute("aria-expanded", "true");
    }
  }

  if (startBtn && startMenu) {
    startBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleStartMenu();
    });

    startMenu.addEventListener("click", function () {
      closeStartMenu();
    });

    document.addEventListener("click", function (e) {
      if (!startMenu.hidden && !startMenu.contains(e.target) && e.target !== startBtn) {
        closeStartMenu();
      }
    });
  }

  /* Window controls */
  let backdrop = null;
  let maximizedWindow = null;

  function getBackdrop() {
    if (!backdrop) {
      backdrop = document.createElement("button");
      backdrop.type = "button";
      backdrop.className = "bx-maximize-backdrop";
      backdrop.hidden = true;
      backdrop.setAttribute("aria-label", "Close maximized window");
      backdrop.addEventListener("click", function () {
        if (maximizedWindow) restoreWindow(maximizedWindow);
      });
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  function rememberWindowPlacement(windowEl) {
    if (!windowEl._bxParent) {
      windowEl._bxParent = windowEl.parentNode;
      windowEl._bxNext = windowEl.nextSibling;
    }
  }

  function restoreWindowPlacement(windowEl) {
    if (!windowEl._bxParent) return;
    if (windowEl._bxNext) {
      windowEl._bxParent.insertBefore(windowEl, windowEl._bxNext);
    } else {
      windowEl._bxParent.appendChild(windowEl);
    }
  }

  function restoreWindow(windowEl) {
    windowEl.classList.remove("is-maximized");
    restoreWindowPlacement(windowEl);

    const maxBtn = windowEl.querySelector(".bx-window-btn-maximize");
    if (maxBtn) maxBtn.textContent = "□";

    if (maximizedWindow === windowEl) {
      maximizedWindow = null;
      getBackdrop().hidden = true;
      document.body.classList.remove("bx-has-maximized");
    }
  }

  function maximizeWindow(windowEl) {
    if (maximizedWindow && maximizedWindow !== windowEl) {
      restoreWindow(maximizedWindow);
    }

    rememberWindowPlacement(windowEl);
    document.body.appendChild(windowEl);

    windowEl.classList.remove("is-minimized");
    windowEl.classList.add("is-maximized");
    maximizedWindow = windowEl;

    const maxBtn = windowEl.querySelector(".bx-window-btn-maximize");
    if (maxBtn) maxBtn.textContent = "❐";

    getBackdrop().hidden = false;
    document.body.classList.add("bx-has-maximized");
  }

  document.querySelectorAll(".bx-window").forEach(function (windowEl) {
    const minimizeBtn = windowEl.querySelector(".bx-window-btn-minimize");
    const maximizeBtn = windowEl.querySelector(".bx-window-btn-maximize");
    const closeBtn = windowEl.querySelector(".bx-window-btn-close");
    const titlebar = windowEl.querySelector(".bx-window-titlebar");

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (windowEl.classList.contains("is-maximized")) {
          restoreWindow(windowEl);
        }
        windowEl.classList.toggle("is-minimized");
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (windowEl.classList.contains("is-maximized")) {
          restoreWindow(windowEl);
        } else {
          maximizeWindow(windowEl);
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (windowEl.classList.contains("is-maximized")) {
          restoreWindow(windowEl);
          return;
        }
        windowEl.classList.add("is-closed");
        windowEl.classList.remove("is-minimized");
      });
    }

    if (titlebar) {
      titlebar.addEventListener("click", function (e) {
        if (
          windowEl.classList.contains("is-minimized") &&
          !e.target.closest(".bx-window-btn")
        ) {
          windowEl.classList.remove("is-minimized");
        }
      });

      titlebar.addEventListener("dblclick", function () {
        if (windowEl.classList.contains("is-minimized")) {
          windowEl.classList.remove("is-minimized");
        } else if (!windowEl.classList.contains("is-closed")) {
          if (windowEl.classList.contains("is-maximized")) {
            restoreWindow(windowEl);
          } else {
            maximizeWindow(windowEl);
          }
        }
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (maximizedWindow) {
        restoreWindow(maximizedWindow);
      }
      closeStartMenu();
    }
  });

  /* About page — scattered desktop windows + drag */
  const aboutGrid = document.querySelector(".bx-page-about .bx-about-grid");
  const SCATTER_BREAKPOINT = "(min-width: 720px)";

  if (aboutGrid) {
    const scatterMq = window.matchMedia(SCATTER_BREAKPOINT);
    const SCATTER_PADDING = 20;
    const SCATTER_GAP = 40;
    const SCATTER_MAX_JITTER = 10;
    const SCATTER_MAX_ROTATE = 1;
    const SCATTER_MIN_GAP = 28;
    let dragState = null;
    let resizeTimer = null;

    function getAboutWindows() {
      return Array.from(aboutGrid.querySelectorAll(".bx-window"));
    }

    function bringWindowToFront(windowEl) {
      const windows = getAboutWindows().filter(function (w) {
        return !w.classList.contains("is-closed");
      });
      const maxZ = windows.reduce(function (max, w) {
        return Math.max(max, parseInt(w.style.zIndex, 10) || 10);
      }, 10);
      windowEl.style.zIndex = String(maxZ + 1);
    }

    function clampWindowPosition(windowEl) {
      const padding = 12;
      const gridWidth = aboutGrid.clientWidth;
      const gridHeight = aboutGrid.clientHeight;
      const width = windowEl.offsetWidth;
      const height = windowEl.offsetHeight;
      let left = parseFloat(windowEl.style.left) || 0;
      let top = parseFloat(windowEl.style.top) || 0;

      left = Math.max(padding, Math.min(left, gridWidth - width - padding));
      top = Math.max(padding, Math.min(top, gridHeight - height - padding));

      windowEl.style.left = left + "px";
      windowEl.style.top = top + "px";
    }

    function updateScatterHeight() {
      if (!aboutGrid.classList.contains("bx-about-scatter")) return;

      let maxBottom = 0;
      getAboutWindows().forEach(function (windowEl) {
        if (windowEl.classList.contains("is-closed")) return;
        const top = parseFloat(windowEl.style.top) || 0;
        maxBottom = Math.max(maxBottom, top + windowEl.offsetHeight);
      });

      aboutGrid.style.minHeight = Math.max(window.innerHeight * 0.72, maxBottom + 24) + "px";
    }

    function clearScatterStyles() {
      aboutGrid.classList.remove("bx-about-scatter");
      aboutGrid.style.minHeight = "";
      getAboutWindows().forEach(function (windowEl) {
        windowEl.style.left = "";
        windowEl.style.top = "";
        windowEl.style.zIndex = "";
        windowEl.style.removeProperty("--bx-window-rotate");
      });
    }

    function getWindowRect(left, top, windowEl) {
      return {
        left: left,
        top: top,
        width: windowEl.offsetWidth,
        height: windowEl.offsetHeight,
      };
    }

    function rectsOverlap(a, b, gap) {
      return !(
        a.left + a.width + gap <= b.left ||
        b.left + b.width + gap <= a.left ||
        a.top + a.height + gap <= b.top ||
        b.top + b.height + gap <= a.top
      );
    }

    function buildScatterLayout(windows, gridWidth) {
      const sizes = windows.map(function (windowEl) {
        return {
          el: windowEl,
          width: windowEl.offsetWidth || 320,
          height: windowEl.offsetHeight || 240,
        };
      });

      if (sizes.length === 0) return [];

      const rotations = [-0.8, 0.9, 0.6, -0.7];
      const rowOffsets = [0, 10, 0, 8];
      const placements = [];

      function addPlacement(index, left, top) {
        const size = sizes[index];
        if (!size) return;

        placements.push({
          el: size.el,
          left: left,
          top: top,
          rotate: rotations[index] || 0,
          width: size.width,
          height: size.height,
        });
      }

      if (sizes.length >= 4 && gridWidth >= 720) {
        const topRowWidth = sizes[0].width + SCATTER_GAP + sizes[1].width;
        const bottomRowWidth = sizes[2].width + SCATTER_GAP + sizes[3].width;
        const fitsTwoColumns =
          topRowWidth <= gridWidth - SCATTER_PADDING * 2 &&
          bottomRowWidth <= gridWidth - SCATTER_PADDING * 2;

        if (fitsTwoColumns) {
          const topStartX = Math.max(SCATTER_PADDING, (gridWidth - topRowWidth) / 2);
          const bottomStartX = Math.max(SCATTER_PADDING, (gridWidth - bottomRowWidth) / 2);

          addPlacement(0, topStartX, SCATTER_PADDING);
          addPlacement(1, topStartX + sizes[0].width + SCATTER_GAP, SCATTER_PADDING + rowOffsets[1]);

          const rowBreak = Math.max(
            SCATTER_PADDING + sizes[0].height + rowOffsets[0],
            SCATTER_PADDING + rowOffsets[1] + sizes[1].height
          );

          addPlacement(2, bottomStartX, rowBreak + SCATTER_GAP);
          addPlacement(
            3,
            bottomStartX + sizes[2].width + SCATTER_GAP,
            rowBreak + SCATTER_GAP + rowOffsets[3]
          );
        }
      }

      if (placements.length === 0) {
        let currentTop = SCATTER_PADDING;
        sizes.forEach(function (size, index) {
          const stagger = index % 2 === 1 ? Math.min(48, gridWidth * 0.08) : 0;
          addPlacement(index, SCATTER_PADDING + stagger, currentTop);
          currentTop += size.height + SCATTER_GAP;
        });
      }

      return placements;
    }

    function resolveScatterOverlaps(placements, gridWidth) {
      const maxLeft = function (width) {
        return Math.max(SCATTER_PADDING, gridWidth - width - SCATTER_PADDING);
      };

      placements.forEach(function (placement, index) {
        let attempts = 0;

        while (attempts < 30) {
          let moved = false;

          for (let i = 0; i < placements.length; i++) {
            if (i === index) continue;

            const other = placements[i];
            const selfRect = getWindowRect(placement.left, placement.top, placement.el);
            const otherRect = {
              left: other.left,
              top: other.top,
              width: other.width,
              height: other.height,
            };

            if (!rectsOverlap(selfRect, otherRect, SCATTER_MIN_GAP)) continue;

            const pushRight = other.left + other.width + SCATTER_MIN_GAP;
            const pushDown = other.top + other.height + SCATTER_MIN_GAP;

            if (pushRight + placement.width <= gridWidth - SCATTER_PADDING) {
              placement.left = pushRight;
            } else {
              placement.top = pushDown;
              placement.left = Math.min(placement.left, maxLeft(placement.width));
            }

            moved = true;
            break;
          }

          if (!moved) break;
          attempts++;
        }

        placement.left = Math.max(
          SCATTER_PADDING,
          Math.min(placement.left, maxLeft(placement.width))
        );
        placement.top = Math.max(SCATTER_PADDING, placement.top);
      });

      return placements;
    }

    function applyScatterPlacement(placement, index) {
      const jitterX = (Math.random() - 0.5) * SCATTER_MAX_JITTER;
      const jitterY = (Math.random() - 0.5) * SCATTER_MAX_JITTER;
      const rotate =
        placement.rotate + (Math.random() - 0.5) * (SCATTER_MAX_ROTATE * 0.4);

      placement.el.style.left = Math.round(placement.left + jitterX) + "px";
      placement.el.style.top = Math.round(placement.top + jitterY) + "px";
      placement.el.style.zIndex = String(10 + index);
      placement.el.style.setProperty("--bx-window-rotate", rotate.toFixed(1) + "deg");
    }

    function scatterAboutWindows() {
      if (!scatterMq.matches) {
        clearScatterStyles();
        return;
      }

      aboutGrid.classList.add("bx-about-scatter");

      const windows = getAboutWindows().filter(function (w) {
        return !w.classList.contains("is-closed");
      });
      const gridWidth = aboutGrid.clientWidth;

      windows.forEach(function (windowEl) {
        void windowEl.offsetWidth;
      });

      let placements = buildScatterLayout(windows, gridWidth);
      placements = resolveScatterOverlaps(placements, gridWidth);

      placements.forEach(function (placement, index) {
        applyScatterPlacement(placement, index);
      });

      updateScatterHeight();
    }

    function getPointerPosition(e) {
      if (e.touches && e.touches.length) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function endDrag() {
      if (!dragState) return;
      dragState.windowEl.classList.remove("is-dragging");
      document.removeEventListener("pointermove", onDragMove);
      document.removeEventListener("pointerup", endDrag);
      document.removeEventListener("pointercancel", endDrag);
      updateScatterHeight();
      dragState = null;
    }

    function onDragMove(e) {
      if (!dragState) return;
      e.preventDefault();

      const point = getPointerPosition(e);
      const dx = point.x - dragState.startX;
      const dy = point.y - dragState.startY;
      const left = dragState.originLeft + dx;
      const top = dragState.originTop + dy;

      dragState.windowEl.style.left = left + "px";
      dragState.windowEl.style.top = top + "px";
      clampWindowPosition(dragState.windowEl);
    }

    getAboutWindows().forEach(function (windowEl) {
      const titlebar = windowEl.querySelector(".bx-window-titlebar");
      if (!titlebar) return;

      titlebar.addEventListener("pointerdown", function (e) {
        if (!scatterMq.matches) return;
        if (e.button !== 0 && e.pointerType !== "touch") return;
        if (e.target.closest(".bx-window-btn")) return;
        if (windowEl.classList.contains("is-maximized") || windowEl.classList.contains("is-closed") || windowEl.classList.contains("is-minimized")) {
          return;
        }

        bringWindowToFront(windowEl);
        const point = getPointerPosition(e);
        dragState = {
          windowEl: windowEl,
          startX: point.x,
          startY: point.y,
          originLeft: parseFloat(windowEl.style.left) || 0,
          originTop: parseFloat(windowEl.style.top) || 0,
        };

        windowEl.classList.add("is-dragging");
        document.addEventListener("pointermove", onDragMove);
        document.addEventListener("pointerup", endDrag);
        document.addEventListener("pointercancel", endDrag);
        e.preventDefault();
      });
    });

    scatterAboutWindows();
    window.addEventListener("load", scatterAboutWindows);

    scatterMq.addEventListener("change", scatterAboutWindows);
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!scatterMq.matches) {
          clearScatterStyles();
          return;
        }

        if (!aboutGrid.classList.contains("bx-about-scatter")) {
          scatterAboutWindows();
          return;
        }

        scatterAboutWindows();
      }, 120);
    });
  }
})();
