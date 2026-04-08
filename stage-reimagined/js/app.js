const playerState = {
    audio: new Audio(),
    queue: [],
    index: -1,
    currentTrack: null,
    dock: null,
    playButton: null,
    prevButton: null,
    nextButton: null,
    progressFill: null,
    progressBar: null,
    title: null,
    meta: null,
    art: null,
    status: null,
    currentTime: null,
    totalTime: null
};

function pageDepth() {
    return document.body.dataset.page === 'band' ? '../../' : '../';
}

function imagePath(name) {
    return `${pageDepth()}images/${name}`;
}

function musicPath(file) {
    return `${pageDepth()}music/${file}`;
}

function bandPath(slug) {
    return document.body.dataset.page === 'band' ? `${slug}.html` : `bands/${slug}.html`;
}

function homePath() {
    return document.body.dataset.page === 'band' ? '../index.html' : 'index.html';
}

function safeAsset(path) {
    return encodeURI(path).replace(/#/g, '%23');
}

function getBands() {
    return Object.values(window.bandLibrary || {});
}

function getBand(slug) {
    return window.bandLibrary ? window.bandLibrary[slug] : null;
}

function createTrack(band, song, songIndex) {
    return {
        id: `${band.slug}-${songIndex}`,
        band,
        title: song.title,
        note: song.note,
        moods: song.moods,
        file: song.file,
        cover: band.images.card
    };
}

function applyTheme(band) {
    if (!band) {
        return;
    }
    const root = document.documentElement;
    root.style.setProperty('--accent', band.palette.accent);
    root.style.setProperty('--accent-rgb', band.palette.accentRgb);
    root.style.setProperty('--accent-alt', band.palette.accentAlt);
    root.style.setProperty('--accent-alt-rgb', band.palette.accentAltRgb);
    root.style.setProperty('--surface', band.palette.surface);
    root.style.setProperty('--panel', band.palette.panel);
    root.style.setProperty('--ink', band.palette.ink);
    root.style.setProperty('--muted', band.palette.muted);
    document.body.dataset.stage = band.slug;
}

function createTagList(items) {
    return items.map((item) => `<span class="tag">${item}</span>`).join('');
}

function createSwatches(band) {
    return [band.palette.accent, band.palette.accentAlt, band.palette.surface, band.palette.panel]
        .map((color) => `<span class="swatch" style="background:${color}"></span>`)
        .join('');
}

function initReveal() {
    const nodes = document.querySelectorAll('.section-block, .hero-section, .selector-section, .band-hero, .band-gallery-section, .game-hero, .game-layout, .site-footer');
    if (!nodes.length) {
        return;
    }
    nodes.forEach((node) => node.classList.add('reveal'));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16 });
    nodes.forEach((node) => observer.observe(node));
}

function initHomeNavHighlight() {
    const sections = document.querySelectorAll('[data-nav-section]');
    const navLinks = document.querySelectorAll('.header-nav a[href^="#"]');
    if (!sections.length || !navLinks.length) {
        return;
    }
    const linkMap = new Map(Array.from(navLinks).map((link) => [link.getAttribute('href').slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }
            navLinks.forEach((link) => link.classList.remove('is-active'));
            const current = linkMap.get(entry.target.id);
            if (current) {
                current.classList.add('is-active');
            }
        });
    }, { threshold: 0.42 });
    sections.forEach((section) => observer.observe(section));
}

