// ==================== نظام الرانك ====================

const RANKS = [
    { name: 'برونز 1', icon: 'bronze', level: 0, min: 0, max: 29 },
    { name: 'برونز 2', icon: 'bronze', level: 0, min: 30, max: 59 },
    { name: 'برونز 3', icon: 'bronze', level: 0, min: 60, max: 99 },
    { name: 'فضي 1', icon: 'silver', level: 1, min: 100, max: 139 },
    { name: 'فضي 2', icon: 'silver', level: 1, min: 140, max: 179 },
    { name: 'فضي 3', icon: 'silver', level: 1, min: 180, max: 219 },
    { name: 'ذهب 1', icon: 'gold', level: 2, min: 220, max: 259 },
    { name: 'ذهب 2', icon: 'gold', level: 2, min: 260, max: 299 },
    { name: 'ذهب 3', icon: 'gold', level: 2, min: 300, max: 349 },
    { name: 'بلاتيني 1', icon: 'platinum', level: 3, min: 350, max: 399 },
    { name: 'بلاتيني 2', icon: 'platinum', level: 3, min: 400, max: 449 },
    { name: 'بلاتيني 3', icon: 'platinum', level: 3, min: 450, max: 499 },
    { name: 'ماسي 1', icon: 'diamond', level: 4, min: 500, max: 549 },
    { name: 'ماسي 2', icon: 'diamond', level: 4, min: 550, max: 599 },
    { name: 'ماسي 3', icon: 'diamond', level: 4, min: 600, max: 649 },
    { name: 'متفوق 1', icon: 'elite', level: 5, min: 650, max: 699 },
    { name: 'متفوق 2', icon: 'elite', level: 5, min: 700, max: 749 },
    { name: 'متفوق 3', icon: 'elite', level: 5, min: 750, max: 799 },
    { name: 'متفوق بارع 1', icon: 'elite-pro', level: 6, min: 800, max: 849 },
    { name: 'متفوق بارع 2', icon: 'elite-pro', level: 6, min: 850, max: 899 },
    { name: 'متفوق بارع 3', icon: 'elite-pro', level: 6, min: 900, max: 949 },
    { name: 'متفوق مسيطر 1', icon: 'elite-dom', level: 7, min: 950, max: 999 },
    { name: 'متفوق مسيطر 2', icon: 'elite-dom', level: 7, min: 1000, max: 1049 },
    { name: 'متفوق مسيطر 3', icon: 'elite-dom', level: 7, min: 1050, max: 1099 },
    { name: 'أسطوري 1', icon: 'legendary', level: 8, min: 1100, max: 1149 },
    { name: 'أسطوري 2', icon: 'legendary', level: 8, min: 1150, max: 1199 },
    { name: 'أسطوري 3', icon: 'legendary', level: 8, min: 1200, max: 1249 },
    { name: 'جراند ماستر', icon: 'grandmaster', level: 9, min: 1250, max: Infinity }
];

const RANK_ICONS = {
    'bronze': '<i class="fas fa-medal" style="color:#cd7f32;"></i>',
    'silver': '<i class="fas fa-medal" style="color:#c0c0c0;"></i>',
    'gold': '<i class="fas fa-medal" style="color:#ffd700;"></i>',
    'platinum': '<i class="fas fa-gem" style="color:#e5e4e2;"></i>',
    'diamond': '<i class="fas fa-gem" style="color:#b9f2ff;"></i>',
    'elite': '<i class="fas fa-star" style="color:#ff6b6b;"></i>',
    'elite-pro': '<i class="fas fa-star" style="color:#ff4500;"></i>',
    'elite-dom': '<i class="fas fa-crown" style="color:#ffd700;"></i>',
    'legendary': '<i class="fas fa-fire" style="color:#ff4500;"></i>',
    'grandmaster': '<i class="fas fa-crown" style="color:#ff00ff;"></i>'
};

