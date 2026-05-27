// ==================== نظام اللاعب ====================

let currentPlayerId = null;

// تدريب اللاعب
function trainPlayer(playerId) {
    const player = findPlayerById(playerId);
    if (!player) return;
    
    const maxTraining = getMaxTrainingLevel(player.baseOVR);
    if (player.trainingLevel >= maxTraining) {
        showNotification('اللاعب وصل لأقصى ترقية! MAX', 'warning');
        return;
    }
    
    const cost = getTrainingCost(player.trainingLevel);
    if (!spendCoins(cost)) {
        showNotification('الكوينز غير كافية! تحتاج ' + cost.toLocaleString() + ' كوينز', 'warning');
        return;
    }
    
    player.trainingLevel++;
    const newOVR = getPlayerOVR(player);
    
    // تحديث الأهداف
    updateDailyObjective('obj_3', 1);
    
    saveGame();
    updateAllUI();
    
    showNotification('تم ترقية ' + player.name + ' إلى OVR ' + newOVR + '!', 'success');
    openPlayerModal(playerId);
}

// فتح مهارة
function unlockSkill(playerId, slotIndex) {
    const player = findPlayerById(playerId);
    if (!player) return;
    
    if (player.skills[slotIndex]) {
        showNotification('هذه الخانة مفتوحة بالفعل!', 'warning');
        return;
    }
    
    const cost = getSkillCost(slotIndex);
    if (!spendBoost(cost)) {
        showNotification('BOOST غير كافية! تحتاج ' + cost + ' BOOST', 'warning');
        return;
    }
    
    // اختيار مهارة عشوائية مناسبة للمركز
    const possibleSkills = SKILLS_BY_POSITION[player.position] || ['Leadership'];
    const availableSkills = possibleSkills.filter(s => !player.skills.includes(s));
    const skill = availableSkills.length > 0 ? randomFromArray(availableSkills) : randomFromArray(possibleSkills);
    
    player.skills[slotIndex] = skill;
    const newOVR = getPlayerOVR(player);
    
    saveGame();
    updateAllUI();
    
    showNotification('تم فتح مهارة "' + skill + '"! +1 OVR (الإجمالي: ' + newOVR + ')', 'success');
    openPlayerModal(playerId);
}

// تبديل لاعب
function swapPlayer(fromPlayerId, toPlayerId) {
    if (fromPlayerId === toPlayerId) return;
    
    const fromInSquad = isPlayerInSquad(fromPlayerId);
    const toInSquad = isPlayerInSquad(toPlayerId);
    
    if (fromInSquad && toInSquad) {
        showNotification('لا يمكن تبديل لاعبين كلاهما في التشكيلة!', 'warning');
        return;
    }
    
    let squadPlayer, clubPlayer;
    
    if (fromInSquad) {
        squadPlayer = GameState.squad.find(p => p.id === fromPlayerId);
        clubPlayer = GameState.club.find(p => p.id === toPlayerId);
    } else {
        squadPlayer = GameState.squad.find(p => p.id === toPlayerId);
        clubPlayer = GameState.club.find(p => p.id === fromPlayerId);
    }
    
    if (!squadPlayer || !clubPlayer) {
        showNotification('حدث خطأ في التبديل!', 'warning');
        return;
    }
    
    // تنفيذ التبديل
    const squadIndex = GameState.squad.indexOf(squadPlayer);
    const clubIndex = GameState.club.indexOf(clubPlayer);
    
    GameState.squad[squadIndex] = clubPlayer;
    GameState.club[clubIndex] = squadPlayer;
    
    saveGame();
    updateAllUI();
    
    showNotification('تم التبديل بنجاح!', 'success');
    closePlayerModal();
    switchTab('squad');
}