function ensurePlayerDock() {
    if (playerState.dock) {
        return;
    }
    const dock = document.createElement('div');
    dock.className = 'player-dock';
    dock.id = 'playerDock';
    dock.hidden = true;
    dock.innerHTML = `
        <div class="player-art-wrap"><img class="player-art" alt="当前封面"></div>
        <div class="player-main">
            <div class="player-headline">
                <div>
                    <strong class="player-title">尚未播放</strong>
                    <p class="player-meta">点一首歌，让舞台亮起来。</p>
                </div>
                <span class="player-status">Idle</span>
            </div>
            <div class="player-progress" role="slider" aria-label="播放进度"><div class="player-progress-fill"></div></div>
            <div class="player-timing"><span class="player-current">0:00</span><span class="player-total">0:00</span></div>
        </div>
        <div class="player-controls">
            <button class="player-btn" type="button" data-player="prev">上一首</button>
            <button class="player-btn player-btn--primary" type="button" data-player="toggle">播放</button>
            <button class="player-btn" type="button" data-player="next">下一首</button>
        </div>
    `;
    document.body.appendChild(dock);
    playerState.dock = dock;
    playerState.playButton = dock.querySelector('[data-player="toggle"]');
    playerState.prevButton = dock.querySelector('[data-player="prev"]');
    playerState.nextButton = dock.querySelector('[data-player="next"]');
    playerState.progressFill = dock.querySelector('.player-progress-fill');
    playerState.progressBar = dock.querySelector('.player-progress');
    playerState.title = dock.querySelector('.player-title');
    playerState.meta = dock.querySelector('.player-meta');
    playerState.art = dock.querySelector('.player-art');
    playerState.status = dock.querySelector('.player-status');
    playerState.currentTime = dock.querySelector('.player-current');
    playerState.totalTime = dock.querySelector('.player-total');
    playerState.playButton.addEventListener('click', togglePlayback);
    playerState.prevButton.addEventListener('click', () => stepTrack(-1));
    playerState.nextButton.addEventListener('click', () => stepTrack(1));
    playerState.progressBar.addEventListener('click', seekPlayback);
    playerState.audio.preload = 'metadata';
    playerState.audio.addEventListener('timeupdate', updatePlaybackProgress);
    playerState.audio.addEventListener('loadedmetadata', updatePlaybackProgress);
    playerState.audio.addEventListener('play', () => {
        updatePlaybackButton();
        if (playerState.status && playerState.currentTrack) {
            playerState.status.textContent = `Now Playing · ${playerState.currentTrack.band.stageLabel}`;
        }
    });
    playerState.audio.addEventListener('pause', () => {
        updatePlaybackButton();
        if (playerState.status && playerState.currentTrack) {
            playerState.status.textContent = `Paused · ${playerState.currentTrack.band.stageLabel}`;
        }
    });
    playerState.audio.addEventListener('waiting', () => {
        if (playerState.status) {
            playerState.status.textContent = '音轨加载中';
        }
    });
    playerState.audio.addEventListener('canplay', () => {
        if (playerState.status && playerState.currentTrack) {
            playerState.status.textContent = `Ready · ${playerState.currentTrack.band.stageLabel}`;
        }
    });
    playerState.audio.addEventListener('ended', () => stepTrack(1));
    playerState.audio.addEventListener('error', () => {
        if (playerState.status) {
            playerState.status.textContent = '音轨加载失败';
        }
    });
}

function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) {
        return '0:00';
    }
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function syncDock(track) {
    if (!track) {
        return;
    }
    ensurePlayerDock();
    playerState.dock.hidden = false;
    playerState.title.textContent = track.title;
    playerState.meta.textContent = `${track.band.chineseName} · ${track.note}`;
    playerState.art.src = safeAsset(imagePath(track.cover));
    playerState.art.alt = track.band.chineseName;
    playerState.status.textContent = track.band.stageLabel;
    playerState.dock.style.setProperty('--player-band-accent', track.band.palette.accent);
    playerState.dock.style.setProperty('--player-band-alt', track.band.palette.accentAlt);
}
function updatePlaybackProgress() {
    if (!playerState.currentTrack) {
        return;
    }
    const duration = playerState.audio.duration || 0;
    const current = playerState.audio.currentTime || 0;
    const percent = duration > 0 ? (current / duration) * 100 : 0;
    playerState.progressFill.style.width = `${percent}%`;
    playerState.currentTime.textContent = formatTime(current);
    playerState.totalTime.textContent = formatTime(duration);
}