const RANK_REWARDS = {
    1: { coins: 500, boost: 1, pack: null },
    2: { coins: 1000, boost: 2, pack: 'gold' },
    3: { coins: 2000, boost: 5, pack: 'platinum' },
    4: { coins: 3000, boost: 5, pack: 'diamond' },
    5: { coins: 5000, boost: 10, pack: 'elite' },
    6: { coins: 10000, boost: 10, poster: 'rare' },
    7: { coins: 15000, boost: 15, poster: 'legendary' },
    8: { coins: 25000, boost: 25, poster: 'legendary' },
    9: { coins: 50000, boost: 50, poster: 'grandmaster' }
};

function getRankInfo(points) {
    for (let rank of RANKS) {
        if (points >= rank.min && points <= rank.max) return rank;
    }
    return RANKS[RANKS.length - 1];
}

function getRankIndex(rankName) {
    return RANKS.findIndex(r => r.name === rankName);
}

function updateRankPoints(pointsChange, isWin, isLose) {
    if (GameState.isAdmin) return;
    
    const oldRank = getRankInfo(GameState.rankPoints);
    GameState.rankPoints += pointsChange;
    if (GameState.rankPoints < 0) GameState.rankPoints = 0;
    
    // تحديث النجوم
    if (isWin) {
        GameState.stars = Math.min(3, GameState.stars + 1);
    } else if (isLose) {
        if (GameState.stars > 1) {
            GameState.stars--;
        } else {
            // الهبوط
            const currentRankIndex = getRankIndex(oldRank.name);
            if (currentRankIndex > 0) {
                const prevRank = RANKS[currentRankIndex - 1];
                GameState.rankPoints = prevRank.max;
                GameState.stars = 2;
                showNotification('لقد هبطت إلى ' + prevRank.name + '!', 'warning');
            }
        }
    }
    
    // التحقق من الترقية
    const newRank = getRankInfo(GameState.rankPoints);
    if (newRank.name !== oldRank.name) {
        handleRankUp(newRank, oldRank);
    }
    
    saveGame();
}

function handleRankUp(newRank, oldRank) {
    const newLevel = newRank.level;
    const oldLevel = oldRank.level;
    
    if (newLevel > oldLevel && RANK_REWARDS[newLevel]) {
        const reward = RANK_REWARDS[newLevel];
        
        // منح المكافأة
        if (reward.coins) addCoins(reward.coins);
        if (reward.boost) addBoost(reward.boost);
        if (reward.poster && !GameState.posters.includes(reward.poster)) {
            GameState.posters.push(reward.poster);
        }
        
        let rewardMsg = 'تهانينا! وصلت إلى ' + newRank.name + '!\n';
        rewardMsg += 'المكافآت:\n';
        if (reward.coins) rewardMsg += '💰 ' + reward.coins.toLocaleString() + ' كوينز\n';
        if (reward.boost) rewardMsg += '💎 ' + reward.boost + ' BOOST\n';
        if (reward.poster) rewardMsg += '🏅 بوستر ' + reward.poster + '\n';
        
        setTimeout(() => showNotification(rewardMsg, 'success'), 500);
    }
}

function isPlayerChampion() {
    const rank = getRankInfo(GameState.rankPoints);
    return rank.icon === 'grandmaster' && GameState.rankPoints >= 1300;
}

function getChampionBonus() {
    if (isPlayerChampion()) {
        return 7; // +7 OVR للـ AI في مواجهات الصدارة
    }
    return 0;
}

// توليد لوحة المتصدرين
function generateLeaderboard() {
    const leaders = [];
    const playerRank = GameState.rankPoints;
    
    // توليد 50 لاعب وهمي
    for (let i = 0; i < 50; i++) {
        const points = Math.floor(Math.random() * 800) + 500 + Math.floor(Math.random() * 300);
        leaders.push({
            name: 'Battlecards26_' + Math.floor(Math.random() * 90000000 + 10000000),
            points: points,
            isPlayer: false,
            rank: getRankInfo(points)
        });
    }
    
    // إضافة اللاعب الحقيقي
    leaders.push({
        name: GameState.teamName,
        points: playerRank,
        isPlayer: true,
        rank: getRankInfo(playerRank)
    });
    
    // ترتيب تنازلي
    leaders.sort((a, b) => b.points - a.points);
    
    return leaders;
}