// ==================== نظام الماتش ====================

let MatchState = {
    type: '',              // 'rank' أو 'friendly'
    aiName: '',
    aiSquad: [],
    aiManager: null,
    comparisons: [],
    currentComparison: 0,
    playerWins: 0,
    aiWins: 0,
    draws: 0,
    isFinished: false,
    seenOpponent: false    // هل شاف الخصم؟
};

// توليد تشكيلة AI
function generateAISquad(rankLevel, isChampion = false) {
    const ovrRanges = {
        0: { min: 55, max: 69, skills: 0, training: 0 },
        1: { min: 65, max: 78, skills: 0.3, training: 2 },
        2: { min: 75, max: 85, skills: 0.5, training: 5 },
        3: { min: 82, max: 92, skills: 0.7, training: 8 },
        4: { min: 88, max: 97, skills: 0.8, training: 12 },
        5: { min: 92, max: 102, skills: 0.9, training: 16 },
        6: { min: 95, max: 106, skills: 1, training: 20 },
        7: { min: 98, max: 110, skills: 1, training: 22 },
        8: { min: 102, max: 115, skills: 1, training: 25 },
        9: { min: 108, max: 128, skills: 1, training: 25 }
    };
    
    const range = ovrRanges[Math.min(rankLevel, 9)] || ovrRanges[0];
    
    // لو بطل (Champion)، استخدم أعلى نطاق
    const finalRange = isChampion ? { min: 121, max: 128, skills: 1, training: 25 } : range;
    
    const aiNames = [
        'Shadow Striker', 'Phantom Keeper', 'Dark Defender', 'Silent Midfielder',
        'Ghost Winger', 'Storm Forward', 'Ice Wall', 'Thunder Foot',
        'Night Hawk', 'Iron Shield', 'Golden Boot', 'Silver Blade',
        'Crystal Pass', 'Diamond Tackle', 'Ruby Shot', 'Emerald Speed'
    ];
    
    const squad = [];
    for (let i = 0; i < 11; i++) {
        const ovr = Math.floor(Math.random() * (finalRange.max - finalRange.min + 1)) + finalRange.min;
        const baseOVR = Math.max(55, ovr - finalRange.training);
        const player = createNewPlayer(
            aiNames[i % aiNames.length] + ' ' + (i + 1),
            FORMATION[i],
            baseOVR,
            Math.floor(Math.random() * finalRange.training),
            []
        );
        
        // إضافة مهارات عشوائية
        if (Math.random() < finalRange.skills) {
            const possibleSkills = SKILLS_BY_POSITION[player.position] || ['Leadership'];
            const numSkills = Math.floor(Math.random() * 3) + 1;
            for (let s = 0; s < numSkills; s++) {
                player.skills.push(randomFromArray(possibleSkills));
            }
        }
        
        squad.push(player);
    }
    
    return squad;
}

// بدء الماتش
function startMatch(type) {
    const rank = getRankInfo(GameState.rankPoints);
    const isChampion = type === 'rank' && isPlayerChampion();
    
    MatchState = {
        type: type,
        aiName: 'Battlecards26_' + Math.floor(Math.random() * 90000000 + 10000000),
        aiSquad: generateAISquad(isChampion ? 9 : rank.level, isChampion),
        aiManager: isChampion ? createNewManager('Grand Master AI', 99, 'all') : 
                   createNewManager('AI Manager', 70 + rank.level * 3, randomFromArray(['attack', 'defense', 'midfield'])),
        comparisons: [],
        currentComparison: 0,
        playerWins: 0,
        aiWins: 0,
        draws: 0,
        isFinished: false,
        seenOpponent: false
    };
    
    // إظهار نافذة الماتش
    showMatchModal();
}

