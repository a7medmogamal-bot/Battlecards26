// ==================== قاعدة البيانات ====================

const POSITIONS = ['GK', 'LB', 'CB', 'RB', 'CM', 'LW', 'RW', 'ST'];
const FORMATION = ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'LW', 'RW', 'ST', 'ST'];
const FORMATION_POSITIONS = {
    'GK': 1, 'LB': 1, 'CB': 2, 'RB': 1, 'CM': 2, 'LW': 1, 'RW': 1, 'ST': 2
};

// مهارات اللاعبين المتاحة حسب المركز
const SKILLS_BY_POSITION = {
    'ST': ['Bullet Header', 'Finishing', 'Curl Ball', 'Rocket Shot', 'Outside 18', 'Leadership', 'Ball Control'],
    'LW': ['Finishing', 'Curl Ball', 'Rocket Shot', 'Outside 18', 'Leadership', 'Ball Control', 'Accel Burst'],
    'RW': ['Finishing', 'Curl Ball', 'Rocket Shot', 'Outside 18', 'Leadership', 'Ball Control', 'Accel Burst'],
    'CM': ['Magnet Ball', 'Passing', 'Through Ball', 'Accel Burst', 'Curl Ball', 'Leadership', 'Stamina'],
    'CAM': ['Magnet Ball', 'Passing', 'Through Ball', 'Accel Burst', 'Curl Ball', 'Leadership', 'Finishing'],
    'CDM': ['Tackling', 'Magnet Ball', 'Passing', 'Leadership', 'Stamina', 'Injury Resist', 'Aggression'],
    'CB': ['Tackling', 'Stamina', 'Aggression', 'Injury Resist', 'Leadership', 'Defense Boost', 'Ball Control'],
    'LB': ['Tackling', 'Stamina', 'Aggression', 'Injury Resist', 'Leadership', 'Accel Burst', 'Passing'],
    'RB': ['Tackling', 'Stamina', 'Aggression', 'Injury Resist', 'Leadership', 'Accel Burst', 'Passing'],
    'GK': ['Defense Boost', 'Leadership', 'Aggression', 'Injury Resist', 'Stamina']
};

// أيقونات المهارات
const SKILL_ICONS = {
    'Bullet Header': 'fa-futbol',
    'Finishing': 'fa-bullseye',
    'Curl Ball': 'fa-wind',
    'Rocket Shot': 'fa-rocket',
    'Outside 18': 'fa-arrow-right-from-bracket',
    'Leadership': 'fa-crown',
    'Ball Control': 'fa-hand',
    'Defense Boost': 'fa-shield-halved',
    'Aggression': 'fa-fire',
    'Tackling': 'fa-shoe-prints',
    'Stamina': 'fa-heart-pulse',
    'Injury Resist': 'fa-shield',
    'Passing': 'fa-paper-plane',
    'Magnet Ball': 'fa-magnet',
    'Through Ball': 'fa-arrow-right',
    'Accel Burst': 'fa-bolt'
};

