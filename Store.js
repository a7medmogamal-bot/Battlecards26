// ==================== نظام المتجر ====================

const STORE_PACKS = [
    {
        id: 'bronze',
        name: 'باك برونزي',
        icon: 'fa-box',
        color: '#cd7f32',
        price: 500,
        cardCount: 3,
        ovrRange: [55, 79],
        description: '3 كروت عشوائية'
    },
    {
        id: 'silver',
        name: 'باك فضي',
        icon: 'fa-box-open',
        color: '#c0c0c0',
        price: 1500,
        cardCount: 3,
        ovrRange: [65, 84],
        description: '3 كروت - ضمان فضي+'
    },
    {
        id: 'gold',
        name: 'باك ذهبي',
        icon: 'fa-box-open',
        color: '#ffd700',
        price: 3000,
        cardCount: 3,
        ovrRange: [75, 89],
        description: '3 كروت - ضمان ذهبي+'
    },
    {
        id: 'platinum',
        name: 'باك بلاتيني',
        icon: 'fa-gem',
        color: '#e5e4e2',
        price: 6000,
        cardCount: 5,
        ovrRange: [80, 94],
        description: '5 كروت - ضمان 85+'
    },
    {
        id: 'diamond',
        name: 'باك ماسي',
        icon: 'fa-gem',
        color: '#b9f2ff',
        price: 12000,
        cardCount: 5,
        ovrRange: [85, 99],
        description: '5 كروت - ضمان 90+'
    },
    {
        id: 'elite',
        name: 'باك النخبة',
        icon: 'fa-star',
        color: '#ff6b6b',
        price: 25000,
        cardCount: 7,
        ovrRange: [88, 102],
        description: '7 كروت - ضمان 92+'
    },
    {
        id: 'legendary',
        name: 'باك أسطوري',
        icon: 'fa-fire',
        color: '#ff4500',
        price: 50000,
        cardCount: 7,
        ovrRange: [92, 128],
        description: '7 كروت - ضمان 95+'
    }
];

const STORE_POSTERS = [
    {
        id: 'rare',
        name: 'بوستر نادر',
        icon: 'fa-star',
        color: '#ffd700',
        price: 100000,
        ovrBonus: 5,
        description: '+5 OVR دائم للتشكيلة'
    },
    {
        id: 'legendary',
        name: 'بوستر أسطوري',
        icon: 'fa-fire',
        color: '#ff4500',
        price: 250000,
        ovrBonus: 10,
        description: '+10 OVR دائم للتشكيلة'
    },
    {
        id: 'grandmaster',
        name: 'بوستر جراند ماستر',
        icon: 'fa-crown',
        color: '#ff00ff',
        price: 500000,
        ovrBonus: 15,
        description: '+15 OVR دائم للتشكيلة'
    }
];

const STORE_BOOST = [
    { amount: 1, price: 2500 },
    { amount: 5, price: 10000 },
    { amount: 15, price: 25000 }
];

// شراء باك
function buyPack(packId) {
    const pack = STORE_PACKS.find(p => p.id === packId);
    if (!pack) return;
    
    if (!spendCoins(pack.price)) {
        showNotification('الكوينز غير كافية!', 'warning');
        return;
    }
    
    // توليد كروت عشوائية
    const newPlayers = [];
    const names = [
        'Star Player', 'Rising Talent', 'Veteran Star', 'Golden Boy',
        'Silver Boot', 'Diamond Foot', 'Crystal Pass', 'Thunder Strike',
        'Ice Wall', 'Shadow Wing', 'Storm Mid', 'Fire Forward'
    ];
    
    for (let i = 0; i < pack.cardCount; i++) {
        const ovr = Math.floor(Math.random() * (pack.ovrRange[1] - pack.ovrRange[0] + 1)) + pack.ovrRange[0];
        const pos = FORMATION[Math.floor(Math.random() * 11)];
        const player = createNewPlayer(
            names[i % names.length] + ' ' + (i + 1),
            pos,
            ovr,
            0,
            []
        );
        newPlayers.push(player);
        addPlayerToClub(player);
    }
    
    // تحديث الأهداف
    updateDailyObjective('obj_4', 1);
    
    saveGame();
    updateAllUI();
    
    // إظهار الباك المفتوح
    showPackOpening(pack, newPlayers);
}

function showPackOpening(pack, players) {
    document.getElementById('packModal').classList.add('active');
    const content = document.getElementById('packModalContent');
    
    content.innerHTML = `
        <button class="modal-close" onclick="document.getElementById('packModal').classList.remove('active')">✕</button>
        <div class="pack-opening">
            <h2 style="color:${pack.color};">${pack.name}</h2>
            <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px;">
                ${players.map(p => `
                    <div class="pack-card-reveal">
                        <div style="color:var(--text-secondary);">${p.position}</div>
                        <div style="font-size:1.5em;font-weight:900;color:var(--gold);">${getPlayerOVR(p)}</div>
                        <div style="font-weight:600;">${p.name}</div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" style="margin-top:20px;" 
                onclick="document.getElementById('packModal').classList.remove('active')">
                <i class="fas fa-check"></i> استلام
            </button>
        </div>
    `;
}

// شراء بوستر
function buyPoster(posterId) {
    const poster = STORE_POSTERS.find(p => p.id === posterId);
    if (!poster) return;
    
    if (GameState.posters.includes(posterId)) {
        showNotification('لديك هذا البوستر بالفعل!', 'warning');
        return;
    }
    
    if (!spendCoins(poster.price)) {
        showNotification('الكوينز غير كافية!', 'warning');
        return;
    }
    
    GameState.posters.push(posterId);
    saveGame();
    updateAllUI();
    showNotification('تم شراء البوستر بنجاح! +' + poster.ovrBonus + ' OVR', 'success');
}

// شراء BOOST
function buyBoost(amount) {
    const boostPack = STORE_BOOST.find(b => b.amount === amount);
    if (!boostPack) return;
    
    if (!spendCoins(boostPack.price)) {
        showNotification('الكوينز غير كافية!', 'warning');
        return;
    }
    
    addBoost(amount);
    saveGame();
    updateAllUI();
    showNotification('تم شراء ' + amount + ' BOOST بنجاح!', 'success');
}