function showMatchModal() {
    document.getElementById('matchModal').classList.add('active');
    const content = document.getElementById('matchModalContent');
    const squadOVR = getSquadOVR();
    const aiSquadOVR = getAISquadOVR();
    
    content.innerHTML = `
        <button class="modal-close" onclick="handleMatchExit()">✕</button>
        <h2 style="text-align:center;color:var(--gold);">
            <i class="fas fa-futbol"></i> ${MatchState.type === 'rank' ? 'ماتش الرانك' : 'مباراة ودية'}
        </h2>
        
        <div style="display:flex;gap:15px;margin:15px 0;">
            <div class="match-team-box home" style="flex:1;">
                <div class="match-team-header">
                    <i class="fas fa-home"></i> ${GameState.teamName}
                </div>
                <p style="text-align:center;color:var(--text-secondary);">OVR: ${squadOVR}</p>
                <div style="font-size:0.8em;">
                    ${GameState.squad.map(p => `
                        <div style="display:flex;justify-content:space-between;padding:3px 0;">
                            <span>[${p.position}] ${p.name}</span>
                            <span style="color:var(--gold);">${getPlayerOVR(p)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="display:flex;align-items:center;font-size:2em;font-weight:900;color:var(--gold);">
                VS
            </div>
            
            <div class="match-team-box away" style="flex:1;">
                <div class="match-team-header">
                    <i class="fas fa-robot"></i> ${MatchState.aiName}
                </div>
                <p style="text-align:center;color:var(--text-secondary);">OVR: ${aiSquadOVR}</p>
                <div style="font-size:0.8em;">
                    ${MatchState.aiSquad.map(p => `
                        <div style="display:flex;justify-content:space-between;padding:3px 0;">
                            <span>[${p.position}] ${p.name}</span>
                            <span style="color:var(--gold);">${getPlayerOVR(p)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div id="comparisonArea" style="margin:15px 0;max-height:300px;overflow-y:auto;"></div>
        <div id="matchResult" style="text-align:center;"></div>
        
        <div style="text-align:center;margin-top:15px;">
            <button class="btn btn-primary btn-large" id="startMatchBtn" onclick="beginComparisons()">
                <i class="fas fa-play"></i> بدء المقارنات
            </button>
        </div>
    `;
    
    // تسجيل إن اللاعب شاف الخصم
    MatchState.seenOpponent = true;
}

function getAISquadOVR() {
    let total = 0;
    for (let p of MatchState.aiSquad) {
        total += getPlayerOVR(p);
    }
    if (MatchState.aiManager && MatchState.aiManager.spec === 'all') {
        total += MatchState.aiSquad.length;
    }
    return Math.round(total / 11);
}

function beginComparisons() {
    document.getElementById('startMatchBtn').style.display = 'none';
    // إخفاء تفاصيل التشكيلات وترك المقارنات فقط
    nextComparison();
}

function nextComparison() {
    if (MatchState.currentComparison >= 11) {
        finishMatch();
        return;
    }
    
    const playerPlayer = GameState.squad[MatchState.currentComparison];
    const aiPlayer = MatchState.aiSquad[MatchState.currentComparison];
    
    if (!playerPlayer || !aiPlayer) {
        MatchState.currentComparison++;
        nextComparison();
        return;
    }
    
    const playerOVR = getPlayerOVR(playerPlayer);
    const aiOVR = getPlayerOVR(aiPlayer);
    
    let result, resultClass, resultIcon;
    if (playerOVR > aiOVR) {
        result = 'win';
        resultClass = 'win';
        resultIcon = '>';
        MatchState.playerWins++;
        recordMatchResult(playerPlayer.id, 'win');
    } else if (playerOVR < aiOVR) {
        result = 'lose';
        resultClass = 'lose';
        resultIcon = '<';
        MatchState.aiWins++;
        recordMatchResult(playerPlayer.id, 'lose');
    } else {
        result = 'draw';
        resultClass = 'draw';
        resultIcon = '=';
        MatchState.draws++;
        recordMatchResult(playerPlayer.id, 'draw');
    }
    
    // إضافة المقارنة للعرض
    const compHTML = `
        <div class="match-comparison-row" style="animation-delay:${MatchState.currentComparison * 0.1}s;">
            <div class="match-player-info">
                <div class="mp-name">${playerPlayer.name}</div>
                <div class="mp-ovr">${playerOVR}</div>
            </div>
            <div class="match-vs-icon ${resultClass}">${resultIcon}</div>
            <div class="match-player-info">
                <div class="mp-name">${aiPlayer.name}</div>
                <div class="mp-ovr">${aiOVR}</div>
            </div>
        </div>
    `;
    
    document.getElementById('comparisonArea').innerHTML += compHTML;
    document.getElementById('comparisonArea').scrollTop = document.getElementById('comparisonArea').scrollHeight;
    
    MatchState.currentComparison++;
    
    // زر المتابعة
    if (MatchState.currentComparison < 11) {
        setTimeout(nextComparison, 800);
    } else {
        setTimeout(finishMatch, 1000);
    }
}

function finishMatch() {
    MatchState.isFinished = true;
    const resultDiv = document.getElementById('matchResult');
    const squadOVR = getSquadOVR();
    const aiSquadOVR = getAISquadOVR();
    
    let finalResult, resultClass, pointsChange, coinsEarned;
    
    if (MatchState.playerWins > MatchState.aiWins) {
        finalResult = 'فوز!';
        resultClass = 'result-win';
        pointsChange = MatchState.type === 'rank' ? 3 : 0;
        coinsEarned = MatchState.type === 'rank' ? 50 : 25;
    } else if (MatchState.playerWins < MatchState.aiWins) {
        finalResult = 'خسارة!';
        resultClass = 'result-lose';
        pointsChange = MatchState.type === 'rank' ? 0 : 0;
        coinsEarned = MatchState.type === 'rank' ? 12 : 5;
    } else {
        // تعادل - OVR التشكيلة يحسم
        if (squadOVR > aiSquadOVR) {
            finalResult = 'فوز! (OVR التشكيلة)';
            resultClass = 'result-win';
            pointsChange = MatchState.type === 'rank' ? 3 : 0;
            coinsEarned = MatchState.type === 'rank' ? 50 : 25;
        } else if (squadOVR < aiSquadOVR) {
            finalResult = 'خسارة! (OVR التشكيلة)';
            resultClass = 'result-lose';
            pointsChange = MatchState.type === 'rank' ? 0 : 0;
            coinsEarned = MatchState.type === 'rank' ? 12 : 5;
        } else {
            finalResult = 'تعادل!';
            resultClass = 'result-draw';
            pointsChange = MatchState.type === 'rank' ? 1 : 0;
            coinsEarned = MatchState.type === 'rank' ? 25 : 12;
        }
    }
    
    // تحديث النقاط
    if (MatchState.type === 'rank') {
        updateRankPoints(pointsChange, finalResult.includes('فوز'), finalResult.includes('خسارة'));
    }
    
    // إضافة الكوينز
    addCoins(coinsEarned);
    
    // تحديث الإحصائيات
    GameState.matchesPlayed++;
    if (finalResult.includes('فوز')) GameState.matchesWon++;
    else if (finalResult.includes('خسارة')) GameState.matchesLost++;
    else GameState.matchesDrawn++;
    
    // تحديث الأهداف اليومية
    updateDailyObjective('obj_1', 1); // لعب ماتش
    if (finalResult.includes('فوز')) updateDailyObjective('obj_2', 1); // فوز
    
    saveGame();
    updateAllUI();
    
    resultDiv.innerHTML = `
        <div class="match-final-result ${resultClass}">
            <h2>${finalResult}</h2>
            <p style="font-size:1.5em;">${MatchState.playerWins} - ${MatchState.aiWins}</p>
            ${pointsChange !== 0 ? `<p>⭐ ${pointsChange > 0 ? '+' + pointsChange : pointsChange} نقطة</p>` : ''}
            <p>💰 +${coinsEarned} كوينز</p>
        </div>
        <button class="btn btn-primary" onclick="closeMatch()">
            <i class="fas fa-check"></i> موافق
        </button>
    `;
}

function handleMatchExit() {
    if (MatchState.seenOpponent && !MatchState.isFinished) {
        // عقوبة الانسحاب
        if (confirm('تحذير! إذا خرجت الآن سيتم خصم 6 نقاط من الرانك. هل تريد الخروج؟')) {
            if (MatchState.type === 'rank') {
                GameState.rankPoints = Math.max(0, GameState.rankPoints - 6);
                GameState.stars = Math.max(1, GameState.stars - 1);
                showNotification('تم خصم 6 نقاط لانسحابك من الماتش!', 'warning');
            }
            saveGame();
            updateAllUI();
            closeMatch();
        }
    } else {
        closeMatch();
    }
}

function closeMatch() {
    document.getElementById('matchModal').classList.remove('active');
    MatchState = {
        type: '',
        aiName: '',
        aiSquad: [],
        aiManager: null,
        comparisons: [],
        currentComparison: 0,
        playerWins: 0,
        aiWins: 0,
        draws: 0,
        isFinished: false,
        seenOpponent: false
    };
    switchTab('squad');
}