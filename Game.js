// ==================== الحالة الأساسية للعبة ====================

const GameState = {
    teamName: '',
    isAdmin: false,
    coins: 0,
    boost: 0,
    rankPoints: 0,
    stars: 1,
    squad: [],           // 11 لاعب أساسي
    club: [],            // كل اللاعبين
    manager: null,
    posters: [],         // ['rare', 'legendary', 'grandmaster']
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    matchesDrawn: 0,
    dailyObjectives: [],
    lastDailyReset: null,
    completedObjectives: []
};

// ==================== دوال التهيئة ====================

function createNewPlayer(name, position, baseOVR, trainingLevel = 0, skills = []) {
    return {
        id: generateId(),
        name: name,
        position: normalizePosition(position),
        baseOVR: baseOVR,
        trainingLevel: trainingLevel,
        skills: skills,
        stats: {
            wins: 0,
            draws: 0,
            losses: 0,
            matches: 0
        }
    };
}

function createNewManager(name, ovr, spec) {
    return {
        id: generateId(),
        name: name,
        ovr: ovr,
        spec: spec, // 'attack', 'defense', 'midfield', 'all'
        isActive: true
    };
}

function generateStarterSquad() {
    const pool = shuffleArray(STARTER_PLAYERS);
    const squad = [];
    const posCount = {};
    
    for (let player of pool) {
        const pos = normalizePosition(player.position);
        if (!posCount[pos]) posCount[pos] = 0;
        
        const maxForPos = FORMATION_POSITIONS[pos] || 1;
        
        if (posCount[pos] < maxForPos && squad.length < 11) {
            squad.push(createNewPlayer(player.name, pos, player.baseOVR));
            posCount[pos]++;
        }
        
        if (squad.length >= 11) break;
    }
    
    // نتأكد إن التشكيلة كاملة
    while (squad.length < 11) {
        const remaining = pool.find(p => {
            const pos = normalizePosition(p.position);
            const count = squad.filter(sp => sp.position === pos).length;
            return count < (FORMATION_POSITIONS[pos] || 1);
        });
        if (!remaining) break;
        squad.push(createNewPlayer(remaining.name, normalizePosition(remaining.position), remaining.baseOVR));
    }
    
    return squad;
}

function generateFullClub() {
    const allPlayers = shuffleArray(STARTER_PLAYERS);
    return allPlayers.map(p => createNewPlayer(p.name, normalizePosition(p.position), p.baseOVR));
}

function generateStarterManager() {
    const m = randomFromArray(STARTER_MANAGERS);
    return createNewManager(m.name, m.ovr, m.spec);
}

function generateDailyObjectives() {
    return [
        {
            id: 'obj_1',
            text: 'العب 3 ماتشات',
            target: 3,
            progress: 0,
            reward: { type: 'coins', amount: 200 }
        },
        {
            id: 'obj_2',
            text: 'اكسب ماتشين',
            target: 2,
            progress: 0,
            reward: { type: 'coins', amount: 300 }
        },
        {
            id: 'obj_3',
            text: 'طور لاعب مرة واحدة',
            target: 1,
            progress: 0,
            reward: { type: 'coins', amount: 250 }
        },
        {
            id: 'obj_4',
            text: 'استخدم باك واحد',
            target: 1,
            progress: 0,
            reward: { type: 'boost', amount: 1 }
        }
    ];
}

function checkDailyReset() {
    const today = new Date().toDateString();
    if (GameState.lastDailyReset !== today) {
        GameState.dailyObjectives = generateDailyObjectives();
        GameState.completedObjectives = [];
        GameState.lastDailyReset = today;
        saveGame();
    }
}

// ==================== دوال حساب القيم ====================

function getPlayerOVR(player) {
    if (!player) return 0;
    let ovr = player.baseOVR + player.trainingLevel;
    ovr += (player.skills ? player.skills.length : 0);
    return ovr;
}

function getMaxTrainingLevel(baseOVR) {
    if (baseOVR <= 80) return 15;
    if (baseOVR <= 90) return 20;
    return 25;
}