// اللاعبين الأساسيين للبداية
const STARTER_PLAYERS = [
    { name: "Lewis Hall", position: "LB", baseOVR: 55 },
    { name: "Valentin Barco", position: "LB", baseOVR: 55 },
    { name: "Rico Lewis", position: "RB", baseOVR: 55 },
    { name: "Tyler Adams", position: "CDM", baseOVR: 55 },
    { name: "Romeo Lavia", position: "CDM", baseOVR: 55 },
    { name: "Arthur Vermeeren", position: "CM", baseOVR: 55 },
    { name: "Charlie Patino", position: "CM", baseOVR: 55 },
    { name: "Lucas Bergvall", position: "CM", baseOVR: 55 },
    { name: "Andrey Santos", position: "CM", baseOVR: 55 },
    { name: "Kobbie Mainoo", position: "CM", baseOVR: 55 },
    { name: "Rayan Cherki", position: "CAM", baseOVR: 55 },
    { name: "Fabio Carvalho", position: "CAM", baseOVR: 55 },
    { name: "Tommaso Baldanzi", position: "CAM", baseOVR: 55 },
    { name: "Valentin Carboni", position: "CAM", baseOVR: 55 },
    { name: "Giovanni Reyna", position: "CAM", baseOVR: 55 },
    { name: "Alejandro Garnacho", position: "LW", baseOVR: 55 },
    { name: "Diego Moreira", position: "LW", baseOVR: 55 },
    { name: "Samuel Iling-Junior", position: "LW", baseOVR: 55 },
    { name: "Noni Madueke", position: "RW", baseOVR: 55 },
    { name: "Facundo Pellistri", position: "RW", baseOVR: 55 },
    { name: "Benjamin Sesko", position: "ST", baseOVR: 55 },
    { name: "Evan Ferguson", position: "ST", baseOVR: 55 },
    { name: "Youssoufa Moukoko", position: "ST", baseOVR: 55 },
    { name: "Marc Guiu", position: "ST", baseOVR: 55 },
    { name: "Armando Broja", position: "ST", baseOVR: 55 },
    { name: "Jorrel Hato", position: "CB", baseOVR: 55 },
    { name: "El Chadaille Bitshiabu", position: "CB", baseOVR: 55 },
    { name: "Maxence Lacroix", position: "CB", baseOVR: 55 },
    { name: "Ousmane Diomande", position: "CB", baseOVR: 55 },
    { name: "Taylor Harwood-Bellis", position: "CB", baseOVR: 55 }
];

// المدربين الضعفاء للبداية
const STARTER_MANAGERS = [
    { name: "Paul Heckingbottom", ovr: 66, spec: "defense" },
    { name: "Gary O'Neil", ovr: 66, spec: "defense" },
    { name: "Steve Cooper", ovr: 72, spec: "defense" },
    { name: "Russell Martin", ovr: 71, spec: "midfield" },
    { name: "Kieran McKenna", ovr: 73, spec: "midfield" },
    { name: "Vincent Kompany", ovr: 75, spec: "defense" },
    { name: "Rob Edwards", ovr: 71, spec: "defense" },
    { name: "Liam Rosenior", ovr: 71, spec: "midfield" },
    { name: "Andoni Iraola", ovr: 74, spec: "attack" },
    { name: "Enzo Maresca", ovr: 73, spec: "midfield" },
    { name: "Gerardo Seoane", ovr: 70, spec: "attack" },
    { name: "Urs Fischer", ovr: 70, spec: "defense" },
    { name: "Bo Svensson", ovr: 70, spec: "defense" },
    { name: "Alexander Blessin", ovr: 70, spec: "defense" },
    { name: "Fabio Grosso", ovr: 69, spec: "attack" },
    { name: "Fabio Cannavaro", ovr: 73, spec: "defense" },
    { name: "Igor Tudor", ovr: 69, spec: "defense" },
    { name: "Ivan Juric", ovr: 69, spec: "midfield" },
    { name: "Raffaele Palladino", ovr: 69, spec: "attack" },
    { name: "Davide Nicola", ovr: 69, spec: "defense" },
    { name: "Jose Bordalas", ovr: 68, spec: "defense" },
    { name: "Quique Sanchez Flores", ovr: 68, spec: "midfield" },
    { name: "Jagoba Arrasate", ovr: 68, spec: "attack" },
    { name: "Luis Garcia Plaza", ovr: 68, spec: "attack" },
    { name: "Sergio Gonzalez", ovr: 68, spec: "defense" },
    { name: "Paco Lopez", ovr: 67, spec: "attack" },
    { name: "Ruben Baraja", ovr: 67, spec: "midfield" },
    { name: "Diego Alonso", ovr: 67, spec: "attack" },
    { name: "Martin Demichelis", ovr: 67, spec: "defense" }
];

