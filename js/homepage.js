/* Local interactions for the captured homepage; no Linear application runtime. */
(() => {
  const appCanvas = document.querySelector('.kayak-app-canvas');
  const appFrame = document.getElementById('app-window');
  if (appCanvas && appFrame) {
    const fitDesktop = () => {
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      const width = mobile ? 1320 : 1920;
      const height = mobile ? 720 : 967;
      const scale = appCanvas.clientWidth / width;
      appFrame.style.width = `${width}px`;
      appFrame.style.height = `${height}px`;
      appFrame.style.transform = `scale(${scale})`;
      appCanvas.style.height = `${height * scale}px`;
    };
    new ResizeObserver(fitDesktop).observe(appCanvas);
    window.matchMedia('(max-width: 768px)').addEventListener('change', fitDesktop);
    fitDesktop();
  }

  // The captured image component used a React onLoad callback. Keep its CSS
  // state in sync when those same images are served by this static page.
  document.querySelectorAll('img[data-loaded]').forEach(img => {
    img.dataset.loaded = 'false';
    const markLoaded = () => { if (img.naturalWidth > 0) img.dataset.loaded = 'true'; };
    img.addEventListener('load', markLoaded, { once: true });
    if (img.complete) markLoaded();
  });

  // Restore the captured illustrations' component interactions without the
  // original React runtime. Geometry and motion parameters match the source.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroFilm = document.getElementById('kayak-hero-film');
  if (heroFilm) {
    heroFilm.muted = true;
    let heroInView = false;
    const syncHeroFilm = () => {
      if (heroInView && !document.hidden && !reducedMotion.matches) {
        heroFilm.play().catch(() => {});
      } else {
        heroFilm.pause();
      }
    };
    new IntersectionObserver(entries => {
      heroInView = entries[0].isIntersecting;
      syncHeroFilm();
    }).observe(heroFilm);
    document.addEventListener('visibilitychange', syncHeroFilm);
    reducedMotion.addEventListener('change', syncHeroFilm);
    syncHeroFilm();
  }
  document.querySelectorAll('.GJ9TEa_purposeHitArea').forEach(hitArea => {
    const svg = hitArea.ownerSVGElement;
    const layers = [...svg.querySelectorAll('.GJ9TEa_purposeLift')];
    const setLift = active => {
      layers.forEach((layer, order) => {
        const index = 4 - (order % 5);
        const lifted = index <= active;
        layer.classList.toggle('GJ9TEa_purposeLifted', lifted);
        layer.style.setProperty('--lift-delay', `${lifted ? (active - index) * 0.05 : 0}s`);
        layer.querySelector('.GJ9TEa_purposeEdge')?.setAttribute('stroke',
          index === active || index === 4 ? '#D0D6E0' : '#3E3E44');
      });
    };
    [...hitArea.children].forEach((path, index) => {
      path.addEventListener('pointerenter', () => {
        if (!reducedMotion.matches) setLift(Math.min(index, 3));
      });
    });
    hitArea.addEventListener('pointerleave', () => setLift(-1));
    reducedMotion.addEventListener('change', () => setLift(-1));
  });

  document.querySelectorAll('.GJ9TEa_momentum').forEach(svg => {
    const defaultHeights = [20.529, 34.049, 54.331, 81.373, 128.697, 81.373, 54.331, 34.049, 20.529, 13.768, 10.387, 8.698, 7.852, 7.853, 7.853];
    const anchors = [[254.46, 188.84], [246.01, 193.07], [237.56, 197.29], [229.11, 201.52], [220.66, 205.74], [212.21, 209.97], [203.76, 214.19], [195.31, 218.42], [186.86, 222.65], [178.41, 226.87], [169.96, 231.09], [161.51, 235.32], [153.05, 239.55], [144.6, 243.77], [136.15, 248]];
    const panels = [...svg.children].map((group, index) => ({
      paths: group.children,
      x: anchors[index][0], y: anchors[index][1],
      height: defaultHeights[index], target: defaultHeights[index], velocity: 0,
    }));
    let frame = 0;
    let previousTime = 0;
    const paint = panel => {
      const x = panel.x - 117.416;
      const y = panel.y - 60.643 - panel.height;
      const height = panel.height;
      panel.paths[0].setAttribute('d', `M${x} ${y}a1.44 1.44 0 0 1 1.288 0l115.686 57.843a3.13 3.13 0 0 1 1.73 2.8v${height}a1.44 1.44 0 0 1-.796 1.288l-1.69.845a1.44 1.44 0 0 1-1.288 0l-115.686-57.843a3.13 3.13 0 0 1-1.73-2.8v${-height}c0-.545.308-1.044.796-1.288z`);
      panel.paths[1].setAttribute('d', `M${x + .645} ${y + 2.778}l113.061 56.531a3.38 3.38 0 0 1 1.868 3.023v${Math.max(0, height - 2.336)}`);
    };
    const tick = time => {
      const dt = previousTime ? Math.min((time - previousTime) / 1000, 1 / 30) : 1 / 60;
      previousTime = time;
      let moving = false;
      panels.forEach(panel => {
        // The source uses a spring with damping 18 and mass 1.
        const force = 100 * (panel.target - panel.height) - 18 * panel.velocity;
        panel.velocity += force * dt;
        panel.height += panel.velocity * dt;
        if (Math.abs(panel.target - panel.height) > .01 || Math.abs(panel.velocity) > .01) moving = true;
        else { panel.height = panel.target; panel.velocity = 0; }
        paint(panel);
      });
      frame = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) previousTime = 0;
    };
    const setPointer = pointerX => {
      panels.forEach((panel, index) => {
        const distance = Math.abs(pointerX - (panel.x - 59));
        panel.target = !Number.isFinite(pointerX) ? defaultHeights[index]
          : distance <= 25 ? 128 - distance / 25 * 88
          : distance <= 60 ? 40 - (distance - 25) / 35 * 28 : 12;
      });
      if (!frame) frame = requestAnimationFrame(tick);
    };
    svg.addEventListener('pointermove', event => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = svg.getBoundingClientRect();
      setPointer((event.clientX - bounds.left) / bounds.width * 272);
    });
    svg.addEventListener('pointerleave', () => setPointer(Infinity));
    reducedMotion.addEventListener('change', () => {
      cancelAnimationFrame(frame);
      frame = previousTime = 0;
      panels.forEach((panel, index) => {
        panel.height = panel.target = defaultHeights[index];
        panel.velocity = 0;
        paint(panel);
      });
    });
  });

  const navigation = document.getElementById('navigation-panel');
  const mobileToggle = document.getElementById('mobile-navigation-toggle');
  const triggers = [...document.querySelectorAll('[data-nav-menu]'), mobileToggle];
  let activeMenu = null;

  const productGroups = [
    [['项目与对话', '#intake', '按项目组织任务与对话'], ['电脑控制', '#plan', '操作浏览器与桌面应用']],
    [['扩展与工具', '#ai', '连接办公协同与创意工具'], ['定时任务', '#build', '安排简报、回顾与跟进提醒']],
  ];

  function closeNavigation() {
    navigation.hidden = true;
    navigation.classList.remove('kayak-mobile-navigation');
    triggers.forEach(trigger => trigger?.setAttribute('aria-expanded', 'false'));
    mobileToggle.setAttribute('aria-label', '打开导航');
    document.body.style.overflow = '';
    activeMenu = null;
  }

  function showNavigation(name, trigger, mobile = false) {
    if (activeMenu === name) { closeNavigation(); return; }
    closeNavigation();
    navigation.replaceChildren();
    const nav = document.createElement('nav');
    nav.className = 'kayak-nav-groups';
    nav.setAttribute('aria-label', mobile ? '网站导航' : '产品');
    const groups = mobile ? [productGroups.flat(), [['工作台', '#app-window'], ['核心架构', '#benefits'], ['系统控制', '#plan'], ['工具生态', '#ai'], ['下载', '#download']]] : productGroups;
    groups.forEach((items, index) => {
      const group = document.createElement('div');
      group.className = 'kayak-nav-group';
      if (mobile && index === 0) {
        const heading = document.createElement('span');
        heading.className = 'kayak-nav-group-heading';
        heading.textContent = '产品';
        group.append(heading);
      }
      items.forEach(([label, href, description]) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        if (description) {
          const detail = document.createElement('small');
          detail.textContent = description;
          link.append(detail);
        }
        group.append(link);
      });
      nav.append(group);
    });
    navigation.append(nav);
    navigation.hidden = false;
    navigation.classList.toggle('kayak-mobile-navigation', mobile);
    trigger.setAttribute('aria-expanded', 'true');
    if (mobile) {
      document.body.style.overflow = 'hidden';
      mobileToggle.setAttribute('aria-label', '关闭导航');
    }
    activeMenu = name;
  }

  document.querySelectorAll('[data-nav-menu]').forEach(trigger => {
    const dropdownItem = trigger.closest('.kayak-nav-dropdown-item');
    if (dropdownItem) {
      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', !expanded);
        dropdownItem.classList.toggle('is-open', !expanded);
      });
      trigger.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          dropdownItem.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          dropdownItem.querySelector('.kayak-dropdown-link')?.focus();
        }
      });
      document.addEventListener('click', event => {
        if (!dropdownItem.contains(event.target)) {
          dropdownItem.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
      return;
    }
    trigger.addEventListener('click', () => showNavigation(trigger.dataset.navMenu, trigger));
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        showNavigation(trigger.dataset.navMenu, trigger);
        navigation.querySelector('a')?.focus();
      }
    });
  });
  mobileToggle.addEventListener('click', () => showNavigation('mobile', mobileToggle, true));
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeNavigation(); });
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target) && !triggers.some(trigger => trigger?.contains(event.target))) closeNavigation();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeMenu) {
      const activeTrigger = triggers.find(trigger => trigger?.getAttribute('aria-expanded') === 'true');
      closeNavigation();
      activeTrigger?.focus();
    }
  });
  window.addEventListener('resize', closeNavigation);

  // ==========================================================================
  // Loading & Scroll Motion System (Step 165)
  // ==========================================================================
  const pageLoader = document.getElementById('kayak-page-loader');
  const scrollProgress = document.getElementById('kayak-scroll-progress');
  const headerElem = document.querySelector('.TZTsQG_header');

  const dismissLoader = () => {
    if (!pageLoader || pageLoader.classList.contains('is-loaded')) return;
    pageLoader.classList.add('is-loaded');
    document.documentElement.classList.add('kayak-motion-ready');
    setTimeout(() => {
      if (pageLoader.parentNode) pageLoader.parentNode.removeChild(pageLoader);
    }, 450);
  };

  // Immediate or bounded preloader dismiss
  if (reducedMotion.matches) {
    dismissLoader();
  } else if (document.readyState === 'complete') {
    setTimeout(dismissLoader, 280);
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoader, 200), { once: true });
    // Hard ceiling: user never waits longer than 600ms
    setTimeout(dismissLoader, 600);
  }

  // Right-Rail Page Scrollbar Component Controller (页面滚动条组件)
  const scrollbarComp = document.getElementById('kayak-scrollbar-component');
  const scrollTrack = document.getElementById('kayak-scroll-track');
  const scrollThumb = document.getElementById('kayak-scroll-thumb');
  const scrollBadge = document.getElementById('kayak-scroll-badge');
  const scrollBadgeText = scrollBadge ? scrollBadge.querySelector('.kayak-badge-text') : null;
  const markers = document.querySelectorAll('.kayak-scroll-marker');

  const navSections = [
    { id: 'top', name: '首页', elem: document.getElementById('skip-nav') || document.body },
    { id: 'integrations', name: '模型生态', elem: document.getElementById('integrations') },
    { id: 'benefits', name: '核心架构', elem: document.getElementById('benefits') },
    { id: 'intake', name: '项目工作区', elem: document.getElementById('intake') },
    { id: 'ai', name: '扩展生态', elem: document.getElementById('ai') },
    { id: 'download', name: '下载客户端', elem: document.getElementById('download') }
  ].filter(s => Boolean(s.elem));

  let isDraggingScroll = false;
  let dragStartY = 0;
  let dragStartScrollTop = 0;
  let scrollIdleTimer = null;

  const resetScrollIdle = () => {
    if (scrollbarComp) scrollbarComp.classList.add('is-active');
    clearTimeout(scrollIdleTimer);
    if (!isDraggingScroll) {
      scrollIdleTimer = setTimeout(() => {
        if (scrollbarComp) scrollbarComp.classList.remove('is-active');
      }, 2200);
    }
  };

  const syncMarkerPositions = () => {
    const totalDocHeight = document.documentElement.scrollHeight;
    if (totalDocHeight <= 0) return;
    navSections.forEach(sec => {
      const marker = document.querySelector(`.kayak-scroll-marker[data-target="${sec.id}"]`);
      if (marker && sec.elem) {
        const rect = sec.elem.getBoundingClientRect();
        const absTop = rect.top + (window.scrollY || document.documentElement.scrollTop);
        const ratio = Math.min(Math.max(absTop / totalDocHeight, 0.02), 0.98);
        marker.style.top = `${(ratio * 100).toFixed(1)}%`;
      }
    });
  };

  // Scroll Progress Bar & Header Glass Effect & Custom Scrollbar
  const updateScroll = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pctRatio = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
    const pct = pctRatio * 100;

    if (scrollProgress && docHeight > 0) {
      scrollProgress.style.width = `${pct}%`;
    }
    if (headerElem) {
      headerElem.classList.toggle('is-scrolled', scrollY > 20);
    }

    // Update Right-Rail Scrollbar Component
    if (scrollbarComp && scrollTrack && scrollThumb && docHeight > 0) {
      const trackHeight = scrollTrack.clientHeight;
      if (trackHeight > 0) {
        const thumbHeight = Math.max(42, Math.min(trackHeight * (window.innerHeight / document.documentElement.scrollHeight), trackHeight * 0.45));
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop = pctRatio * maxThumbTop;

        scrollThumb.style.height = `${thumbHeight}px`;
        scrollThumb.style.transform = `translateY(${thumbTop}px)`;

        // Identify current section
        const viewportMid = scrollY + window.innerHeight * 0.38;
        let currentSection = navSections[0];
        for (let i = navSections.length - 1; i >= 0; i--) {
          const top = navSections[i].elem.getBoundingClientRect().top + scrollY;
          if (viewportMid >= top - 60) {
            currentSection = navSections[i];
            break;
          }
        }

        // Update Badge
        if (scrollBadge && scrollBadgeText) {
          scrollBadgeText.textContent = `${currentSection.name} · ${Math.round(pct)}%`;
          scrollBadge.style.top = `${thumbTop + thumbHeight / 2}px`;
        }

        // Update Markers
        markers.forEach(m => {
          m.classList.toggle('is-active', m.dataset.target === currentSection.id);
        });

        resetScrollIdle();
      }
    }
  };

  // Drag Scrollbar Thumb
  if (scrollThumb && scrollTrack) {
    scrollThumb.addEventListener('pointerdown', (e) => {
      isDraggingScroll = true;
      dragStartY = e.clientY;
      dragStartScrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollThumb.setPointerCapture(e.pointerId);
      scrollThumb.classList.add('is-dragging');
      if (scrollbarComp) scrollbarComp.classList.add('is-dragging');
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDraggingScroll) {
        if (window.innerWidth - e.clientX <= 65) {
          resetScrollIdle();
        }
        return;
      }
      const deltaY = e.clientY - dragStartY;
      const trackHeight = scrollTrack.clientHeight;
      const thumbHeight = scrollThumb.offsetHeight;
      const maxThumbTop = trackHeight - thumbHeight;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (maxThumbTop > 0 && docHeight > 0) {
        const scrollDelta = (deltaY / maxThumbTop) * docHeight;
        window.scrollTo({ top: dragStartScrollTop + scrollDelta });
      }
    });

    const endScrollDrag = (e) => {
      if (isDraggingScroll) {
        isDraggingScroll = false;
        scrollThumb.classList.remove('is-dragging');
        if (scrollbarComp) scrollbarComp.classList.remove('is-dragging');
        document.body.style.userSelect = '';
        resetScrollIdle();
      }
    };
    window.addEventListener('pointerup', endScrollDrag);
    window.addEventListener('pointercancel', endScrollDrag);

    // Track click to jump
    scrollTrack.addEventListener('pointerdown', (e) => {
      if (e.target === scrollThumb || scrollThumb.contains(e.target)) return;
      const rect = scrollTrack.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const trackHeight = rect.height;
      const ratio = Math.min(Math.max(clickY / trackHeight, 0), 1);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: ratio * docHeight, behavior: 'smooth' });
    });

    // Marker click to smooth scroll
    markers.forEach(marker => {
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = marker.dataset.target;
        if (targetId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const targetElem = document.getElementById(targetId);
          if (targetElem) {
            targetElem.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', () => {
    syncMarkerPositions();
    updateScroll();
  }, { passive: true });

  // Initial marker sync after DOM layout settles
  setTimeout(() => {
    syncMarkerPositions();
    updateScroll();
  }, 350);

  // Scroll Reveal Observer
  const revealTargets = document.querySelectorAll(
    '.kayak-reveal, .kayak-feature-row, .GJ9TEa_carouselCard, .GJ9TEa_benefit'
  );

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    revealTargets.forEach((target, i) => {
      if (target.classList.contains('GJ9TEa_carouselCard') || target.classList.contains('GJ9TEa_benefit')) {
        target.style.setProperty('--item-index', i % 3);
      }
      revealObserver.observe(target);
    });
  } else {
    revealTargets.forEach(t => t.classList.add('is-revealed'));
  }

})();