function getTrainingCost(currentLevel) {
    const costs = [
        500, 750, 1000, 1500, 2000, 2500, 3200, 4000, 5000, 6000,
        7500, 9000, 11000, 13000, 15000, 18000, 21000, 25000, 30000,
        35000, 40000, 50000, 60000, 75000, 100000
    ];
    if (currentLevel >= costs.length) return 100000;
    return costs[currentLevel];
}

function getSkillCost(slotIndex) {
    const costs = [2, 4, 8];
    return costs[slotIndex] || 8;
}

function getSquadOVR() {
    if (!GameState.squad || GameState.squad.length === 0) return 0;
    
    let total = 0;
    for (let player of GameState.squad) {
        total += getPlayerOVR(player);
    }
    
    // بونص المدرب
    if (GameState.manager) {
        const spec = GameState.manager.spec;
        if (spec === 'defense') {
            total += GameState.squad.filter(p => ['CB', 'LB', 'RB'].includes(p.position)).length;
        } else if (spec === 'midfield') {
            total += GameState.squad.filter(p => p.position === 'CM').length;
        } else if (spec === 'attack') {
            total += GameState.squad.filter(p => ['RW', 'LW', 'ST'].includes(p.position)).length;
        } else if (spec === 'all') {
            total += GameState.squad.length;
        }
    }
    
    // بونص البوسترات
    if (GameState.posters) {
        if (GameState.posters.includes('rare')) total += 5 * GameState.squad.length;
        if (GameState.posters.includes('legendary')) total += 10 * GameState.squad.length;
        if (GameState.posters.includes('grandmaster')) total += 15 * GameState.squad.length;
    }
    
    return Math.round(total / 11);
}

function getPlayerSellPrice(player) {
    const basePrice = player.baseOVR * 50;
    const trainingBonus = player.trainingLevel * 200;
    const skillsBonus = (player.skills ? player.skills.length : 0) * 1000;
    return basePrice + trainingBonus + skillsBonus;
}

// ==================== دوال إدارة اللاعبين ====================

function isPlayerInSquad(playerId) {
    return GameState.squad.some(p => p.id === playerId);
}

function findPlayerById(playerId) {
    let player = GameState.squad.find(p => p.id === playerId);
    if (!player) player = GameState.club.find(p => p.id === playerId);
    return player;
}

function removePlayerFromClub(playerId) {
    GameState.club = GameState.club.filter(p => p.id !== playerId);
}

function addPlayerToClub(player) {
    GameState.club.push(player);
}

function swapPlayerInSquad(squadPlayerId, clubPlayerId) {
    const squadIndex = GameState.squad.findIndex(p => p.id === squadPlayerId);
    const clubIndex = GameState.club.findIndex(p => p.id === clubPlayerId);
    
    if (squadIndex === -1 || clubIndex === -1) return false;
    
    const squadPlayer = GameState.squad[squadIndex];
    const clubPlayer = GameState.club[clubIndex];
    
    // تبديل
    GameState.squad[squadIndex] = clubPlayer;
    GameState.club[clubIndex] = squadPlayer;
    
    saveGame();
    return true;
}

function movePlayerToBench(playerId) {
    const index = GameState.squad.findIndex(p => p.id === playerId);
    if (index === -1) return false;
    
    const player = GameState.squad[index];
    GameState.squad.splice(index, 1);
    addPlayerToClub(player);
    
    // نحتاج نضيف لاعب من النادي مكانه
    const replacement = GameState.club.find(p => p.position === player.position);
    if (replacement) {
        removePlayerFromClub(replacement.id);
        GameState.squad.push(replacement);
    }
    
    saveGame();
    return true;
}

// ==================== دوال الإحصائيات ====================

function recordMatchResult(playerId, result) {
    const player = findPlayerById(playerId);
    if (!player) return;
    
    player.stats.matches++;
    if (result === 'win') player.stats.wins++;
    else if (result === 'draw') player.stats.draws++;
    else if (result === 'lose') player.stats.losses++;
}

