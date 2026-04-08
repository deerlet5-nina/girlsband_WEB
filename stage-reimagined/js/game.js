const gameAudio = {
    audioContext: null,
    enabled: localStorage.getItem('stage-reimagined-game-sound') !== 'false',

    init() {
        this.updateButton();
    },

    ensure() {
        if (!this.enabled) {
            return;
        }
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    updateButton() {
        const button = document.getElementById('soundToggle');
        if (!button) {
            return;
        }
        button.textContent = this.enabled ? '音效开启' : '音效关闭';
        button.setAttribute('aria-pressed', String(this.enabled));
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('stage-reimagined-game-sound', String(this.enabled));
        if (!this.enabled && gameState.sakikoAudio) {
            gameState.sakikoAudio.pause();
        }
        this.updateButton();
    },

    tone(frequency, duration = 0.18, volume = 0.06, wave = 'sine', delay = 0) {
        if (!this.enabled) {
            return;
        }
        this.ensure();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const now = this.audioContext.currentTime + delay;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(frequency, now);
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
    },

    melody(notes, tempo = 170) {
        notes.forEach((note, index) => {
            if (!note.freq) {
                return;
            }
            this.tone(
                note.freq,
                note.duration || 0.22,
                note.volume || 0.06,
                note.wave || 'sine',
                index * (tempo / 1000)
            );
        });
    },

    borrow(kind) {
        const soundMap = {
            positive: [
                { freq: 659, duration: 0.16, volume: 0.07 },
                { freq: 784, duration: 0.2, volume: 0.08 }
            ],
            negative: [
                { freq: 294, duration: 0.22, volume: 0.08, wave: 'sawtooth' },
                { freq: 220, duration: 0.28, volume: 0.08, wave: 'sawtooth' }
            ],
            warning: [
                { freq: 523, duration: 0.12, volume: 0.06 },
                { freq: 440, duration: 0.12, volume: 0.06 },
                { freq: 523, duration: 0.12, volume: 0.06 }
            ],
            epic: [
                { freq: 392, duration: 0.18, volume: 0.08 },
                { freq: 523, duration: 0.18, volume: 0.08 },
                { freq: 784, duration: 0.34, volume: 0.1 }
            ],
            neutral: [{ freq: 440, duration: 0.16, volume: 0.05 }]
        };
        this.melody(soundMap[kind] || soundMap.neutral, 140);
    },

    result(score) {
        if (score >= 120) {
            this.melody([{ freq: 523 }, { freq: 659 }, { freq: 784 }, { freq: 988, duration: 0.32 }, { freq: 1047, duration: 0.45, volume: 0.1 }], 125);
            return;
        }
        if (score >= 100) {
            this.melody([{ freq: 523 }, { freq: 659 }, { freq: 784 }, { freq: 659 }, { freq: 523, duration: 0.3 }], 150);
            return;
        }
        if (score >= 85) {
            this.melody([{ freq: 440, duration: 0.24 }, { freq: 523, duration: 0.24 }, { freq: 659, duration: 0.3 }], 180);
            return;
        }
        if (score >= 70) {
            this.melody([{ freq: 392, duration: 0.24 }, { freq: 440, duration: 0.24 }, { freq: 523, duration: 0.28 }], 220);
            return;
        }
        if (score >= 55) {
            this.melody([{ freq: 440, duration: 0.28 }, { freq: 392, duration: 0.28 }, { freq: 440, duration: 0.3 }], 260);
            return;
        }
        if (score >= 40) {
            this.melody([{ freq: 523, duration: 0.28 }, { freq: 440, duration: 0.28 }, { freq: 349, duration: 0.35 }], 240);
            return;
        }
        this.melody([{ freq: 294, duration: 0.3, wave: 'sawtooth' }, { freq: 262, duration: 0.3, wave: 'sawtooth' }, { freq: 220, duration: 0.45, wave: 'sawtooth' }], 280);
    }
};

const bandMeta = {
    'k-on': { title: '轻音少女', badge: 'Tea House', accent: '#d7b37d', alt: '#8a6245', note: '暖木、茶点和放学后的社团空气。' },
    bocchi: { title: '结束乐队', badge: 'Live House', accent: '#4bd2c7', alt: '#ff5f9d', note: '低照度霓虹、贴纸噪点和突然爆发。' },
    mygo: { title: 'MyGO!!!!!', badge: 'Rainy Stage', accent: '#8ba6bf', alt: '#526d87', note: '雾蓝、留白和雨夜剧场感。' },
    gbc: { title: 'Girls Band Cry', badge: 'Streetlight', accent: '#e1785c', alt: '#7f879e', note: '街灯、柏油和带伤的反抗。' }
};

const roster = [
    { id: 'k-on-1', name: '平泽唯', bandKey: 'k-on', band: '轻音少女', role: '吉他手', abilities: ['作词', '主唱'], cost: 3, skill: 5, chemistry: 6, image: '../images/k-on_yui (2).jpg' },
    { id: 'k-on-2', name: '秋山澪', bandKey: 'k-on', band: '轻音少女', role: '贝斯手', abilities: ['作词', '主唱'], cost: 4, skill: 8, chemistry: 4, image: '../images/k-on_mio (4).jpg' },
    { id: 'k-on-3', name: '田井中律', bandKey: 'k-on', band: '轻音少女', role: '鼓手', abilities: [], cost: 3, skill: 5, chemistry: 7, image: '../images/k-on_ritsu (3).jpg' },
    { id: 'k-on-4', name: '琴吹紬', bandKey: 'k-on', band: '轻音少女', role: '键盘手', abilities: ['作曲'], cost: 3, skill: 9, chemistry: 5, image: '../images/k-on_mugi (4).jpg' },
    { id: 'k-on-5', name: '中野梓', bandKey: 'k-on', band: '轻音少女', role: '吉他手', abilities: [], cost: 3, skill: 8, chemistry: 4, image: '../images/k-on_azusa (3).jpg' },
    { id: 'bocchi-1', name: '后藤一里', bandKey: 'bocchi', band: '结束乐队', role: '吉他手', abilities: ['作词'], cost: 3, skill: 10, chemistry: 3, image: '../images/bocchi_hitori (1).jpg' },
    { id: 'bocchi-2', name: '伊地知虹夏', bandKey: 'bocchi', band: '结束乐队', role: '鼓手', abilities: [], cost: 3, skill: 5, chemistry: 7, image: '../images/bocchi_nijika (1).jpg' },
    { id: 'bocchi-3', name: '山田凉', bandKey: 'bocchi', band: '结束乐队', role: '贝斯手', abilities: ['作曲'], cost: 2, skill: 9, chemistry: 2, image: '../images/bocchi_ryo (1).jpg' },
    { id: 'bocchi-4', name: '喜多郁代', bandKey: 'bocchi', band: '结束乐队', role: '吉他手 / 主唱', abilities: ['主唱'], cost: 2, skill: 5, chemistry: 6, image: '../images/bocchi_ikuyo (1).jpg' },
    { id: 'mygo-1', name: '高松灯', bandKey: 'mygo', band: 'MyGO!!!!!', role: '主唱', abilities: ['作词', '主唱'], cost: 1, skill: 5, chemistry: 2, image: '../images/mygo_tomori (1).jpg' },
    { id: 'mygo-2', name: '千早爱音', bandKey: 'mygo', band: 'MyGO!!!!!', role: '吉他手', abilities: ['主唱'], cost: 1, skill: 2, chemistry: 6, image: '../images/mygo_anon.cover.jpg' },
    { id: 'mygo-3', name: '要乐奈', bandKey: 'mygo', band: 'MyGO!!!!!', role: '吉他手', abilities: [], cost: 3, skill: 9, chemistry: 2, image: '../images/mygo_rana.cover.jpg' },
    { id: 'mygo-4', name: '长崎爽世', bandKey: 'mygo', band: 'MyGO!!!!!', role: '贝斯手', abilities: [], cost: 4, skill: 7, chemistry: 7, image: '../images/mygo_soyo.cover.jpg' },
    { id: 'mygo-5', name: '椎名立希', bandKey: 'mygo', band: 'MyGO!!!!!', role: '鼓手', abilities: ['作曲'], cost: 3, skill: 8, chemistry: 3, image: '../images/mygo_taki.cover.jpg' },
    { id: 'gbc-1', name: '井芹仁菜', bandKey: 'gbc', band: 'Girls Band Cry', role: '主唱', abilities: ['作词', '主唱'], cost: 4, skill: 9, chemistry: 4, image: '../images/gbc_nina.cover.png' },
    { id: 'gbc-2', name: '河原木桃香', bandKey: 'gbc', band: 'Girls Band Cry', role: '吉他手', abilities: ['作曲', '作词', '主唱'], cost: 5, skill: 10, chemistry: 6, image: '../images/gbc_mmk.cover.png' },
    { id: 'gbc-3', name: '安和昴', bandKey: 'gbc', band: 'Girls Band Cry', role: '鼓手', abilities: [], cost: 3, skill: 4, chemistry: 7, image: '../images/gbc_subaru.cover.jpg' },
    { id: 'gbc-4', name: '海老冢智', bandKey: 'gbc', band: 'Girls Band Cry', role: '键盘手', abilities: ['作曲'], cost: 3, skill: 10, chemistry: 2, image: '../images/gbc_tomo.cover.jpg' },
    { id: 'gbc-5', name: 'Rupa', bandKey: 'gbc', band: 'Girls Band Cry', role: '贝斯手', abilities: [], cost: 3, skill: 8, chemistry: 5, image: '../images/gbc_rupa.cover.png' }
];

const evaluationTiers = [
    { key: 'legend', min: 120, title: '传奇乐队', text: '这已经不是临时拼团，而是一支会留下现场传说的乐队。' },
    { key: 'star', min: 100, title: '明星乐队', text: '阵容已经有明显舞台统治力，观众会记住这次演出。' },
    { key: 'skillful', min: 85, title: '实力派乐队', text: '技术和组合逻辑都在线，已经能稳定打出漂亮演出。' },
    { key: 'promising', min: 70, title: '新锐乐队', text: '方向是对的，只差几处关键补强。' },
    { key: 'amateur', min: 55, title: '业余乐队', text: '基础可以成立，但默契和结构还不够扎实。' },
    { key: 'practice', min: 40, title: '练习室乐队', text: '像一场试排，能听见潜力，也能听见缺口。' },
    { key: 'garage', min: 0, title: '车库乐队', text: '现在更像把器材先凑在了一起，离正式上台还早。' }
];

const gameState = {
    budget: 15,
    selected: [],
    borrowUsed: false,
    hitoriBorrowCount: 0,
    locked: false,
    sakikoAudio: null
};
function safeAsset(path) {
    return encodeURI(path).replace(/#/g, '%23');
}

function musicPath(file) {
    return safeAsset(`../music/${file}`);
}

function cloneMember(member) {
    return {
        ...member,
        abilities: [...member.abilities],
        skillBoost: 0,
        chemistryBoost: 0
    };
}

function namesOf(members) {
    return members.map((member) => member.name);
}

function hasName(members, name) {
    return members.some((member) => member.name === name);
}

function totalCost(members) {
    return members.reduce((total, member) => total + member.cost, 0);
}

function rolePresent(members, keyword) {
    return members.some((member) => member.role.includes(keyword) || member.abilities.includes(keyword));
}

function getRequirementState(members) {
    return ['主唱', '吉他', '贝斯', '鼓'].map((keyword) => ({
        keyword,
        ok: rolePresent(members, keyword)
    }));
}

function comboDefinitions() {
    return [
        {
            id: 'same_band',
            name: '同团默契',
            bonus: 10,
            when(members) {
                const counts = members.reduce((map, member) => {
                    map[member.bandKey] = (map[member.bandKey] || 0) + 1;
                    return map;
                }, {});
                const hit = Object.entries(counts).find(([, count]) => count >= 3);
                if (!hit) {
                    return null;
                }
                const [bandKey, count] = hit;
                return {
                    detail: `${bandMeta[bandKey].title} 编入 ${count} 人`,
                    evaluation: '同团成员会显著拉高默契和排练效率。'
                };
            }
        },
        {
            id: 'soul_mate',
            name: 'Soul Mate',
            bonus: 5,
            when(members) {
                return hasName(members, '井芹仁菜') && hasName(members, '河原木桃香')
                    ? { evaluation: '仁菜和桃香一旦同台，整支队伍的情绪核心会立刻成形。' }
                    : null;
            }
        },
        {
            id: 'cake_hunter',
            name: '蛋糕猎手',
            bonus: 3,
            when(members) {
                return hasName(members, '平泽唯') && hasName(members, '琴吹紬')
                    ? { evaluation: '社团茶点到位之后，唯的状态显然会更好。' }
                    : null;
            }
        },
        {
            id: 'childhood_friends',
            name: '青梅竹马',
            bonus: 6,
            when(members) {
                return hasName(members, '秋山澪') && hasName(members, '田井中律')
                    ? { evaluation: '澪和律的熟悉感会把节奏咬得很稳。' }
                    : null;
            }
        },
        {
            id: 'parent_love',
            name: '父母爱情',
            bonus: 6,
            when(members) {
                return hasName(members, '伊地知虹夏') && hasName(members, '山田凉')
                    ? { evaluation: '虹夏和凉的平衡感，会把乐队重心稳稳托住。' }
                    : null;
            }
        },
        {
            id: 'perfect_vocalist',
            name: '完美主唱',
            bonus: 5,
            when(members) {
                const vocalist = members.find((member) => (member.role.includes('主唱') || member.abilities.includes('主唱')) && member.skill >= 9);
                return vocalist
                    ? { detail: `${vocalist.name} 担任高强度主唱位`, evaluation: '顶级主唱会直接抬高整场演出的完成度。' }
                    : null;
            }
        },
        {
            id: 'harmony_family',
            name: '和谐大家庭',
            bonus: 8,
            when(members) {
                const chemistry = members.reduce((sum, member) => sum + member.chemistry, 0);
                return chemistry >= 30
                    ? { detail: `当前基础默契 ${chemistry}`, evaluation: '成员之间的气氛已经很适合长期排练。' }
                    : null;
            }
        },
        {
            id: 'creative_ability',
            name: '完整创作链',
            bonus: 15,
            when(members) {
                const abilities = new Set();
                members.forEach((member) => {
                    member.abilities.forEach((ability) => abilities.add(ability));
                    if (member.role.includes('主唱')) {
                        abilities.add('主唱');
                    }
                });
                return abilities.has('作词') && abilities.has('作曲') && abilities.has('主唱')
                    ? { evaluation: '作词、作曲和演唱都有人能扛，原创能力直接成型。' }
                    : null;
            }
        },
        {
            id: 'budget_master',
            name: '预算大师',
            bonus: 5,
            when(members) {
                return totalCost(members) === 15
                    ? { evaluation: '刚好用满 15 元预算，说明你很会精打细算。' }
                    : null;
            }
        },
        {
            id: 'kon_complete',
            name: '放学后茶会完全体',
            bonus: 15,
            when(members) {
                return ['平泽唯', '秋山澪', '田井中律', '琴吹紬', '中野梓'].every((name) => hasName(members, name))
                    ? { evaluation: '轻音部五人齐聚，队伍已经自带青春滤镜。' }
                    : null;
            }
        },
        {
            id: 'bocchi_complete',
            name: '下北泽完全体',
            bonus: 15,
            when(members) {
                return ['后藤一里', '伊地知虹夏', '山田凉', '喜多郁代'].every((name) => hasName(members, name))
                    ? { evaluation: '结束乐队完整阵容一上来，live house 的灯就该亮了。' }
                    : null;
            }
        },
        {
            id: 'mygo_complete',
            name: '雨夜剧场完全体',
            bonus: 15,
            when(members) {
                return ['高松灯', '千早爱音', '要乐奈', '长崎爽世', '椎名立希'].every((name) => hasName(members, name))
                    ? { evaluation: 'MyGO!!!!! 五人齐场时，情绪张力会非常完整。' }
                    : null;
            }
        },
        {
            id: 'gbc_complete',
            name: '街灯之下完全体',
            bonus: 15,
            when(members) {
                return ['井芹仁菜', '河原木桃香', '安和昴', '海老冢智', 'Rupa'].every((name) => hasName(members, name))
                    ? { evaluation: 'Girls Band Cry 完整阵容会把城市夜色的硬度一起带上台。' }
                    : null;
            }
        }
    ];
}
function getTriggeredCombos(members) {
    const extraDefinitions = [
        {
            id: 'instrument_repeat',
            name: '编制冲突',
            bonus: -10,
            when(list) {
                const repeats = ['贝斯手', '鼓手', '键盘手']
                    .map((role) => ({ role, count: list.filter((member) => member.role.includes(role)).length }))
                    .filter((item) => item.count > 1);
                return repeats.length
                    ? { detail: repeats.map((item) => `${item.role} x${item.count}`).join(' / '), evaluation: '关键位置重复会让编制职责变得模糊。' }
                    : null;
            }
        },
        {
            id: 'mutual_dependence',
            name: '互相依赖',
            bonus: 10,
            effect: { chemistryBonus: 8 },
            when(list) {
                return hasName(list, '海老冢智') && hasName(list, 'Rupa')
                    ? { evaluation: '智和 Rupa 彼此在场，默契会明显更顺。' }
                    : null;
            }
        },
        {
            id: 'respect_aso',
            name: '体面与暗流',
            bonus: 12,
            effect: { chemistryBonus: 4, skillBonus: 4 },
            when(list) {
                return hasName(list, '千早爱音') && hasName(list, '长崎爽世')
                    ? { evaluation: '爱音和爽世的关系非常复杂，但放在舞台上反而会变成张力。' }
                    : null;
            }
        },
        {
            id: 'meeting_angel',
            name: '天使相遇',
            bonus: 15,
            effect: { memberBonuses: [{ name: '平泽唯', skill: 5 }, { name: '中野梓', skill: 5 }] },
            when(list) {
                return hasName(list, '平泽唯') && hasName(list, '中野梓')
                    ? { evaluation: '唯和梓的前后辈配合会让吉他线整段亮起来。' }
                    : null;
            }
        },
        {
            id: 'what_is_happiness',
            name: '幸福是什么',
            bonus: 8,
            effect: { chemistryBonus: 3, memberBonuses: [{ name: '椎名立希', skill: 3 }] },
            when(list) {
                return hasName(list, '高松灯') && hasName(list, '椎名立希')
                    ? { evaluation: '灯和立希同台时，立希的鼓会更有方向感。' }
                    : null;
            }
        },
        {
            id: 'crychic_revival',
            name: 'CRYCHiC 复活',
            bonus: 50,
            effect: { skillBonus: 10, chemistryBonus: 12 },
            when(list) {
                return ['丰川祥子', '高松灯', '长崎爽世', '椎名立希', '若叶睦'].every((name) => hasName(list, name))
                    ? { detail: '你按下了最危险也最华丽的按钮', evaluation: '这不是普通组合加成，而是一场会让人失语的复活演出。' }
                    : null;
            }
        }
    ];

    return [...comboDefinitions(), ...extraDefinitions]
        .map((combo) => {
            const outcome = combo.when(members);
            return outcome ? { ...combo, ...outcome } : null;
        })
        .filter(Boolean);
}

function applyComboEffects(members, triggeredCombos) {
    const enhancedMembers = members.map(cloneMember);
    let skillBonus = 0;
    let chemistryBonus = 0;

    triggeredCombos.forEach((combo) => {
        if (!combo.effect) {
            return;
        }
        skillBonus += combo.effect.skillBonus || 0;
        chemistryBonus += combo.effect.chemistryBonus || 0;

        (combo.effect.memberBonuses || []).forEach((bonus) => {
            const target = enhancedMembers.find((member) => member.name === bonus.name);
            if (!target) {
                return;
            }
            target.skillBoost += bonus.skill || 0;
            target.chemistryBoost += bonus.chemistry || 0;
        });
    });

    return { enhancedMembers, skillBonus, chemistryBonus };
}

function computeScores(members) {
    const requirements = getRequirementState(members);
    const missingRoles = requirements.filter((item) => !item.ok).map((item) => item.keyword);
    const triggeredCombos = getTriggeredCombos(members);
    const comboScore = triggeredCombos.reduce((sum, combo) => sum + combo.bonus, 0);
    const { enhancedMembers, skillBonus, chemistryBonus } = applyComboEffects(members, triggeredCombos);
    const skillScore = enhancedMembers.reduce((sum, member) => sum + member.skill + member.skillBoost, 0) + skillBonus;
    const chemistryScore = enhancedMembers.reduce((sum, member) => sum + member.chemistry + member.chemistryBoost, 0) + chemistryBonus;
    const totalScore = Math.max(0, skillScore + chemistryScore + comboScore - missingRoles.length * 6);

    return {
        requirements,
        missingRoles,
        enhancedMembers,
        triggeredCombos,
        skillScore,
        chemistryScore,
        comboScore,
        totalScore,
        totalCost: totalCost(members)
    };
}

function getEvaluationTier(totalScore) {
    return evaluationTiers.find((tier) => totalScore >= tier.min) || evaluationTiers[evaluationTiers.length - 1];
}

function createMemberCard(member) {
    const meta = bandMeta[member.bandKey];
    const selected = gameState.selected.some((item) => item.id === member.id);
    const image = safeAsset(member.image);
    const abilityList = member.abilities.length ? member.abilities : ['基础位'];
    const actionLabel = selected ? '已选中' : gameState.budget < member.cost ? `需要 ${member.cost} 元` : '加入阵容';

    return `
        <article class="member-card ${selected ? 'is-selected' : ''}" data-band="${member.bandKey}" style="--band-accent:${meta.accent};--band-alt:${meta.alt};">
            <img src="${image}" alt="${member.name}">
            <div class="member-card-top">
                <div>
                    <small>${meta.badge}</small>
                    <strong>${member.name}</strong>
                    <span>${member.role}</span>
                </div>
                <span class="pill">${member.cost} 元</span>
            </div>
            <div class="meta-row member-entry">
                <span>技能 ${member.skill}</span>
                <span>默契 ${member.chemistry}</span>
            </div>
            <div class="member-stack">${abilityList.map((item) => `<span class="member-chip">${item}</span>`).join('')}</div>
            <button type="button" data-select-member="${member.id}" ${selected ? 'disabled' : ''}>${actionLabel}</button>
        </article>
    `;
}
function renderMemberPool() {
    const pool = document.getElementById('memberPool');
    if (!pool) {
        return;
    }

    const groups = Object.keys(bandMeta).map((bandKey) => {
        const meta = bandMeta[bandKey];
        const members = roster.filter((member) => member.bandKey === bandKey);
        return `
            <article class="game-band-group" data-band="${bandKey}" style="--band-accent:${meta.accent};--band-alt:${meta.alt};">
                <div class="pool-header">
                    <div>
                        <span class="section-kicker">${meta.badge}</span>
                        <h3>${meta.title}</h3>
                    </div>
                    <span class="badge">${meta.note}</span>
                </div>
                <div class="member-pool">${members.map(createMemberCard).join('')}</div>
            </article>
        `;
    }).join('');

    pool.innerHTML = groups;
    pool.querySelectorAll('[data-select-member]').forEach((button) => {
        button.addEventListener('click', () => selectMember(button.dataset.selectMember));
    });
}

function renderSelected() {
    const selectedList = document.getElementById('selectedList');
    if (!selectedList) {
        return;
    }

    if (!gameState.selected.length) {
        selectedList.innerHTML = '<p class="empty-state">还没有成员入队，先从任意一个舞台把第一位拉进来吧。</p>';
        return;
    }

    selectedList.innerHTML = gameState.selected.map((member) => {
        const meta = bandMeta[member.bandKey] || { accent: '#7f879e', alt: '#4b5563', badge: 'Special' };
        return `
            <article class="selected-card" data-band="${member.bandKey}" style="--band-accent:${meta.accent};--band-alt:${meta.alt};">
                <img src="${safeAsset(member.image)}" alt="${member.name}">
                <div class="selected-card-head">
                    <div>
                        <small>${meta.badge}</small>
                        <strong>${member.name}</strong>
                        <span>${member.role}</span>
                    </div>
                    <button class="remove-member" type="button" data-remove-member="${member.id}" aria-label="移除 ${member.name}">×</button>
                </div>
                <div class="meta-row member-entry">
                    <span>技能 ${member.skill}</span>
                    <span>默契 ${member.chemistry}</span>
                    <span>花费 ${member.cost}</span>
                </div>
            </article>
        `;
    }).join('');

    selectedList.querySelectorAll('[data-remove-member]').forEach((button) => {
        button.addEventListener('click', () => removeMember(button.dataset.removeMember));
    });
}

function updateBudget() {
    const budgetDisplay = document.getElementById('budgetDisplay');
    if (budgetDisplay) {
        budgetDisplay.textContent = `${gameState.budget} 元`;
    }
}

function updateRequirements() {
    const status = document.getElementById('requirementsStatus');
    if (!status) {
        return [];
    }

    const requirements = getRequirementState(gameState.selected);
    status.innerHTML = requirements
        .map((item) => `<span class="requirement-tag ${item.ok ? 'is-ok' : 'is-missing'}">${item.ok ? '已满足' : '缺少'} ${item.keyword}</span>`)
        .join('');

    return requirements.filter((item) => !item.ok).map((item) => item.keyword);
}

function updateScores() {
    const scoreMap = {
        skillScore: document.getElementById('skillScore'),
        chemistryScore: document.getElementById('chemistryScore'),
        comboScore: document.getElementById('comboScore'),
        totalScore: document.getElementById('totalScore')
    };
    const comboList = document.getElementById('comboList');
    const scoreNote = document.getElementById('scoreNote');

    if (!gameState.selected.length) {
        Object.values(scoreMap).forEach((node) => {
            if (node) {
                node.textContent = '0';
                node.classList.remove('is-positive', 'is-negative');
            }
        });
        if (comboList) {
            comboList.innerHTML = '<p class="empty-state">组合加成会在成员逐渐成型之后出现。</p>';
        }
        if (scoreNote) {
            scoreNote.textContent = '先凑齐主唱、吉他、贝斯和鼓手，再来看整队的舞台完成度。';
        }
        return null;
    }

    const result = computeScores(gameState.selected);
    scoreMap.skillScore.textContent = String(result.skillScore);
    scoreMap.chemistryScore.textContent = String(result.chemistryScore);
    scoreMap.comboScore.textContent = result.comboScore >= 0 ? `+${result.comboScore}` : String(result.comboScore);
    scoreMap.totalScore.textContent = String(result.totalScore);
    scoreMap.comboScore.classList.toggle('is-negative', result.comboScore < 0);
    scoreMap.comboScore.classList.toggle('is-positive', result.comboScore > 0);
    scoreMap.totalScore.classList.toggle('is-positive', result.totalScore >= 85);

    if (comboList) {
        comboList.innerHTML = result.triggeredCombos.length
            ? result.triggeredCombos.map((combo) => `
                <article class="combo-item ${combo.bonus < 0 ? 'negative' : ''}">
                    <div class="combo-head">
                        <strong>${combo.name}</strong>
                        <span>${combo.bonus >= 0 ? '+' : ''}${combo.bonus}</span>
                    </div>
                    <p>${combo.detail || combo.evaluation}</p>
                </article>
            `).join('')
            : '<p class="empty-state">暂时还没有触发组合，你可以试着往完整原团或强关系线靠拢。</p>';
    }

    if (scoreNote) {
        if (result.missingRoles.length) {
            scoreNote.textContent = `还缺少 ${result.missingRoles.join('、')}，正式上台前最好先把基础编制补齐。`;
        } else if (result.triggeredCombos.some((combo) => combo.id === 'crychic_revival')) {
            scoreNote.textContent = '你触发了最危险的隐藏事件，这已经不是普通配队，而是一场会压住全场呼吸的复活演出。';
        } else if (result.triggeredCombos.length >= 3) {
            scoreNote.textContent = '组合联动已经开始叠起来了，这支队伍有明显的完整舞台感。';
        } else {
            scoreNote.textContent = '基础位已经差不多了，再补一条关系线或完整原团加成会更漂亮。';
        }
    }

    return result;
}

function setBanner(title, text, kind = 'neutral') {
    const banner = document.getElementById('borrowBanner');
    if (!banner) {
        return;
    }
    banner.classList.remove('is-positive', 'is-negative', 'is-warning', 'is-epic');
    if (kind !== 'neutral') {
        banner.classList.add(`is-${kind}`);
    }
    banner.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
}

function updateBorrowButton() {
    const button = document.getElementById('borrowButton');
    if (!button) {
        return;
    }
    if (gameState.locked) {
        button.disabled = true;
        button.textContent = '祥子接管中';
        return;
    }
    if (gameState.hitoriBorrowCount > 0) {
        button.disabled = false;
        button.textContent = `继续向波奇借钱 (+1)`;
        return;
    }
    button.disabled = gameState.borrowUsed;
    button.textContent = gameState.borrowUsed ? '借钱机会已用' : '试试借钱';
}
function selectMember(memberId) {
    if (gameState.locked) {
        setBanner('当前阵容已锁定', '彩蛋事件触发后，后台名单已经被祥子直接接管。', 'warning');
        return;
    }

    const member = roster.find((item) => item.id === memberId);
    if (!member || gameState.selected.some((item) => item.id === memberId)) {
        return;
    }
    if (gameState.budget < member.cost) {
        setBanner('预算不够', `${member.name} 需要 ${member.cost} 元，但你现在只剩 ${gameState.budget} 元。`, 'negative');
        gameAudio.borrow('negative');
        return;
    }

    gameState.selected.push(cloneMember(member));
    gameState.budget -= member.cost;
    gameAudio.borrow('neutral');
    refreshGame();
}

function removeMember(memberId) {
    if (gameState.locked) {
        setBanner('当前阵容已锁定', '隐藏事件触发后不能再移除成员，只能重新开始。', 'warning');
        return;
    }

    const index = gameState.selected.findIndex((member) => member.id === memberId);
    if (index < 0) {
        return;
    }

    gameState.budget += gameState.selected[index].cost;
    gameState.selected.splice(index, 1);
    refreshGame();
}

function createSupportBorrower() {
    const supporters = [
        { name: '伊地知虹夏', text: '虹夏从收银盒里帮你找到了 1 元硬币。' },
        { name: '安和昴', text: '昴说先拿去垫一下，排练别停。' },
        { name: '长崎爽世', text: '爽世看了你一眼，还是把 1 元放到了桌上。' }
    ];
    return supporters[Math.floor(Math.random() * supporters.length)];
}

function triggerSakikoRevival() {
    if (gameState.sakikoAudio) {
        gameState.sakikoAudio.pause();
        gameState.sakikoAudio.currentTime = 0;
    }

    gameState.borrowUsed = true;
    gameState.locked = true;
    gameState.budget = 0;
    gameState.selected = [
        { id: 'crychic-1', name: '丰川祥子', bandKey: 'mygo', band: 'CRYCHiC', role: '键盘手', abilities: ['作曲'], cost: 0, skill: 10, chemistry: 0, image: '../images/丰川祥子.png' },
        { id: 'crychic-2', name: '高松灯', bandKey: 'mygo', band: 'CRYCHiC', role: '主唱', abilities: ['作词', '主唱'], cost: 0, skill: 5, chemistry: 2, image: '../images/mygo_tomori (1).jpg' },
        { id: 'crychic-3', name: '长崎爽世', bandKey: 'mygo', band: 'CRYCHiC', role: '贝斯手', abilities: [], cost: 0, skill: 7, chemistry: 7, image: '../images/mygo_soyo.cover.jpg' },
        { id: 'crychic-4', name: '椎名立希', bandKey: 'mygo', band: 'CRYCHiC', role: '鼓手', abilities: ['作曲'], cost: 0, skill: 8, chemistry: 3, image: '../images/mygo_taki.cover.jpg' },
        { id: 'crychic-5', name: '若叶睦', bandKey: 'mygo', band: 'CRYCHiC', role: '吉他手', abilities: ['支援'], cost: 0, skill: 10, chemistry: 1, image: '../images/若叶睦.png' }
    ].map(cloneMember);

    if (gameAudio.enabled) {
        gameState.sakikoAudio = new Audio(musicPath('CRYCHIC - 春日影.mp3'));
        gameState.sakikoAudio.play().catch(() => {
            setBanner('CRYCHiC 复活', '彩蛋已经触发。浏览器拦截了自动播放，但阵容已经完整切换。', 'epic');
        });
    }

    setBanner('CRYCHiC 复活', '借钱按钮被你按出了最危险的结果。祥子直接接管后台名单，CRYCHiC 重新站回了舞台中央。', 'epic');
    gameAudio.borrow('epic');
    refreshGame();
}

function borrowMoney() {
    if (gameState.locked) {
        return;
    }

    if (gameState.hitoriBorrowCount > 0) {
        gameState.hitoriBorrowCount += 1;
        gameState.budget += 1;
        setBanner('波奇继续借钱', `后藤一里第 ${gameState.hitoriBorrowCount} 次颤抖着掏出 1 元硬币。你现在有 ${gameState.budget} 元。`, 'positive');
        gameAudio.borrow('positive');
        refreshGame();
        return;
    }

    if (gameState.borrowUsed) {
        setBanner('借钱机会已用掉', '这轮运气已经结算过了，除非你走上波奇连借分支。', 'warning');
        gameAudio.borrow('warning');
        return;
    }

    gameState.borrowUsed = true;
    const roll = Math.random();

    if (roll < 0.05) {
        triggerSakikoRevival();
        return;
    }
    if (roll < 0.30) {
        gameState.hitoriBorrowCount = 1;
        gameState.budget += 1;
        setBanner('波奇把零花钱递给了你', '虽然只有 1 元，但她好像默认以后还会继续借给你。', 'positive');
        gameAudio.borrow('positive');
        refreshGame();
        return;
    }
    if (roll < 0.48) {
        gameState.budget = 150;
        setBanner('紬大小姐接管后勤', '预算瞬间被抬到了 150 元。你现在可以按梦之队规格来选。', 'positive');
        gameAudio.borrow('positive');
        refreshGame();
        return;
    }
    if (roll < 0.64) {
        gameState.budget = Math.max(0, gameState.budget - 5);
        setBanner('凉顺手拿走了 5 元', '她说这只是临时周转，但你很清楚这笔钱大概回不来了。', 'negative');
        gameAudio.borrow('negative');
        refreshGame();
        return;
    }
    if (roll < 0.80) {
        gameState.budget = Math.max(0, gameState.budget - 2);
        setBanner('乐奈拿走了 2 元', '她什么都没解释，只留下一个“我想吃抹茶芭菲”的背影。', 'negative');
        gameAudio.borrow('negative');
        refreshGame();
        return;
    }

    const support = createSupportBorrower();
    gameState.budget += 1;
    setBanner(`${support.name} 伸了把手`, `${support.text} 预算来到 ${gameState.budget} 元。`, 'positive');
    gameAudio.borrow('positive');
    refreshGame();
}

function createSuggestionItems(result) {
    const suggestions = [];

    if (result.missingRoles.length) {
        suggestions.push(`先补齐 ${result.missingRoles.join('、')}，这会比盲目堆技能分更有效。`);
    }
    if (result.triggeredCombos.some((combo) => combo.id === 'instrument_repeat')) {
        suggestions.push('避免重复堆贝斯、鼓手或键盘，除非你就是想做实验编制。');
    }
    if (!result.triggeredCombos.some((combo) => combo.id === 'creative_ability')) {
        suggestions.push('补上作词、作曲和主唱三项能力，原创加成会非常明显。');
    }
    if (result.chemistryScore < 20) {
        suggestions.push('默契值偏低，优先考虑同团成员或关系线更强的组合。');
    }
    if (result.totalCost <= 10 && !gameState.locked) {
        suggestions.push('预算还有余量，可以把一个弱位升级成高技能成员。');
    }
    if (!suggestions.length) {
        suggestions.push('这套阵容已经足够完整，下一步就是试听歌单然后直接上台。');
    }

    return suggestions.slice(0, 4);
}

function evaluateBand() {
    const detail = document.getElementById('evaluationDetail');
    if (!detail) {
        return;
    }
    if (!gameState.selected.length) {
        detail.innerHTML = '<p class="empty-state">先选人，再来做完整评估。</p>';
        setBanner('先别急着打分', '后台名单还是空的，先把人拉进阵容再说。', 'warning');
        return;
    }

    const result = computeScores(gameState.selected);
    const tier = getEvaluationTier(result.totalScore);
    const boosted = result.enhancedMembers.filter((member) => member.skillBoost || member.chemistryBoost);
    const suggestions = createSuggestionItems(result);

    detail.innerHTML = `
        <article class="evaluation-card evaluation-card--${tier.key}">
            <small>Final Result</small>
            <h3>${tier.title}</h3>
            <p>${tier.text}</p>
            <div class="score-grid-compact">
                <article class="score-tile"><span>总分</span><strong>${result.totalScore}</strong></article>
                <article class="score-tile"><span>预算</span><strong>${result.totalCost} / ${gameState.locked ? '锁定' : '15+'}</strong></article>
            </div>
        </article>
        <article class="evaluation-card">
            <small>Highlights</small>
            <h3>这支队伍的亮点</h3>
            <div class="analysis-list">${result.triggeredCombos.length ? result.triggeredCombos.map((combo) => `<div><strong>${combo.name}</strong><p>${combo.evaluation}</p></div>`).join('') : '<p>目前最大的亮点还是基础成员本身，还需要组合加成来进一步成形。</p>'}</div>
        </article>
        <article class="evaluation-card">
            <small>Suggestions</small>
            <h3>下一步优化建议</h3>
            <div class="analysis-list">${suggestions.map((item) => `<p>${item}</p>`).join('')}</div>
        </article>
        <article class="evaluation-card">
            <small>Boost</small>
            <h3>被加成点亮的成员</h3>
            <div class="analysis-list">${boosted.length ? boosted.map((member) => `<p>${member.name}：技能 +${member.skillBoost || 0}，默契 +${member.chemistryBoost || 0}</p>`).join('') : '<p>这次没有出现针对单个成员的额外加成。</p>'}</div>
        </article>
    `;

    gameAudio.result(result.totalScore);
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function refreshGame() {
    renderMemberPool();
    renderSelected();
    updateBudget();
    updateRequirements();
    updateScores();
    updateBorrowButton();
}

function resetGame() {
    if (gameState.sakikoAudio) {
        gameState.sakikoAudio.pause();
        gameState.sakikoAudio.currentTime = 0;
        gameState.sakikoAudio = null;
    }

    gameState.budget = 15;
    gameState.selected = [];
    gameState.borrowUsed = false;
    gameState.hitoriBorrowCount = 0;
    gameState.locked = false;

    const detail = document.getElementById('evaluationDetail');
    if (detail) {
        detail.innerHTML = '<p class="empty-state">点击“评估乐队”后，这里会展开更完整的分析和建议。</p>';
    }

    setBanner('后台留言', '你有 15 元预算。可以先正常选人，也可以赌一把借钱按钮会不会带来好事。', 'neutral');
    refreshGame();
}

function initGame() {
    gameAudio.init();
    document.getElementById('borrowButton')?.addEventListener('click', borrowMoney);
    document.getElementById('soundToggle')?.addEventListener('click', () => gameAudio.toggle());
    document.getElementById('resetGame')?.addEventListener('click', resetGame);
    document.getElementById('evaluateBand')?.addEventListener('click', evaluateBand);

    const detail = document.getElementById('evaluationDetail');
    if (detail && !detail.innerHTML.trim()) {
        detail.innerHTML = '<p class="empty-state">点击“评估乐队”后，这里会展开更完整的分析和建议。</p>';
    }

    refreshGame();
}

document.addEventListener('DOMContentLoaded', initGame);
