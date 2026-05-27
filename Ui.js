// ==================== واجهة المستخدم ====================

function updateAllUI() {
    updateResourcesDisplay();
    updateRankBadge();
    updateTeamName();
}

function updateResourcesDisplay() {
    document.getElementById('coinsDisplay').textContent = GameState.isAdmin ? '∞' : GameState.coins.toLocaleString();
    document.getElementById('boostDisplay').textContent = GameState.isAdmin ? '∞' : GameState.boost;
    document.getElementById('rankPointsDisplay').textContent = GameState.rankPoints;
}

function updateRankBadge() {
    const rank = getRankInfo(GameState.rankPoints);
    document.getElementById('rankBadge').innerHTML = 
        RANK_ICONS[rank.icon] + ' ' + rank.name;
}

function updateTeamName() {
    document.getElementById('displayTeamName').innerHTML = 
        '<i class="fas fa-shield-alt"></i> ' + GameState.teamName;
}

// تبديل التبويبات
function switchTab(tabName) {
    // تحديث التبويبات النشطة
    const tabs = document.querySelectorAll('#navTabs .nav-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    // تفعيل التبويب المناسب
    const tabButtons = document.querySelectorAll('#navTabs .nav-tab');
    const tabMap = {
        'squad': 0,
        'rank': 1,
        'store': 2,
        'club': 3,
        'objectives': 4,
        'leaderboard': 5
    };
    
    if (tabButtons[tabMap[tabName]]) {
        tabButtons[tabMap[tabName]].classList.add('active');
    }
    
    const content = document.getElementById('tab-content');
    
    switch (tabName) {
        case 'squad':
            content.innerHTML = renderSquadTab();
            break;
        case 'rank':
            content.innerHTML = renderRankTab();
            break;
        case 'store':
            content.innerHTML = renderStoreTab();
            break;
        case 'club':
            content.innerHTML = renderClubTab();
            break;
        case 'objectives':
            content.innerHTML = renderObjectivesTab();
            break;
        case 'leaderboard':
            content.innerHTML = renderLeaderboardTab();
            break;
    }
}

// ==================== تبويب التشكيلة ====================
function renderSquadTab() {
    const rank = getRankInfo(GameState.rankPoints);
    const squadOVR = getSquadOVR();
    
    let html = `
        <div class="rank-display">
            <div class="rank-icon-large">${RANK_ICONS[rank.icon]}</div>
            <div class="rank-name-large">${rank.name}</div>
            <div class="rank-stars-display">${'<i class="fas fa-star" style="color:#ffd700;"></i>'.repeat(GameState.stars)}${'<i class="far fa-star" style="color:#555;"></i>'.repeat(3 - GameState.stars)}</div>
            <div class="rank-points-display">
                <i class="fas fa-chart-line"></i> OVR التشكيلة: <strong style="color:var(--gold);">${squadOVR}</strong>
            </div>
            <div style="margin-top:5px;color:var(--text-secondary);">
                <i class="fas fa-user-tie"></i> المدرب: ${GameState.manager ? GameState.manager.name : 'لا يوجد'} 
                (${GameState.manager ? GameState.manager.ovr : 0})
            </div>
            ${GameState.posters.length > 0 ? `
                <div style="margin-top:5px;">
                    ${GameState.posters.map(p => '<span style="margin:0 3px;">🏅</span>').join('')}
                    بوسترات مفعلة (+${GameState.posters.includes('grandmaster') ? 30 : GameState.posters.includes('legendary') ? 15 : 5} OVR)
                </div>
            ` : ''}
        </div>
        
        <div class="formation-wrapper">
            <div class="formation-field">
                <div class="center-circle field-line"></div>
                <div class="center-line"></div>
                <div class="center-dot"></div>
                <div class="penalty-area-top field-line"></div>
                <div class="penalty-area-bottom field-line"></div>
                <div class="goal-area-top field-line"></div>
                <div class="goal-area-bottom field-line"></div>
    `;
    
    // رسم اللاعبين
    const posClasses = {
        'GK': 'pos-gk', 'LB': 'pos-lb', 'RB': 'pos-rb',
        'LW': 'pos-lw', 'RW': 'pos-rw'
    };
    
    let cbCount = 0, cmCount = 0, stCount = 0;
    
    for (let player of GameState.squad) {
        let posClass;
        
        if (player.position === 'CB') {
            posClass = cbCount === 0 ? 'pos-cb1' : 'pos-cb2';
            cbCount++;
        } else if (player.position === 'CM') {
            posClass = cmCount === 0 ? 'pos-cm1' : 'pos-cm2';
            cmCount++;
        } else if (player.position === 'ST') {
            posClass = stCount === 0 ? 'pos-st1' : 'pos-st2';
            stCount++;
        } else {
            posClass = posClasses[player.position] || 'pos-cm1';
        }
        
        const ovr = getPlayerOVR(player);
        
        html += `
            <div class="player-slot ${posClass}" onclick="openPlayerModal('${player.id}')">
                <div class="player-card-mini">
                    <span class="pos-label">${player.position}</span>
                    <span class="ovr-number">${ovr}</span>
                    <span class="player-name-mini">${player.name.split(' ').pop()}</span>
                </div>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
        
        <div style="text-align:center;margin-top:15px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-outline" onclick="startMatch('friendly')">
                <i class="fas fa-handshake"></i> مباراة ودية
            </button>
        </div>
    `;
    
    return html;
}

// ==================== تبويب الرانك ====================
function renderRankTab() {
    const rank = getRankInfo(GameState.rankPoints);
    const isChamp = isPlayerChampion();
    
    return `
        <div class="rank-display">
            <div class="rank-icon-large">${RANK_ICONS[rank.icon]}</div>
            <div class="rank-name-large">${rank.name}</div>
            <div class="rank-stars-display">${'<i class="fas fa-star" style="color:#ffd700;"></i>'.repeat(GameState.stars)}${'<i class="far fa-star" style="color:#555;"></i>'.repeat(3 - GameState.stars)}</div>
            <div class="rank-points-display">⭐ ${GameState.rankPoints} نقطة</div>
            ${isChamp ? '<p style="color:#ff00ff;font-weight:700;margin-top:10px;"><i class="fas fa-crown"></i> أنت في الصدارة! تحدي الأبطال مفعل!</p>' : ''}
        </div>
        
        <div style="text-align:center;margin:20px 0;">
            <button class="btn btn-primary btn-large" onclick="startMatch('rank')">
                <i class="fas fa-trophy"></i> بدء ماتش رانك
            </button>
            ${isChamp ? '<p style="color:var(--lose);margin-top:10px;">تحذير: الخصوم في الصدارة أقوى بكثير!</p>' : ''}
        </div>
        
        <div style="background:var(--bg-card);border-radius:var(--radius-lg);padding:15px;margin-top:15px;">
            <h3 style="color:var(--text-secondary);text-align:center;">معلومات الرانك</h3>
            <p><i class="fas fa-check-circle" style="color:var(--win);"></i> فوز = +3 نقاط + نجمة</p>
            <p><i class="fas fa-equals" style="color:var(--draw);"></i> تعادل = +1 نقطة</p>
            <p><i class="fas fa-times-circle" style="color:var(--lose);"></i> خسارة = -1 نجمة</p>
            <p><i class="fas fa-running" style="color:var(--lose);"></i> انسحاب بعد رؤية الخصم = -6 نقاط</p>
        </div>
    `;
}

// ==================== تبويب المتجر ====================
function renderStoreTab() {
    let html = '<h2 style="text-align:center;color:var(--gold);margin-bottom:15px;"><i class="fas fa-store"></i> المتجر</h2>';
    
    // الباكات
    html += '<h3 style="color:var(--accent);margin-bottom:10px;">الباكات</h3>';
    html += '<div class="store-grid">';
    
    for (let pack of STORE_PACKS) {
        html += `
            <div class="store-item">
                <div class="pack-icon" style="color:${pack.color};">
                    <i class="fas ${pack.icon}"></i>
                </div>
                <h3>${pack.name}</h3>
                <div class="item-info">${pack.description}</div>
                <div class="price-tag">💰 ${pack.price.toLocaleString()}</div>
                <button class="btn btn-primary btn-small" onclick="buyPack('${pack.id}')">
                    شراء
                </button>
            </div>
        `;
    }
    html += '</div>';
    
    // البوسترات
    html += '<h3 style="color:var(--accent);margin:20px 0 10px;">البوسترات</h3>';
    html += '<div class="store-grid">';
    
    for (let poster of STORE_POSTERS) {
        const owned = GameState.posters.includes(poster.id);
        html += `
            <div class="store-item" style="${owned ? 'border-color:var(--win);' : ''}">
                <div class="pack-icon" style="color:${poster.color};">
                    <i class="fas ${poster.icon}"></i>
                </div>
                <h3>${poster.name}</h3>
                <div class="item-info">${poster.description}</div>
                <div class="price-tag">💰 ${poster.price.toLocaleString()}</div>
                ${owned ? '<p style="color:var(--win);">مفعل</p>' : 
                    `<button class="btn btn-warning btn-small" onclick="buyPoster('${poster.id}')">شراء</button>`
                }
            </div>
        `;
    }
    html += '</div>';
    
    // BOOST
    html += '<h3 style="color:var(--accent);margin:20px 0 10px;">BOOST</h3>';
    html += '<div class="store-grid">';
    
    for (let boost of STORE_BOOST) {
        html += `
            <div class="store-item">
                <div class="pack-icon" style="color:#00d4ff;">
                    <i class="fas fa-bolt"></i>
                </div>
                <h3>${boost.amount} BOOST</h3>
                <div class="price-tag">💰 ${boost.price.toLocaleString()}</div>
                <button class="btn btn-primary btn-small" onclick="buyBoost(${boost.amount})">
                    شراء
                </button>
            </div>
        `;
    }
    html += '</div>';
    
    return html;
}

// ==================== تبويب النادي ====================
function renderClubTab() {
    const benchPlayers = GameState.club.filter(p => !isPlayerInSquad(p.id));
    
    let html = `
        <h2 style="text-align:center;color:var(--gold);margin-bottom:15px;">
            <i class="fas fa-archive"></i> النادي (${benchPlayers.length} لاعب)
        </h2>
    `;
    
    if (benchPlayers.length === 0) {
        html += '<p style="text-align:center;color:var(--text-secondary);">لا يوجد لاعبين في النادي. افتح باكات للحصول على لاعبين!</p>';
        return html;
    }
    
    html += '<div class="card-grid">';
    
    for (let player of benchPlayers) {
        const ovr = getPlayerOVR(player);
        html += `
            <div class="player-card-full" onclick="openPlayerModal('${player.id}')">
                <div class="player-ovr">${ovr}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-pos">${player.position}</div>
                ${player.skills.length > 0 ? `<div style="font-size:0.7em;color:var(--win);">${player.skills.length} مهارات</div>` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// ==================== تبويب الأهداف ====================
function renderObjectivesTab() {
    checkDailyReset();
    
    let html = `
        <h2 style="text-align:center;color:var(--gold);margin-bottom:15px;">
            <i class="fas fa-tasks"></i> الأهداف اليومية
        </h2>
        <p style="text-align:center;color:var(--text-secondary);">تتجدد كل 24 ساعة</p>
    `;
    
    for (let obj of GameState.dailyObjectives) {
        const completed = GameState.completedObjectives.includes(obj.id);
        const progressPercent = Math.min(100, (obj.progress / obj.target) * 100);
        
        html += `
            <div style="background:var(--bg-card);border-radius:var(--radius);padding:15px;margin:10px 0;
                border:2px solid ${completed ? 'var(--win)' : 'var(--border-color)'};">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span>${obj.text}</span>
                    <span style="color:var(--text-secondary);">${obj.progress}/${obj.target}</span>
                </div>
                <div style="background:var(--bg-dark);border-radius:10px;height:8px;margin:8px 0;">
                    <div style="background:${completed ? 'var(--win)' : 'var(--accent)'};border-radius:10px;
                        height:100%;width:${progressPercent}%;transition:width 0.5s;"></div>
                </div>
                <div style="color:${completed ? 'var(--win)' : '#ffd700'};font-weight:600;">
                    المكافأة: ${obj.reward.amount} ${obj.reward.type === 'coins' ? 'كوينز' : 'BOOST'}
                    ${completed ? ' <i class="fas fa-check-circle"></i>' : ''}
                </div>
            </div>
        `;
    }
    
    return html;
}

// ==================== تبويب المتصدرين ====================
function renderLeaderboardTab() {
    const leaders = generateLeaderboard();
    
    let html = `
        <h2 style="text-align:center;color:var(--gold);margin-bottom:5px;">
            <i class="fas fa-list-ol"></i> المتصدرين
        </h2>
        <p style="text-align:center;color:var(--text-secondary);margin-bottom:15px;">
            <i class="fas fa-clock"></i> يتحدث كل ساعة
        </p>
        <div class="leaderboard">
    `;
    
    leaders.forEach((l, i) => {
        const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        html += `
            <div class="leaderboard-item ${i < 3 ? 'top-rank' : ''} ${l.isPlayer ? 'is-me' : ''}">
                <span class="leaderboard-rank">${rankIcon}</span>
                <span>${l.name} ${l.isPlayer ? '(أنت)' : ''}</span>
                <span>${RANK_ICONS[l.rank.icon]} ${l.points} نقطة</span>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// ==================== تهيئة ====================
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود بيانات محفوظة
    const saved = storage.load();
    if (saved && !saved.isAdmin) {
        // يوجد بيانات محفوظة، تحميلها
        loadSavedGame(saved);
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
        checkDailyReset();
        updateAllUI();
        switchTab('squad');
    }
    
    // إضافة حدث Enter في حقل الاسم
    document.getElementById('teamNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'matchModal' && MatchState.seenOpponent && !MatchState.isFinished) {
                    handleMatchExit();
                } else {
                    this.classList.remove('active');
                }
            }
        });
    });
});