function updateDailyObjective(objectiveId, amount = 1) {
    const objective = GameState.dailyObjectives.find(o => o.id === objectiveId);
    if (!objective) return;
    
    objective.progress = Math.min(objective.target, objective.progress + amount);
    
    if (objective.progress >= objective.target && !GameState.completedObjectives.includes(objectiveId)) {
        GameState.completedObjectives.push(objectiveId);
        // منح المكافأة
        if (objective.reward.type === 'coins') {
            GameState.coins += objective.reward.amount;
        } else if (objective.reward.type === 'boost') {
            GameState.boost += objective.reward.amount;
        }
        showNotification('تم إكمال هدف يومي! المكافأة: ' + objective.reward.amount + ' ' + 
            (objective.reward.type === 'coins' ? 'كوينز' : 'BOOST'));
    }
}

// ==================== دوال الحفظ والتحميل ====================

function saveGame() {
    if (GameState.isAdmin) return; // ما نحفظش حساب الأدمن
    
    const saveData = {
        teamName: GameState.teamName,
        isAdmin: GameState.isAdmin,
        coins: GameState.coins,
        boost: GameState.boost,
        rankPoints: GameState.rankPoints,
        stars: GameState.stars,
        squad: GameState.squad,
        club: GameState.club,
        manager: GameState.manager,
        posters: GameState.posters,
        matchesPlayed: GameState.matchesPlayed,
        matchesWon: GameState.matchesWon,
        matchesLost: GameState.matchesLost,
        matchesDrawn: GameState.matchesDrawn,
        dailyObjectives: GameState.dailyObjectives,
        lastDailyReset: GameState.lastDailyReset,
        completedObjectives: GameState.completedObjectives
    };
    
    return storage.save(saveData);
}

function loadGame() {
    const data = storage.load();
    if (!data) return null;
    return data;
}

// ==================== دوال الأموال ====================

function addCoins(amount) {
    if (GameState.isAdmin) return;
    GameState.coins += amount;
    updateResourcesDisplay();
}

function spendCoins(amount) {
    if (GameState.isAdmin) return true;
    if (GameState.coins < amount) return false;
    GameState.coins -= amount;
    updateResourcesDisplay();
    return true;
}

function addBoost(amount) {
    if (GameState.isAdmin) return;
    GameState.boost += amount;
    updateResourcesDisplay();
}

function spendBoost(amount) {
    if (GameState.isAdmin) return true;
    if (GameState.boost < amount) return false;
    GameState.boost -= amount;
    updateResourcesDisplay();
    return true;
}

// ==================== دالة تسجيل الدخول ====================

function login() {
    const nameInput = document.getElementById('teamNameInput');
    const teamName = nameInput.value.trim();
    
    if (!teamName) {
        showNotification('من فضلك اكتب اسم التشكيلة!', 'warning');
        return;
    }
    
    // التحقق من حساب الأدمن
    if (teamName === 'Battlecards26_12345678') {
        setupAdminAccount();
        return;
    }
    
    // محاولة تحميل بيانات محفوظة
    const savedData = storage.load();
    
    if (savedData && savedData.teamName === teamName) {
        // تحميل البيانات المحفوظة
        loadSavedGame(savedData);
    } else if (savedData && savedData.teamName !== teamName) {
        // اسم مختلف - لاعب جديد
        setupNewGame(teamName);
    } else {
        // لا يوجد بيانات محفوظة - لاعب جديد
        setupNewGame(teamName);
    }
    
    // دخول اللعبة
    enterGame();
}