// كل المدربين
const ALL_MANAGERS = [
    ...STARTER_MANAGERS,
    { name: "Pep Guardiola", ovr: 99, spec: "midfield" },
    { name: "Carlo Ancelotti", ovr: 99, spec: "all" },
    { name: "Jurgen Klopp", ovr: 98, spec: "attack" },
    { name: "Jose Mourinho", ovr: 98, spec: "defense" },
    { name: "Diego Simeone", ovr: 96, spec: "defense" },
    { name: "Zinedine Zidane", ovr: 96, spec: "all" },
    { name: "Lionel Scaloni", ovr: 95, spec: "all" },
    { name: "Didier Deschamps", ovr: 95, spec: "defense" },
    { name: "Xabi Alonso", ovr: 94, spec: "midfield" },
    { name: "Mikel Arteta", ovr: 93, spec: "defense" },
    { name: "Hansi Flick", ovr: 93, spec: "attack" },
    { name: "Thomas Tuchel", ovr: 92, spec: "defense" },
    { name: "Luis Enrique", ovr: 92, spec: "midfield" },
    { name: "Antonio Conte", ovr: 92, spec: "defense" },
    { name: "Simone Inzaghi", ovr: 91, spec: "attack" },
    { name: "Massimiliano Allegri", ovr: 91, spec: "defense" },
    { name: "Julian Nagelsmann", ovr: 90, spec: "midfield" },
    { name: "Unai Emery", ovr: 90, spec: "all" },
    { name: "Gian Piero Gasperini", ovr: 89, spec: "attack" },
    { name: "Roberto De Zerbi", ovr: 89, spec: "midfield" },
    { name: "Erik ten Hag", ovr: 88, spec: "midfield" },
    { name: "Mauricio Pochettino", ovr: 88, spec: "attack" },
    { name: "Rafa Benitez", ovr: 88, spec: "defense" },
    { name: "Claudio Ranieri", ovr: 88, spec: "all" },
    { name: "Xavi Hernandez", ovr: 87, spec: "midfield" },
    { name: "Ruben Amorim", ovr: 87, spec: "attack" },
    { name: "Roberto Mancini", ovr: 87, spec: "midfield" },
    { name: "Brendan Rodgers", ovr: 86, spec: "attack" },
    { name: "Roger Schmidt", ovr: 86, spec: "attack" },
    { name: "Tite", ovr: 86, spec: "defense" },
    { name: "Steven Gerrard", ovr: 85, spec: "midfield" },
    { name: "Frank Lampard", ovr: 85, spec: "midfield" },
    { name: "Wayne Rooney", ovr: 84, spec: "attack" },
    { name: "Patrick Vieira", ovr: 84, spec: "defense" },
    { name: "Thierry Henry", ovr: 84, spec: "attack" },
    { name: "Edin Terzic", ovr: 84, spec: "defense" },
    { name: "David Moyes", ovr: 83, spec: "defense" },
    { name: "Marco Rose", ovr: 83, spec: "attack" },
    { name: "Gareth Southgate", ovr: 83, spec: "defense" },
    { name: "Roberto Martinez", ovr: 83, spec: "attack" },
    { name: "Fernando Diniz", ovr: 82, spec: "midfield" },
    { name: "Cesc Fabregas", ovr: 82, spec: "midfield" },
    { name: "Gerardo Martino", ovr: 82, spec: "midfield" },
    { name: "Jesse Marsch", ovr: 81, spec: "attack" },
    { name: "Leonardo Jardim", ovr: 81, spec: "defense" },
    { name: "Dorival Junior", ovr: 81, spec: "midfield" },
    { name: "Quique Setien", ovr: 80, spec: "midfield" },
    { name: "Diego Martinez", ovr: 79, spec: "defense" },
    { name: "Steve Clarke", ovr: 78, spec: "defense" },
    { name: "Rob Page", ovr: 77, spec: "defense" }
];

// دالة مساعدة: اختيار عنصر عشوائي من مصفوفة
function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// دالة مساعدة: خلط مصفوفة
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// دالة مساعدة: توليد ID فريد
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// دالة مساعدة: تقريب المركز
function normalizePosition(position) {
    const mapping = {
        'CAM': 'CM',
        'CDM': 'CM',
        'CF': 'ST',
        'SS': 'ST',
        'RM': 'RW',
        'LM': 'LW',
        'LWB': 'LB',
        'RWB': 'RB'
    };
    return mapping[position] || position;
}