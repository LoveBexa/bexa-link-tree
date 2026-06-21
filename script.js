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
})();