function setupAdminAccount() {
    GameState.teamName = 'Battlecards26_12345678';
    GameState.isAdmin = true;
    GameState.coins = Infinity;
    GameState.boost = Infinity;
    GameState.rankPoints = 1300;
    GameState.stars = 3;
    GameState.posters = ['rare', 'legendary', 'grandmaster'];
    GameState.manager = createNewManager('Pep Guardiola', 99, 'all');
    GameState.squad = [];
    GameState.club = [];
    GameState.dailyObjectives = [];
    
    // توليد لاعبين MAX للأدمن
    const adminNames = [
        'Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappe', 'Erling Haaland',
        'Vinicius Junior', 'Jude Bellingham', 'Kevin De Bruyne', 'Mohamed Salah',
        'Thibaut Courtois', 'Virgil van Dijk', 'Alphonso Davies'
    ];
    
    const adminPositions = ['RW', 'LW', 'ST', 'ST', 'LW', 'CM', 'CM', 'RW', 'GK', 'CB', 'LB'];
    
    for (let i = 0; i < adminNames.length; i++) {
        const player = createNewPlayer(adminNames[i], adminPositions[i], 99, 25, 
            ['Finishing', 'Leadership', 'Ball Control']);
        GameState.squad.push(player);
    }
    
    enterGame();
}

function setupNewGame(teamName) {
    GameState.teamName = teamName;
    GameState.isAdmin = false;
    GameState.coins = 500;
    GameState.boost = 2;
    GameState.rankPoints = 0;
    GameState.stars = 1;
    GameState.posters = [];
    GameState.matchesPlayed = 0;
    GameState.matchesWon = 0;
    GameState.matchesLost = 0;
    GameState.matchesDrawn = 0;
    
    // توليد التشكيلة والنادي
    GameState.squad = generateStarterSquad();
    GameState.club = generateFullClub();
    
    // إزالة اللاعبين الموجودين في التشكيلة من النادي
    const squadIds = GameState.squad.map(p => p.id);
    GameState.club = GameState.club.filter(p => !squadIds.includes(p.id));
    
    // مدرب عشوائي
    GameState.manager = generateStarterManager();
    
    // أهداف يومية
    GameState.dailyObjectives = generateDailyObjectives();
    GameState.completedObjectives = [];
    GameState.lastDailyReset = new Date().toDateString();
    
    saveGame();
}

function loadSavedGame(savedData) {
    GameState.teamName = savedData.teamName;
    GameState.isAdmin = savedData.isAdmin || false;
    GameState.coins = savedData.coins;
    GameState.boost = savedData.boost;
    GameState.rankPoints = savedData.rankPoints;
    GameState.stars = savedData.stars;
    GameState.squad = savedData.squad;
    GameState.club = savedData.club;
    GameState.manager = savedData.manager;
    GameState.posters = savedData.posters || [];
    GameState.matchesPlayed = savedData.matchesPlayed || 0;
    GameState.matchesWon = savedData.matchesWon || 0;
    GameState.matchesLost = savedData.matchesLost || 0;
    GameState.matchesDrawn = savedData.matchesDrawn || 0;
    GameState.dailyObjectives = savedData.dailyObjectives || [];
    GameState.lastDailyReset = savedData.lastDailyReset;
    GameState.completedObjectives = savedData.completedObjectives || [];
}

function enterGame() {
    // إخفاء شاشة تسجيل الدخول
    document.getElementById('login-screen').classList.remove('active');
    // إظهار الشاشة الرئيسية
    document.getElementById('main-screen').classList.add('active');
    
    // التحقق من الأهداف اليومية
    checkDailyReset();
    
    // تحديث الواجهة
    updateAllUI();
    
    // فتح تبويب التشكيلة
    switchTab('squad');
}

// ==================== إشعارات ====================

function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // إضافة للصفحة
    document.body.appendChild(notification);
    
    // إظهار
    setTimeout(() => notification.classList.add('show'), 100);
    
    // إخفاء بعد 3 ثواني
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// إضافة أنماط الإشعارات
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-120px);
        background: var(--bg-card);
        color: var(--text);
        padding: 12px 25px;
        border-radius: var(--radius);
        z-index: 9999;
        border: 2px solid var(--border-color);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        transition: transform 0.3s ease;
        max-width: 90%;
    }
    .notification.show {
        transform: translateX(-50%) translateY(0);
    }
    .notification-success { border-color: var(--win); }
    .notification-warning { border-color: var(--draw); }
    .notification-info { border-color: var(--accent); }
`;
document.head.appendChild(notificationStyle);