function loadTrack(index, autoplay = false) {
    if (!playerState.queue.length) {
        return;
    }
    const safeIndex = (index + playerState.queue.length) % playerState.queue.length;
    playerState.index = safeIndex;
    playerState.currentTrack = playerState.queue[safeIndex];
    syncDock(playerState.currentTrack);
    playerState.progressFill.style.width = '0%';
    playerState.currentTime.textContent = '0:00';
    playerState.totalTime.textContent = '0:00';
    playerState.status.textContent = '音轨加载中';
    playerState.audio.src = safeAsset(musicPath(playerState.currentTrack.file));
    playerState.audio.load();
    if (autoplay) {
        const playPromise = playerState.audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                playerState.status.textContent = '点击播放以继续';
            });
        }
    }
    updatePlaybackButton();
}

function updatePlaybackButton() {
    const isPlaying = !playerState.audio.paused && !playerState.audio.ended;
    if (playerState.playButton) {
        playerState.playButton.textContent = isPlaying ? '暂停' : '播放';
    }
}

function playQueue(queue, startIndex) {
    ensurePlayerDock();
    playerState.queue = queue;
    loadTrack(startIndex, true);
}

function togglePlayback() {
    if (!playerState.currentTrack) {
        return;
    }
    if (playerState.audio.paused) {
        const playPromise = playerState.audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                playerState.status.textContent = '浏览器阻止了自动播放';
            });
        }
    } else {
        playerState.audio.pause();
    }
    updatePlaybackButton();
}

function stepTrack(direction) {
    if (!playerState.queue.length) {
        return;
    }
    loadTrack(playerState.index + direction, true);
}

function seekPlayback(event) {
    if (!playerState.audio.duration) {
        return;
    }
    const rect = playerState.progressBar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    playerState.audio.currentTime = ratio * playerState.audio.duration;
}

function getStageOrder() {
    return window.stageOrder || getBands().map((band) => band.slug);
}

function getNextBandSlug(currentSlug) {
    const order = getStageOrder();
    const index = order.indexOf(currentSlug);
    return order[(index + 1 + order.length) % order.length];
}

function getFeaturedTrack(band) {
    const index = Number.isInteger(band.featuredTrack) ? band.featuredTrack : 0;
    return createTrack(band, band.songs[index], index);
}

function buildBandQueue(band) {
    return band.songs.map((song, songIndex) => createTrack(band, song, songIndex));
}

function playBandTrack(band, index) {
    playQueue(buildBandQueue(band), index);
}

function playRandomTrackFromBand(band) {
    const index = Math.floor(Math.random() * band.songs.length);
    playBandTrack(band, index);
}

function createDashboardMarkup(items) {
    return items.map((item) => `
        <article class="dashboard-chip">
            <small>${item.label}</small>
            <strong>${item.value}</strong>
        </article>
    `).join('');
}

