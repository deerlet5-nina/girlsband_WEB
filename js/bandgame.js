// 音效系统
const audioSystem = {
    audioContext: null,
    soundEnabled: true,
    
    init() {
        // 创建AudioContext（需要用户交互后才能初始化）
        this.audioContext = null;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.updateSoundButton();
    },
    
    ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },
    
    updateSoundButton() {
        const soundButton = document.getElementById('sound-toggle');
        if (soundButton) {
            soundButton.textContent = this.soundEnabled ? '🔊' : '🔇';
            soundButton.title = this.soundEnabled ? '点击关闭音效' : '点击开启音效';
        }
    },
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled.toString());
        this.updateSoundButton();
    },
    
    // 播放指定频率的音符
    playNote(frequency, duration = 0.2, volume = 0.1, waveType = 'sine') {
        if (!this.soundEnabled) return;
        
        this.ensureAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = waveType;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },
    
    // 播放和弦
    playChord(frequencies, duration = 0.5, volume = 0.08) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playNote(freq, duration, volume);
            }, index * 50);
        });
    },
    
    // 播放旋律
    playMelody(notes, tempo = 200) {
        notes.forEach((note, index) => {
            setTimeout(() => {
                if (note.freq > 0) {
                    this.playNote(note.freq, note.duration || 0.2, note.volume || 0.1, note.wave || 'sine');
                }
            }, index * tempo);
        });
    },
    
    // 根据评分播放对应的结算音乐
    playResultMusic(score) {
        if (!this.soundEnabled) return;
        
        // 添加音效按钮的视觉反馈
        this.addSoundButtonFeedback();
        
        if (score >= 120) {
            // 传奇乐队 - 胜利音乐
            this.playLegendaryMusic();
        } else if (score >= 100) {
            // 明星乐队 - 成功音乐
            this.playStarMusic();
        } else if (score >= 85) {
            // 实力派乐队 - 良好音效
            this.playSkillfulMusic();
        } else if (score >= 70) {
            // 新锐乐队 - 鼓励音效
            this.playPromisingMusic();
        } else if (score >= 55) {
            // 业余乐队 - 平淡音效
            this.playAmateurMusic();
        } else if (score >= 40) {
            // 练习乐队 - 遗憾音效
            this.playPracticeMusic();
        } else {
            // 车库乐队 - 失败音效
            this.playGarageMusic();
        }
    },
    
    // 添加音效按钮的视觉反馈
    addSoundButtonFeedback() {
        const soundButton = document.getElementById('sound-toggle');
        if (soundButton) {
            soundButton.classList.add('playing');
            setTimeout(() => {
                soundButton.classList.remove('playing');
            }, 3000); // 3秒后移除效果
        }
    },
    
    // 传奇乐队音乐 - 华丽的上升音阶
    playLegendaryMusic() {
        const notes = [
            {freq: 523, duration: 0.15}, // C5
            {freq: 587, duration: 0.15}, // D5
            {freq: 659, duration: 0.15}, // E5
            {freq: 698, duration: 0.15}, // F5
            {freq: 784, duration: 0.15}, // G5
            {freq: 880, duration: 0.15}, // A5
            {freq: 988, duration: 0.3},  // B5
            {freq: 1047, duration: 0.5}, // C6
        ];
        this.playMelody(notes, 150);
        
        // 添加和弦支撑
        setTimeout(() => {
            this.playChord([523, 659, 784], 1.0, 0.06); // C大三和弦
        }, 800);
    },
    
    // 明星乐队音乐 - 欢快的旋律
    playStarMusic() {
        const notes = [
            {freq: 523, duration: 0.2}, // C5
            {freq: 659, duration: 0.2}, // E5
            {freq: 784, duration: 0.2}, // G5
            {freq: 659, duration: 0.2}, // E5
            {freq: 523, duration: 0.3}, // C5
            {freq: 784, duration: 0.4}, // G5
        ];
        this.playMelody(notes, 200);
        
        setTimeout(() => {
            this.playChord([523, 659, 784], 0.8, 0.05);
        }, 600);
    },
    
    // 实力派乐队音乐 - 稳定的进行
    playSkillfulMusic() {
        const notes = [
            {freq: 440, duration: 0.3}, // A4
            {freq: 523, duration: 0.3}, // C5
            {freq: 659, duration: 0.3}, // E5
            {freq: 523, duration: 0.4}, // C5
        ];
        this.playMelody(notes, 250);
    },
    
    // 新锐乐队音乐 - 渐强的希望音调
    playPromisingMusic() {
        const notes = [
            {freq: 392, duration: 0.2, volume: 0.06}, // G4
            {freq: 440, duration: 0.2, volume: 0.08}, // A4
            {freq: 494, duration: 0.2, volume: 0.10}, // B4
            {freq: 523, duration: 0.4, volume: 0.12}, // C5
        ];
        this.playMelody(notes, 300);
    },
    
    // 业余乐队音乐 - 中性音调
    playAmateurMusic() {
        const notes = [
            {freq: 440, duration: 0.3}, // A4
            {freq: 392, duration: 0.3}, // G4
            {freq: 440, duration: 0.3}, // A4
        ];
        this.playMelody(notes, 350);
    },
    
    // 练习乐队音乐 - 下降音调
    playPracticeMusic() {
        const notes = [
            {freq: 523, duration: 0.3}, // C5
            {freq: 440, duration: 0.3}, // A4
            {freq: 392, duration: 0.3}, // G4
            {freq: 349, duration: 0.4}, // F4
        ];
        this.playMelody(notes, 300);
    },
    
    // 车库乐队音乐 - 低沉的失败音效
    playGarageMusic() {
        const notes = [
            {freq: 294, duration: 0.4, wave: 'sawtooth'}, // D4
            {freq: 262, duration: 0.4, wave: 'sawtooth'}, // C4
            {freq: 220, duration: 0.6, wave: 'sawtooth'}, // A3
        ];
        this.playMelody(notes, 400);
    },
    
    // 借钱音效
    playBorrowSound(type) {
        if (!this.soundEnabled) return;
        
        switch(type) {
            case 'positive':
                this.playNote(659, 0.2, 0.1); // E5 - 成功音
                setTimeout(() => this.playNote(784, 0.2, 0.1), 100); // G5
                break;
            case 'negative':
                this.playNote(294, 0.3, 0.1, 'sawtooth'); // D4 - 失败音
                setTimeout(() => this.playNote(220, 0.3, 0.1, 'sawtooth'), 150); // A3
                break;
            case 'warning':
                this.playNote(523, 0.15, 0.08); // C5 - 警告音
                setTimeout(() => this.playNote(440, 0.15, 0.08), 80);
                setTimeout(() => this.playNote(523, 0.15, 0.08), 160);
                break;
            case 'neutral':
                this.playNote(440, 0.2, 0.08); // A4 - 中性音
                break;
        }
    }
};