// بيع لاعب
function sellPlayer(playerId) {
    if (isPlayerInSquad(playerId)) {
        showNotification('لا يمكن بيع لاعب موجود في التشكيلة!', 'warning');
        return;
    }
    
    const player = findPlayerById(playerId);
    if (!player) return;
    
    const price = getPlayerSellPrice(player);
    
    if (confirm('هل أنت متأكد من بيع ' + player.name + '؟\nالسعر: ' + price.toLocaleString() + ' كوينز')) {
        removePlayerFromClub(playerId);
        addCoins(price);
        saveGame();
        updateAllUI();
        closePlayerModal();
        showNotification('تم بيع ' + player.name + ' مقابل ' + price.toLocaleString() + ' كوينز', 'success');
    }
}

// فتح نافذة اللاعب
function openPlayerModal(playerId) {
    currentPlayerId = playerId;
    const player = findPlayerById(playerId);
    if (!player) return;
    
    document.getElementById('playerModal').classList.add('active');
    const content = document.getElementById('playerModalContent');
    
    const ovr = getPlayerOVR(player);
    const maxTraining = getMaxTrainingLevel(player.baseOVR);
    const isMaxed = player.trainingLevel >= maxTraining;
    const inSquad = isPlayerInSquad(playerId);
    
    content.innerHTML = `
        <button class="modal-close" onclick="closePlayerModal()">✕</button>
        
        <div style="text-align:center;">
            <div style="font-size:2em;font-weight:900;color:var(--gold);">${ovr}</div>
            <h2>${player.name}</h2>
            <p style="color:var(--text-secondary);">${player.position} | الأساسي: ${player.baseOVR}</p>
        </div>
        
        <div class="nav-tabs" style="justify-content:center;margin:15px 0;">
            <button class="nav-tab active" onclick="switchPlayerSubTab('stats', '${playerId}')">
                <i class="fas fa-chart-bar"></i> إحصائيات
            </button>
            <button class="nav-tab" onclick="switchPlayerSubTab('training', '${playerId}')">
                <i class="fas fa-dumbbell"></i> تدريب
            </button>
            <button class="nav-tab" onclick="switchPlayerSubTab('skills', '${playerId}')">
                <i class="fas fa-bolt"></i> مهارات
            </button>
            <button class="nav-tab" onclick="switchPlayerSubTab('swap', '${playerId}')">
                <i class="fas fa-exchange-alt"></i> تبديل
            </button>
            ${!inSquad ? `<button class="nav-tab" onclick="sellPlayer('${playerId}')">
                <i class="fas fa-coins"></i> بيع
            </button>` : ''}
        </div>
        
        <div id="playerSubTabContent">
            ${renderPlayerStats(player)}
        </div>
    `;
}