function renderBandModePanel(panel, band) {
    if (!panel) {
        return;
    }
    let activeIndex = 0;
    panel.innerHTML = `
        <div class="section-heading section-heading--compact">
            <div>
                <span class="section-kicker">Scene Switch</span>
                <h3>切换这一页的阅读视角</h3>
            </div>
        </div>
        <div class="mode-switch" id="bandModeSwitch">
            ${band.modes.map((mode, index) => `<button class="mode-btn ${index === 0 ? 'is-active' : ''}" type="button" data-mode-index="${index}">${mode.label}</button>`).join('')}
        </div>
        <article class="mode-screen" id="bandModeScreen"></article>
    `;
    const screen = panel.querySelector('#bandModeScreen');
    function updateMode(index) {
        activeIndex = index;
        const current = band.modes[index];
        panel.querySelectorAll('.mode-btn').forEach((button) => {
            button.classList.toggle('is-active', Number(button.dataset.modeIndex) === index);
        });
        screen.innerHTML = `
            <small>${current.label}</small>
            <h4>${current.title}</h4>
            <p>${current.text}</p>
        `;
    }
    panel.querySelectorAll('.mode-btn').forEach((button) => {
        button.addEventListener('click', () => updateMode(Number(button.dataset.modeIndex)));
    });
    updateMode(activeIndex);
}
function renderHome() {
    const bands = getBands();
    const savedBand = localStorage.getItem('stageReimaginedTheme');
    let activeBand = getBand(savedBand) || getBand('mygo') || bands[0];

    const heroTitle = document.getElementById('heroTitle');
    const heroSummary = document.getElementById('heroSummary');
    const heroImage = document.getElementById('heroImage');
    const heroOriginal = document.getElementById('heroOriginal');
    const heroTagline = document.getElementById('heroTagline');
    const heroMeta = document.getElementById('heroMeta');
    const heroEnter = document.getElementById('heroEnter');
    const heroPalette = document.getElementById('heroPalette');
    const heroRandomStage = document.getElementById('heroRandomStage');
    const heroResume = document.getElementById('heroResume');
    const selectorStrip = document.getElementById('stageSelector');
    const selectorDetail = document.getElementById('selectorDetail');
    const bandGrid = document.getElementById('bandGrid');
    const setlistGrid = document.getElementById('setlistGrid');
    const homeActions = document.getElementById('homeActions');
    const gameAccent = document.getElementById('gameAccentSwatches');

    function syncSavedBand(slug) {
        localStorage.setItem('stageReimaginedTheme', slug);
        if (heroResume) {
            heroResume.href = bandPath(slug);
            heroResume.textContent = `继续 ${getBand(slug).chineseName} 舞台`;
        }
    }

    function updateHero(band) {
        applyTheme(band);
        heroTitle.textContent = band.chineseName;
        heroSummary.textContent = band.summary;
        heroImage.src = safeAsset(imagePath(band.images.hero));
        heroImage.alt = band.chineseName;
        heroOriginal.textContent = `${band.originalName} · ${band.stageLabel}`;
        heroTagline.textContent = band.quote;
        heroEnter.href = bandPath(band.slug);
        heroPalette.innerHTML = createSwatches(band);
        heroMeta.innerHTML = band.dashboard.map((item) => `
            <li><span class="section-kicker">${item.label}</span><strong>${item.value}</strong></li>
        `).join('');
        if (gameAccent) {
            gameAccent.innerHTML = createSwatches(band);
        }
    }

    function updateSelectorDetail(band) {
        selectorDetail.innerHTML = `
            <div class="selector-spotlight">
                <span class="section-kicker">Stage Brief</span>
                <h3>${band.signature.title}</h3>
                <p>${band.signature.text}</p>
            </div>
            <div class="detail-grid">
                <article class="detail-box">
                    <strong>关键词</strong>
                    <div class="tag-list">${createTagList(band.keywords)}</div>
                </article>
                <article class="detail-box">
                    <strong>标题与边角</strong>
                    <p>${band.notes[1].text}</p>
                </article>
                <article class="detail-box">
                    <strong>互动视角</strong>
                    <div class="tag-list">${band.modes.map((mode) => `<span class="tag">${mode.label}</span>`).join('')}</div>
                </article>
                <article class="detail-box">
                    <strong>推荐顺序</strong>
                    <p>${band.notes[2].text}</p>
                </article>
            </div>
        `;
    }

    function renderSelector() {
        selectorStrip.innerHTML = bands.map((band) => `
            <button class="selector-chip ${band.slug === activeBand.slug ? 'is-active' : ''}" data-band="${band.slug}" type="button" aria-pressed="${band.slug === activeBand.slug}">
                <strong>${band.chineseName}</strong>
                <span>${band.stageLabel}</span>
            </button>
        `).join('');
        selectorStrip.querySelectorAll('.selector-chip').forEach((button) => {
            button.addEventListener('click', () => {
                const nextBand = getBand(button.dataset.band);
                if (!nextBand) {
                    return;
                }
                activeBand = nextBand;
                syncSavedBand(nextBand.slug);
                updateHero(nextBand);
                updateSelectorDetail(nextBand);
                renderSelector();
                renderBandGrid();
                renderHomeActions();
            });
        });
    }

    function renderBandGrid() {
        bandGrid.innerHTML = bands.map((band) => `
            <article class="band-card portal-card" data-band-theme="${band.slug}">
                <div class="band-card-media">
                    <img src="${safeAsset(imagePath(band.images.card))}" alt="${band.chineseName}">
                    <span class="badge">${band.stageLabel}</span>
                </div>
                <div class="band-card-body">
                    <div class="band-card-header">
                        <div><h3>${band.chineseName}<span>${band.originalName}</span></h3></div>
                        <div class="mini-palette"><i style="background:${band.palette.accent}"></i><i style="background:${band.palette.accentAlt}"></i><i style="background:${band.palette.panel}"></i></div>
                    </div>
                    <p>${band.signature.text}</p>
                    <div class="portal-stat-row">${createDashboardMarkup(band.dashboard)}</div>
                    <div class="portal-card-actions">
                        <button class="play-track-btn" type="button" data-stage-play="${band.slug}">播放主打曲</button>
                        <button class="action-btn secondary" type="button" data-stage-theme="${band.slug}">设为当前舞台</button>
                        <a class="primary-link" href="${bandPath(band.slug)}">进入专题页</a>
                    </div>
                </div>
            </article>
        `).join('');
        bandGrid.querySelectorAll('[data-stage-play]').forEach((button) => {
            button.addEventListener('click', () => {
                const band = getBand(button.dataset.stagePlay);
                playBandTrack(band, band.featuredTrack || 0);
            });
        });
        bandGrid.querySelectorAll('[data-stage-theme]').forEach((button) => {
            button.addEventListener('click', () => {
                const band = getBand(button.dataset.stageTheme);
                activeBand = band;
                syncSavedBand(band.slug);
                updateHero(band);
                updateSelectorDetail(band);
                renderSelector();
                renderBandGrid();
                renderHomeActions();
            });
        });
    }

    function renderFeaturedPicks() {
        const picks = bands.map((band) => getFeaturedTrack(band));
        setlistGrid.innerHTML = picks.map((track, index) => `
            <article class="setlist-card" data-band-theme="${track.band.slug}">
                <div class="setlist-card-head">
                    <div><small>${track.band.chineseName}</small><h3>${track.title}</h3></div>
                    <button class="play-track-btn" type="button" data-track-index="${index}">播放</button>
                </div>
                <p>${track.note}</p>
                <div class="pill-row">${track.moods.map((mood) => `<span class="pill">${mood}</span>`).join('')}</div>
                <div class="band-card-footer"><span class="card-link">${track.band.stageLabel}</span><a class="ghost-link" href="${bandPath(track.band.slug)}">进入子页</a></div>
            </article>
        `).join('');
        setlistGrid.querySelectorAll('.play-track-btn').forEach((button) => {
            button.addEventListener('click', () => playQueue(picks, Number(button.dataset.trackIndex)));
        });
    }

    function renderHomeActions() {
        homeActions.innerHTML = `
            <span class="section-kicker">Quick Entry</span>
            <h3>${activeBand.chineseName} 是当前舞台</h3>
            <p>${activeBand.tagline}</p>
            <div class="home-action-stack">
                <button class="primary-link" type="button" id="homePlayCurrent">播放当前主打曲</button>
                <button class="action-btn secondary" type="button" id="homeRandomTrack">随机放一首当前乐队</button>
                <a class="ghost-link" href="${bandPath(activeBand.slug)}">打开完整专题页</a>
                <a class="ghost-link" href="bandgame.html">直接去搭配游戏</a>
            </div>
            <div class="portal-stat-row">${createDashboardMarkup(activeBand.dashboard)}</div>
        `;
        homeActions.querySelector('#homePlayCurrent').addEventListener('click', () => playBandTrack(activeBand, activeBand.featuredTrack || 0));
        homeActions.querySelector('#homeRandomTrack').addEventListener('click', () => playRandomTrackFromBand(activeBand));
    }

    heroRandomStage?.addEventListener('click', () => {
        const candidates = bands.filter((band) => band.slug !== activeBand.slug);
        const nextBand = candidates[Math.floor(Math.random() * candidates.length)] || activeBand;
        syncSavedBand(nextBand.slug);
        window.location.href = bandPath(nextBand.slug);
    });

    syncSavedBand(activeBand.slug);
    updateHero(activeBand);
    updateSelectorDetail(activeBand);
    renderSelector();
    renderBandGrid();
    renderFeaturedPicks();
    renderHomeActions();
    initHomeNavHighlight();
}
function renderBandPage() {
    const slug = document.body.dataset.bandPage;
    const band = getBand(slug);
    if (!band) {
        return;
    }

    applyTheme(band);
    document.title = `${band.chineseName} | Stage Reimagined`;
    localStorage.setItem('stageReimaginedTheme', band.slug);

    const heroTitle = document.getElementById('bandHeroTitle');
    const heroOriginal = document.getElementById('bandHeroOriginal');
    const heroSummary = document.getElementById('bandHeroSummary');
    const heroImage = document.getElementById('bandHeroImage');
    const heroMeta = document.getElementById('bandHeroMeta');
    const quickRail = document.getElementById('bandQuickRail');
    const signaturePanel = document.getElementById('bandSignature');
    const interactionPanel = document.getElementById('bandInteraction');
    const focusGrid = document.getElementById('bandFocusGrid');
    const songPanel = document.getElementById('bandSongs');
    const memberPanel = document.getElementById('bandMembers');
    const momentsGrid = document.getElementById('bandMoments');
    const noteGrid = document.getElementById('bandNotes');
    const galleryGrid = document.getElementById('bandGallery');
    const crossNav = document.getElementById('bandCrossNav');
    const stageBack = document.getElementById('backToHome');

    heroTitle.textContent = band.chineseName;
    heroOriginal.textContent = `${band.originalName} · ${band.stageLabel}`;
    heroSummary.textContent = band.summary;
    heroImage.src = safeAsset(imagePath(band.images.hero));
    heroImage.alt = band.chineseName;
    heroMeta.innerHTML = `
        <span class="meta-chip">${band.keywords.join(' / ')}</span>
        <span class="meta-chip">${band.moods.join(' / ')}</span>
        <span class="meta-chip">${band.stageLabel}</span>
    `;

    const nextBand = getBand(getNextBandSlug(band.slug));
    const featuredIndex = Number.isInteger(band.featuredTrack) ? band.featuredTrack : 0;
    const featuredTrack = band.songs[featuredIndex];
    const bandQueue = buildBandQueue(band);

    quickRail.innerHTML = `
        <article class="quick-rail-card soft-geometry" data-band-theme="${band.slug}">
            <div class="quick-rail-actions">
                <button class="primary-link" type="button" data-band-action="featured">播放主打曲</button>
                <button class="action-btn secondary" type="button" data-band-action="random">随机一首</button>
                <a class="ghost-link" href="${bandPath(nextBand.slug)}">下一舞台：${nextBand.chineseName}</a>
                <a class="ghost-link" href="../bandgame.html">混编乐队去</a>
            </div>
            <div class="quick-stat-grid">${createDashboardMarkup(band.dashboard)}</div>
        </article>
    `;
    quickRail.querySelector('[data-band-action="featured"]').addEventListener('click', () => playQueue(bandQueue, featuredIndex));
    quickRail.querySelector('[data-band-action="random"]').addEventListener('click', () => playRandomTrackFromBand(band));

    signaturePanel.innerHTML = `
        <span class="section-kicker">Signature</span>
        <h3>${band.signature.title}</h3>
        <p>${band.signature.text}</p>
        <blockquote class="band-quote">“${band.quote}”</blockquote>
        <div class="palette-list">
            <div class="palette-item"><span class="swatch" style="background:${band.palette.accent}"></span><div><strong>主色</strong><p>${band.palette.accent}</p></div></div>
            <div class="palette-item"><span class="swatch" style="background:${band.palette.accentAlt}"></span><div><strong>辅助色</strong><p>${band.palette.accentAlt}</p></div></div>
            <div class="palette-item"><span class="swatch" style="background:${band.palette.surface}"></span><div><strong>舞台底色</strong><p>${band.palette.surface}</p></div></div>
            <div class="palette-item"><span class="swatch" style="background:${band.palette.panel}"></span><div><strong>面板色</strong><p>${band.palette.panel}</p></div></div>
        </div>
    `;

    renderBandModePanel(interactionPanel, band);

    focusGrid.innerHTML = band.spotlights.map((item) => `
        <article class="focus-card" data-band-theme="${band.slug}">
            <small>${item.kicker}</small>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
        </article>
    `).join('');

    songPanel.innerHTML = `
        <div class="section-heading section-heading--compact">
            <div><span class="section-kicker">Playable Setlist</span><h3>${featuredTrack.title} 是这页的起手式</h3></div>
        </div>
        <article class="song-feature-card" data-band-theme="${band.slug}">
            <small>${band.stageLabel}</small>
            <strong>${featuredTrack.title}</strong>
            <p>${featuredTrack.note}</p>
            <div class="pill-row">${featuredTrack.moods.map((mood) => `<span class="pill">${mood}</span>`).join('')}</div>
            <div class="band-card-footer">
                <button class="play-track-btn" type="button" data-band-song="featured">立即播放</button>
                <button class="action-btn secondary" type="button" data-band-song="random">换一首试试</button>
            </div>
        </article>
        <div class="song-stack">
            ${band.songs.map((song, songIndex) => `
                <article class="song-entry" data-band-theme="${band.slug}">
                    <div class="song-entry-head">
                        <div><small>${song.moods.join(' · ')}</small><strong>${song.title}</strong></div>
                        <button class="play-track-btn" type="button" data-song-index="${songIndex}">播放</button>
                    </div>
                    <p>${song.note}</p>
                </article>
            `).join('')}
        </div>
    `;
    songPanel.querySelector('[data-band-song="featured"]').addEventListener('click', () => playQueue(bandQueue, featuredIndex));
    songPanel.querySelector('[data-band-song="random"]').addEventListener('click', () => playRandomTrackFromBand(band));
    songPanel.querySelectorAll('[data-song-index]').forEach((button) => {
        button.addEventListener('click', () => playQueue(bandQueue, Number(button.dataset.songIndex)));
    });

    memberPanel.innerHTML = `
        <div class="section-heading section-heading--compact">
            <div><span class="section-kicker">Members</span><h3>成员不再只是一列文字</h3></div>
        </div>
        <div class="member-visual-grid">
            ${band.members.map((member) => `
                <article class="member-visual-card" data-band-theme="${band.slug}">
                    <img src="${safeAsset(imagePath(member.image))}" alt="${member.name}">
                    <div class="member-visual-copy">
                        <small>${member.role}</small>
                        <strong>${member.name}</strong>
                        <p>${member.note}</p>
                    </div>
                </article>
            `).join('')}
        </div>
    `;

    momentsGrid.innerHTML = band.moments.map((moment) => `
        <article class="moment-card" data-band-theme="${band.slug}">
            <div class="moment-media"><img src="${safeAsset(imagePath(moment.image))}" alt="${moment.title}"></div>
            <div class="moment-copy"><small>${band.stageLabel}</small><h3>${moment.title}</h3><p>${moment.text}</p></div>
        </article>
    `).join('');

    noteGrid.innerHTML = band.notes.map((note) => `
        <article class="note-card"><h3>${note.title}</h3><p>${note.text}</p></article>
    `).join('');

    galleryGrid.innerHTML = band.images.gallery.map((image) => `
        <article class="gallery-card"><img src="${safeAsset(imagePath(image))}" alt="${band.chineseName} 画面"></article>
    `).join('');

    crossNav.innerHTML = getStageOrder().filter((item) => item !== band.slug).map((item) => getBand(item)).map((item) => `
        <article class="cross-nav-card" data-band-theme="${item.slug}">
            <img src="${safeAsset(imagePath(item.images.card))}" alt="${item.chineseName}">
            <div class="cross-nav-copy">
                <small>${item.stageLabel}</small>
                <h3>${item.chineseName}</h3>
                <p>${item.tagline}</p>
                <a class="ghost-link" href="${bandPath(item.slug)}">进入 ${item.chineseName}</a>
            </div>
        </article>
    `).join('');

    if (stageBack) {
        stageBack.href = homePath();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.bandLibrary) {
        return;
    }
    ensurePlayerDock();
    if (document.body.dataset.page === 'home') {
        renderHome();
    }
    if (document.body.dataset.page === 'band') {
        renderBandPage();
    }
    initReveal();
});