// 游戏数据
const gameData = {
    budget: 15,
    selectedMembers: [],
    borrowUsed: false, // 借钱功能是否已使用
    borrowHistory: [], // 借钱历史记录
    members: [
        // 轻音少女乐队成员
        {
            id: 'k-on-1',
            name: '平泽唯',
            band: '轻音少女',
            role: '吉他手',
            abilities: ['作词',"主唱"],
            cost: 3,
            skill: 5,
            chemistry: 6,
            image: '../images/k-on_yui (2).jpg'
        },
        {
            id: 'k-on-2',
            name: '秋山澪',
            band: '轻音少女',
            role: '贝斯手',
            abilities: ['作词', '主唱'],
            cost: 4,
            skill: 8,
            chemistry: 4,
            image: '../images/k-on_mio (4).jpg'
        },
        {
            id: 'k-on-3',
            name: '田井中律',
            band: '轻音少女',
            role: '鼓手',
            abilities: [],
            cost: 3,
            skill: 5,
            chemistry: 7,
            image: '../images/k-on_ritsu (3).jpg'
        },
        {
            id: 'k-on-4',
            name: '琴吹䌷',
            band: '轻音少女',
            role: '键盘手',
            abilities: ['作曲'],
            cost: 3,
            skill: 9,
            chemistry: 5,
            image: '../images/k-on_mugi (4).jpg'
        },
        {
            id: 'k-on-5',
            name: '中野梓',
            band: '轻音少女',
            role: '吉他手',
            abilities: [],
            cost: 3,
            skill: 8,
            chemistry: 4,
            image: '../images/k-on_azusa (3).jpg'
        },
        
        // 孤独摇滚成员
        {
            id: 6,
            name: "后藤一里",
            role: "吉他手",
            band: "结束乐队",
            cost: 3,
            skill: 10,
            chemistry: 3,
            image: "../images/bocchi_hitori (1).jpg",
            abilities: ["作词"]
        },
        {
            id: 7,
            name: "伊地知虹夏",
            role: "鼓手",
            band: "结束乐队",
            cost: 3,
            skill: 5,
            chemistry: 7,
            image: "../images/bocchi_nijika (1).jpg",
            abilities: []
        },
        {
            id: 8,
            name: "山田凉",
            role: "贝斯手",
            band: "结束乐队",
            cost: 2,
            skill: 9,
            chemistry: 2,
            image: "../images/bocchi_ryo (1).jpg",
            abilities: ["作曲"]
        },
        {
            id: 9,
            name: "喜多郁代",
            role: "吉他手 & 主唱",
            band: "结束乐队",
            cost: 2,
            skill: 5,
            chemistry: 6,
            image: "../images/bocchi_ikuyo (1).jpg",
            abilities: ["主唱"]
        },
        
        // MyGO!! 乐队成员
        {
            id: 'mygo-1',
            name: '高松灯',
            band: 'MyGO!!',
            role: '主唱',
            abilities: ['作词',"主唱"],
            cost: 1,
            skill: 5,
            chemistry: 2,
            image: '../images/mygo_tomori (1).jpg'
        },
        {
            id: 'mygo-2',
            name: '千早爱音',
            band: 'MyGO!!',
            role: '吉他手',
            abilities: ['主唱'],
            cost: 1,
            skill: 2,
            chemistry: 6,
            image: '../images/mygo_anon.cover.jpg'
        },
        {
            id: 'mygo-3',
            name: '要乐奈',
            band: 'MyGO!!',
            role: '吉他手',
            abilities: [],
            cost: 3,
            skill: 9,
            chemistry: 2,
            image: '../images/mygo_rana.cover.jpg'
        },
        {
            id: 'mygo-4',
            name: '长崎素世',
            band: 'MyGO!!',
            role: '贝斯手',
            abilities: [],
            cost: 4,
            skill: 7,
            chemistry: 7,
            image: '../images/mygo_soyo.cover.jpg'
        },
        {
            id: 'mygo-5',
            name: '椎名立希',
            band: 'MyGO!!',
            role: '鼓手',
            abilities: ["作曲"],
            cost: 3,
            skill: 8,
            chemistry: 3,
            image: '../images/mygo_taki.cover.jpg'
        },
        
        // 无刺有刺乐队成员
        {
            id: 15,
            name: "井芹仁菜",
            role: "主唱",
            band: "无刺有刺",
            cost: 4,
            skill: 9,
            chemistry: 4,
            image: "../images/gbc_nina.cover.png",
            abilities: ["作词"]
        },
        {
            id: 16,
            name: "河原木桃香",
            role: "吉他手",
            band: "无刺有刺",
            cost: 5,
            skill: 10,
            chemistry: 6,
            image: "../images/gbc_mmk.cover.png",
            abilities: ["作曲","作词","主唱"]
        },
        {
            id: 17,
            name: "安和昴",
            role: "鼓手",
            band: "无刺有刺",
            cost: 3,
            skill: 4,
            chemistry: 7,
            image: "../images/gbc_subaru.cover.jpg",
            abilities: []
        },
        {
            id: 18,
            name: "海老冢智",
            role: "键盘手",
            band: "无刺有刺",
            cost: 3,
            skill: 10,
            chemistry: 2,
            image: "../images/gbc_tomo.cover.jpg",
            abilities: ["作曲"]
        },
        {
            id: 19,
            name: "RUPA",
            role: "贝斯手",
            band: "无刺有刺",
            cost: 3,
            skill: 8,
            chemistry: 5,
            image: "../images/gbc_rupa.cover.png",
            abilities: []
        },
        

        {
            id: 'assist-1',
            name: "若叶睦",
            role: "吉他手",
            band: "CRYCHiC",
            cost: 0,
            skill: 10,
            chemistry: 1,
            image: "../images/若叶睦.png", 
            abilities: ["支援者"],
            isAssistCharacter: true,
            hidden: true // 初始隐藏，只有通过祥子才能获得
        }
    ]
};