function switchPlayerSubTab(tab, playerId) {
    const player = findPlayerById(playerId);
    if (!player) return;
    
    // تحديث التبويبات النشطة
    const tabs = document.querySelectorAll('#playerModalContent .nav-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('playerSubTabContent');
    
    switch (tab) {
        case 'stats':
            content.innerHTML = renderPlayerStats(player);
            break;
        case 'training':
            content.innerHTML = renderPlayerTraining(player);
            break;
        case 'skills':
            content.innerHTML = renderPlayerSkills(player);
            break;
        case 'swap':
            content.innerHTML = renderPlayerSwap(player);
            break;
    }
}

function renderPlayerStats(player) {
    return `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value" style="color:var(--win);">${player.stats.wins}</div>
                <div class="stat-label"><i class="fas fa-check-circle"></i> فوز في المقارنة</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color:var(--draw);">${player.stats.draws}</div>
                <div class="stat-label"><i class="fas fa-equals"></i> تعادل</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color:var(--lose);">${player.stats.losses}</div>
                <div class="stat-label"><i class="fas fa-times-circle"></i> خسارة</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${player.stats.matches}</div>
                <div class="stat-label"><i class="fas fa-futbol"></i> مجموع الماتشات</div>
            </div>
        </div>
    `;
}

function renderPlayerTraining(player) {
    const maxTraining = getMaxTrainingLevel(player.baseOVR);
    const isMaxed = player.trainingLevel >= maxTraining;
    const currentOVR = getPlayerOVR(player);
    
    if (isMaxed) {
        return `
            <div style="text-align:center;padding:20px;">
                <div style="font-size:3em;color:var(--gold);margin-bottom:10px;">MAX</div>
                <p>وصل اللاعب لأقصى ترقية!</p>
                <p>OVR الحالي: <strong style="color:var(--gold);">${currentOVR}</strong></p>
            </div>
        `;
    }
    
    const cost = getTrainingCost(player.trainingLevel);
    const newOVR = currentOVR + 1;
    const remaining = maxTraining - player.trainingLevel;
    
    return `
        <div style="text-align:center;padding:20px;">
            <p>الترقية الحالية: <strong>${player.trainingLevel}</strong> من <strong>${maxTraining}</strong></p>
            <p>المتبقي: <strong>${remaining}</strong> ترقيات</p>
            <p>OVR الحالي: <strong style="color:var(--gold);font-size:1.3em;">${currentOVR}</strong></p>
            <p style="color:var(--win);">OVR التالي: <strong style="font-size:1.3em;">${newOVR}</strong></p>
            <p>سعر الترقية: <strong style="color:#ffd700;">${cost.toLocaleString()}</strong> كوينز</p>
            <button class="btn btn-success btn-large" onclick="trainPlayer('${player.id}')">
                <i class="fas fa-arrow-up"></i> ترقية +1 OVR
            </button>
            <p style="color:var(--text-secondary);margin-top:10px;">
                💰 رصيدك: ${GameState.isAdmin ? '∞' : GameState.coins.toLocaleString()} كوينز
            </p>
        </div>
    `;
}

function renderPlayerSkills(player) {
    let html = '<div style="padding:10px;">';
    html += '<p style="text-align:center;color:var(--text-secondary);">كل مهارة مفتوحة تمنح +1 OVR</p>';
    
    for (let i = 0; i < 3; i++) {
        if (player.skills[i]) {
            const icon = SKILL_ICONS[player.skills[i]] || 'fa-star';
            html += `
                <div class="skill-slot unlocked">
                    <i class="fas ${icon}" style="color:var(--win);"></i>
                    <span class="skill-name">${player.skills[i]}</span>
                    <span style="color:var(--win);">(+1 OVR)</span>
                </div>
            `;
        } else {
            const cost = getSkillCost(i);
            const canAfford = GameState.isAdmin || GameState.boost >= cost;
            html += `
                <div class="skill-slot">
                    <i class="fas fa-lock" style="color:var(--text-secondary);"></i>
                    <span>الخانة ${i + 1} - مغلقة</span>
                    <div style="color:#00d4ff;">السعر: ${cost} BOOST</div>
                    <button class="btn btn-warning btn-small" 
                        onclick="unlockSkill('${player.id}', ${i})"
                        ${!canAfford ? 'disabled' : ''}>
                        <i class="fas fa-random"></i> فتح عشوائي
                    </button>
                </div>
            `;
        }
    }
    
    html += `
        <p style="text-align:center;margin-top:10px;">
            💎 رصيدك: ${GameState.isAdmin ? '∞' : GameState.boost} BOOST
        </p>
    </div>`;
    
    return html;
}

function renderPlayerSwap(player) {
    const benchPlayers = GameState.club.filter(p => 
        !isPlayerInSquad(p.id) && p.position === player.position
    );
    
    if (benchPlayers.length === 0) {
        return '<p style="text-align:center;padding:20px;">لا يوجد لاعبين بدلاء في هذا المركز</p>';
    }
    
    let html = '<div style="max-height:350px;overflow-y:auto;">';
    html += '<p style="text-align:center;color:var(--text-secondary);">اختر لاعب للتبديل:</p>';
    
    for (let p of benchPlayers) {
        html += `
            <div class="match-comparison-row" style="cursor:pointer;"
                onclick="swapPlayer('${player.id}', '${p.id}')">
                <span><strong>${p.name}</strong> (${p.position})</span>
                <span style="color:var(--gold);">OVR: ${getPlayerOVR(p)}</span>
                <button class="btn btn-small btn-primary">
                    <i class="fas fa-exchange-alt"></i> تبديل
                </button>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

function closePlayerModal() {
    document.getElementById('playerModal').classList.remove('active');
    currentPlayerId = null;
}