// 特殊组合规则 - 修复逻辑，确保分数计算一致性
const specialCombos = [
    {
        id: "same_band",
        name: "我们来自同一个乐队",
        description: "选择来自同一乐队的3名或以上成员",
        bonus: 10,
        check: function(selectedMembers) {
            const bandCounts = {};
            selectedMembers.forEach(member => {
                bandCounts[member.band] = (bandCounts[member.band] || 0) + 1;
            });
            
            for (const band in bandCounts) {
                if (bandCounts[band] >= 3) {
                    return { 
                        triggered: true, 
                        detail: `${band}乐队有${bandCounts[band]}名成员`,
                        evaluation: `选择来自同一个乐队的成员能带来更好的默契度和团队精神，${band}的成员们彼此非常了解！`
                    };
                }
            }
            return { triggered: false };
        }
    },
    {
        id: "soul_mate",
        name: "Soul mate",
        description: "仁菜和桃香的特殊羁绊",
        bonus: 5,
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('井芹仁菜') && names.includes('河原木桃香')) {
                return { 
                    triggered: true,
                    evaluation: "仁菜和桃香的特殊羁绊：你在害怕什么，你在担心什么？站在你面前的，是从你那里获得勇气、振作精神，才从痛苦中解放的人。是和你一起唱歌，会感到幸福，想和你一起赌一把的人。相信着你，爱着你的歌。mmk桑，不要拿我当作逃避的借口..."
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "cake_hunter",
        name: "蛋糕猎手",
        description: "大小姐带来了呆唯最喜欢的茶点",
        bonus: 3,
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('平泽唯') && names.includes('琴吹䌷')) {
                return { 
                    triggered: true,
                    evaluation: "蛋糕猎手：䌷大小姐带来的美味茶点让唯的演奏更有活力！甜食是唯的动力源泉。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "childhood_friends",
        name: "青梅竹马（k-on)",
        description: "mio和律是从小到大的好朋友",
        bonus: 6,
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('秋山澪') && names.includes('田井中律')) {
                return { 
                    triggered: true,
                    evaluation: "青梅竹马：澪和律从小到大的深厚友谊让她们在台上有着无可比拟的默契，只有在律的身旁，澪才会展现出完全放下戒备的状态。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "parent_love",
        name: "父母爱情",
        description: "虹夏与凉像老夫老妻般彼此知根知底",
        bonus: 6,
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('伊地知虹夏') && names.includes('山田凉')) {
                return { 
                    triggered: true,
                    evaluation: "父母爱情：虹夏与凉像老夫老妻般彼此知根知底，也只有虹夏能摸清楚凉假装的扑克脸之下的真情感，当然也能督促她还波奇的钱啦。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "perfect_vocalist",
        name: "完美主唱",
        description: "选择一名技能值9或以上的主唱",
        bonus: 5,
        check: function(selectedMembers) {
            const perfectVocalist = selectedMembers.find(member => 
                (member.abilities.includes("主唱") || member.role.includes("主唱")) && member.skill >= 9
            );
            if (perfectVocalist) {
                return { 
                    triggered: true,
                    detail: `${perfectVocalist.name}是技能${perfectVocalist.skill}的顶级主唱`,
                    evaluation: `拥有${perfectVocalist.name}这样实力出众的主唱！强大的歌声为乐队的表演增添了无与伦比的表现力和感染力。`
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "harmony_family",
        name: "和谐大家庭",
        description: "所有成员的和谐值总和在30或以上",
        bonus: 8,
        check: function(selectedMembers) {
            if (selectedMembers.length > 0) {
                const totalChemistry = selectedMembers.reduce((sum, member) => sum + member.chemistry, 0);
                if (totalChemistry >= 30) {
                    return { 
                        triggered: true,
                        detail: `总和谐值：${totalChemistry}`,
                        evaluation: `乐队成员之间关系非常融洽！这种和谐的氛围有助于创作出更好的音乐，团队合作无间。`
                    };
                }
            }
            return { triggered: false };
        }
    },
    {
        id: "creative_ability",
        name: "创作能力",
        description: "拥有作词、作曲和主唱能力",
        bonus: 15,
        check: function(selectedMembers) {
            const abilities = new Set();
            selectedMembers.forEach(member => {
                member.abilities.forEach(ability => abilities.add(ability));
                if (member.role.includes("主唱")) {
                    abilities.add("主唱");
                }
            });
            if (abilities.has("作词") && abilities.has("作曲") && abilities.has("主唱")) {
                return { 
                    triggered: true,
                    evaluation: "完整创作能力：乐队具备从作词到作曲再到演唱的完整创作能力！这是成为顶级乐队的必备条件，能够独立创作出优质的原创音乐。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "budget_master",
        name: "预算达人",
        description: "正好使用全部15元预算",
        bonus: 5,
        check: function(selectedMembers) {
            const totalCost = selectedMembers.reduce((sum, member) => sum + member.cost, 0);
            if (totalCost === 15) {
                return { 
                    triggered: true,
                    evaluation: "预算达人：完美利用预算！这种精打细算的能力在乐队运营中非常重要，资源配置达到最优化。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "kon_complete",
        name: "放课后茶会",
        description: "选择完整的轻音部成员",
        bonus: 15,
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('平泽唯') && 
                   names.includes('秋山澪') && 
                   names.includes('田井中律') && 
                   names.includes('琴吹䌷') &&
                names.includes('中野梓')) {
                return { 
                    triggered: true,
                    evaluation: "放课后茶会：完整的轻音部成员！这支乐队有着极高的默契度和亲和力，能够呈现出温暖人心的治愈系表演，轻松惬意的茶会时光。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "bocchi_complete", 
        name: "结束乐队",
        description: "选择完整的结束乐队成员",
        bonus: 15,
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('后藤一里') && 
                   names.includes('伊地知虹夏') && 
                   names.includes('山田凉') && 
                names.includes('喜多郁代')) {
                return { 
                    triggered: true,
                    evaluation: "结束乐队：完整的结束乐队成员！这支乐队能够呈现出融合了社恐少女成长历程的独特摇滚风格，每个人都在音乐中找到了自己的位置。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "mygo_complete",
        name: "MyGO!!",
        description: "选择完整的MyGO!!乐队成员",
        bonus: 15,
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('高松灯') && 
                   names.includes('千早爱音') && 
                   names.includes('要乐奈') && 
                   names.includes('长崎素世') &&
                names.includes('椎名立希')) {
                return { 
                    triggered: true,
                    evaluation: "MyGO!!：完整的MyGO!!乐队成员！这支乐队充满青春活力，能够带来令人心潮澎湃的表演，少女们的爱恨纠葛在音乐中得到升华。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "gbc_complete",
        name: "无刺有刺",
        description: "选择完整的无刺有刺乐队成员",
        bonus: 15,
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('井芹仁菜') && 
                   names.includes('河原木桃香') && 
                   names.includes('安和昴') && 
                   names.includes('海老冢智') &&
                names.includes('RUPA')) {
                return { 
                    triggered: true,
                    evaluation: "无刺有刺：完整的无刺有刺乐队成员！这支乐队能够呈现出深沉而富有层次的音乐表现，燃烧的摇滚灵魂点燃观众的内心。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "instrument_repeat",
        name: "乐器重复",
        description: "乐队中除了吉他以外的某种乐器超过一把",
        bonus: -10,
        check: function(selectedMembers) {
            const instrumentCount = {};
            selectedMembers.forEach(member => {
                const role = member.role.toLowerCase();
                if (role.includes('贝斯')) {
                    instrumentCount['贝斯'] = (instrumentCount['贝斯'] || 0) + 1;
                } else if (role.includes('鼓手')) {
                    instrumentCount['鼓'] = (instrumentCount['鼓'] || 0) + 1;
                } else if (role.includes('键盘')) {
                    instrumentCount['键盘'] = (instrumentCount['键盘'] || 0) + 1;
                }
            });
            
            for (const [instrument, count] of Object.entries(instrumentCount)) {
                if (count > 1) {
                    return { 
                        triggered: true,
                        detail: `${instrument}重复${count}把`,
                        evaluation: `乐器重复：${instrument}重复！虽然是有趣的组合，但可能会导致音色冲突。不过如果是打算进行乐器大战的话，倒是个不错的配置。`
                    };
                }
            }
            return { triggered: false };
        }
    },
    {
        id: "mutual_dependence",
        name: "相依为命",
        description: "同时选择海老冢智和RUPA",
        bonus: 10,
        effect: { chemistryBonus: 8 },
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('海老冢智') && names.includes('RUPA')) {
                return { 
                    triggered: true,
                    evaluation: "相依为命：毅然离开家庭的tomo和失去挚亲的RUPA，在这个世界上，他们是彼此能依赖的唯一的亲人。这种深厚的羁绊让乐队的和谐度大幅提升。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "respect_aso",
        name: "敬爱素",
        description: "同时选择千早爱音和长崎素世",
        bonus: 12,
        effect: { chemistryBonus: 4, skillBonus: 4 },
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('千早爱音') && names.includes('长崎素世')) {
                return { 
                    triggered: true,
                    evaluation: "敬爱素：二创入脑也好，自带干粮也罢，哪有无缘无故的猜测，反驳的都是在嘴硬。让我们向爱素献上崇高的敬意！这种特殊的羁绊提升了整个乐队的实力。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "meeting_angel",
        name: "相遇天使",
        description: "同时选择平泽唯和中野梓",
        bonus: 15,
        effect: { specificMemberBonus: [
            { name: '平泽唯', skillBonus: 5 },
            { name: '中野梓', skillBonus: 5 }
        ]},
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('平泽唯') && names.includes('中野梓')) {
                return { 
                    triggered: true,
                    evaluation: "相遇天使：学园祭上响起滑滑蛋，路过的猫儿有了家。阿梓喵走入活动室，不靠谱的唯也必须有点学姐的样子了。师姐后辈的美好邂逅让她们都成长了许多。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "what_is_happiness",
        name: "幸福是什么",
        description: "同时选择高松灯和椎名立希",
        bonus: 8,
        effect: { 
            chemistryBonus: 3,
            specificMemberBonus: [
                { name: '椎名立希', skillBonus: 3 }
            ]
        },
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('高松灯') && names.includes('椎名立希')) {
                return { 
                    triggered: true,
                    evaluation: "幸福是什么：当你问我幸福是什么的时候，我连将来咱俩的门前挂哪个姓的门牌都想好了。这种纯真的感情让立希的演奏更加动人，也让乐队的氛围更加温馨。"
                };
            }
            return { triggered: false };
        }
    },
    {
        id: "crychic_revival",
        name: "我要复活crychic",
        description: "选择丰川祥子自动触发CRYCHiC完全体复活",
        bonus: 50,
        effect: { 
            chemistryBonus: 20,
            specificMemberBonus: [
                { name: '丰川祥子', skillBonus: 15 },
                { name: '高松灯', skillBonus: 10, chemistryBonus: 5 },
                { name: '长崎素世', skillBonus: 10, chemistryBonus: 5 },
                { name: '椎名立希', skillBonus: 10, chemistryBonus: 5 },
                { name: '若叶睦', skillBonus: 15, chemistryBonus: 10 }
            ]
        },
        check: function(selectedMembers) {
            const names = selectedMembers.map(member => member.name);
            if (names.includes('丰川祥子') && names.includes('高松灯') && 
                names.includes('长崎素世') && names.includes('椎名立希') && names.includes('若叶睦')) {
                return { 
                    triggered: true,
                    evaluation: "我要复活crychic：CRYCHiC的完全体！在祥子的指挥下，昔日的天才乐队重新聚集。灯、爽世、立希重新站在一起，而睦的加入为乐队带来了新的活力。这是音乐史上最传奇的复活，她们将创造出超越过去的音乐奇迹！"
                };
            }
            return { triggered: false };
        }
    }
];

// 乐队评价
const bandEvaluations = [
    { 
        minScore: 120, 
        title: "传奇乐队", 
        description: "这是一支注定载入音乐史册的传奇乐队！完美的成员搭配、卓越的技能水平、以及无与伦比的化学反应，让这支乐队拥有征服世界舞台的潜力。他们的音乐将影响几代人，成为永恒的经典。",
        bgColor: "#FFD700",
        textColor: "#8B4513"
    },
    { 
        minScore: 100, 
        title: "明星乐队", 
        description: "这支乐队很可能成为主流乐坛的耀眼明星！优秀的实力搭配和良好的团队合作，让他们拥有大量粉丝和商业成功的潜力。准备好迎接演唱会爆满的盛况吧！",
        bgColor: "#FF69B4",
        textColor: "#FFFFFF"
    },
    { 
        minScore: 85, 
        title: "实力派乐队", 
        description: "一支非常有实力的乐队！扎实的音乐功底和不错的默契度，音乐品质上乘，拥有稳定的粉丝群体。虽然还需要一些时间来打磨，但前景非常光明。",
        bgColor: "#32CD32",
        textColor: "#FFFFFF"
    },
    { 
        minScore: 70, 
        title: "新锐乐队", 
        description: "这支乐队展现出了不错的潜力！虽然在某些方面还需要磨合和提升，但整体实力可圈可点。假以时日，定能在音乐道路上闯出一片天地。",
        bgColor: "#1E90FF",
        textColor: "#FFFFFF"
    },
    { 
        minScore: 55, 
        title: "业余乐队", 
        description: "作为业余爱好者的水平来说已经不错了！虽然距离专业水准还有一定差距，但只要继续努力练习和磨合，未来还是很有希望的。",
        bgColor: "#FFA500",
        textColor: "#FFFFFF"
    },
    { 
        minScore: 40, 
        title: "练习乐队", 
        description: "目前还处于练习阶段的乐队。成员之间需要更多的磨合，技能也有提升空间。不过每个人都是从这个阶段开始的，坚持下去一定能有所收获！",
        bgColor: "#DC143C",
        textColor: "#FFFFFF"
    },
    { 
        minScore: 0, 
        title: "车库乐队", 
        description: "一支刚刚起步的车库乐队。虽然现在还有很多不足，但音乐之路才刚刚开始！多多练习，相信总有一天能够登上属于你们的舞台。",
        bgColor: "#696969",
        textColor: "#FFFFFF"
    }
];

// 初始化游戏
function initGame() {
    // 渲染可用成员
    const kOnContainer = document.getElementById('k-on-members');
    const bocchiContainer = document.getElementById('bocchi-members');
    const mygoContainer = document.getElementById('mygo-members');
    const gbcContainer = document.getElementById('gbc-members');
    
    // 清空容器
    kOnContainer.innerHTML = '';
    bocchiContainer.innerHTML = '';
    mygoContainer.innerHTML = '';
    gbcContainer.innerHTML = '';
    
    // 轻音少女成员
    gameData.members.filter(m => m.band === '轻音少女' && !m.isAssistCharacter).forEach(member => {
        kOnContainer.appendChild(createMemberCard(member));
    });
    
    // 孤独摇滚成员
    gameData.members.filter(m => m.band === '结束乐队' && !m.isAssistCharacter).forEach(member => {
        bocchiContainer.appendChild(createMemberCard(member));
    });
    
    // MYGO!!成员
    gameData.members.filter(m => m.band === 'MyGO!!' && !m.isAssistCharacter).forEach(member => {
        mygoContainer.appendChild(createMemberCard(member));
    });
    
    // 无刺有刺成员
    gameData.members.filter(m => m.band === '无刺有刺' && !m.isAssistCharacter).forEach(member => {
        gbcContainer.appendChild(createMemberCard(member));
    });
    

    
    updateBudget();
    updateScore();
    
    // 添加重置按钮事件监听
    document.getElementById('reset-button').addEventListener('click', resetGame);
    
    // 添加评估按钮事件监听
    document.getElementById('evaluate-button').addEventListener('click', evaluateBand);
    
    // 添加借钱按钮事件监听
    document.getElementById('borrow-button').addEventListener('click', borrowMoney);
    
    // 添加音效按钮事件监听
    document.getElementById('sound-toggle').addEventListener('click', () => audioSystem.toggleSound());
    
    // 初始化音效系统
    audioSystem.init();
    
    // 更新评估按钮状态
    updateEvaluateButtonState();
    
    // 更新借钱按钮状态
    updateBorrowButtonState();
}



// 渲染可选成员
function renderAvailableMembers() {
    const membersContainer = document.getElementById('available-members');
    membersContainer.innerHTML = '';
    
    // 按乐队分组成员
    const bandGroups = {};
    gameData.members.forEach(member => {
        if (!bandGroups[member.band]) {
            bandGroups[member.band] = [];
        }
        bandGroups[member.band].push(member);
    });
    
    // 为每个乐队创建一个部分
    for (const band in bandGroups) {
        const bandSection = document.createElement('div');
        bandSection.className = 'band-section';
        
        const bandTitle = document.createElement('h3');
        bandTitle.textContent = band;
        bandSection.appendChild(bandTitle);
        
        const bandMembers = document.createElement('div');
        bandMembers.className = 'band-members';
        
        bandGroups[band].forEach(member => {
            const memberCard = createMemberCard(member);
            bandMembers.appendChild(memberCard);
        });
        
        bandSection.appendChild(bandMembers);
        membersContainer.appendChild(bandSection);
    }
}

// 创建成员卡片
function createMemberCard(member) {
    const memberCard = document.createElement('div');
    memberCard.className = 'member-card';
    memberCard.dataset.id = member.id;
    
    // 检查成员是否已被选择
    const isSelected = gameData.selectedMembers.some(m => m.id == member.id);
    if (isSelected) {
        memberCard.classList.add('selected');
    }
    
    const memberImage = document.createElement('div');
    memberImage.className = 'member-image';
    
    const img = document.createElement('img');
    img.src = member.image;
    img.alt = member.name;
    memberImage.appendChild(img);
    
    const memberInfo = document.createElement('div');
    memberInfo.className = 'member-info';
    
    const nameElement = document.createElement('h3');
    nameElement.textContent = member.name;
    memberInfo.appendChild(nameElement);
    
    const infoGrid = document.createElement('div');
    infoGrid.className = 'info-grid';
    
    // 创建左右属性容器
    const leftAttributes = document.createElement('div');
    leftAttributes.className = 'left-attributes';
    
    const rightAttributes = document.createElement('div');
    rightAttributes.className = 'right-attributes';
    
    // 左侧属性：乐队、职位、能力
    const bandElement = document.createElement('div');
    bandElement.className = 'info-item band';
    bandElement.innerHTML = `<span class="label">乐队:</span> ${member.band}`;
    leftAttributes.appendChild(bandElement);
    
    const roleElement = document.createElement('div');
    roleElement.className = 'info-item role';
    roleElement.innerHTML = `<span class="label">职位:</span> ${member.role}`;
    leftAttributes.appendChild(roleElement);
    
    const abilitiesElement = document.createElement('div');
    abilitiesElement.className = 'info-item abilities';
    abilitiesElement.innerHTML = `<span class="label">能力:</span> ${member.abilities.join(', ') || '无'}`;
    leftAttributes.appendChild(abilitiesElement);
    
    // 右侧属性：技能、和谐度、价格
    const skillElement = document.createElement('div');
    skillElement.className = 'info-item skill';
    skillElement.innerHTML = `<span class="label">技能:</span> ${member.skill}`;
    rightAttributes.appendChild(skillElement);
    
    const chemistryElement = document.createElement('div');
    chemistryElement.className = 'info-item chemistry';
    chemistryElement.innerHTML = `<span class="label">和谐:</span> ${member.chemistry}`;
    rightAttributes.appendChild(chemistryElement);
    
    const costElement = document.createElement('div');
    costElement.className = 'info-item cost';
    
    // 特殊处理自动选择的成员显示
    let costDisplay = `${member.cost}元`;
    if (member.isAutoSelected) {
        costDisplay = `<span style="color: #2ecc71;">0元 (免费)</span>`;
    }
    
    costElement.innerHTML = `<span class="label">价格:</span> ${costDisplay}`;
    rightAttributes.appendChild(costElement);
    
    // 将左右属性容器添加到网格中
    infoGrid.appendChild(leftAttributes);
    infoGrid.appendChild(rightAttributes);
    
    memberInfo.appendChild(infoGrid);
    
    memberCard.appendChild(memberImage);
    memberCard.appendChild(memberInfo);
    
    // 为已选择的成员添加"已选择"标记并禁用点击
    if (isSelected) {
        const selectedMark = document.createElement('div');
        selectedMark.className = 'selected-mark';
        selectedMark.textContent = '已选择';
        memberCard.appendChild(selectedMark);
    } else {
        // 只为未选择的成员添加点击事件
        memberCard.addEventListener('click', () => selectMember(member.id));
    }
    
    return memberCard;
}

// 选择成员
function selectMember(memberId) {
    const member = gameData.members.find(m => m.id == memberId);
    if (!member) return;
    
    // 检查是否已经选择了该成员
    if (gameData.selectedMembers.some(m => m.id == memberId)) {
        showToast('该成员已经被选择，不能重复选择！', 'warning');
        return;
    }
    
    // 检查预算
    const currentCost = gameData.selectedMembers.reduce((sum, m) => sum + m.cost, 0);
    if (currentCost + member.cost > gameData.budget) {
        showToast('预算不足，无法选择该成员！', 'warning');
        return;
    }
    
    gameData.selectedMembers.push(member);
    
    updateSelectedMembers();
    updateBudget();
    updateScore();
    updateEvaluateButtonState();
    
    // 标记成员卡片为已选
    const memberCard = document.querySelector(`.member-card[data-id="${memberId}"]`);
    if (memberCard) {
        memberCard.classList.add('selected');
    }
}

// 移除成员
function removeMember(memberId) {
    gameData.selectedMembers = gameData.selectedMembers.filter(m => m.id != memberId);
    updateSelectedMembers();
    updateBudget();
    updateScore();
    updateEvaluateButtonState();
    
    // 取消成员卡片的选中状态
    const memberCard = document.querySelector(`.member-card[data-id="${memberId}"]`);
    if (memberCard) {
        memberCard.classList.remove('selected');
    }
}

// 更新已选成员显示
function updateSelectedMembers() {
    const selectedContainer = document.getElementById('selected-members');
    
    if (gameData.selectedMembers.length === 0) {
        selectedContainer.innerHTML = '<div class="empty-message">还没有选择任何成员</div>';
        return;
    }
    
    selectedContainer.innerHTML = '';
    
    gameData.selectedMembers.forEach(member => {
        const memberItem = document.createElement('div');
        memberItem.className = 'selected-member';
        memberItem.dataset.memberId = member.id;
        
        memberItem.innerHTML = `
            <div class="selected-member-info">
                <img src="${member.image}" alt="${member.name}" class="selected-member-img">
                <div class="selected-member-details">
                    <strong>${member.name}</strong>
                    <div>${member.role} (${member.band})</div>
                    <div>价格: ${member.cost}元</div>
                </div>
            </div>
            <button class="remove-btn" data-id="${member.id}">✕</button>
        `;
        
        selectedContainer.appendChild(memberItem);
    });
    
    // 添加移除按钮事件
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            removeMember(id);
        });
    });
    
    // 检查要求
    checkRequirements();
}

// 更新预算显示
function updateBudget() {
    const currentCost = gameData.selectedMembers.reduce((sum, member) => sum + member.cost, 0);
    const remainingBudget = gameData.budget - currentCost;
    
    document.getElementById('budget-display').textContent = remainingBudget;
}

// 应用特殊组合效果到成员属性
function applyComboEffects(selectedMembers) {
    // 创建成员的深拷贝以避免修改原始数据
    const enhancedMembers = selectedMembers.map(member => ({...member}));
    let totalChemistryBonus = 0;
    let totalSkillBonus = 0;
    
    // 检查所有特殊组合
    specialCombos.forEach(combo => {
        if (combo.effect && combo.check(selectedMembers).triggered) {
            const effect = combo.effect;
            
            // 应用全体和谐度加成
            if (effect.chemistryBonus) {
                totalChemistryBonus += effect.chemistryBonus;
            }
            
            // 应用全体技能加成
            if (effect.skillBonus) {
                totalSkillBonus += effect.skillBonus;
            }
            
            // 应用特定成员加成
            if (effect.specificMemberBonus) {
                effect.specificMemberBonus.forEach(bonus => {
                    const targetMember = enhancedMembers.find(m => m.name === bonus.name);
                    if (targetMember) {
                        if (bonus.skillBonus) {
                            targetMember.skill += bonus.skillBonus;
                        }
                        if (bonus.chemistryBonus) {
                            targetMember.chemistry += bonus.chemistryBonus;
                        }
                    }
                });
            }
        }
    });
    
    // 应用全体加成
    enhancedMembers.forEach(member => {
        member.skill += totalSkillBonus;
        member.chemistry += totalChemistryBonus;
    });
    
    return {
        enhancedMembers,
        totalChemistryBonus,
        totalSkillBonus
    };
}

// 更新得分显示 - 修复分数计算逻辑
function updateScore() {
    // 应用特殊组合效果
    const { enhancedMembers, totalChemistryBonus, totalSkillBonus } = applyComboEffects(gameData.selectedMembers);
    
    // 计算技能总分（使用增强后的技能值）
    const skillScore = enhancedMembers.reduce((sum, member) => sum + member.skill, 0);
    
    // 计算默契得分（使用增强后的和谐值）
    let chemistryScore = 0;
    if (enhancedMembers.length > 0) {
        const avgChemistry = enhancedMembers.reduce((sum, member) => sum + member.chemistry, 0) / enhancedMembers.length;
        chemistryScore = Math.round(avgChemistry * enhancedMembers.length);
    }
    
    // 计算特殊组合加成 - 修复重复计算问题
    let comboBonus = 0;
    const triggeredCombos = [];
    
    // 使用Set确保每个组合只触发一次，不受选人顺序影响
    const triggeredComboIds = new Set();
    
    specialCombos.forEach(combo => {
        const result = combo.check(gameData.selectedMembers);
        if (result.triggered && !triggeredComboIds.has(combo.id)) {
            triggeredComboIds.add(combo.id);
            comboBonus += combo.bonus;
            triggeredCombos.push({
                ...combo,
                detail: result.detail,
                evaluation: result.evaluation
            });
        }
    });
    
    // 显示已触发的组合
    const combosContainer = document.getElementById('special-combos');
    
    if (triggeredCombos.length > 0) {
        combosContainer.innerHTML = '';
        triggeredCombos.forEach(combo => {
            const comboItem = document.createElement('div');
            comboItem.className = 'combo-item';
            const bonusText = combo.bonus > 0 ? `+${combo.bonus}` : `${combo.bonus}`;
            const bonusClass = combo.bonus > 0 ? 'positive' : 'negative';
            
            // 生成效果描述
            let effectText = '';
            if (combo.effect) {
                const effects = [];
                if (combo.effect.chemistryBonus) {
                    effects.push(`和谐度+${combo.effect.chemistryBonus}`);
                }
                if (combo.effect.skillBonus) {
                    effects.push(`全体技能+${combo.effect.skillBonus}`);
                }
                if (combo.effect.specificMemberBonus) {
                    combo.effect.specificMemberBonus.forEach(bonus => {
                        if (bonus.skillBonus) {
                            effects.push(`${bonus.name}技能+${bonus.skillBonus}`);
                        }
                    });
                }
                if (effects.length > 0) {
                    effectText = `<div class="combo-effects">效果：${effects.join('，')}</div>`;
                }
            }
            
            comboItem.innerHTML = `
                <div class="combo-header">
                <span class="combo-name">${combo.name}</span>
                    <span class="combo-bonus ${bonusClass}">${bonusText}</span>
                </div>
                ${combo.detail ? `<div class="combo-detail">${combo.detail}</div>` : ''}
                ${effectText}
            `;
            combosContainer.appendChild(comboItem);
        });
    } else {
        combosContainer.innerHTML = '<div class="empty-message">还没有触发任何特殊组合</div>';
    }
    
    // 计算总分
    const totalScore = skillScore + chemistryScore + comboBonus;
    
    // 更新分数显示
    document.getElementById('skill-score').textContent = skillScore;
    document.getElementById('chemistry-score').textContent = chemistryScore;
    document.getElementById('total-score').textContent = totalScore;
    
    // 更新乐队评价
    updateBandEvaluation(totalScore);
    
    // 检查是否满足必要条件
    checkRequirements();
}

// 更新乐队评价 - 增强版本
function updateBandEvaluation(score) {
    const evaluationContainer = document.getElementById('evaluationResult');
    
    // 如果没有选择成员，显示提示
    if (gameData.selectedMembers.length === 0) {
        evaluationContainer.innerHTML = '<div class="evaluation-message">选择成员开始组建你的乐队吧！</div>';
        return;
    }
    
    // 根据分数获取评价
    let evaluation = bandEvaluations[bandEvaluations.length - 1]; // 默认最低评价
    for (let i = 0; i < bandEvaluations.length; i++) {
        if (score >= bandEvaluations[i].minScore) {
            evaluation = bandEvaluations[i];
            break;
        }
    }
    
    // 生成详细的乐队分析
    const analysis = generateBandAnalysis();
    
    evaluationContainer.innerHTML = `
        <div class="evaluation-header" style="background: ${evaluation.bgColor}; color: ${evaluation.textColor};">
        <h3 class="evaluation-title">${evaluation.title}</h3>
            <div class="evaluation-score">总分：${score}</div>
        </div>
        <div class="evaluation-content">
        <p class="evaluation-description">${evaluation.description}</p>
            <div class="band-analysis">
                <h4>乐队分析</h4>
                ${analysis}
            </div>
        </div>
    `;
}

// 生成乐队分析
function generateBandAnalysis() {
    const selectedMembers = gameData.selectedMembers;
    const { enhancedMembers, totalChemistryBonus, totalSkillBonus } = applyComboEffects(selectedMembers);
    let analysis = '';
    
    // 成员构成分析
    const bandCounts = {};
    selectedMembers.forEach(member => {
        bandCounts[member.band] = (bandCounts[member.band] || 0) + 1;
    });
    
    analysis += '<div class="analysis-section"><strong>成员构成：</strong><br>';
    for (const [band, count] of Object.entries(bandCounts)) {
        const percentage = Math.round((count / selectedMembers.length) * 100);
        analysis += `${band}: ${count}人 (${percentage}%)<br>`;
    }
    analysis += '</div>';
    
    // 角色配置分析
    const roles = {
        '主唱': selectedMembers.filter(m => m.role.includes('主唱') || m.abilities.includes('主唱')),
        '吉他手': selectedMembers.filter(m => m.role.includes('吉他')),
        '贝斯手': selectedMembers.filter(m => m.role.includes('贝斯')),
        '鼓手': selectedMembers.filter(m => m.role.includes('鼓手')),
        '键盘手': selectedMembers.filter(m => m.role.includes('键盘'))
    };
    
    analysis += '<div class="analysis-section"><strong>角色配置：</strong><br>';
    for (const [role, members] of Object.entries(roles)) {
        if (members.length > 0) {
            analysis += `${role}: ${members.map(m => m.name).join(', ')}<br>`;
        }
    }
    analysis += '</div>';
    
    // 技能水平分析（使用增强后的数值）
    const avgSkill = enhancedMembers.reduce((sum, m) => sum + m.skill, 0) / enhancedMembers.length;
    const originalAvgSkill = selectedMembers.reduce((sum, m) => sum + m.skill, 0) / selectedMembers.length;
    const skillLevel = avgSkill >= 8 ? '超高' : avgSkill >= 6 ? '较高' : avgSkill >= 4 ? '中等' : '较低';
    
    analysis += `<div class="analysis-section"><strong>技能水平：</strong><br>`;
    if (totalSkillBonus > 0) {
        analysis += `平均技能值：${avgSkill.toFixed(1)} (${skillLevel}) <span class="enhanced">+${totalSkillBonus}✨</span><br>`;
        analysis += `<small>原始平均：${originalAvgSkill.toFixed(1)}</small><br></div>`;
    } else {
        analysis += `平均技能值：${avgSkill.toFixed(1)} (${skillLevel})<br></div>`;
    }
    
    // 和谐度分析（使用增强后的数值）
    const avgChemistry = enhancedMembers.reduce((sum, m) => sum + m.chemistry, 0) / enhancedMembers.length;
    const originalAvgChemistry = selectedMembers.reduce((sum, m) => sum + m.chemistry, 0) / selectedMembers.length;
    const chemistryLevel = avgChemistry >= 6 ? '非常融洽' : avgChemistry >= 4 ? '较为和谐' : '需要磨合';
    
    analysis += `<div class="analysis-section"><strong>团队和谐：</strong><br>`;
    if (totalChemistryBonus > 0) {
        analysis += `平均和谐值：${avgChemistry.toFixed(1)} (${chemistryLevel}) <span class="enhanced">+${totalChemistryBonus}✨</span><br>`;
        analysis += `<small>原始平均：${originalAvgChemistry.toFixed(1)}</small><br></div>`;
    } else {
        analysis += `平均和谐值：${avgChemistry.toFixed(1)} (${chemistryLevel})<br></div>`;
    }
    
    return analysis;
}

// 检查乐队角色要求
function checkRequirements() {
    // 检查必要的乐队角色
    const requiredRoles = ['主唱', '吉他', '贝斯', '鼓手'];
    const availableRoles = new Set();
    
    // 检查每个成员的角色
    gameData.selectedMembers.forEach(member => {
        // 从角色描述中提取角色
        requiredRoles.forEach(role => {
            if (member.role.toLowerCase().includes(role.toLowerCase())) {
                availableRoles.add(role);
            }
        });
        
        // 从能力中提取角色
        if (member.abilities.includes('主唱')) {
            availableRoles.add('主唱');
        }
    });
    
    // 检查必要的乐队能力
    const requiredAbilities = ['作词', '作曲', '主唱'];
    const availableAbilities = new Set();
    
    gameData.selectedMembers.forEach(member => {
        member.abilities.forEach(ability => {
            availableAbilities.add(ability);
        });
        
        // 如果角色描述中包含主唱，也算作能力
        if (member.role.toLowerCase().includes('主唱')) {
            availableAbilities.add('主唱');
        }
    });
    
    const missingRoles = requiredRoles.filter(role => !availableRoles.has(role));
    const missingAbilities = requiredAbilities.filter(ability => !availableAbilities.has(ability));
    
    const requirementsContainer = document.getElementById('requirements-check');
    
    // 检查是否满足所有要求 - 不再要求5名成员
    if (missingRoles.length === 0 && missingAbilities.length === 0 && gameData.selectedMembers.length > 0) {
        requirementsContainer.innerHTML = '<p class="requirements-met">✅ 恭喜！你的乐队已满足所有基本要求</p>';
        document.getElementById('evaluate-button').disabled = false;
    } else {
        let html = '<div class="requirements-missing">';
        
        if (missingRoles.length > 0) {
            html += `<p>⚠️ 缺少必要角色：${missingRoles.join('、')}</p>`;
        }
        
        if (missingAbilities.length > 0) {
            html += `<p>⚠️ 缺少必要能力：${missingAbilities.join('、')}</p>`;
        }
        
        html += '</div>';
        requirementsContainer.innerHTML = html;
        
        // 仅当没有选择成员时禁用评估按钮
        document.getElementById('evaluate-button').disabled = gameData.selectedMembers.length === 0;
    }
}

// 更新评估按钮状态
function updateEvaluateButtonState() {
    const evaluateButton = document.getElementById('evaluate-button');
    const hasSelectedMembers = gameData.selectedMembers.length > 0;
    
    // 检查是否选择了成员
    evaluateButton.disabled = !hasSelectedMembers;
}

// 评估乐队 - 重构版本，提供详细评价
function evaluateBand() {
    const selectedMembers = gameData.selectedMembers;
    const resultContainer = document.getElementById('evaluationResult');
    
    // 如果没有选择任何成员，显示提示信息
    if (selectedMembers.length === 0) {
        resultContainer.innerHTML = `<div class="evaluation-message">请先选择乐队成员开始组建你的乐队！</div>`;
        return;
    }

    // 显示加载效果
    resultContainer.innerHTML = `<div class="evaluation-message loading">🎵 正在评估你的乐队组合... 🎵</div>`;
    
    // 延迟显示结果，增加评估的仪式感
    setTimeout(() => {
        // 应用特殊组合效果并重新计算分数确保一致性
        const { enhancedMembers } = applyComboEffects(selectedMembers);
        const skillScore = enhancedMembers.reduce((sum, member) => sum + member.skill, 0);
        let chemistryScore = 0;
        if (enhancedMembers.length > 0) {
            const avgChemistry = enhancedMembers.reduce((sum, member) => sum + member.chemistry, 0) / enhancedMembers.length;
            chemistryScore = Math.round(avgChemistry * enhancedMembers.length);
        }
        
        // 计算特殊组合
        let comboBonus = 0;
        const triggeredCombos = [];
        const triggeredComboIds = new Set();
        
        specialCombos.forEach(combo => {
            const result = combo.check(selectedMembers);
            if (result.triggered && !triggeredComboIds.has(combo.id)) {
                triggeredComboIds.add(combo.id);
                comboBonus += combo.bonus;
                triggeredCombos.push({
                    ...combo,
                    detail: result.detail,
                    evaluation: result.evaluation
                });
            }
        });
        
        const totalScore = skillScore + chemistryScore + comboBonus;
        
        // 生成详细评估
        let detailedEvaluation = generateDetailedEvaluation(selectedMembers, {
            skillScore,
            chemistryScore,
            comboBonus,
            totalScore,
            triggeredCombos
        });
        
        // 在扩展区域显示详细评估
        const expansionArea = document.getElementById('evaluation-expansion-area');
        const detailedContainer = document.createElement('div');
        detailedContainer.id = 'detailed-evaluation-container';
        detailedContainer.classList.add('detailed');
        detailedContainer.innerHTML = detailedEvaluation;
        
        // 清空扩展区域并添加详细评估
        expansionArea.innerHTML = '';
        expansionArea.appendChild(detailedContainer);
        
        // 在原位置显示简化信息
        resultContainer.innerHTML = `
            <div class="evaluation-summary">
                <div class="summary-header">
                    <h3>🎵 乐队评估完成</h3>
                    <div class="summary-score">总分：${totalScore}</div>
                </div>
                <div class="summary-note">详细评估结果已显示在右侧区域 →</div>
            </div>
        `;
        
        // 添加收起按钮到扩展区域
        const collapseButton = document.createElement('button');
        collapseButton.className = 'collapse-button';
        collapseButton.innerHTML = '✕';
        collapseButton.title = '收起详细评估';
        collapseButton.onclick = () => {
            expansionArea.innerHTML = '';
            resultContainer.innerHTML = '<div class="evaluation-message">点击评估按钮查看乐队评价</div>';
        };
        detailedContainer.appendChild(collapseButton);
        
        // 更新总分显示
        document.getElementById('total-score').textContent = totalScore;
        
        // 播放结算音乐
        audioSystem.playResultMusic(totalScore);
    }, 1000);
}

// 生成详细评估
function generateDetailedEvaluation(selectedMembers, scores) {
    const { skillScore, chemistryScore, comboBonus, totalScore, triggeredCombos } = scores;
    
    // 获取乐队评价等级
    let evaluation = bandEvaluations[bandEvaluations.length - 1];
    for (let i = 0; i < bandEvaluations.length; i++) {
        if (totalScore >= bandEvaluations[i].minScore) {
            evaluation = bandEvaluations[i];
            break;
        }
    }
    
    let html = `
        <div class="detailed-evaluation">
            <div class="evaluation-header" style="background: ${evaluation.bgColor}; color: ${evaluation.textColor};">
                <h2 class="evaluation-title">🎵 ${evaluation.title} 🎵</h2>
                <div class="evaluation-score">总分：${totalScore}</div>
            </div>
            
            <div class="evaluation-content">
                <p class="evaluation-description">${evaluation.description}</p>
                
                <div class="score-breakdown">
                    <h3>得分详情</h3>
                    <div class="score-item">技能总分：<span class="score-value">${skillScore}</span></div>
                    <div class="score-item">团队化学反应：<span class="score-value">${chemistryScore}</span></div>
                    <div class="score-item">特殊组合加成：<span class="score-value ${comboBonus >= 0 ? 'positive' : 'negative'}">${comboBonus >= 0 ? '+' : ''}${comboBonus}</span></div>
                    <div class="score-total">总计：<span class="total-value">${totalScore}</span></div>
                </div>
                
                <div class="member-showcase">
                    <h3>乐队成员</h3>
                    <div class="member-grid">
    `;
    
    selectedMembers.forEach(member => {
        html += `
            <div class="member-highlight">
                <img src="${member.image}" alt="${member.name}" class="member-thumb">
                <div class="member-details">
                    <strong>${member.name}</strong><br>
                    <span class="member-band">${member.band}</span><br>
                    <span class="member-role">${member.role}</span>
                </div>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
    `;
    
    // 特殊组合详情
    if (triggeredCombos.length > 0) {
        html += `
            <div class="special-combos-detail">
                <h3>触发的特殊组合</h3>
        `;
        
        triggeredCombos.forEach(combo => {
            const bonusClass = combo.bonus > 0 ? 'positive' : 'negative';
            const bonusText = combo.bonus > 0 ? `+${combo.bonus}` : `${combo.bonus}`;
            html += `
                <div class="combo-detail-item">
                    <div class="combo-header">
                        <span class="combo-name">${combo.name}</span>
                        <span class="combo-bonus ${bonusClass}">${bonusText}分</span>
                    </div>
                    <p class="combo-evaluation">${combo.evaluation}</p>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // 乐队建议
    html += generateBandSuggestions(selectedMembers, totalScore);
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// 生成乐队建议
function generateBandSuggestions(selectedMembers, totalScore) {
    let suggestions = '<div class="band-suggestions"><h3>专业建议</h3>';
    
    // 检查角色配置
    const roles = {
        '主唱': selectedMembers.filter(m => m.role.includes('主唱') || m.abilities.includes('主唱')),
        '吉他手': selectedMembers.filter(m => m.role.includes('吉他')),
        '贝斯手': selectedMembers.filter(m => m.role.includes('贝斯')),
        '鼓手': selectedMembers.filter(m => m.role.includes('鼓手')),
        '键盘手': selectedMembers.filter(m => m.role.includes('键盘'))
    };
    
    const missingRoles = [];
    for (const [role, members] of Object.entries(roles)) {
        if (members.length === 0) {
            missingRoles.push(role);
        }
    }
    
    if (missingRoles.length > 0) {
        suggestions += `<div class="suggestion-item warning">⚠️ 建议补充：${missingRoles.join('、')}，以完善乐队配置</div>`;
    } else {
        suggestions += `<div class="suggestion-item positive">✅ 乐队角色配置完整！</div>`;
    }
    
    // 检查预算使用
    const totalCost = selectedMembers.reduce((sum, member) => sum + member.cost, 0);
    const remainingBudget = 15 - totalCost;
    
    if (remainingBudget > 0) {
        suggestions += `<div class="suggestion-item info">💡 还有${remainingBudget}元预算可以使用，考虑添加更多成员</div>`;
    }
    
    // 技能建议（使用增强后的数值）
    const { enhancedMembers } = applyComboEffects(selectedMembers);
    const avgSkill = enhancedMembers.reduce((sum, m) => sum + m.skill, 0) / enhancedMembers.length;
    if (avgSkill < 6) {
        suggestions += `<div class="suggestion-item warning">📈 平均技能水平偏低，建议选择技能更高的成员</div>`;
    } else if (avgSkill >= 8) {
        suggestions += `<div class="suggestion-item positive">🌟 技能水平优秀！</div>`;
    }
    
    // 和谐度建议（使用增强后的数值）
    const avgChemistry = enhancedMembers.reduce((sum, m) => sum + m.chemistry, 0) / enhancedMembers.length;
    if (avgChemistry < 4) {
        suggestions += `<div class="suggestion-item warning">🤝 团队和谐度有待提升，建议选择默契更好的成员组合</div>`;
    } else if (avgChemistry >= 6) {
        suggestions += `<div class="suggestion-item positive">💕 团队氛围融洽！</div>`;
    }
    
    suggestions += '</div>';
    return suggestions;
}

// 借钱功能
function borrowMoney() {
    // 如果已经向波奇借过钱，直接找波奇
    const hasPoshi = gameData.borrowHistory.some(name => name === '后藤一里');
    if (hasPoshi) {
        borrowFromPoshi();
        return;
    }
    
    // 检查是否已经使用过借钱功能
    if (gameData.borrowUsed) {
        showBorrowMessage('你已经使用过借钱功能了！每局只能使用一次哦～', 'warning', false, null);
        return;
    }
    
    // 5% 概率遇到丰川祥子（稀有事件）
    const random = Math.random();
    if (random < 0.05) { // 5%概率遇到祥子
        // 创建丰川祥子对象
        const sakiko = {
            name: "丰川祥子",
            image: "../images/丰川祥子.png" // 使用千早爱音的图片
        };
        handleBorrowFromMember(sakiko);
        return;
    }
    
    // 随机选择一个普通角色（测试期间不会执行到这里）
    const randomMember = gameData.members[Math.floor(Math.random() * gameData.members.length)];
    
    // 处理不同角色的借钱逻辑
    handleBorrowFromMember(randomMember);
}

function handleBorrowFromMember(member) {
    const memberName = member.name;
    const memberImage = member.image;
    
    switch(memberName) {
        case '丰川祥子':
            // 丰川祥子的特殊效果：复活CRYCHiC
            triggerSakikoRevival(memberImage);
                    break;
                    
        case '山田凉':
            // 山田凉问你借5元走
            gameData.budget = Math.max(0, gameData.budget - 5);
            gameData.borrowUsed = true;
            showBorrowMessage(`你遇到了${memberName}！她说："你好，借我5元"你的钱包被掏空了5元...`, 'negative', false, memberImage);
            audioSystem.playBorrowSound('negative');
                    break;
                    
        case '要乐奈':
            // 要乐奈要2元买巴菲
            gameData.budget = Math.max(0, gameData.budget - 2);
            gameData.borrowUsed = true;
            showBorrowMessage(`你遇到了${memberName}！她说："能给我2元买巴菲吗？"你不好意思拒绝，给了她2元...`, 'warning', false, memberImage);
            audioSystem.playBorrowSound('warning');
                    break;
                    
        case '琴吹䌷':
            // 琴吹䌷将预算提升至150元
            gameData.budget = 150;
            gameData.borrowUsed = true;
            showBorrowMessage(`你遇到了大小姐${memberName}！她笑眯眯地说："啊啦，你缺钱吗，我这刚好有一点哦。"挥手给了你一大笔钱！预算提升至150元！`, 'positive', false, memberImage);
            // 特殊的豪华音效
            setTimeout(() => audioSystem.playChord([523, 659, 784, 1047], 0.8, 0.12), 100);
                    break;
                    
        case '后藤一里':
            // 后藤一里可以多次借钱
            gameData.budget += 1;
            gameData.borrowHistory.push(memberName);
            
            // 检查是否是第一次向波奇借钱
            const poshiCount = gameData.borrowHistory.filter(name => name === '后藤一里').length;
            if (poshiCount === 1) {
                gameData.borrowUsed = true; // 只有第一次点击计入使用次数
                showBorrowMessage(`你遇到了${memberName}！她害羞地说："那个...这是1元，请一定要记得还给我哦..."（点击"再借一次"可以继续向波奇借钱）`, 'positive', true, memberImage);
                audioSystem.playBorrowSound('positive');
            } else {
                showBorrowMessage(`${memberName}（恐慌焦虑且带着哭腔）："还要吗...好吧，这是1元...这是妈妈给我准备的嫁妆钱，请一定要还给我啊"（共向波奇借了${poshiCount}元）`, 'neutral', true, memberImage);
                audioSystem.playBorrowSound('neutral');
            }
                    break;
                    
        default:
            // 其他角色借1元
            gameData.budget += 1;
            gameData.borrowUsed = true;
            const messages = [
                `${memberName}很爽快地借给了你1元！`,
                `${memberName}笑着说："没问题，借你1元！"`,
                `${memberName}说："虽然不多，但这1元给你用吧！"`,
                `${memberName}："朋友之间借点钱很正常啦！"给了你1元。`
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            showBorrowMessage(randomMessage, 'positive', false, memberImage);
            audioSystem.playBorrowSound('positive');
                    break;
            }
    
    updateBudget();
    updateBorrowButtonState();
}

function showBorrowMessage(message, type = 'neutral', showBorrowAgain = false, memberImage = null) {
    const messageContainer = document.getElementById('borrow-message') || createBorrowMessageContainer();
    
    messageContainer.className = `borrow-message ${type}`;
    messageContainer.innerHTML = `
        <div class="borrow-content">
            <p>${message}</p>
            ${showBorrowAgain ? '<button class="borrow-again-btn" onclick="borrowFromPoshi()">再借一次</button>' : ''}
        </div>
    `;
    
    // 显示角色头像
    if (memberImage) {
        showMemberAvatar(memberImage, type);
    }
    
    // 3秒后自动隐藏消息（如果不是波奇的话）
    if (!showBorrowAgain) {
        setTimeout(() => {
            messageContainer.style.opacity = '0';
            setTimeout(() => messageContainer.remove(), 300);
        }, 3000);
    }
}

function showMemberAvatar(imageSrc, type) {
    // 移除已存在的头像
    const existingAvatar = document.getElementById('borrow-avatar');
    if (existingAvatar) {
        existingAvatar.remove();
    }
    
    // 创建头像元素
    const avatarContainer = document.createElement('div');
    avatarContainer.id = 'borrow-avatar';
    avatarContainer.className = `borrow-avatar ${type}`;
    
    const avatarImg = document.createElement('img');
    avatarImg.src = imageSrc;
    avatarImg.alt = '角色头像';
    
    const avatarFrame = document.createElement('div');
    avatarFrame.className = 'avatar-frame';
    avatarFrame.appendChild(avatarImg);
    
    avatarContainer.appendChild(avatarFrame);
    
    // 插入到预算显示区域旁边
    const budgetDisplay = document.querySelector('.budget-display');
    budgetDisplay.appendChild(avatarContainer);
    
    // 添加进入动画
    setTimeout(() => {
        avatarContainer.classList.add('show');
    }, 100);
    
    // 4秒后自动消失
    setTimeout(() => {
        avatarContainer.classList.add('hide');
        setTimeout(() => {
            if (avatarContainer.parentNode) {
                avatarContainer.remove();
            }
        }, 500);
    }, 4000);
}

function createBorrowMessageContainer() {
    const container = document.createElement('div');
    container.id = 'borrow-message';
    container.className = 'borrow-message';
    
    // 插入到预算显示区域下方
    const budgetDisplay = document.querySelector('.budget-display');
    budgetDisplay.parentNode.insertBefore(container, budgetDisplay.nextSibling);
    
    return container;
}

// 丰川祥子复活CRYCHiC的特殊功能
function triggerSakikoRevival(memberImage) {
    // 清空已选成员
    gameData.selectedMembers = [];
    
    // 扣除全部预算
    gameData.budget = 0;
    gameData.borrowUsed = true;
    
    // 获取CRYCHiC成员数据（来自MyGO!!乐队的成员）
    const tomoriMember = gameData.members.find(m => m.name === '高松灯' && m.band === 'MyGO!!');
    const soyoMember = gameData.members.find(m => m.name === '长崎素世' && m.band === 'MyGO!!');
    const takiMember = gameData.members.find(m => m.name === '椎名立希' && m.band === 'MyGO!!');
    
    // 若叶睦需要从assist角色中获取，或者创建新的
    let mutsumiMember = gameData.members.find(m => m.name === '若叶睦');
    if (!mutsumiMember) {
        // 如果若叶睦不存在，创建她的数据
        mutsumiMember = {
            id: 'assist-1',
            name: "若叶睦",
            role: "支援者",
            band: "CRYCHiC",
            cost: 0,
            skill: 10,
            chemistry: 1,
            image: "../images/若叶睦.png", 
            abilities: ["支援"],
            isAssistCharacter: true
        };
    }
    
    // 创建丰川祥子角色数据
    const sakiko = {
        id: 'sakiko-revival',
        name: "丰川祥子",
        role: "键盘手",
        band: "CRYCHiC",
        cost: 0,
        skill: 10,
        chemistry: 0,
        image: memberImage,
        abilities: ["指挥者"],
        isSpecialRevival: true
    };
    
    // 创建CRYCHiC版本的成员（改变乐队归属并免费）
    const freeTomori = {
        ...tomoriMember, 
        cost: 0, 
        band: "CRYCHiC", 
        isAutoSelected: true,
        id: 'crychic-tomori'
    };
    const freeSoyo = {
        ...soyoMember, 
        cost: 0, 
        band: "CRYCHiC", 
        isAutoSelected: true,
        id: 'crychic-soyo'
    };
    const freeTaki = {
        ...takiMember, 
        cost: 0, 
        band: "CRYCHiC", 
        isAutoSelected: true,
        id: 'crychic-taki'
    };
    const freeMutsumi = {
        ...mutsumiMember, 
        cost: 0, 
        band: "CRYCHiC", 
        isAutoSelected: true,
        id: 'crychic-mutsumi'
    };
    
    // 添加所有CRYCHiC成员
    gameData.selectedMembers = [sakiko, freeTomori, freeSoyo, freeTaki, freeMutsumi];
    
    // 显示特殊消息
    showBorrowMessage(
        `🌙 你遇到了神秘的丰川祥子！她用冷酷的声音说道："把你的一切都献给我吧，CRYCHiC复活！"` +
        `\n\n✨ 所有预算被消耗，但CRYCHiC的完整阵容（高松灯、长崎素世、椎名立希、若叶睦）自动加入你的乐队！`, 
        'success', 
        false, 
        memberImage
    );
    
    // 播放春日影音乐
    setTimeout(() => {
        // 停止之前可能播放的音乐
        const existingAudio = document.getElementById('sakiko-revival-music');
        if (existingAudio) {
            existingAudio.pause();
            existingAudio.remove();
        }
        
        // 创建新的audio元素播放春日影
        const audio = document.createElement('audio');
        audio.id = 'sakiko-revival-music';
        audio.src = '../music/CRYCHIC - 春日影.mp3';
        audio.volume = 0.6; // 设置音量为60%
        audio.loop = false; // 不循环播放
        document.body.appendChild(audio);
        
        // 尝试播放音乐
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('🎵 春日影开始播放！');
            }).catch(error => {
                console.log('音乐播放失败（可能需要用户交互）:', error);
                // 如果音乐播放失败，播放原来的和弦音效
                audioSystem.playChord([196, 246, 294, 349, 415], 1.0, 0.15);
                setTimeout(() => audioSystem.playChord([220, 277, 330, 415, 523], 1.0, 0.15), 300);
                setTimeout(() => audioSystem.playChord([246, 311, 370, 466, 587], 1.0, 0.15), 600);
            });
        }
        
        // 音乐播放完毕后清理
        audio.addEventListener('ended', () => {
            audio.remove();
        });
        
        // 如果音乐播放失败，也播放和弦作为备选
        setTimeout(() => {
            if (audio.paused) {
                audioSystem.playChord([196, 246, 294, 349, 415], 1.0, 0.15);
                setTimeout(() => audioSystem.playChord([220, 277, 330, 415, 523], 1.0, 0.15), 300);
                setTimeout(() => audioSystem.playChord([246, 311, 370, 466, 587], 1.0, 0.15), 600);
            }
        }, 1000);
    }, 500);
    
    // 更新UI
    updateSelectedMembers();
    updateBudget();
    updateScore();
    updateEvaluateButtonState();
    updateBorrowButtonState();
    
    // 标记原始MyGO!!成员卡片为已选（这样用户就知道这些成员已被使用）
    const originalMembers = [tomoriMember, soyoMember, takiMember];
    originalMembers.forEach(member => {
        if (member) {
            const memberCard = document.querySelector(`.member-card[data-id="${member.id}"]`);
            if (memberCard) {
                memberCard.classList.add('selected');
            }
        }
    });
}

function borrowFromPoshi() {
    // 专门处理向波奇再次借钱
    const poshi = gameData.members.find(m => m.name === '后藤一里');
    handleBorrowFromMember(poshi);
}

function updateBorrowButtonState() {
    const borrowButton = document.getElementById('borrow-button');
    const hasPoshi = gameData.borrowHistory.some(name => name === '后藤一里');
    
    if (gameData.borrowUsed && !hasPoshi) {
        borrowButton.disabled = true;
        borrowButton.textContent = '💰 已借钱';
        borrowButton.title = '你已经使用过借钱功能了';
    } else if (hasPoshi) {
        borrowButton.disabled = false;
        borrowButton.textContent = '💰 找波奇';
        borrowButton.title = '继续向波奇借钱...';
        borrowButton.style.background = 'linear-gradient(135deg, #FFB6C1, #FF69B4)';
    } else {
        borrowButton.disabled = false;
        borrowButton.textContent = '💰 借钱';
        borrowButton.title = '试试找人借钱？';
        borrowButton.style.background = '';
    }
}

// 重置游戏
function resetGame() {
    gameData.selectedMembers = [];
    gameData.budget = 15;
    gameData.borrowUsed = false;
    gameData.borrowHistory = [];
    
    updateSelectedMembers();
    updateBudget();
    updateScore();
    updateEvaluateButtonState();
    updateBorrowButtonState();
    
    // 重置所有成员卡片的选中状态
    document.querySelectorAll('.member-card').forEach(card => {
        card.classList.remove('selected');
        card.classList.remove('disabled');
    });
    
    // 重置评估结果
    const evaluationResult = document.getElementById('evaluationResult');
    evaluationResult.classList.remove('detailed');
    evaluationResult.innerHTML = '<div class="evaluation-message">点击评估按钮查看乐队评价</div>';
    
    // 移除借钱消息和头像
    const borrowMessage = document.getElementById('borrow-message');
    if (borrowMessage) {
        borrowMessage.remove();
    }
    
    const borrowAvatar = document.getElementById('borrow-avatar');
    if (borrowAvatar) {
        borrowAvatar.remove();
    }
    
    // 停止祥子复活音乐
    const sakikoMusic = document.getElementById('sakiko-revival-music');
    if (sakikoMusic) {
        sakikoMusic.pause();
        sakikoMusic.remove();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame); 