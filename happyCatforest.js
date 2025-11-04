/**
 * 묘냥의 숲 RPG 게임 스크립트 v3.5.0 - 기능 통합
 * * 제작: momo
 * * 수정: Gemini, 묘냥
 * * 주요 변경사항 (v3.5.0):
 * - [기능] 2차 전직 시스템 추가: 50레벨 달성 및 특정 퀘스트 완료 후 전직 가능.
 * - [기능] 펫 진화 시스템 추가: 특정 레벨의 펫을 진화시켜 능력치 강화.
 * - [기능] 세트 아이템 시스템 추가: 특정 아이템들을 함께 장착하면 추가 능력치 보너스.
 * - [콘텐츠] 2차 직업, 진화 펫, 전직 퀘스트, 세트 아이템 등 데이터 추가.
 * - [명령어] /전직, /펫진화 명령어 추가.
 * - [개선] /장비 명령어에 활성화된 세트 효과 표시.
 * - [개선] /명령어, /도움말에 신규 기능 안내 추가.
 * * 이 스크립트는 바닐라 자바스크립트(ES5)로 작성되었으며,
 * 메신저봇 R 환경에서 바로 동작하도록 설계되었습니다.
 */

// -------------------------------------------
// 1. 게임 환경 설정 (Config)
// -------------------------------------------
var Config = {
    DATA_FOLDER_PATH: "sdcard/Rbot/RPG_Data_v2.7.1",
    MARKET_DATA_FILE: "market.json",
    LOTTO_DATA_FILE: "lotto.json",
    BATTLE_ITEM_DROP_RATE: 0.3,
    RAID_ITEM_DROP_RATE_MULTIPLIER: 2,
    REPAIR_COST_MULTIPLIER: 0.1,
    REST_DURATION: 300000,
    FISHING_DELAY_MIN: 10000,
    FISHING_DELAY_MAX: 30000,
    WAR_MODE_EXP_BONUS: 0.03,
    LOTTO_TICKET_PRICE: 100,
    INITIAL_LOTTO_POT: 10000,
    LOTTO_DRAW_INTERVAL: 3600000,
    RANKING_CACHE_DURATION: 600000,
    RANKING_DISPLAY_COUNT: 10,
    PET_EXP_RATE: 0.5 // 플레이어가 얻는 경험치의 50%를 펫이 획득
};

// -------------------------------------------
// 2. 게임 기본 데이터 (GameData)
// -------------------------------------------
var GameData = {
    monsters: {
        '슬라임': { name: '슬라임', hp: 30, att: 8, def: 2, exp: 10, gold: 5, items: ['젤리', '펫 알'] },
        '고블린': { name: '고블린', hp: 70, att: 18, def: 6, exp: 25, gold: 20, items: ['가죽 조각', '단검'] },
        '늑대': { name: '늑대', hp: 90, att: 22, def: 8, exp: 35, gold: 25, items: ['늑대 가죽', '펫 알'] },
        '골렘': { name: '골렘', hp: 600, att: 70, def: 60, exp: 300, gold: 250, items: ['마력의 돌', '골렘의 핵'] },
        '심연의 감시자': { name: '심연의 감시자', hp: 3000, att: 200, def: 100, exp: 1000, gold: 1000, items: ['심연의 파편', '찬란한 보물상자'] },
        '혼돈의 그림자': { name: '혼돈의 그림자', hp: 5000, att: 250, def: 120, exp: 2000, gold: 2000, items: ['혼돈의 정수', '찬란한 보물상자'] },
        '어비스 드래곤': { name: '어비스 드래곤', hp: 10000, att: 300, def: 150, exp: 5000, gold: 5000, items: ['드래곤의 심장', '어비스의 숨결', '찬란한 보물상자'] }
    },
    items: {
        '포션': { name: '포션', type: 'consumable', price: 30, description: 'HP 50 회복', effect: function(p) { p.hp = Math.min(p.getMaxHp(), p.hp + 50); return 'HP를 50 회복했습니다.'; } },
        '마나 포션': { name: '마나 포션', type: 'consumable', price: 40, description: 'MP 30 회복', effect: function(p) { p.mp = Math.min(p.getMaxMp(), p.mp + 30); return 'MP를 30 회복했습니다.'; } },
        '엘릭서': { name: '엘릭서', type: 'consumable', price: 200, description: 'HP/MP 모두 회복', effect: function(p) { p.hp = p.getMaxHp(); p.mp = p.getMaxMp(); return 'HP와 MP를 모두 회복했습니다.'; } },
        '힘의 영약': { name: '힘의 영약', type: 'consumable', price: 5000, description: '10분간 공격력 20% 증가', effect: function(p) { p.buffs.att = { multiplier: 1.2, expires: Date.now() + 600000 }; return '10분간 힘이 넘칩니다! 공격력이 20% 증가합니다.'; } },
        '수호의 영약': { name: '수호의 영약', type: 'consumable', price: 5000, description: '10분간 방어력 20% 증가', effect: function(p) { p.buffs.def = { multiplier: 1.2, expires: Date.now() + 600000 }; return '10분간 수호의 기운이 감돕니다! 방어력이 20% 증가합니다.'; } },
        '성장의 영약': { name: '성장의 영약', type: 'consumable', price: 50000, description: '최대 경험치의 50% 획득', effect: function(p) { var expGain = Math.floor(p.maxExp * 0.5); return p.addExp(expGain); } },
        '어비스의 열쇠': { name: '어비스의 열쇠', type: 'special', price: 10000, description: '어비스 던전에 입장하는 열쇠' },
        '낡은 보물상자': { name: '낡은 보물상자', type: 'box', price: 500, description: '오래된 보물상자. 무엇이 나올지 모른다.' },
        '화려한 보물상자': { name: '화려한 보물상자', type: 'box', price: 3000, description: '화려하게 장식된 보물상자. 좋은 것이 나올 것 같다.' },
        '찬란한 보물상자': { name: '찬란한 보물상자', type: 'box', price: 15000, description: '눈부시게 빛나는 보물상자. 최고의 보물이 담겨있을지도 모른다.' },
        '펫 알': { name: '펫 알', type: 'special', price: 10000, description: '신비한 기운이 느껴지는 알. 부화시킬 수 있다.' },
        '펫 먹이': { name: '펫 먹이', type: 'consumable', price: 100, description: '펫에게 주면 친밀도가 오르는 영양 만점 간식.' },
        // [추가] 펫 진화 아이템
        '진화의 돌': { name: '진화의 돌', type: 'special', price: 50000, description: '펫에게 사용하면 잠재된 힘을 이끌어내 진화시키는 신비한 돌.' },
        // [추가] 전직 관련 아이템
        '영웅의 증표': { name: '영웅의 증표', type: 'special', price: 0, description: '영웅의 자격을 증명하는 빛나는 증표. 전직에 사용된다.' },
        '단검': { name: '단검', type: 'weapon', att: 5, price: 50, maxDura: 100 },
        '조잡한 철검': { name: '조잡한 철검', type: 'weapon', att: 10, price: 120, maxDura: 100 },
        '강철 몽둥이': { name: '강철 몽둥이', type: 'weapon', att: 25, price: 400, maxDura: 120 },
        '어둠의 검': { name: '어둠의 검', type: 'weapon', att: 50, price: 1500, maxDura: 150 },
        '화염의 검': { name: '화염의 검', type: 'weapon', att: 80, price: 5000, maxDura: 180 },
        '어비스의 숨결': { name: '어비스의 숨결', type: 'weapon', att: 150, price: 20000, maxDura: 250 },
        '가죽 갑옷': { name: '가죽 갑옷', type: 'armor', def: 5, price: 70, maxDura: 100 },
        '낡은 방패': { name: '낡은 방패', type: 'shield', def: 8, price: 100, maxDura: 100 },
        '마법사의 로브': { name: '마법사의 로브', type: 'armor', def: 15, price: 800, maxDura: 120 },
        '저주받은 갑옷 조각': { name: '저주받은 갑옷 조각', type: 'armor', def: 40, price: 2000, maxDura: 180 },
        '드래곤의 심장': { name: '드래곤의 심장', type: 'shield', def: 80, price: 25000, maxDura: 250 },
        '젤리': { name: '젤리', type: 'material', price: 2 }, '쥐꼬리': { name: '쥐꼬리', type: 'material', price: 3 }, '멧돼지 어금니': { name: '멧돼지 어금니', type: 'material', price: 8 },
        '가죽 조각': { name: '가죽 조각', type: 'material', price: 10 }, '늑대 가죽': { name: '늑대 가죽', type: 'material', price: 15 }, '오크의 송곳니': { name: '오크의 송곳니', type: 'material', price: 25 },
        '생명의 나뭇가지': { name: '생명의 나뭇가지', type: 'material', price: 50 }, '골렘의 핵': { name: '골렘의 핵', type: 'material', price: 200 }, '용의 비늘': { name: '용의 비늘', type: 'material', price: 120 },
        '타오르는 심장': { name: '타오르는 심장', type: 'material', price: 400 }, '심연의 파편': { name: '심연의 파편', type: 'material', price: 800 }, '혼돈의 정수': { name: '혼돈의 정수', type: 'material', price: 1500 },
        '구리 조각': { name: '구리 조각', type: 'material', price: 30 }, '보석': { name: '보석', type: 'material', price: 250 }, '마력의 돌': { name: '마력의 돌', type: 'material', price: 180 },
        '불의 정수': { name: '불의 정수', type: 'material', price: 300 },
        '지옥의 가죽': { name: '지옥의 가죽', type: 'material', price: 350 },
        '강철검': { name: '강철검', type: 'weapon', att: 18, price: 300, maxDura: 120 },
        '기사의 검': { name: '기사의 검', type: 'weapon', att: 35, price: 900, maxDura: 150 },
        '룬 블레이드': { name: '룬 블레이드', type: 'weapon', att: 100, price: 8000, maxDura: 200 },
        '강철 갑옷': { name: '강철 갑옷', type: 'armor', def: 25, price: 500, maxDura: 150 },
        '멸치구이': { name: '멸치구이', type: 'consumable', description: 'HP 15 회복', effect: function(p) { p.hp = Math.min(p.getMaxHp(), p.hp + 15); return 'HP를 15 회복했습니다.'; } },
        '잉어찜': { name: '잉어찜', type: 'consumable', description: 'HP 40 회복', effect: function(p) { p.hp = Math.min(p.getMaxHp(), p.hp + 40); return 'HP를 40 회복했습니다.'; } },
        '광어회': { name: '광어회', type: 'consumable', description: 'HP 120 회복', effect: function(p) { p.hp = Math.min(p.getMaxHp(), p.hp + 120); return 'HP를 120 회복했습니다.'; } },
        '장어구이': { name: '장어구이', type: 'consumable', description: 'HP 200, MP 50 회복', effect: function(p) { p.hp = Math.min(p.getMaxHp(), p.hp + 200); p.mp = Math.min(p.getMaxMp(), p.mp + 50); return 'HP를 200, MP를 50 회복했습니다.'; } },
        '고래찜': { name: '고래찜', type: 'consumable', description: 'HP/MP 모두 회복', effect: function(p) { p.hp = p.getMaxHp(); p.mp = p.getMaxMp(); return 'HP와 MP를 모두 회복했습니다.'; } }
    },
    pets: {
        '아기용': {
            name: '아기용',
            description: '작지만 강력한 힘을 숨긴 용. 주인에게 힘을 보태줍니다.',
            buff: { type: 'att', baseValue: 5, growth: 2 } // 레벨당 공격력 2 증가
        },
        '새끼늑대': {
            name: '새끼늑대',
            description: '민첩하고 날카로운 감각을 지닌 늑대. 주인의 방어력을 높여줍니다.',
            buff: { type: 'def', baseValue: 3, growth: 1 } // 레벨당 방어력 1 증가
        },
        '숲의정령': {
            name: '숲의정령',
            description: '생명의 기운으로 가득한 정령. 주인의 최대 HP를 늘려줍니다.',
            buff: { type: 'maxHp', baseValue: 20, growth: 10 } // 레벨당 최대 HP 10 증가
        },
        // [추가] 진화한 펫 정보
        '화염용': {
            name: '화염용',
            description: '뜨거운 화염의 기운을 내뿜는 용. 적을 불태우는 강력한 힘을 가졌습니다.',
            buff: { type: 'att', baseValue: 15, growth: 5 } // 능력치 성장폭 증가
        },
        '서리늑대': {
            name: '서리늑대',
            description: '냉혹한 서리의 힘을 다루는 늑대. 적의 공격을 얼어붙게 만듭니다.',
            buff: { type: 'def', baseValue: 10, growth: 3 }
        },
        '세계수의 정령': {
            name: '세계수의 정령',
            description: '세계수의 기운을 받은 위대한 정령. 파티 전체에 생명의 축복을 내립니다.',
            buff: { type: 'maxHp', baseValue: 50, growth: 25 }
        }
    },
    // [추가] 펫 진화 정보 객체
    petEvolutions: {
        '아기용': {
            evolvesTo: '화염용',
            requiredLevel: 20,
            requiredItem: '진화의 돌'
        },
        '새끼늑대': {
            evolvesTo: '서리늑대',
            requiredLevel: 20,
            requiredItem: '진화의 돌'
        },
        '숲의정령': {
            evolvesTo: '세계수의 정령',
            requiredLevel: 20,
            requiredItem: '진화의 돌'
        }
    },
    fish: {
        '돌': { name: '돌', basePrice: 0.1, rarity: 'junk' }, '장화': { name: '장화', basePrice: 0.1, rarity: 'junk' }, '먼지': { name: '먼지', basePrice: 0.1, rarity: 'junk' },
        '해파리': { name: '해파리', basePrice: 1, rarity: 'common' }, '말미잘': { name: '말미잘', basePrice: 1, rarity: 'common' }, '멸치': { name: '멸치', basePrice: 2, rarity: 'common' },
        '새우': { name: '새우', basePrice: 3, rarity: 'common' }, '오징어': { name: '오징어', basePrice: 5, rarity: 'common' }, '잉어': { name: '잉어', basePrice: 6, rarity: 'common' },
        '가오리': { name: '가오리', basePrice: 8, rarity: 'uncommon' }, '갈치': { name: '갈치', basePrice: 10, rarity: 'uncommon' }, '농어': { name: '농어', basePrice: 12, rarity: 'uncommon' },
        '대구': { name: '대구', basePrice: 13, rarity: 'uncommon' }, '우럭': { name: '우럭', basePrice: 15, rarity: 'uncommon' }, '광어': { name: '광어', basePrice: 18, rarity: 'uncommon' },
        '가다랑어': { name: '가다랑어', basePrice: 20, rarity: 'rare' }, '도미': { name: '도미', basePrice: 25, rarity: 'rare' }, '방어': { name: '방어', basePrice: 28, rarity: 'rare' },
        '복어': { name: '복어', basePrice: 30, rarity: 'rare' }, '연어': { name: '연어', basePrice: 35, rarity: 'rare' }, '장어': { name: '장어', basePrice: 40, rarity: 'rare' },
        '문어': { name: '문어', basePrice: 50, rarity: 'epic' }, '아귀': { name: '아귀', basePrice: 60, rarity: 'epic' }, '개복치': { name: '개복치', basePrice: 80, rarity: 'epic' },
        '상어': { name: '상어', basePrice: 100, rarity: 'epic' }, '킹크랩': { name: '킹크랩', basePrice: 150, rarity: 'legendary' }, '돌고래': { name: '돌고래', basePrice: 200, rarity: 'legendary' },
        '바다표범': { name: '바다표범', basePrice: 250, rarity: 'legendary' }, '고래': { name: '고래', basePrice: 500, rarity: 'legendary' }
    },
    quests: {
        '늑대 사냥꾼': { name: '늑대 사냥꾼', description: '숲의 늑대 10마리를 처치하세요.', target: '늑대', count: 10, reward: { exp: 500, gold: 300, items: ['강철 몽둥이'] } },
        '골렘 파괴': { name: '골렘 파괴', description: '산악 지대의 골렘을 파괴하고 핵을 가져오세요.', target: '골렘', count: 1, reward: { exp: 2000, gold: 1500, items: ['어둠의 검'] } },
        // [추가] 전직 퀘스트
        '영웅의 길': { name: '영웅의 길', description: '자신의 한계를 증명하기 위해 어비스 드래곤을 1번 처치하세요.', target: '어비스 드래곤', count: 1, reward: { exp: 10000, gold: 5000, items: ['영웅의 증표'] } }
    },
    classes: {
        // --- 1차 직업 ---
        '전사': {
            hp: 120, mp: 30, att: 12, def: 8, jobTier: 1,
            nextJob: { '버서커': '공격 특화', '팔라딘': '방어 특화' }, // 전직 정보 추가
            skills: {
                '강타': { name: '강타', mpCost: 15, damageMultiplier: 2.0, description: 'MP를 소모하여 적에게 강력한 일격을 날립니다.' }
            }
        },
        '마법사': {
            hp: 80, mp: 80, att: 8, def: 5, jobTier: 1,
            nextJob: { '아크메이지': '광역 마법', '서모너': '소환 특화' },
            skills: {
                '파이어볼': { name: '파이어볼', mpCost: 20, baseDamage: 50, description: '거대한 화염구를 날려 적을 공격합니다.' }
            }
        },
        '도적': {
            hp: 90, mp: 50, att: 15, def: 6, jobTier: 1,
            nextJob: { '어쌔신': '치명타 특화', '로그': '파밍 특화' },
            skills: {
                '독바르기': { name: '독바르기', mpCost: 25, duration: 300000, extraDamage: 10, description: '5분간 무기에 맹독을 발라 공격 시 추가 데미지를 줍니다.' }
            }
        },
        '힐러': {
            hp: 90, mp: 100, att: 6, def: 6, jobTier: 1,
            nextJob: { '프리스트': '회복/부활', '몽크': '전투/회복' },
            skills: {
                '치유': { name: '치유', mpCost: 25, healAmount: 80, description: '아군의 HP를 회복시킵니다.' }
            }
        },
        // --- 2차 직업 (예시) ---
        '버서커': {
            hp: 150, mp: 40, att: 18, def: 10, jobTier: 2,
            skills: {
                '강타': { name: '강타', mpCost: 15, damageMultiplier: 2.0, description: 'MP를 소모하여 적에게 강력한 일격을 날립니다.' },
                '분노폭발': { name: '분노폭발', mpCost: 30, selfBuff: true, description: '5분간 자신의 공격력을 30% 증가시키고 방어력을 10% 감소시킵니다.' }
            }
        },
        '팔라딘': {
            hp: 200, mp: 50, att: 14, def: 15, jobTier: 2,
            skills: {
                '강타': { name: '강타', mpCost: 15, damageMultiplier: 2.0, description: 'MP를 소모하여 적에게 강력한 일격을 날립니다.' },
                '신성한 방패': { name: '신성한 방패', mpCost: 40, partyBuff: true, description: '5분간 모든 파티원의 방어력을 20% 증가시킵니다.' }
            }
        },
        '아크메이지': {
            hp: 100, mp: 150, att: 10, def: 8, jobTier: 2,
            skills: {
                '파이어볼': { name: '파이어볼', mpCost: 20, baseDamage: 50, description: '거대한 화염구를 날려 적을 공격합니다.' },
                '메테오': { name: '메테오', mpCost: 80, baseDamage: 200, description: '하늘에서 거대한 운석을 떨어트려 강력한 피해를 줍니다.' }
            }
        },
        '서모너': {
            hp: 110, mp: 120, att: 12, def: 10, jobTier: 2,
            skills: {
                '파이어볼': { name: '파이어볼', mpCost: 20, baseDamage: 50, description: '거대한 화염구를 날려 적을 공격합니다.' },
                '골렘소환': { name: '골렘소환', mpCost: 100, description: '전투를 돕는 작은 골렘을 소환합니다.' }
            }
        },
        '어쌔신': {
            hp: 120, mp: 70, att: 20, def: 8, jobTier: 2,
            skills: {
                '독바르기': { name: '독바르기', mpCost: 25, duration: 300000, extraDamage: 10, description: '5분간 무기에 맹독을 발라 공격 시 추가 데미지를 줍니다.' },
                '암살': { name: '암살', mpCost: 50, damageMultiplier: 3.0, description: '적의 약점을 노려 치명적인 일격을 가합니다.' }
            }
        },
        '로그': {
            hp: 130, mp: 80, att: 18, def: 12, jobTier: 2,
            skills: {
                '독바르기': { name: '독바르기', mpCost: 25, duration: 300000, extraDamage: 10, description: '5분간 무기에 맹독을 발라 공격 시 추가 데미지를 줍니다.' },
                '훔치기': { name: '훔치기', mpCost: 30, description: '전투 중인 몬스터에게서 골드를 훔칩니다.' }
            }
        },
        '프리스트': {
            hp: 120, mp: 180, att: 8, def: 10, jobTier: 2,
            skills: {
                '치유': { name: '치유', mpCost: 25, healAmount: 80, description: '아군의 HP를 회복시킵니다.' },
                '부활': { name: '부활', mpCost: 150, description: '전투 불능 상태의 파티원을 부활시킵니다.' }
            }
        },
        '몽크': {
            hp: 140, mp: 100, att: 15, def: 13, jobTier: 2,
            skills: {
                '치유': { name: '치유', mpCost: 25, healAmount: 80, description: '아군의 HP를 회복시킵니다.' },
                '아수라파천무': { name: '아수라파천무', mpCost: 60, damageMultiplier: 2.5, description: '빠른 연타로 적에게 큰 데미지를 줍니다.' }
            }
        }
    },
    // [추가] 세트 아이템 정보
    itemSets: {
        '어비스 드래곤 세트': {
            items: ['어비스의 숨결', '드래곤의 심장'], // 세트에 포함되는 아이템 이름들
            bonuses: {
                '2': { description: '공격력 +10%, 방어력 +10%', attMultiplier: 1.1, defMultiplier: 1.1 }
            }
        },
        '기사의 맹세 세트': {
            items: ['기사의 검', '강철 갑옷', '낡은 방패'],
            bonuses: {
                '2': { description: '최대 HP +50', maxHpBonus: 50 },
                '3': { description: '공격력 +5%, 방어력 +5%', attMultiplier: 1.05, defMultiplier: 1.05 }
            }
        }
    },
    raidDungeon: {
        name: "어비스 던전", entryItem: "어비스의 열쇠", minLevel: 20, bosses: ['심연의 감시자', '혼돈의 그림자', '어비스 드래곤']
    },
    combinationRecipes: {
        '포션': { cost: 50, materials: [{ name: '젤리', count: 10 }], result: { name: '포션', count: 1 } },
        '펫 먹이': { cost: 100, materials: [{ name: '젤리', count: 5 }, { name: '가죽 조각', count: 5 }], result: { name: '펫 먹이', count: 3 } },
        '강철검': { cost: 100, materials: [{ name: '조잡한 철검', count: 1 }, { name: '구리 조각', count: 5 }], result: { name: '강철검', count: 1 } },
        '강철 갑옷': { cost: 200, materials: [{ name: '가죽 갑옷', count: 1 }, { name: '구리 조각', count: 10 }], result: { name: '강철 갑옷', count: 1 } },
        '기사의 검': { cost: 500, materials: [{ name: '강철검', count: 1 }, { name: '보석', count: 1 }], result: { name: '기사의 검', count: 1 } },
        '룬 블레이드': { cost: 3000, materials: [{ name: '어둠의 검', count: 1 }, { name: '마력의 돌', count: 5 }, { name: '심연의 파편', count: 1 }], result: { name: '룬 블레이드', count: 1 } },
        '힘의 영약': { cost: 1000, materials: [{ name: '트롤의 피', count: 2 }, { name: '오우거의 가죽', count: 1 }, { name: '불의 정수', count: 1 }], result: { name: '힘의 영약', count: 1 } },
        '수호의 영약': { cost: 1000, materials: [{ name: '골렘의 핵', count: 1 }, { name: '용의 비늘', count: 2 }, { name: '지옥의 가죽', count: 1 }], result: { name: '수호의 영약', count: 1 } },
        '성장의 영약': { cost: 10000, materials: [{ name: '혼돈의 정수', count: 1 }, { name: '드래곤의 심장', count: 1 }, { name: '찬란한 보물상자', count: 1 }], result: { name: '성장의 영약', count: 1 } }
    },
    cookingRecipes: {
        '멸치구이': { cost: 10, fish: { name: '멸치', count: 1 }, result: { name: '멸치구이', count: 1 } },
        '잉어찜': { cost: 30, fish: { name: '잉어', count: 1 }, result: { name: '잉어찜', count: 1 } },
        '광어회': { cost: 100, fish: { name: '광어', count: 1 }, result: { name: '광어회', count: 1 } },
        '장어구이': { cost: 200, fish: { name: '장어', count: 1 }, result: { name: '장어구이', count: 1 } },
        '고래찜': { cost: 1000, fish: { name: '고래', count: 1 }, result: { name: '고래찜', count: 1 } }
    },
    treasureBoxes: {
        '낡은 보물상자': [
            { item: '포션', count: 5, weight: 30 }, { item: '마나 포션', count: 5, weight: 30 },
            { item: '조잡한 철검', count: 1, weight: 15 }, { item: '가죽 갑옷', count: 1, weight: 15 },
            { item: '강철 몽둥이', count: 1, weight: 5 }, { item: '보석', count: 1, weight: 4 },
            { item: '펫 알', count: 1, weight: 2 },
            { item: '화려한 보물상자', count: 1, weight: 1 }
        ],
        '화려한 보물상자': [
            { item: '엘릭서', count: 3, weight: 30 }, { item: '강철 몽둥이', count: 1, weight: 20 },
            { item: '어둠의 검', count: 1, weight: 10 }, { item: '마법사의 로브', count: 1, weight: 10 },
            { item: '기사의 검', count: 1, weight: 5 }, { item: '화염의 검', count: 1, weight: 2 },
            { item: '펫 알', count: 1, weight: 5 },
            { item: '찬란한 보물상자', count: 1, weight: 1 }
        ],
        '찬란한 보물상자': [
            { item: '엘릭서', count: 10, weight: 30 }, { item: '화염의 검', count: 1, weight: 20 },
            { item: '저주받은 갑옷 조각', count: 1, weight: 15 }, { item: '룬 블레이드', count: 1, weight: 10 },
            { item: '어비스의 숨결', count: 1, weight: 5 },
            { item: '드래곤의 심장', count: 1, weight: 2 }
        ]
    }
};

// -------------------------------------------
// 3. 전역 상태 및 데이터 관리
// -------------------------------------------
var dataFolder = new java.io.File(Config.DATA_FOLDER_PATH);
if (!dataFolder.exists()) {
    dataFolder.mkdirs();
}

var accounts = {};
var players = {};
var rankingCache = [];
var lastRankingUpdateTime = 0;

var battleSession = {};
var pvpSession = {};
var raidSession = {};
var restSession = {};
var fishingSession = {};
var shopSession = {};
var marketSession = {};
var parties = {};
var invitations = {};
var tradeRequests = {};
var tradeSessions = {};

var market = loadData(Config.MARKET_DATA_FILE) || {};
var lottoData = loadData(Config.LOTTO_DATA_FILE) || { pot: Config.INITIAL_LOTTO_POT, tickets: {}, lastWinner: null, lastDrawTime: null };

// -------------------------------------------
// 4. 플레이어 객체 및 데이터 I/O
// -------------------------------------------
function Player(name, className, sender) {
    var classInfo = GameData.classes[className] || GameData.classes['전사'];
    this.sender = sender;
    this.name = name;
    this.className = className;
    this.jobTier = classInfo.jobTier || 1; // [수정] 직업 등급 추가
    this.level = 1; this.exp = 0; this.maxExp = 100;
    this.hp = classInfo.hp; this.baseMaxHp = classInfo.hp;
    this.mp = classInfo.mp; this.baseMaxMp = classInfo.mp;
    this.baseAtt = classInfo.att; this.baseDef = classInfo.def;
    this.gold = 100;
    this.inventory = [{ name: '단검', count: 1 }, { name: '포션', count: 5 }];
    this.equipment = {
        weapon: { name: null, dura: 0 },
        armor: { name: null, dura: 0 },
        shield: { name: null, dura: 0 }
    };
    this.activeQuests = {};
    this.fishingLevel = 1; this.fishingExp = 0; this.maxFishingExp = 100;
    this.fishInventory = [];
    this.party = null;
    this.buffs = {};
    this.warMode = false;
}

Player.prototype = {
    constructor: Player,

    // [추가] 세트 아이템 카운트 함수
    getEquippedSetInfo: function() {
        var equippedSets = {};
        var eq = this.equipment;

        for (var setName in GameData.itemSets) {
            var setInfo = GameData.itemSets[setName];
            var count = 0;
            if (eq.weapon.name && setInfo.items.indexOf(eq.weapon.name) > -1) count++;
            if (eq.armor.name && setInfo.items.indexOf(eq.armor.name) > -1) count++;
            if (eq.shield.name && setInfo.items.indexOf(eq.shield.name) > -1) count++;

            if (count > 0) {
                equippedSets[setName] = count;
            }
        }
        return equippedSets;
    },

    getMaxHp: function() {
        var maxHp = this.baseMaxHp;
        var account = accounts[this.sender];
        if (account && account.pet && account.pet.isActive) {
            var petData = GameData.pets[account.pet.type];
            if (petData && petData.buff.type === 'maxHp') {
                maxHp += petData.buff.baseValue + (petData.buff.growth * (account.pet.level - 1));
            }
        }

        // [추가] 세트 아이템 효과 적용
        var equippedSets = this.getEquippedSetInfo();
        for (var setName in equippedSets) {
            var count = equippedSets[setName];
            var bonuses = GameData.itemSets[setName].bonuses;
            // bonuses[String(count)] 으로 접근해야 올바르게 동작
            if (bonuses[String(count)] && bonuses[String(count)].maxHpBonus) {
                maxHp += bonuses[String(count)].maxHpBonus;
            }
        }

        return maxHp;
    },
    getMaxMp: function() { return this.baseMaxMp; },
    getAttack: function() {
        var totalAtt = this.baseAtt;
        var weapon = this.equipment.weapon;
        if (weapon && weapon.name && weapon.dura > 0 && GameData.items[weapon.name]) {
            totalAtt += GameData.items[weapon.name].att;
        }
        // 펫 능력치 적용
        var account = accounts[this.sender];
        if (account && account.pet && account.pet.isActive) {
            var petData = GameData.pets[account.pet.type];
            if (petData && petData.buff.type === 'att') {
                totalAtt += petData.buff.baseValue + (petData.buff.growth * (account.pet.level - 1));
            }
        }
        if (this.buffs.att && this.buffs.att.expires > Date.now()) {
            totalAtt = Math.floor(totalAtt * this.buffs.att.multiplier);
        }

        // [추가] 세트 아이템 효과 적용
        var equippedSets = this.getEquippedSetInfo();
        for (var setName in equippedSets) {
            var count = equippedSets[setName];
            var bonuses = GameData.itemSets[setName].bonuses;
            if (bonuses[String(count)] && bonuses[String(count)].attMultiplier) {
                totalAtt = Math.floor(totalAtt * bonuses[String(count)].attMultiplier);
            }
        }

        return totalAtt;
    },
    getDefense: function() {
        var totalDef = this.baseDef;
        var armor = this.equipment.armor;
        var shield = this.equipment.shield;
        if (armor && armor.name && armor.dura > 0 && GameData.items[armor.name]) {
            totalDef += GameData.items[armor.name].def;
        }
        if (shield && shield.name && shield.dura > 0 && GameData.items[shield.name]) {
            totalDef += GameData.items[shield.name].def;
        }
        // 펫 능력치 적용
        var account = accounts[this.sender];
        if (account && account.pet && account.pet.isActive) {
            var petData = GameData.pets[account.pet.type];
            if (petData && petData.buff.type === 'def') {
                totalDef += petData.buff.baseValue + (petData.buff.growth * (account.pet.level - 1));
            }
        }
        if (this.buffs.def && this.buffs.def.expires > Date.now()) {
            totalDef = Math.floor(totalDef * this.buffs.def.multiplier);
        }

        // [추가] 세트 아이템 효과 적용
        var equippedSets = this.getEquippedSetInfo();
        for (var setName in equippedSets) {
            var count = equippedSets[setName];
            var bonuses = GameData.itemSets[setName].bonuses;
            if (bonuses[String(count)] && bonuses[String(count)].defMultiplier) {
                totalDef = Math.floor(totalDef * bonuses[String(count)].defMultiplier);
            }
        }

        return totalDef;
    },
    addExp: function(exp) {
        var bonusExp = this.warMode ? Math.floor(exp * Config.WAR_MODE_EXP_BONUS) : 0;
        var totalExp = exp + bonusExp;
        this.exp += totalExp;
        var message = '경험치 ' + exp + (bonusExp > 0 ? '(+' + bonusExp + ')' : '') + '을(를) 획득했습니다.';

        // 펫 경험치 획득
        var account = accounts[this.sender];
        if (account && account.pet && account.pet.isActive) {
            var petExpGain = Math.floor(exp * Config.PET_EXP_RATE);
            if (petExpGain > 0) {
                message += '\n' + addPetExp(account.pet, petExpGain);
            }
        }

        while (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.levelUp();
            message += '\n🎉 레벨 업! ' + this.level + '레벨이 되었습니다! 🎉';
        }
        return message;
    },
    levelUp: function() {
        this.level++;
        this.maxExp = Math.floor(this.maxExp * 1.5);
        this.baseMaxHp += 20;
        this.baseMaxMp += 10;
        this.baseAtt += 3;
        this.baseDef += 2;
        this.hp = this.getMaxHp();
        this.mp = this.getMaxMp();
    },
    addItem: function(itemName, count) {
        count = count || 1;
        var item = this.inventory.find(function(i) { return i.name === itemName; });
        if (item) {
            item.count += count;
        } else {
            this.inventory.push({ name: itemName, count: count });
        }
    },
    removeItem: function(itemName, count) {
        count = count || 1;
        var itemIndex = this.inventory.findIndex(function(i) { return i.name === itemName; });
        if (itemIndex > -1) {
            this.inventory[itemIndex].count -= count;
            if (this.inventory[itemIndex].count <= 0) {
                this.inventory.splice(itemIndex, 1);
            }
            return true;
        }
        return false;
    },
    hasItem: function(itemName, count) {
        count = count || 1;
        var item = this.inventory.find(function(i) { return i.name === itemName; });
        return item && item.count >= count;
    },
    hasFish: function(fishName, count) {
        count = count || 1;
        var fishCount = this.fishInventory.filter(function(f) { return f.name === fishName; }).length;
        return fishCount >= count;
    },
    removeFish: function(fishName, count) {
        count = count || 1;
        for (var i = 0; i < count; i++) {
            var fishIndex = this.fishInventory.findIndex(function(f) { return f.name === fishName; });
            if (fishIndex > -1) {
                this.fishInventory.splice(fishIndex, 1);
            } else {
                return false;
            }
        }
        return true;
    },
    addFishingExp: function(exp) {
        this.fishingExp += exp;
        var message = '낚시 경험치 ' + exp + '을(를) 획득했습니다.';
        while (this.fishingExp >= this.maxFishingExp) {
            this.fishingExp -= this.maxFishingExp;
            this.fishingLevel++;
            this.maxFishingExp = Math.floor(this.maxFishingExp * 1.8);
            message += '\n🎣 낚시 레벨 업! ' + this.fishingLevel + '레벨이 되었습니다! 🎣';
        }
        return message;
    }
};

function writeFile(fileName, data) {
    try {
        var file = new java.io.File(dataFolder, fileName);
        var fileData = JSON.stringify(data, null, 2);
        var fos = new java.io.FileOutputStream(file);
        var writer = new java.io.OutputStreamWriter(fos, "UTF-8");
        writer.write(fileData);
        writer.close();
        fos.close();
        return true;
    } catch (e) {
        Log.e("묘냥의 숲 " + fileName + " 데이터 저장 오류: " + e);
        return false;
    }
}

function readFile(fileName) {
    try {
        var file = new java.io.File(dataFolder, fileName);
        if (!file.exists()) return null;
        var fis = new java.io.FileInputStream(file);
        var reader = new java.io.InputStreamReader(fis, "UTF-8");
        var br = new java.io.BufferedReader(reader);
        var data = "";
        var line = null;
        while ((line = br.readLine()) != null) {
            data += line;
        }
        br.close();
        reader.close();
        fis.close();
        return JSON.parse(data);
    } catch (e) {
        Log.e("묘냥의 숲 " + fileName + " 데이터 로드 오류: " + e);
        return null;
    }
}

function saveAccount(sender, account) {
    var fileName = sender.replace(/[^a-zA-Z0-9가-힣]/g, '') + ".json";
    var dataToSave = JSON.parse(JSON.stringify(account));
    return writeFile(fileName, dataToSave);
}

function loadAccount(sender) {
    var fileName = sender.replace(/[^a-zA-Z0-9가-힣]/g, '') + ".json";
    var loaded = readFile(fileName);
    if (!loaded) return null;

    if (loaded.className && !loaded.characters) {
        Log.i("구버전 데이터 발견, 계정 시스템으로 마이그레이션을 시작합니다: " + sender);
        var oldPlayer = new Player(loaded.name, loaded.className, sender);
        for (var key in loaded) {
            if (loaded.hasOwnProperty(key)) {
                oldPlayer[key] = loaded[key];
            }
        }
        var newAccount = {
            activeCharacterName: oldPlayer.className,
            characters: {},
            pet: null // 펫 데이터 초기화
        };
        newAccount.characters[oldPlayer.className] = oldPlayer;
        saveAccount(sender, newAccount);
        Log.i("마이그레이션 완료: " + sender);
        loaded = newAccount;
    }

    try {
        // 펫 데이터 호환성 체크
        if (loaded.pet === undefined) {
            loaded.pet = null;
        }

        for (var className in loaded.characters) {
            var charData = loaded.characters[className];
            var playerInstance = new Player(charData.name, charData.className, charData.sender);
            for (var key in charData) {
                if (charData.hasOwnProperty(key)) {
                    playerInstance[key] = charData[key];
                }
            }
            if (!playerInstance.buffs) playerInstance.buffs = {};
            if (playerInstance.warMode === undefined) playerInstance.warMode = false;
            if (playerInstance.jobTier === undefined) { // 이전 버전 호환
                var classInfo = GameData.classes[playerInstance.className] || GameData.classes['전사'];
                playerInstance.jobTier = classInfo.jobTier || 1;
            }
            ['weapon', 'armor', 'shield'].forEach(function(slot) {
                if (!playerInstance.equipment[slot] || typeof playerInstance.equipment[slot].name === 'undefined') {
                    playerInstance.equipment[slot] = { name: null, dura: 0 };
                }
            });
            loaded.characters[className] = playerInstance;
        }
        return loaded;
    } catch (e) {
        Log.e("묘냥의 숲 계정 객체 변환 오류: " + e);
        return null;
    }
}

function saveData(fileName, data) {
    return writeFile(fileName, data);
}

function loadData(fileName) {
    return readFile(fileName);
}

// -------------------------------------------
// 5. 게임 시스템 헬퍼 함수
// -------------------------------------------

// 펫 경험치 추가 및 레벨업 처리 함수
function addPetExp(pet, exp) {
    if (!pet) return "";
    pet.exp += exp;
    var message = "펫 [" + pet.name + "]이(가) 경험치 " + exp + "을(를) 획득했습니다.";
    while (pet.exp >= pet.maxExp) {
        pet.exp -= pet.maxExp;
        pet.level++;
        pet.maxExp = Math.floor(pet.maxExp * 1.8);
        message += "\n🐾 펫 레벨 업! [" + pet.name + "]이(가) " + pet.level + "레벨이 되었습니다! 🐾";
    }
    return message;
}

function findSenderByName(name) {
    for (var sender in players) {
        if (players[sender] && players[sender].name === name) {
            return sender;
        }
    }
    return null;
}

function formatEquipmentDisplay(equipmentSlot) {
    if (!equipmentSlot || !equipmentSlot.name) {
        return '없음';
    }
    var itemData = GameData.items[equipmentSlot.name];
    if (!itemData) {
        return equipmentSlot.name + ' (알 수 없는 아이템)';
    }
    var duraInfo = '(' + equipmentSlot.dura + '/' + itemData.maxDura + ')';
    return equipmentSlot.name + ' ' + duraInfo;
}

function startBattle(sender, player, monsterName) {
    if (!GameData.monsters[monsterName]) {
        return '존재하지 않는 몬스터입니다. 사냥 가능한 몬스터 목록은 /몬스터도감 에서 확인하세요.';
    }
    var monster = JSON.parse(JSON.stringify(GameData.monsters[monsterName]));
    battleSession[sender] = {
        player: player,
        monster: monster,
        log: [monster.name + '이(가) 나타났다!']
    };
    return getBattleStatus(sender);
}

function handleBattleAction(sender) {
    var session = battleSession[sender];
    if (!session) return null;

    var player = session.player;
    var monster = session.monster;
    session.log = [];

    var playerDamage = Math.max(0, player.getAttack() - monster.def);

    // 독바르기 버프 효과 적용
    if (player.buffs.poison && player.buffs.poison.expires > Date.now()) {
        var poisonDamage = player.buffs.poison.extraDamage;
        playerDamage += poisonDamage;
        session.log.push('☠️ 독 효과로 ' + poisonDamage + '의 추가 데미지!');
    } else if (player.buffs.poison) {
        delete player.buffs.poison; // 만료된 버프 제거
    }

    monster.hp -= playerDamage;
    session.log.push('플레이어의 공격! ' + monster.name + '에게 ' + playerDamage + '의 데미지!');
    if (player.equipment.weapon.name) {
        player.equipment.weapon.dura = Math.max(0, player.equipment.weapon.dura - 1);
    }

    if (monster.hp <= 0) {
        var exp = monster.exp;
        var gold = monster.gold;
        player.gold += gold;
        var expMessage = player.addExp(exp);
        var dropItem = null;
        if (monster.items && Math.random() < Config.BATTLE_ITEM_DROP_RATE) {
            dropItem = monster.items[Math.floor(Math.random() * monster.items.length)];
            player.addItem(dropItem);
        }
        Object.keys(player.activeQuests).forEach(function(questName) {
            var questInfo = GameData.quests[questName];
            if (questInfo && questInfo.target === monster.name) {
                player.activeQuests[questName].current++;
            }
        });
        var result = '💥 ' + monster.name + '을(를) 물리쳤다!\n' + '획득 골드: ' + gold + ' G\n' + expMessage;
        if (dropItem) {
            result += '\n아이템 [' + dropItem + ']을(를) 획득했다!';
        }
        delete battleSession[sender];
        var account = accounts[sender];
        account.characters[player.className] = player;
        saveAccount(sender, account);
        return result;
    }

    var monsterDamage = Math.max(0, monster.att - player.getDefense());
    player.hp -= monsterDamage;
    session.log.push(monster.name + '의 공격! 플레이어에게 ' + monsterDamage + '의 데미지!');
    if (player.equipment.armor.name) {
        player.equipment.armor.dura = Math.max(0, player.equipment.armor.dura - 1);
    }
    if (player.equipment.shield.name) {
        player.equipment.shield.dura = Math.max(0, player.equipment.shield.dura - 1);
    }

    if (player.hp <= 0) {
        player.hp = 1;
        delete battleSession[sender];
        var account = accounts[sender];
        account.characters[player.className] = player;
        saveAccount(sender, account);
        return '전투에서 패배했다... HP가 1 남았습니다.';
    }
    return getBattleStatus(sender);
}

function getBattleStatus(sender) {
    var session = battleSession[sender];
    if (!session) return '전투 중이 아닙니다.';
    var player = session.player;
    var monster = session.monster;
    return '--- 전투 상황 ---\n' +
        '👤 ' + player.name + ': HP ' + player.hp + '/' + player.getMaxHp() + '\n' +
        '👹 ' + monster.name + ': HP ' + monster.hp + '\n' +
        '-------------------\n' +
        session.log.join('\n') + '\n\n' +
        '명령어: /공격, /도망, /사용 [아이템], /강타, /파이어볼 등 스킬';
}

function handlePvpAction(sender) {
    var session = pvpSession[sender];
    if (!session) return null;

    var attacker = session.p1;
    var defender = session.p2;
    session.log = [];

    var damage = Math.max(0, attacker.getAttack() - defender.getDefense());

    // 독바르기 버프 효과 적용
    if (attacker.buffs.poison && attacker.buffs.poison.expires > Date.now()) {
        var poisonDamage = attacker.buffs.poison.extraDamage;
        damage += poisonDamage;
        session.log.push('☠️ 독 효과로 ' + poisonDamage + '의 추가 데미지!');
    } else if (attacker.buffs.poison) {
        delete attacker.buffs.poison; // 만료된 버프 제거
    }

    defender.hp -= damage;
    session.log.push('⚔️ ' + attacker.name + '의 공격! ' + defender.name + '에게 ' + damage + '의 데미지!');
    if (attacker.equipment.weapon.name) {
        attacker.equipment.weapon.dura = Math.max(0, attacker.equipment.weapon.dura - 1);
    }

    if (defender.hp <= 0) {
        defender.hp = 1;
        var result = '👑 ' + attacker.name + '님이 ' + defender.name + '님과의 대결에서 승리했습니다!';
        delete pvpSession[attacker.sender];
        delete pvpSession[defender.sender];
        var attackerAccount = accounts[attacker.sender];
        attackerAccount.characters[attacker.className] = attacker;
        saveAccount(attacker.sender, attackerAccount);
        var defenderAccount = accounts[defender.sender];
        defenderAccount.characters[defender.className] = defender;
        saveAccount(defender.sender, defenderAccount);
        return result;
    }

    if (defender.equipment.armor.name) defender.equipment.armor.dura = Math.max(0, defender.equipment.armor.dura - 1);
    if (defender.equipment.shield.name) defender.equipment.shield.dura = Math.max(0, defender.equipment.shield.dura - 1);

    var temp = session.p1;
    session.p1 = session.p2;
    session.p2 = temp;

    return getPvpStatus(sender);
}

function getPvpStatus(sender) {
    var session = pvpSession[sender];
    if (!session) return 'PK 대전 중이 아닙니다.';
    var turnPlayer = session.p1;
    var waitingPlayer = session.p2;
    return '--- 🔥 전쟁 모드 PK 🔥 ---\n' +
        '🗡️ ' + turnPlayer.name + ': HP ' + turnPlayer.hp + '/' + turnPlayer.getMaxHp() + ' (당신 턴)\n' +
        '🛡️ ' + waitingPlayer.name + ': HP ' + waitingPlayer.hp + '/' + waitingPlayer.getMaxHp() + '\n' +
        '---------------------------\n' +
        (session.log ? session.log.join('\n') : '') + '\n\n' +
        '명령어: /공격, /도망, /사용 [아이템], /강타, /파이어볼 등 스킬';
}

function startRaid(leaderSender, replier) {
    var party = parties[leaderSender];
    if (!party || party.leader !== leaderSender) {
        return "레이드는 파티장만 시작할 수 있습니다.";
    }
    if (raidSession[leaderSender]) {
        return "이미 다른 레이드를 진행하고 있습니다.";
    }
    var dungeonData = GameData.raidDungeon;
    var leaderPlayer = players[leaderSender];
    if (!leaderPlayer.hasItem(dungeonData.entryItem)) {
        return "⚠️ 입장 아이템 [" + dungeonData.entryItem + "]이(가) 부족합니다.";
    }
    var partyMembers = [];
    for (var i = 0; i < party.members.length; i++) {
        var memberSender = party.members[i];
        var member = players[memberSender];
        if (!member) {
            return "⚠️ 파티원 " + memberSender + "의 정보를 찾을 수 없습니다. (오프라인 상태)";
        }
        if (member.level < dungeonData.minLevel) {
            return "⚠️ 파티원 '" + member.name + "'의 레벨이 부족하여 입장할 수 없습니다. (최소 " + dungeonData.minLevel + "레벨)";
        }
        partyMembers.push(member);
    }
    leaderPlayer.removeItem(dungeonData.entryItem, 1);
    var leaderAccount = accounts[leaderSender];
    leaderAccount.characters[leaderPlayer.className] = leaderPlayer;
    saveAccount(leaderSender, leaderAccount);
    var firstBoss = JSON.parse(JSON.stringify(GameData.monsters[dungeonData.bosses[0]]));
    raidSession[leaderSender] = {
        party: party,
        bosses: dungeonData.bosses,
        currentBossIndex: 0,
        currentBoss: firstBoss,
        memberStatus: partyMembers.map(function(p) {
            return {
                sender: p.sender,
                name: p.name,
                className: p.className,
                hp: p.hp,
                maxHp: p.getMaxHp(),
                isAlive: true
            };
        }),
        log: ["🔥 " + dungeonData.name + "에 입장했습니다! 첫 번째 보스, " + firstBoss.name + "이(가) 나타났습니다!"]
    };
    return getRaidStatus(leaderSender);
}

function handleRaidAction(sender) {
    var player = players[sender];
    if (!player.party || !raidSession[player.party]) {
        return "진행 중인 레이드가 없습니다.";
    }
    var leaderSender = player.party;
    var session = raidSession[leaderSender];
    var playerStatus = session.memberStatus.find(function(m) { return m.sender === sender; });
    if (!playerStatus.isAlive) {
        return "당신은 전투 불능 상태라 행동할 수 없습니다.";
    }
    session.log = [];
    var totalPartyDamage = 0;
    session.memberStatus.forEach(function(member) {
        if (member.isAlive) {
            var p = players[member.sender];
            if (p) {
                if (p.className === '힐러') {
                    var healSkill = GameData.classes['힐러'].skills['치유'];
                    if (p.mp >= healSkill.mpCost) {
                        p.mp -= healSkill.mpCost;
                        var healTarget = null;
                        var lowestHpRatio = 1;
                        session.memberStatus.forEach(function(targetMember) {
                            if (targetMember.isAlive) {
                                var currentP = players[targetMember.sender];
                                var ratio = currentP.hp / currentP.getMaxHp();
                                if (ratio < lowestHpRatio) {
                                    lowestHpRatio = ratio;
                                    healTarget = targetMember;
                                }
                            }
                        });
                        if (healTarget) {
                            var targetPlayer = players[healTarget.sender];
                            var oldHp = targetPlayer.hp;
                            targetPlayer.hp = Math.min(targetPlayer.getMaxHp(), targetPlayer.hp + healSkill.healAmount);
                            healTarget.hp = targetPlayer.hp;
                            session.log.push("💚 " + p.name + "의 치유! " + healTarget.name + "의 HP를 " + (targetPlayer.hp - oldHp) + " 회복!");
                        }
                    } else {
                        session.log.push("⚠️ " + p.name + "의 MP가 부족하여 치유에 실패했습니다.");
                    }
                } else {
                    var playerDamage = Math.max(0, p.getAttack() - session.currentBoss.def);

                    // 독바르기 버프 효과 적용
                    if (p.buffs.poison && p.buffs.poison.expires > Date.now()) {
                        var poisonDamage = p.buffs.poison.extraDamage;
                        playerDamage += poisonDamage;
                        session.log.push('☠️ ' + p.name + '의 독 효과로 ' + poisonDamage + '의 추가 데미지!');
                    } else if (p.buffs.poison) {
                        delete p.buffs.poison; // 만료된 버프 제거
                    }

                    totalPartyDamage += playerDamage;
                    session.log.push("⚔️ " + p.name + "의 공격! " + playerDamage + "의 데미지!");
                    if (p.equipment.weapon.name) {
                        p.equipment.weapon.dura = Math.max(0, p.equipment.weapon.dura - 1);
                    }
                }
            }
        }
    });
    session.currentBoss.hp -= totalPartyDamage;
    if (totalPartyDamage > 0) {
        session.log.push("➡️ " + session.currentBoss.name + "에게 총 " + totalPartyDamage + "의 피해를 입혔습니다!");
    }
    if (session.currentBoss.hp <= 0) {
        var defeatedBoss = session.currentBoss;
        session.log.push("🏆 보스 " + defeatedBoss.name + "을(를) 물리쳤습니다!");
        session.currentBossIndex++;
        if (session.currentBossIndex < session.bosses.length) {
            var nextBossName = session.bosses[session.currentBossIndex];
            session.currentBoss = JSON.parse(JSON.stringify(GameData.monsters[nextBossName]));
            session.log.push("\n✨ 다음 상대, " + session.currentBoss.name + "이(가) 나타났습니다!");
            return getRaidStatus(leaderSender);
        } else {
            var rewardMessage = "🎉🎉 최종 보스를 격파하고 어비스 던전을 클리어했습니다! 🎉🎉\n\n--- 최종 보상 ---\n";
            var livingMembers = session.memberStatus.filter(function(m) { return m.isAlive; });
            livingMembers.forEach(function(member) {
                var p = players[member.sender];
                if (p) {
                    var exp = defeatedBoss.exp;
                    var gold = defeatedBoss.gold;
                    p.gold += gold;
                    var expMsg = p.addExp(exp).replace(/\n/g, ' ');
                    rewardMessage += "• " + p.name + ": " + gold + "G, " + expMsg;
                    var dropItem = null;
                    if (defeatedBoss.items && Math.random() < Config.BATTLE_ITEM_DROP_RATE * Config.RAID_ITEM_DROP_RATE_MULTIPLIER) {
                        dropItem = defeatedBoss.items[Math.floor(Math.random() * defeatedBoss.items.length)];
                        p.addItem(dropItem);
                        rewardMessage += ", 아이템 [" + dropItem + "]\n";
                    } else {
                        rewardMessage += "\n";
                    }
                    var account = accounts[p.sender];
                    account.characters[p.className] = p;
                    saveAccount(p.sender, account);
                }
            });
            delete raidSession[leaderSender];
            return rewardMessage;
        }
    }
    var livingMembers = session.memberStatus.filter(function(m) { return m.isAlive; });
    if (livingMembers.length > 0) {
        var targetStatus = livingMembers[Math.floor(Math.random() * livingMembers.length)];
        var targetPlayer = players[targetStatus.sender];
        if (targetPlayer) {
            var bossDamage = Math.max(0, session.currentBoss.att - targetPlayer.getDefense());
            targetPlayer.hp -= bossDamage;
            targetStatus.hp = targetPlayer.hp;
            session.log.push("👹 " + session.currentBoss.name + "의 공격! " + targetPlayer.name + "에게 " + bossDamage + "의 데미지!");
            if (targetPlayer.equipment.armor.name) targetPlayer.equipment.armor.dura = Math.max(0, targetPlayer.equipment.armor.dura - 1);
            if (targetPlayer.equipment.shield.name) targetPlayer.equipment.shield.dura = Math.max(0, targetPlayer.equipment.shield.dura - 1);
            if (targetPlayer.hp <= 0) {
                targetPlayer.hp = 1;
                targetStatus.isAlive = false;
                session.log.push("☠️ " + targetPlayer.name + "님이 전투 불능 상태가 되었습니다.");
            }
            var targetAccount = accounts[targetPlayer.sender];
            targetAccount.characters[targetPlayer.className] = targetPlayer;
            saveAccount(targetPlayer.sender, targetAccount);
        }
    }
    livingMembers = session.memberStatus.filter(function(m) { return m.isAlive; });
    if (livingMembers.length === 0) {
        var failureMessage = "전투에서 패배했습니다... 파티가 전멸하여 레이드에 실패했습니다.";
        delete raidSession[leaderSender];
        return failureMessage;
    }
    return getRaidStatus(leaderSender);
}

function getRaidStatus(leaderSender) {
    var session = raidSession[leaderSender];
    if (!session) return "진행 중인 레이드가 없습니다.";
    var statusMsg = "--- 🔥 " + GameData.raidDungeon.name + " (" + (session.currentBossIndex + 1) + "/" + session.bosses.length + ") 🔥 ---\n";
    statusMsg += "👹 보스: " + session.currentBoss.name + " (HP: " + session.currentBoss.hp + ")\n";
    statusMsg += "--------------------------------------\n";
    session.memberStatus.forEach(function(member) {
        var p = players[member.sender];
        var mpInfo = (p && p.className === '힐러') ? ' | MP ' + p.mp + '/' + p.getMaxMp() : '';
        if (member.isAlive) {
            statusMsg += " • " + member.name + ": HP " + member.hp + "/" + member.maxHp + mpInfo + "\n";
        } else {
            statusMsg += " • " + member.name + ": [전투불능]\n";
        }
    });
    statusMsg += "--------------------------------------\n";
    statusMsg += session.log.join("\n") + "\n\n";
    statusMsg += "명령어: /어비스공격, /사용 [아이템], /어비스포기";
    return statusMsg;
}

function getTradeStatus(session) {
    var p1 = players[session.p1.sender];
    var p2 = players[session.p2.sender];
    var p1Name = p1 ? p1.name : '(오프라인)';
    var p2Name = p2 ? p2.name : '(오프라인)';
    var msg = '--- 거래창 ---\n';
    msg += '👤 ' + p1Name + (session.p1.confirmed ? ' (✅확인)' : '') + '\n';
    msg += ' • 골드: ' + session.p1.gold + ' G\n';
    session.p1.items.forEach(function(item) {
        msg += ' • 아이템: ' + item.name + ' x' + item.count + '\n';
    });
    if (session.p1.items.length === 0) msg += ' • 아이템: 없음\n';
    msg += '----------------\n';
    msg += '👤 ' + p2Name + (session.p2.confirmed ? ' (✅확인)' : '') + '\n';
    msg += ' • 골드: ' + session.p2.gold + ' G\n';
    session.p2.items.forEach(function(item) {
        msg += ' • 아이템: ' + item.name + ' x' + item.count + '\n';
    });
    if (session.p2.items.length === 0) msg += ' • 아이템: 없음\n';
    msg += '----------------\n';
    msg += '명령어: /거래올리기, /거래골드, /거래확인, /거래취소';
    return msg;
}

function endTrade(sessionId, replier, message) {
    var session = tradeSessions[sessionId];
    if (!session) return;
    var p1 = players[session.p1.sender];
    var p2 = players[session.p2.sender];
    if (p1) {
        p1.gold += session.p1.gold;
        session.p1.items.forEach(function(item) { p1.addItem(item.name, item.count); });
        var p1Account = accounts[p1.sender];
        p1Account.characters[p1.className] = p1;
        saveAccount(p1.sender, p1Account);
    }
    if (p2) {
        p2.gold += session.p2.gold;
        session.p2.items.forEach(function(item) { p2.addItem(item.name, item.count); });
        var p2Account = accounts[p2.sender];
        p2Account.characters[p2.className] = p2;
        saveAccount(p2.sender, p2Account);
    }
    delete tradeSessions[session.p1.sender];
    delete tradeSessions[session.p2.sender];
    delete tradeSessions[sessionId];
    if (replier) replier.reply(message || "거래가 취소되었습니다.");
}

function showInventory(player) {
    var msg = '--- 인벤토리 (' + player.name + ') ---\n';
    if (player.inventory.length === 0) {
        msg += '🎒 아이템이 없습니다.\n';
    } else {
        player.inventory.forEach(function(item) {
            var itemInfo = GameData.items[item.name];
            msg += '• ' + item.name + ' x' + item.count + (itemInfo && itemInfo.description ? ' (' + itemInfo.description + ')\n' : '\n');
        });
    }
    msg += '\n--- 어류 보관함 ---\n';
    if (player.fishInventory.length === 0) {
        msg += '🐟 잡은 물고기가 없습니다.\n';
    } else {
        var sortedFish = player.fishInventory.sort(function(a, b) {
            return b.size - a.size;
        });
        sortedFish.forEach(function(fish) {
            msg += '• ' + fish.name + ' (' + fish.size + 'cm)\n';
        });
    }
    msg += '----------------\n' + '골드: ' + player.gold + ' G';
    return msg;
}

// -------------------------------------------
// 6. 랭킹 시스템
// -------------------------------------------
function updateRankingCache() {
    Log.i("묘냥의 숲: 랭킹 캐시 업데이트 시작...");
    try {
        var allCharacters = [];
        var files = dataFolder.listFiles();
        if (!files) {
            Log.e("묘냥의 숲: 랭킹 데이터 폴더를 읽을 수 없습니다.");
            return;
        }
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.getName().endsWith(".json") && file.getName() !== Config.MARKET_DATA_FILE && file.getName() !== Config.LOTTO_DATA_FILE) {
                var accountData = readFile(file.getName());
                if (accountData && accountData.characters) {
                    for (var className in accountData.characters) {
                        var pData = accountData.characters[className];
                        if (pData && pData.name && pData.level) {
                            allCharacters.push({
                                name: pData.name,
                                level: pData.level,
                                className: pData.className
                            });
                        }
                    }
                } else if (accountData && accountData.className) {
                    if (accountData.name && accountData.level) {
                        allCharacters.push({
                            name: accountData.name,
                            level: accountData.level,
                            className: accountData.className
                        });
                    }
                }
            }
        }
        allCharacters.sort(function(a, b) {
            return b.level - a.level;
        });
        rankingCache = allCharacters.slice(0, Config.RANKING_DISPLAY_COUNT);
        lastRankingUpdateTime = Date.now();
        Log.i("묘냥의 숲: 랭킹 캐시 업데이트 완료. (" + rankingCache.length + "명)");
    } catch (e) {
        Log.e("랭킹 캐시 업데이트 중 오류 발생: " + e);
    }
}

// -------------------------------------------
// 7. 메인 명령어 핸들러
// -------------------------------------------
var commandHandlers = {
    '/rpg': function(player, args, replier, sender, account) {
        replier.reply('🌳 묘냥의 숲에 오신 것을 환영합니다! 🌳\n\n"/생성 [이름] [직업]"으로 캐릭터를 만들어주세요.\n(직업: 전사, 마법사, 도적, 힐러)');
    },
    '/생성': function(player, args, replier, sender, account) {
        if (!args[0] || !args[1]) {
            replier.reply('⚠️ 사용법: /생성 [이름] [직업]\n(직업: 전사, 마법사, 도적, 힐러)');
            return;
        }
        var name = args[0];
        var className = args[1];
        if (!GameData.classes[className] || GameData.classes[className].jobTier !== 1) { // 1차 직업만 생성 가능
            replier.reply('⚠️ 선택할 수 없는 직업입니다. (가능: 전사, 마법사, 도적, 힐러)');
            return;
        }
        if (account.characters[className]) {
            replier.reply('⚠️ 이미 해당 직업의 캐릭터가 존재합니다. /캐릭터변경 으로 접속하거나 다른 직업을 선택해주세요.');
            return;
        }
        var newPlayer = new Player(name, className, sender);
        account.characters[className] = newPlayer;
        if (!account.activeCharacterName) {
            account.activeCharacterName = className;
        }
        players[sender] = account.characters[account.activeCharacterName];
        saveAccount(sender, account);
        replier.reply('🎉 캐릭터 "' + name + '" (' + className + ') 생성 완료! 🎉\n"/명령어"를 입력하여 모험을 시작하세요!');
    },
    '/명령어': function(player, args, replier, sender, account) {
        replier.reply('--- 묘냥의 숲 명령어 v3.5.0 ---\n' +
            '👤 플레이어: /내정보, /인벤토리, /장비, /퀘스트, /랭킹, /내캐릭터\n' +
            '🐾 펫: /펫, /펫정보, /펫알부화, /펫먹이주기, /펫동행, /펫이름변경, /펫진화\n' +
            '✨ 성장: /캐릭터변경, /전직\n' +
            '⚔️ 행동: /사냥, /상점, /취침, /장착, /해제, /사용, /수리\n' +
            '🔥 PvP: /전쟁모드, /pk [이름]\n' +
            '✨ 스킬: /힐, /강타, /파이어볼, /독바르기 등\n' +
            '💰 판매: /판매, /아이템일괄판매, /물고기일괄판매\n' +
            '🛠️ 제작: /조합법, /조합, /요리법, /요리\n' +
            '🎁 뽑기: /상자열기\n' +
            '👨‍👩‍👧‍👦 파티: /파티생성, /파티초대, /파티수락, /파티탈퇴, /파티해산, /파티정보\n' +
            '👹 레이드: /어비스입장, /어비스공격, /어비스포기\n' +
            '🤝 거래: /거래신청, /거래수락, /거래거절, /거래취소, /거래올리기, /거래골드, /거래확인\n' +
            '🎣 경제: /낚시, /수산시장, /시장등록, /시장구매\n' +
            '🎲 로또: /로또, /로또구매, /로또확인, /로또추첨\n' +
            '📚 정보: /도움말, /몬스터도감, /아이템도감, /저장');
    },
    '/도움말': function(player, args, replier, sender, account) {
        replier.reply(
            '--- 묘냥의 숲 상세 도움말 v3.5.0 ---\n\n' +
            '📖 __기본 & 캐릭터__\n' +
            ' • /생성 [이름] [직업]: 새 1차 직업 캐릭터 생성\n' +
            ' • /내정보, /인벤토리, /장비, /저장, /랭킹\n' +
            ' • /내캐릭터: 보유한 모든 캐릭터 목록 보기\n' +
            ' • /캐릭터변경 [직업]: 다른 캐릭터로 접속\n\n' +
            '✨ __성장 시스템__\n' +
            " • /전직 [직업이름]: 50레벨, '영웅의 길' 퀘스트 완료 후 2차 직업으로 전직.\n" +
            " • /펫진화: 20레벨 펫과 '진화의 돌'로 펫을 진화.\n\n" +
            '🐾 __펫 시스템__\n' +
            ' • /펫알부화: 인벤토리의 펫 알을 부화시킵니다.\n' +
            ' • /펫정보, /펫먹이주기, /펫동행, /펫이름변경\n\n' +
            '⚔️ __행동 & PvP__\n' +
            ' • /사냥 [몬스터]: 1:1 몬스터 전투\n' +
            ' • /전쟁모드: PvP 모드 ON/OFF (경험치 +3%)\n' +
            ' • /pk [이름]: 전쟁모드를 켠 유저에게 대결 신청\n' +
            ' • /수리 [부위/전체]: 골드로 장비 내구도 회복\n' +
            ' • /취침: 5분 후 HP/MP 모두 회복\n\n' +
            '👨‍👩‍👧‍👦 __파티 & 레이드__\n' +
            ' • /파티생성, /파티초대 [이름], /파티수락 등\n' +
            ' • /어비스입장: 파티로 레이드 던전 입장\n' +
            ' • /어비스공격: 파티원과 함께 보스 공격 (힐러는 자동 치유)\n\n' +
            '🔄 __거래 & 경제__\n' +
            ' • /거래신청 [이름]: 1:1 아이템/골드 거래\n' +
            ' • /낚시, /수산시장, /시장구매 [번호], /로또 등\n\n' +
            '📚 __정보__\n' +
            ' • /몬스터도감 [이름], /아이템도감 [이름]'
        );
    },
    '/내정보': function(player, args, replier, sender, account) {
        var info = '--- 내 정보 ---\n' +
            '• 이름: ' + player.name + ' (' + player.className + ')\n' +
            '• 레벨: ' + player.level + ' (EXP: ' + player.exp + '/' + player.maxExp + ')\n' +
            '• HP: ' + player.hp + '/' + player.getMaxHp() + ' | MP: ' + player.mp + '/' + player.getMaxMp() + '\n' +
            '• 공격력: ' + player.getAttack() + ' | 방어력: ' + player.getDefense() + '\n' +
            '• 골드: ' + player.gold + ' G\n' +
            '• 낚시 레벨: ' + player.fishingLevel + ' (EXP: ' + player.fishingExp + '/' + player.maxFishingExp + ')\n' +
            '• 전쟁 모드: ' + (player.warMode ? 'ON' : 'OFF') + (player.warMode ? ' (경험치 +3%)' : '');

        // 펫 정보 추가
        if (account.pet) {
            info += '\n• 동행 펫: ' + account.pet.name + ' (Lv.' + account.pet.level + ' ' + account.pet.type + ')' + (account.pet.isActive ? ' [동행중]' : '');
        }

        var buffMessages = [];
        if (player.buffs.att && player.buffs.att.expires > Date.now()) {
            var remaining = Math.ceil((player.buffs.att.expires - Date.now()) / 60000);
            buffMessages.push('💪 힘의 영약 (' + remaining + '분 남음)');
        }
        if (player.buffs.def && player.buffs.def.expires > Date.now()) {
            var remaining = Math.ceil((player.buffs.def.expires - Date.now()) / 60000);
            buffMessages.push('🛡️ 수호의 영약 (' + remaining + '분 남음)');
        }
        if (player.buffs.poison && player.buffs.poison.expires > Date.now()) {
            var remaining = Math.ceil((player.buffs.poison.expires - Date.now()) / 60000);
            buffMessages.push('☠️ 독바르기 (' + remaining + '분 남음)');
        }
        if (buffMessages.length > 0) {
            info += '\n• 적용중인 효과: ' + buffMessages.join(', ');
        }
        if (player.party) {
            var partyLeaderName = players[player.party] ? players[player.party].name : "알 수 없음";
            info += '\n• 소속 파티: ' + partyLeaderName + '의 파티';
        }
        replier.reply(info);
    },
    '/인벤토리': function(player, args, replier, sender, account) {
        replier.reply(showInventory(player));
    },
    '/캐릭터인벤토리': function(player, args, replier, sender, account) {
        commandHandlers['/인벤토리'](player, args, replier, sender, account);
    },
    // [수정] /장비 명령어에 세트 효과 표시 추가
    '/장비': function(player, args, replier, sender, account) {
        var eq = player.equipment;
        var eqMsg = '--- 장착 장비 (' + player.name + ') ---\n';
        eqMsg += '무기: ' + formatEquipmentDisplay(eq.weapon) + '\n';
        eqMsg += '갑옷: ' + formatEquipmentDisplay(eq.armor) + '\n';
        eqMsg += '방패: ' + formatEquipmentDisplay(eq.shield) + '\n';
        eqMsg += '------------------\n';

        // [추가] 활성화된 세트 효과 표시
        var equippedSets = player.getEquippedSetInfo();
        var hasSetBonus = false;
        for (var setName in equippedSets) {
            var count = equippedSets[setName];
            var bonuses = GameData.itemSets[setName].bonuses;
            if (bonuses[String(count)]) {
                if (!hasSetBonus) {
                    eqMsg += '--- 세트 효과 ---\n';
                    hasSetBonus = true;
                }
                eqMsg += '• ' + setName + ' (' + count + '세트): ' + bonuses[String(count)].description + '\n';
            }
        }
        if (hasSetBonus) {
            eqMsg += '------------------';
        }

        replier.reply(eqMsg.trim());
    },
    '/사냥': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (player.party) {
            replier.reply("⚠️ 파티에 소속된 동안에는 개인 사냥을 할 수 없습니다.");
            return;
        }
        if (!argString) {
            replier.reply("⚠️ 사냥할 몬스터 이름을 입력해주세요. 예: /사냥 슬라임");
            return;
        }
        replier.reply(startBattle(sender, player, argString));
    },
    '/공격': function(player, args, replier, sender, account) {
        var response = null;
        if (battleSession[sender]) {
            response = handleBattleAction(sender);
        } else if (pvpSession[sender] && pvpSession[sender].p1.sender === sender) {
            response = handlePvpAction(sender);
        } else if (pvpSession[sender]) {
            response = "⚠️ 상대방의 턴입니다. 기다려 주세요.";
        } else {
            response = "⚠️ 현재 전투 중이 아닙니다.";
        }
        if (response) {
            replier.reply(response);
        }
    },
    '/도망': function(player, args, replier, sender, account) {
        if (battleSession[sender]) {
            delete battleSession[sender];
            replier.reply("전투에서 도망쳤습니다.");
        } else if (pvpSession[sender]) {
            var opponentSender = (pvpSession[sender].p1.sender === sender) ? pvpSession[sender].p2.sender : pvpSession[sender].p1.sender;
            delete pvpSession[sender];
            delete pvpSession[opponentSender];
            replier.reply("PK 대전에서 도망쳤습니다.");
        } else {
            replier.reply("도망칠 상대가 없습니다.");
        }
    },
    '/상점': function(player, args, replier, sender, account) {
        shopSession[sender] = true;
        var msg = '--- 상점 ---\n';
        Object.keys(GameData.items).forEach(function(itemName) {
            var item = GameData.items[itemName];
            if (item.price && item.type !== 'material' && item.type !== 'special' && item.type !== 'box') {
                msg += '• ' + itemName + ' (' + item.type + ') - ' + item.price + ' G\n';
            }
        });
        msg += '----------------\n' + '명령어: /구매 [아이템], /나가기';
        replier.reply(msg);
    },
    '/구매': function(player, args, replier, sender, account) {
        var itemName = args.join(' ');
        if (!itemName) { replier.reply("⚠️ 구매할 아이템 이름을 입력해주세요."); return; }
        var itemData = GameData.items[itemName];
        if (!itemData || !itemData.price) { replier.reply('⚠️ 상점에서 팔지 않는 아이템입니다.'); }
        else if (player.gold < itemData.price) { replier.reply('⚠️ 골드가 부족합니다.'); }
        else {
            player.gold -= itemData.price;
            player.addItem(itemName, 1);
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply('🛒 [' + itemName + '] 을(를) 구매했습니다. (남은 골드: ' + player.gold + ' G)');
        }
    },
    '/판매': function(player, args, replier, sender, account) {
        var itemName = args.join(' ');
        if (!itemName) { replier.reply("⚠️ 판매할 아이템 이름을 입력해주세요."); return; }
        if (!player.hasItem(itemName)) { replier.reply('⚠️ 해당 아이템을 가지고 있지 않습니다.'); }
        else {
            var itemData = GameData.items[itemName];
            var sellPrice = Math.floor((itemData.price || 0) / 2);
            if (sellPrice <= 0) {
                replier.reply("⚠️ [" + itemName + "] 아이템은 판매할 수 없습니다.");
                return;
            }
            player.gold += sellPrice;
            player.removeItem(itemName, 1);
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply('💰 [' + itemName + '] 을(를) ' + sellPrice + ' G에 판매했습니다.');
        }
    },
    '/아이템일괄판매': function(player, args, replier, sender, account) {
        var totalSellPrice = 0;
        var soldItemsList = [];
        var itemsToKeep = [];
        player.inventory.forEach(function(itemStack) {
            var itemData = GameData.items[itemStack.name];
            if (itemData && itemData.type === 'material') {
                var sellPrice = Math.floor((itemData.price || 0) / 2) * itemStack.count;
                if (sellPrice > 0) {
                    totalSellPrice += sellPrice;
                    soldItemsList.push(itemStack.name + " x" + itemStack.count);
                } else {
                    itemsToKeep.push(itemStack);
                }
            } else {
                itemsToKeep.push(itemStack);
            }
        });
        if (totalSellPrice > 0) {
            player.inventory = itemsToKeep;
            player.gold += totalSellPrice;
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply("--- 재료 일괄 판매 완료 ---\n" +
                soldItemsList.join('\n') +
                "\n--------------------------\n" +
                "총 " + totalSellPrice + " G를 획득했습니다.");
        } else {
            replier.reply("⚠️ 판매할 재료 아이템이 없습니다.");
        }
    },
    '/물고기일괄판매': function(player, args, replier, sender, account) {
        if (player.fishInventory.length === 0) {
            replier.reply("⚠️ 판매할 물고기가 없습니다.");
            return;
        }
        var totalSellPrice = 0;
        var soldFishCount = player.fishInventory.length;
        player.fishInventory.forEach(function(fish) {
            var fishData = GameData.fish[fish.name];
            if (fishData) {
                totalSellPrice += Math.floor(fish.size * fishData.basePrice);
            }
        });
        player.fishInventory = [];
        player.gold += totalSellPrice;
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply("🐟 물고기 " + soldFishCount + "마리를 모두 판매하여 총 " + totalSellPrice + " G를 획득했습니다.");
    },
    '/나가기': function(player, args, replier, sender, account) {
        if (shopSession[sender]) {
            delete shopSession[sender];
            replier.reply('상점에서 나왔습니다.');
        } else {
            replier.reply('⚠️ 현재 상점에 있지 않습니다.');
        }
    },
    '/사용': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply("⚠️ 사용할 아이템 이름을 입력해주세요. 예: /사용 포션");
            return;
        }
        // 펫 먹이 사용 로직 추가
        if (argString === '펫 먹이') {
            commandHandlers['/펫먹이주기'](player, args, replier, sender, account);
            return;
        }
        var itemData = GameData.items[argString];
        if (!player.hasItem(argString)) {
            replier.reply('⚠️ [' + argString + '] 아이템이 없습니다.');
        } else if (!itemData || typeof itemData.effect !== 'function') {
            replier.reply('⚠️ [' + argString + '] 아이템은 사용할 수 없는 종류입니다.');
        } else {
            var effectMsg = itemData.effect(player);
            player.removeItem(argString, 1);
            var inRaid = player.party && raidSession[player.party];
            if (inRaid) {
                var status = raidSession[player.party].memberStatus.find(function(m) { return m.sender === sender; });
                if (status) {
                    status.hp = player.hp;
                    status.maxHp = player.getMaxHp();
                }
            }
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply(effectMsg);
        }
    },
    '/장착': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply("⚠️ 장착할 아이템 이름을 입력해주세요. 예: /장착 단검");
            return;
        }
        var itemData = GameData.items[argString];
        if (!player.hasItem(argString)) {
            replier.reply('⚠️ [' + argString + '] 아이템이 없습니다.');
            return;
        }
        if (!itemData || (itemData.type !== 'weapon' && itemData.type !== 'armor' && itemData.type !== 'shield')) {
            replier.reply('⚠️ [' + argString + '] 아이템은 장착할 수 없는 종류입니다.');
            return;
        }
        var itemType = itemData.type;
        if (player.equipment[itemType] && player.equipment[itemType].name) {
            player.addItem(player.equipment[itemType].name, 1);
        }
        player.equipment[itemType] = { name: argString, dura: itemData.maxDura };
        player.removeItem(argString, 1);
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply('✅ [' + argString + '] 을(를) 장착했습니다.');
    },
    '/해제': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        var slotEng = { '무기': 'weapon', '갑옷': 'armor', '방패': 'shield' }[argString];
        if (!slotEng) {
            replier.reply('⚠️ 해제할 부위를 정확히 입력해주세요. (무기, 갑옷, 방패)');
            return;
        }
        var equippedItem = player.equipment[slotEng];
        if (!equippedItem || !equippedItem.name) {
            replier.reply('⚠️ 해당 부위에 장착한 아이템이 없습니다.');
        } else {
            var itemName = equippedItem.name;
            player.equipment[slotEng] = { name: null, dura: 0 };
            player.addItem(itemName);
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply('✅ [' + itemName + '] 장착을 해제했습니다.');
        }
    },
    '/수리': function(player, args, replier, sender, account) {
        var part = args[0];
        if (!part) {
            replier.reply("⚠️ 수리할 부위를 입력해주세요. (무기, 갑옷, 방패, 전체)");
            return;
        }
        var partsToRepair = [];
        if (part === '전체') {
            partsToRepair = ['weapon', 'armor', 'shield'];
        } else {
            var slotEng = { '무기': 'weapon', '갑옷': 'armor', '방패': 'shield' }[part];
            if (!slotEng) {
                replier.reply("⚠️ 수리할 부위를 정확히 입력해주세요. (무기, 갑옷, 방패, 전체)");
                return;
            }
            partsToRepair.push(slotEng);
        }
        var totalCost = 0;
        var repairedItems = [];
        partsToRepair.forEach(function(slot) {
            var equip = player.equipment[slot];
            if (equip && equip.name) {
                var itemData = GameData.items[equip.name];
                var missingDura = itemData.maxDura - equip.dura;
                if (missingDura > 0) {
                    var cost = Math.ceil((itemData.price * Config.REPAIR_COST_MULTIPLIER) * (missingDura / itemData.maxDura));
                    totalCost += cost;
                    repairedItems.push({ slot: slot, cost: cost, name: equip.name });
                }
            }
        });
        if (repairedItems.length === 0) {
            replier.reply("✅ 수리할 장비가 없습니다.");
            return;
        }
        if (player.gold < totalCost) {
            replier.reply("⚠️ 수리 비용이 부족합니다. (필요: " + totalCost + " G)");
            return;
        }
        player.gold -= totalCost;
        repairedItems.forEach(function(item) {
            var itemData = GameData.items[item.name];
            player.equipment[item.slot].dura = itemData.maxDura;
        });
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply("🔧 장비 수리를 완료했습니다. (비용: " + totalCost + " G)");
    },
    '/퀘스트': function(player, args, replier, sender, account) {
        var msg = '--- 퀘스트 목록 ---\n';
        if (Object.keys(player.activeQuests).length === 0) {
            msg += '진행 중인 퀘스트가 없습니다.\n';
        } else {
            Object.keys(player.activeQuests).forEach(function(questName) {
                var quest = player.activeQuests[questName];
                var questData = GameData.quests[questName];
                msg += '• ' + questName + ' (' + quest.current + '/' + questData.count + ')\n' + '  ' + questData.description + '\n';
            });
        }
        msg += '-------------------\n' + '수락 가능: ' + Object.keys(GameData.quests).join(', ');
        replier.reply(msg);
    },
    '/수락': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply("⚠️ 수락할 퀘스트 이름을 입력해주세요.");
            return;
        }
        if (!GameData.quests[argString]) {
            replier.reply('⚠️ 존재하지 않는 퀘스트입니다.');
        } else if (player.activeQuests[argString]) {
            replier.reply('⚠️ 이미 진행 중인 퀘스트입니다.');
        } else {
            player.activeQuests[argString] = { current: 0 };
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply('✅ 퀘스트 [' + argString + ']을(를) 수락했습니다.');
        }
    },
    '/완료': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply("⚠️ 완료할 퀘스트 이름을 입력해주세요.");
            return;
        }
        var questData = GameData.quests[argString];
        var playerQuest = player.activeQuests[argString];
        if (!playerQuest) {
            replier.reply('⚠️ 진행 중인 퀘스트가 아닙니다.');
        } else if (playerQuest.current < questData.count) {
            replier.reply('⚠️ 아직 퀘스트 목표를 달성하지 못했습니다. (현재 ' + playerQuest.current + '/' + questData.count + ')');
        } else {
            var reward = questData.reward;
            player.gold += reward.gold;
            var expMsg = player.addExp(reward.exp);
            var rewardMsg = '✨ 퀘스트 [' + argString + '] 완료! ✨\n' + '보상 골드: ' + reward.gold + ' G\n' + expMsg;
            if (reward.items) {
                reward.items.forEach(function(item) { player.addItem(item); });
                rewardMsg += '\n보상 아이템: ' + reward.items.join(', ');
            }
            delete player.activeQuests[argString];
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply(rewardMsg);
        }
    },
    '/저장': function(player, args, replier, sender, account) {
        account.characters[player.className] = player;
        if (saveAccount(sender, account)) {
            replier.reply('💾 데이터를 성공적으로 저장했습니다.');
        } else {
            replier.reply('⚠️ 데이터 저장에 실패했습니다.');
        }
    },
    '/취침': function(player, args, replier, sender, account) {
        if (player.party) {
            replier.reply("⚠️ 파티에 소속된 동안에는 휴식을 취할 수 없습니다.");
            return;
        }
        restSession[sender] = setTimeout(function() {
            if (restSession[sender]) {
                var currentAccount = accounts[sender];
                if (currentAccount) {
                    var p = currentAccount.characters[currentAccount.activeCharacterName];
                    if (p) {
                        p.hp = p.getMaxHp();
                        p.mp = p.getMaxMp();
                        saveAccount(sender, currentAccount);
                        replier.reply("충분한 휴식을 취해 HP와 MP가 모두 회복되었습니다.");
                    }
                }
                delete restSession[sender];
            }
        }, Config.REST_DURATION);
        replier.reply("휴식을 시작합니다. 5분 후에 HP와 MP가 모두 회복됩니다. (/취침중단 으로 취소)");
    },
    '/취침중단': function(player, args, replier, sender, account) {
        if (restSession[sender]) {
            clearTimeout(restSession[sender]);
            delete restSession[sender];
            replier.reply("휴식을 중단했습니다.");
        }
    },
    '/어비스입장': function(player, args, replier, sender, account) {
        if (!player.party) {
            replier.reply("⚠️ 어비스 던전은 파티를 맺어야만 입장할 수 있습니다.");
            return;
        }
        if (player.party !== sender) {
            replier.reply("⚠️ 파티장만 레이드를 시작할 수 있습니다.");
            return;
        }
        var response = startRaid(sender, replier);
        replier.reply(response);
    },
    '/어비스공격': function(player, args, replier, sender, account) {
        var response = handleRaidAction(sender);
        if (response) {
            replier.reply(response);
        }
    },
    '/어비스포기': function(player, args, replier, sender, account) {
        var leaderSender = player.party;
        var session = raidSession[leaderSender];
        if (!session) {
            replier.reply("⚠️ 현재 진행중인 레이드가 없습니다.");
            return;
        }
        session.party.members.forEach(function(memberSender) {
            var p = players[memberSender];
            if (p) {
                p.hp = 1;
                var pAccount = accounts[p.sender];
                pAccount.characters[p.className] = p;
                saveAccount(p.sender, pAccount);
            }
        });
        delete raidSession[leaderSender];
        replier.reply("레이드를 포기하고 던전에서 탈출했습니다.");
    },
    '/몬스터도감': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply('--- 몬스터 도감 ---\n' + Object.keys(GameData.monsters).join(', ') + '\n\n자세한 정보는 "/몬스터도감 [이름]"을 입력하세요.');
            return;
        }
        var m = GameData.monsters[argString];
        if (!m) {
            replier.reply('해당 몬스터를 찾을 수 없습니다.');
        } else {
            replier.reply('--- ' + m.name + ' 정보 ---\n' +
                '• HP: ' + m.hp + '\n' +
                '• 공격력: ' + m.att + '\n' +
                '• 방어력: ' + m.def + '\n' +
                '• 획득 EXP: ' + m.exp + '\n' +
                '• 획득 골드: ' + m.gold + '\n' +
                '• 드랍 아이템: ' + m.items.join(', '));
        }
    },
    '/아이템도감': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply('--- 아이템 도감 ---\n' + Object.keys(GameData.items).join(', ') + '\n\n자세한 정보는 "/아이템도감 [이름]"을 입력하세요.');
            return;
        }
        var i = GameData.items[argString];
        if (!i) {
            replier.reply('해당 아이템을 찾을 수 없습니다.');
        } else {
            var msg = '--- ' + i.name + ' 정보 ---\n' +
                '• 종류: ' + i.type + '\n' +
                '• 가격: ' + (i.price ? i.price + ' G' : '판매불가') + '\n';
            if (i.att) msg += '• 공격력: ' + i.att + '\n';
            if (i.def) msg += '• 방어력: ' + i.def + '\n';
            if (i.maxDura) msg += '• 최대 내구도: ' + i.maxDura + '\n';
            if (i.description) msg += '• 설명: ' + i.description + '\n';
            replier.reply(msg.trim());
        }
    },
    '/파티생성': function(player, args, replier, sender, account) {
        if (player.party) {
            replier.reply("⚠️ 이미 다른 파티에 소속되어 있습니다.");
            return;
        }
        parties[sender] = { leader: sender, members: [sender] };
        player.party = sender;
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply("🎉 파티를 생성했습니다. 다른 플레이어를 초대하려면 /파티초대 [이름] 을 사용하세요.");
    },
    '/파티초대': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!player.party || parties[player.party].leader !== sender) {
            replier.reply("⚠️ 파티장만 다른 플레이어를 초대할 수 있습니다.");
            return;
        }
        if (!argString) {
            replier.reply("⚠️ 초대할 플레이어의 이름을 입력해주세요.");
            return;
        }
        var invitedSender = findSenderByName(argString);
        if (!invitedSender) {
            replier.reply("⚠️ '" + argString + "' 플레이어를 찾을 수 없거나 오프라인 상태입니다.");
            return;
        }
        var invitedPlayer = players[invitedSender];
        if (invitedPlayer.party) {
            replier.reply("⚠️ 해당 플레이어는 이미 다른 파티에 소속되어 있습니다.");
            return;
        }
        if (invitations[invitedSender]) {
            replier.reply("⚠️ 해당 플레이어는 이미 다른 파티의 초대를 기다리는 중입니다.");
            return;
        }
        invitations[invitedSender] = sender;
        replier.reply("✅ " + argString + "님에게 파티 초대를 보냈습니다. 상대방이 /파티수락 으로 응답해야 합니다.");
    },
    '/파티수락': function(player, args, replier, sender, account) {
        var inviterSender = invitations[sender];
        if (!inviterSender) {
            replier.reply("⚠️ 받은 파티 초대가 없습니다.");
            return;
        }
        if (player.party) {
            replier.reply("⚠️ 이미 다른 파티에 소속되어 있습니다.");
            delete invitations[sender];
            return;
        }
        var party = parties[inviterSender];
        if (!party) {
            replier.reply("⚠️ 초대했던 파티가 해산되었습니다.");
            delete invitations[sender];
            return;
        }
        party.members.push(sender);
        player.party = inviterSender;
        delete invitations[sender];
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply("✅ " + players[inviterSender].name + "님의 파티에 참가했습니다.");
    },
    '/파티탈퇴': function(player, args, replier, sender, account) {
        if (!player.party) {
            replier.reply("⚠️ 소속된 파티가 없습니다.");
            return;
        }
        var leaderSender = player.party;
        var party = parties[leaderSender];
        var index = party.members.indexOf(sender);
        if (index > -1) {
            party.members.splice(index, 1);
        }
        player.party = null;
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply("파티에서 탈퇴했습니다.");
    },
    '/파티해산': function(player, args, replier, sender, account) {
        if (!player.party || parties[player.party].leader !== sender) {
            replier.reply("⚠️ 파티장이 아니므로 파티를 해산할 수 없습니다. /파티탈퇴 를 이용해주세요.");
            return;
        }
        var party = parties[sender];
        party.members.forEach(function(memberSender) {
            var memberAccount = accounts[memberSender];
            if (memberAccount) {
                var p = memberAccount.characters[memberAccount.activeCharacterName];
                if (p) {
                    p.party = null;
                    saveAccount(memberSender, memberAccount);
                }
            }
        });
        delete parties[sender];
        replier.reply("파티를 해산했습니다.");
    },
    '/파티정보': function(player, args, replier, sender, account) {
        if (!player.party) {
            replier.reply("⚠️ 소속된 파티가 없습니다.");
            return;
        }
        var party = parties[player.party];
        if (!party) {
            player.party = null;
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply("오류: 소속된 파티 정보를 찾을 수 없습니다. 파티에서 자동으로 탈퇴됩니다.");
            return;
        }
        var partyInfo = "--- 파티 정보 ---\n";
        party.members.forEach(function(memberSender) {
            var member = players[memberSender];
            if (member) {
                var role = (memberSender === party.leader) ? " (파티장)" : "";
                partyInfo += "• " + member.name + " (Lv." + member.level + " " + member.className + ")" + role + "\n";
            }
        });
        replier.reply(partyInfo.trim());
    },
    '/낚시': function(player, args, replier, sender, account) {
        var delay = Math.floor(Math.random() * (Config.FISHING_DELAY_MAX - Config.FISHING_DELAY_MIN + 1)) + Config.FISHING_DELAY_MIN;
        fishingSession[sender] = setTimeout(function() {
            if (fishingSession[sender]) {
                var currentAccount = accounts[sender];
                if (currentAccount) {
                    var p = currentAccount.characters[currentAccount.activeCharacterName];
                    if (p) {
                        var allFish = Object.keys(GameData.fish);
                        var caughtFishName = allFish[Math.floor(Math.random() * allFish.length)];
                        var fishData = GameData.fish[caughtFishName];
                        var size = Math.floor(p.fishingLevel * (0.8 + Math.random() * 0.4) * 10);
                        p.fishInventory.push({ name: caughtFishName, size: size });
                        var expGained = Math.floor(size * 0.5) + (fishData.basePrice * 2);
                        var expMsg = p.addFishingExp(expGained);
                        replier.reply('🎉 ' + size + 'cm 짜리 ' + caughtFishName + '을(를) 낚았다!\n' + expMsg);
                        saveAccount(sender, currentAccount);
                    }
                }
                delete fishingSession[sender];
            }
        }, delay);
        replier.reply("🎣 낚시를 시작합니다. 잠시 후 자동으로 물고기를 낚습니다... (/낚시중지 로 취소)");
    },
    '/낚시중지': function(player, args, replier, sender, account) {
        if (fishingSession[sender]) {
            clearTimeout(fishingSession[sender]);
            delete fishingSession[sender];
            replier.reply("낚시를 중단했습니다.");
        }
    },
    '/수산시장': function(player, args, replier, sender, account) {
        marketSession[sender] = { map: {} };
        var marketList = "--- 수산시장 ---\n";
        var hasItem = false;
        var displayIndex = 1;
        Object.keys(market).forEach(function(sellerSender) {
            market[sellerSender].forEach(function(fish, itemIndex) {
                hasItem = true;
                marketList += '• (' + displayIndex + ') ' + fish.name + ' ' + fish.size + 'cm - ' + fish.price + 'G (판매자: ' + fish.sellerName + ')\n';
                marketSession[sender].map[displayIndex] = {
                    sellerSender: sellerSender,
                    itemIndex: itemIndex
                };
                displayIndex++;
            });
        });
        if (!hasItem) { marketList += "현재 등록된 물고기가 없습니다.\n"; }
        marketList += '----------------\n/시장구매 [번호] 로 구매 가능';
        replier.reply(marketList);
    },
    '/시장등록': function(player, args, replier, sender, account) {
        if (args.length < 3) { replier.reply("⚠️ 사용법: /시장등록 [이름] [크기] [가격]"); return; }
        var fishName = args[0]; var fishSize = parseInt(args[1]); var price = parseInt(args[2]);
        if (isNaN(fishSize) || isNaN(price) || price <= 0) { replier.reply("⚠️ 크기와 가격은 0보다 큰 숫자로 입력해주세요."); return; }
        var fishIndex = player.fishInventory.findIndex(function(f) { return f.name === fishName && f.size === fishSize; });
        if (fishIndex === -1) { replier.reply("⚠️ 해당 물고기가 어류 보관함에 없습니다."); return; }
        if (!market[sender]) { market[sender] = []; }
        market[sender].push({ name: fishName, size: fishSize, price: price, sellerName: player.name });
        player.fishInventory.splice(fishIndex, 1);
        saveData(Config.MARKET_DATA_FILE, market);
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply('✅ ' + fishName + ' ' + fishSize + 'cm를 ' + price + 'G에 수산시장에 등록했습니다.');
    },
    '/시장구매': function(player, args, replier, sender, account) {
        if (args.length < 1) { replier.reply("⚠️ 사용법: /시장구매 [번호]"); return; }
        var itemNumber = parseInt(args[0]);
        if (isNaN(itemNumber) || itemNumber < 1) { replier.reply("⚠️ 번호는 1 이상의 숫자로 입력해주세요."); return; }
        var sessionMap = marketSession[sender] && marketSession[sender].map;
        if (!sessionMap || !sessionMap[itemNumber]) {
            replier.reply("⚠️ 해당 번호의 판매 정보가 없습니다. /수산시장 명령어로 목록을 다시 확인해주세요.");
            return;
        }
        var purchaseInfo = sessionMap[itemNumber];
        var sellerSender = purchaseInfo.sellerSender;
        var itemIndex = purchaseInfo.itemIndex;
        if (!market[sellerSender] || !market[sellerSender][itemIndex]) {
            replier.reply("⚠️ 해당 아이템은 이미 판매되었거나 등록이 취소되었습니다. /수산시장 명령어로 목록을 다시 확인해주세요.");
            return;
        }
        var fishToBuy = market[sellerSender][itemIndex];
        if (player.gold < fishToBuy.price) { replier.reply("⚠️ 골드가 부족합니다."); return; }
        var sellerAccount = accounts[sellerSender] || loadAccount(sellerSender);
        if (!sellerAccount) {
            replier.reply("⚠️ 판매자 정보를 찾을 수 없어 거래를 취소합니다.");
            return;
        }
        var sellerPlayer = sellerAccount.characters[sellerAccount.activeCharacterName];
        player.gold -= fishToBuy.price;
        player.fishInventory.push({ name: fishToBuy.name, size: fishToBuy.size });
        sellerPlayer.gold += fishToBuy.price;
        market[sellerSender].splice(itemIndex, 1);
        if (market[sellerSender].length === 0) { delete market[sellerSender]; }
        saveData(Config.MARKET_DATA_FILE, market);
        account.characters[player.className] = player;
        saveAccount(sender, account);
        saveAccount(sellerSender, sellerAccount);
        delete marketSession[sender].map[itemNumber];
        replier.reply('✅ ' + sellerPlayer.name + '님으로부터 ' + fishToBuy.name + ' ' + fishToBuy.size + 'cm를 ' + fishToBuy.price + 'G에 구매했습니다.');
    },
    '/상자열기': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply("⚠️ 열고 싶은 상자 이름을 입력해주세요. (예: /상자열기 낡은 보물상자)");
            return;
        }
        var boxData = GameData.treasureBoxes[argString];
        if (!boxData) { replier.reply("존재하지 않는 보물상자입니다."); return; }
        if (!player.hasItem(argString)) { replier.reply("해당 보물상자를 가지고 있지 않습니다."); return; }
        var totalWeight = boxData.reduce(function(sum, reward) { return sum + reward.weight; }, 0);
        var random = Math.random() * totalWeight;
        var cumulativeWeight = 0;
        var reward = null;
        for (var i = 0; i < boxData.length; i++) {
            cumulativeWeight += boxData[i].weight;
            if (random < cumulativeWeight) {
                reward = boxData[i];
                break;
            }
        }
        if (reward) {
            player.removeItem(argString, 1);
            player.addItem(reward.item, reward.count);
            account.characters[player.className] = player;
            saveAccount(sender, account);
            replier.reply("🎁 " + argString + "에서 [" + reward.item + "] " + reward.count + "개를 획득했습니다!");
        } else {
            replier.reply("알 수 없는 오류로 보물상자를 열 수 없습니다.");
        }
    },
    '/조합법': function(player, args, replier, sender, account) {
        var msg = "--- 아이템 조합법 ---\n";
        for (var itemName in GameData.combinationRecipes) {
            var recipe = GameData.combinationRecipes[itemName];
            msg += " • [" + itemName + "] (비용: " + recipe.cost + "G)\n";
            recipe.materials.forEach(function(mat) {
                msg += "    └ 재료: " + mat.name + " x" + mat.count + "\n";
            });
        }
        msg += "--------------------\n/조합 [아이템이름] 으로 제작";
        replier.reply(msg);
    },
    '/조합': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply("⚠️ 조합할 아이템 이름을 입력해주세요. /조합법 으로 목록 확인");
            return;
        }
        var recipe = GameData.combinationRecipes[argString];
        if (!recipe) {
            replier.reply("⚠️ 존재하지 않는 조합법입니다.");
            return;
        }
        if (player.gold < recipe.cost) {
            replier.reply("⚠️ 조합 비용이 부족합니다. (필요 골드: " + recipe.cost + "G)");
            return;
        }
        var canCraft = recipe.materials.every(function(mat) {
            return player.hasItem(mat.name, mat.count);
        });
        if (!canCraft) {
            replier.reply("⚠️ 재료가 부족합니다. /조합법 을 다시 확인해주세요.");
            return;
        }
        player.gold -= recipe.cost;
        recipe.materials.forEach(function(mat) {
            player.removeItem(mat.name, mat.count);
        });
        player.addItem(recipe.result.name, recipe.result.count);
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply("🛠️ [" + recipe.result.name + "] " + recipe.result.count + "개 조합에 성공했습니다!");
    },
    '/요리법': function(player, args, replier, sender, account) {
        var msg = "--- 요리법 ---\n";
        for (var recipeName in GameData.cookingRecipes) {
            var recipe = GameData.cookingRecipes[recipeName];
            var itemInfo = GameData.items[recipe.result.name];
            msg += " • [" + recipeName + "] (비용: " + recipe.cost + "G) - " + itemInfo.description + "\n";
            msg += "    └ 재료: " + recipe.fish.name + " x" + recipe.fish.count + "\n";
        }
        msg += "--------------------\n/요리 [요리이름] 으로 제작";
        replier.reply(msg);
    },
    '/요리': function(player, args, replier, sender, account) {
        var argString = args.join(' ');
        if (!argString) {
            replier.reply("⚠️ 요리할 음식 이름을 입력해주세요. /요리법 으로 목록 확인");
            return;
        }
        var recipe = GameData.cookingRecipes[argString];
        if (!recipe) {
            replier.reply("⚠️ 존재하지 않는 요리법입니다.");
            return;
        }
        if (player.gold < recipe.cost) {
            replier.reply("⚠️ 요리 비용이 부족합니다. (필요 골드: " + recipe.cost + "G)");
            return;
        }
        if (!player.hasFish(recipe.fish.name, recipe.fish.count)) {
            replier.reply("⚠️ 재료 물고기가 부족합니다. (" + recipe.fish.name + " 필요)");
            return;
        }
        player.gold -= recipe.cost;
        player.removeFish(recipe.fish.name, recipe.fish.count);
        player.addItem(recipe.result.name, recipe.result.count);
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply("🍳 [" + recipe.result.name + "] " + recipe.result.count + "개 요리를 완성했습니다!");
    },
    '/거래신청': function(player, args, replier, sender, account) {
        var targetName = args.join(' ');
        if (!targetName) { replier.reply("⚠️ 거래를 신청할 플레이어의 이름을 입력해주세요."); return; }
        if (targetName === player.name) { replier.reply("⚠️ 자기 자신과는 거래할 수 없습니다."); return; }
        var targetSender = findSenderByName(targetName);
        if (!targetSender) { replier.reply("⚠️ '" + targetName + "' 플레이어를 찾을 수 없거나 오프라인 상태입니다."); return; }
        if (tradeRequests[targetSender] || tradeSessions[targetSender]) { replier.reply("⚠️ 상대방은 지금 다른 거래를 하거나 요청을 받는 중입니다."); return; }
        tradeRequests[targetSender] = sender;
        replier.reply("✅ " + targetName + "님에게 거래를 신청했습니다. 상대방이 /거래수락 또는 /거래거절 로 응답해야 합니다.");
    },
    '/거래수락': function(player, args, replier, sender, account) {
        var requesterSender = tradeRequests[sender];
        if (!requesterSender) { replier.reply("⚠️ 받은 거래 신청이 없습니다."); return; }
        var requesterPlayer = players[requesterSender];
        if (!requesterPlayer || tradeSessions[requesterSender]) {
            replier.reply("⚠️ 요청자가 다른 거래를 시작하여 거래할 수 없습니다.");
            delete tradeRequests[sender];
            return;
        }
        var sessionId = sender + requesterSender;
        tradeSessions[requesterSender] = sessionId;
        tradeSessions[sender] = sessionId;
        tradeSessions[sessionId] = {
            p1: { sender: requesterSender, gold: 0, items: [], confirmed: false },
            p2: { sender: sender, gold: 0, items: [], confirmed: false }
        };
        delete tradeRequests[sender];
        replier.reply("✅ " + requesterPlayer.name + "님과의 거래를 시작합니다.\n" + getTradeStatus(tradeSessions[sessionId]));
    },
    '/거래거절': function(player, args, replier, sender, account) {
        var requesterSender = tradeRequests[sender];
        if (!requesterSender) { replier.reply("⚠️ 받은 거래 신청이 없습니다."); return; }
        delete tradeRequests[sender];
        replier.reply("거래 신청을 거절했습니다.");
    },
    '/거래취소': function(player, args, replier, sender, account) {
        var sessionId = tradeSessions[sender];
        if (!sessionId) { replier.reply("⚠️ 거래 중이 아닙니다."); return; }
        endTrade(sessionId, replier, "거래가 취소되었습니다.");
    },
    '/거래올리기': function(player, args, replier, sender, account) {
        var sessionId = tradeSessions[sender];
        if (!sessionId) { replier.reply("⚠️ 거래 중이 아닙니다."); return; }
        var count = parseInt(args[args.length - 1]);
        var itemName = args.join(' ');
        if (!isNaN(count)) {
            itemName = args.slice(0, -1).join(' ');
        } else {
            count = 1;
        }
        if (count <= 0) { replier.reply("⚠️ 올바른 수량을 입력해주세요."); return; }
        if (!player.hasItem(itemName, count)) { replier.reply("⚠️ 해당 아이템을 소지하고 있지 않거나 수량이 부족합니다."); return; }
        var session = tradeSessions[sessionId];
        var myOffer = (session.p1.sender === sender) ? session.p1 : session.p2;
        player.removeItem(itemName, count);
        var existingItem = myOffer.items.find(function(i) { return i.name === itemName; });
        if (existingItem) {
            existingItem.count += count;
        } else {
            myOffer.items.push({ name: itemName, count: count });
        }
        session.p1.confirmed = false;
        session.p2.confirmed = false;
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply(getTradeStatus(session));
    },
    '/거래골드': function(player, args, replier, sender, account) {
        var sessionId = tradeSessions[sender];
        if (!sessionId) { replier.reply("⚠️ 거래 중이 아닙니다."); return; }
        var amount = parseInt(args.join(' '));
        if (isNaN(amount) || amount <= 0) { replier.reply("⚠️ 올바른 골드를 입력해주세요."); return; }
        if (player.gold < amount) { replier.reply("⚠️ 소지한 골드가 부족합니다."); return; }
        var session = tradeSessions[sessionId];
        var myOffer = (session.p1.sender === sender) ? session.p1 : session.p2;
        player.gold -= amount;
        myOffer.gold += amount;
        session.p1.confirmed = false;
        session.p2.confirmed = false;
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply(getTradeStatus(session));
    },
    '/거래확인': function(player, args, replier, sender, account) {
        var sessionId = tradeSessions[sender];
        if (!sessionId) { replier.reply("⚠️ 거래 중이 아닙니다."); return; }
        var session = tradeSessions[sessionId];
        var myInfo = (session.p1.sender === sender) ? session.p1 : session.p2;
        var partnerInfo = (session.p1.sender === sender) ? session.p2 : session.p1;
        if (myInfo.confirmed) { replier.reply("⚠️ 이미 확인을 눌렀습니다. 상대방을 기다려주세요."); return; }
        myInfo.confirmed = true;
        if (partnerInfo.confirmed) {
            var p1Account = accounts[session.p1.sender];
            var p2Account = accounts[session.p2.sender];
            if (!p1Account || !p2Account) {
                endTrade(sessionId, replier, "⚠️ 상대방이 오프라인 상태가 되어 거래를 취소합니다.");
                return;
            }
            var p1 = p1Account.characters[p1Account.activeCharacterName];
            var p2 = p2Account.characters[p2Account.activeCharacterName];
            p1.gold += session.p2.gold;
            p2.gold += session.p1.gold;
            session.p1.items.forEach(function(item) { p2.addItem(item.name, item.count); });
            session.p2.items.forEach(function(item) { p1.addItem(item.name, item.count); });
            saveAccount(p1.sender, p1Account);
            saveAccount(p2.sender, p2Account);
            delete tradeSessions[p1.sender];
            delete tradeSessions[p2.sender];
            delete tradeSessions[sessionId];
            replier.reply("🎉 거래가 성공적으로 완료되었습니다!");
        } else {
            replier.reply("✅ 거래 내용을 확인했습니다. 상대방이 확인할 때까지 기다려주세요.\n" + getTradeStatus(session));
        }
    },
    '/로또': function(player, args, replier, sender, account) {
        var totalTickets = 0;
        for (var p in lottoData.tickets) {
            totalTickets += lottoData.tickets[p];
        }
        var msg = '--- 🍀 행운의 로또 🍀 ---\n' +
            ' • 현재 누적 당첨금: ' + lottoData.pot + ' G\n' +
            ' • 티켓 가격: ' + Config.LOTTO_TICKET_PRICE + ' G\n' +
            ' • 총 판매된 티켓 수: ' + totalTickets + ' 장\n' +
            ' • 내 구매 수: ' + (lottoData.tickets[sender] || 0) + ' 장\n' +
            '--------------------------\n' +
            ' • /로또구매 [수량]: 로또 티켓 구매\n' +
            ' • /로또확인: 내 티켓 수 확인\n' +
            ' • /로또추첨: 당첨자 추첨 (1시간마다 가능)';
        if (lottoData.lastWinner) {
            var winnerName = lottoData.lastWinner.name || '(알수없음)';
            msg += '\n • 지난 회차 당첨자: ' + winnerName + ' (' + lottoData.lastWinner.pot + ' G)';
        }
        replier.reply(msg);
    },
    '/로또구매': function(player, args, replier, sender, account) {
        var count = parseInt(args[0]) || 1;
        if (isNaN(count) || count <= 0) {
            replier.reply("⚠️ 구매할 티켓 수량을 정확히 입력해주세요.");
            return;
        }
        var totalCost = count * Config.LOTTO_TICKET_PRICE;
        if (player.gold < totalCost) {
            replier.reply("⚠️ 골드가 부족합니다. (필요: " + totalCost + " G)");
            return;
        }
        player.gold -= totalCost;
        lottoData.pot += totalCost;
        lottoData.tickets[sender] = (lottoData.tickets[sender] || 0) + count;
        account.characters[player.className] = player;
        saveAccount(sender, account);
        saveData(Config.LOTTO_DATA_FILE, lottoData);
        replier.reply("✅ 로또 티켓 " + count + "장을 구매했습니다. 행운을 빌어요!\n(현재 내 티켓: " + lottoData.tickets[sender] + "장)");
    },
    '/로또확인': function(player, args, replier, sender, account) {
        replier.reply("🍀 내가 구매한 로또 티켓은 총 " + (lottoData.tickets[sender] || 0) + "장 입니다.");
    },
    '/로또추첨': function(player, args, replier, sender, account) {
        var now = new Date().getTime();
        if (lottoData.lastDrawTime && (now - lottoData.lastDrawTime < Config.LOTTO_DRAW_INTERVAL)) {
            var remaining = Math.ceil((lottoData.lastDrawTime + Config.LOTTO_DRAW_INTERVAL - now) / (60 * 1000));
            replier.reply("⚠️ 다음 추첨까지 " + remaining + "분 남았습니다.");
            return;
        }
        var ticketPool = [];
        for (var pSender in lottoData.tickets) {
            for (var i = 0; i < lottoData.tickets[pSender]; i++) {
                ticketPool.push(pSender);
            }
        }
        if (ticketPool.length === 0) {
            replier.reply("⚠️ 구매된 로또가 없어 추첨할 수 없습니다.");
            return;
        }
        var winnerSender = ticketPool[Math.floor(Math.random() * ticketPool.length)];
        var winnerAccount = accounts[winnerSender] || loadAccount(winnerSender);
        var prize = lottoData.pot;
        var winnerName = "(알수없음)";
        if (winnerAccount) {
            var winnerPlayer = winnerAccount.characters[winnerAccount.activeCharacterName];
            winnerPlayer.gold += prize;
            winnerName = winnerPlayer.name;
            saveAccount(winnerSender, winnerAccount);
        }
        replier.reply("🎉🎉 로또 당첨! 🎉🎉\n\n축하합니다! " + winnerName + "님이 " + prize + " G에 당첨되었습니다!");
        lottoData.lastWinner = { name: winnerName, pot: prize };
        lottoData.pot = Config.INITIAL_LOTTO_POT;
        lottoData.tickets = {};
        lottoData.lastDrawTime = now;
        saveData(Config.LOTTO_DATA_FILE, lottoData);
    },
    '/랭킹': function(player, args, replier, sender, account) {
        var now = Date.now();
        if (now - lastRankingUpdateTime > Config.RANKING_CACHE_DURATION) {
            updateRankingCache();
        }
        if (rankingCache.length === 0) {
            replier.reply("--- 🏆 레벨 랭킹 🏆 ---\n기록된 플레이어가 없습니다.");
            return;
        }
        var rankList = "--- 🏆 레벨 랭킹 🏆 ---\n";
        rankingCache.forEach(function(p, index) {
            rankList += (index + 1) + "위: " + p.name + " (Lv." + p.level + " " + p.className + ")\n";
        });
        replier.reply(rankList.trim());
    },
    '/내캐릭터': function(player, args, replier, sender, account) {
        var msg = "--- 내 캐릭터 목록 ---\n";
        var charList = Object.keys(account.characters);
        if (charList.length === 0) {
            msg += "보유한 캐릭터가 없습니다.";
        } else {
            charList.forEach(function(className) {
                var char = account.characters[className];
                var isActive = (player && char.name === player.name && char.className === player.className) ? " (접속중)" : "";
                msg += "• " + char.name + " (Lv." + char.level + " " + char.className + ")" + isActive + "\n";
            });
        }
        replier.reply(msg.trim());
    },
    '/캐릭터변경': function(player, args, replier, sender, account) {
        var targetClass = args[0];
        if (!targetClass) {
            replier.reply("⚠️ 변경할 캐릭터의 직업을 입력해주세요. 예: /캐릭터변경 마법사");
            return;
        }
        if (!account.characters[targetClass]) {
            replier.reply("⚠️ 해당 직업의 캐릭터를 보유하고 있지 않습니다.");
            return;
        }
        if (player.className === targetClass) {
            replier.reply("⚠️ 이미 해당 캐릭터로 접속해 있습니다.");
            return;
        }
        account.characters[player.className] = player;
        account.activeCharacterName = targetClass;
        players[sender] = account.characters[targetClass];
        saveAccount(sender, account);
        replier.reply("✅ 캐릭터를 '" + players[sender].name + "' (" + targetClass + ")(으)로 변경했습니다.");
    },
    '/전쟁모드': function(player, args, replier, sender, account) {
        player.warMode = !player.warMode;
        account.characters[player.className] = player;
        saveAccount(sender, account);
        if (player.warMode) {
            replier.reply("🔥 전쟁 모드가 활성화되었습니다. 이제 다른 유저와 PK가 가능하며, 경험치를 3% 더 얻습니다.");
        } else {
            replier.reply("🛡️ 전쟁 모드가 비활성화되었습니다.");
        }
    },
    '/pk': function(player, args, replier, sender, account) {
        var targetName = args.join(' ');
        if (!targetName) {
            replier.reply("⚠️ 대결할 상대방의 이름을 입력해주세요.");
            return;
        }
        if (!player.warMode) {
            replier.reply("⚠️ 전쟁 모드를 먼저 활성화해야 합니다. (/전쟁모드)");
            return;
        }
        var targetSender = findSenderByName(targetName);
        if (!targetSender) {
            replier.reply("⚠️ '" + targetName + "' 플레이어를 찾을 수 없거나 오프라인 상태입니다.");
            return;
        }
        var targetPlayer = players[targetSender];
        if (!targetPlayer.warMode) {
            replier.reply("⚠️ 상대방이 전쟁 모드를 활성화하지 않았습니다.");
            return;
        }
        if (sender === targetSender) {
            replier.reply("⚠️ 자기 자신과 대결할 수 없습니다.");
            return;
        }
        if (pvpSession[sender] || pvpSession[targetSender]) {
            replier.reply("⚠️ 당신 또는 상대방이 이미 다른 대결을 진행 중입니다.");
            return;
        }
        var session = {
            p1: player,
            p2: targetPlayer,
            log: [player.name + '이(가) ' + targetPlayer.name + '에게 대결을 신청했다!']
        };
        pvpSession[sender] = session;
        pvpSession[targetSender] = session;
        replier.reply(getPvpStatus(sender));
    },
    '/힐': function(player, args, replier, sender, account) {
        if (player.className !== '힐러') {
            replier.reply("⚠️ 힐러만 사용할 수 있는 스킬입니다.");
            return;
        }
        var targetName = args.join(' ');
        if (!targetName) {
            replier.reply("⚠️ 치유할 대상의 이름을 입력해주세요.");
            return;
        }
        var healSkill = GameData.classes['힐러'].skills['치유'];
        if (player.mp < healSkill.mpCost) {
            replier.reply("⚠️ MP가 부족합니다. (필요 MP: " + healSkill.mpCost + ")");
            return;
        }
        var targetSender = findSenderByName(targetName);
        if (!targetSender) {
            replier.reply("⚠️ '" + targetName + "' 플레이어를 찾을 수 없거나 오프라인 상태입니다.");
            return;
        }
        var targetPlayer = players[targetSender];
        if (!player.party || player.party !== targetPlayer.party) {
            replier.reply("⚠️ 같은 파티에 소속된 대상만 치유할 수 있습니다.");
            return;
        }
        player.mp -= healSkill.mpCost;
        var oldHp = targetPlayer.hp;
        targetPlayer.hp = Math.min(targetPlayer.getMaxHp(), targetPlayer.hp + healSkill.healAmount);
        var healedAmount = targetPlayer.hp - oldHp;
        account.characters[player.className] = player;
        saveAccount(sender, account);
        var targetAccount = accounts[targetSender];
        targetAccount.characters[targetPlayer.className] = targetPlayer;
        saveAccount(targetSender, targetAccount);
        replier.reply("💚 " + targetPlayer.name + "님의 HP를 " + healedAmount + "만큼 회복시켰습니다. (남은 MP: " + player.mp + ")");
    },
    '/강타': function(player, args, replier, sender, account) {
        var currentClassInfo = GameData.classes[player.className];
        if (!currentClassInfo || !currentClassInfo.skills['강타']) {
             replier.reply("⚠️ 현재 직업은 사용할 수 없는 스킬입니다.");
             return;
        }
        if (!battleSession[sender] && !pvpSession[sender]) {
            replier.reply("⚠️ 전투 중에만 사용할 수 있는 스킬입니다.");
            return;
        }
        var skill = currentClassInfo.skills['강타'];
        if (player.mp < skill.mpCost) {
            replier.reply("⚠️ MP가 부족합니다. (필요 MP: " + skill.mpCost + ")");
            return;
        }
        player.mp -= skill.mpCost;
        var damage = Math.floor(player.getAttack() * skill.damageMultiplier);
        var response = "";
        if (battleSession[sender]) {
            var session = battleSession[sender];
            session.monster.hp -= damage;
            session.log = ['💥 강타! ' + session.monster.name + '에게 ' + damage + '의 강력한 데미지!'];
            response = handleBattleAction(sender); // 전투 로직 재실행
        } else if (pvpSession[sender]) {
            var session = pvpSession[sender];
            var defender = (session.p1.sender === sender) ? session.p2 : session.p1;
            defender.hp -= damage;
            session.log = ['💥 강타! ' + defender.name + '에게 ' + damage + '의 강력한 데미지!'];
            response = handlePvpAction(sender); // PvP 로직 재실행
        }
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply(response);
    },
    '/파이어볼': function(player, args, replier, sender, account) {
        var currentClassInfo = GameData.classes[player.className];
        if (!currentClassInfo || !currentClassInfo.skills['파이어볼']) {
             replier.reply("⚠️ 현재 직업은 사용할 수 없는 스킬입니다.");
             return;
        }
        if (!battleSession[sender] && !pvpSession[sender]) {
            replier.reply("⚠️ 전투 중에만 사용할 수 있는 스킬입니다.");
            return;
        }
        var skill = currentClassInfo.skills['파이어볼'];
        if (player.mp < skill.mpCost) {
            replier.reply("⚠️ MP가 부족합니다. (필요 MP: " + skill.mpCost + ")");
            return;
        }
        player.mp -= skill.mpCost;
        var damage = skill.baseDamage + Math.floor(player.getAttack() * 0.5);
        var response = "";
        if (battleSession[sender]) {
            var session = battleSession[sender];
            session.monster.hp -= damage;
            session.log = ['🔥 파이어볼! ' + session.monster.name + '에게 ' + damage + '의 화염 데미지!'];
            response = handleBattleAction(sender);
        } else if (pvpSession[sender]) {
            var session = pvpSession[sender];
            var defender = (session.p1.sender === sender) ? session.p2 : session.p1;
            defender.hp -= damage;
            session.log = ['🔥 파이어볼! ' + defender.name + '에게 ' + damage + '의 화염 데미지!'];
            response = handlePvpAction(sender);
        }
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply(response);
    },
    '/독바르기': function(player, args, replier, sender, account) {
        var currentClassInfo = GameData.classes[player.className];
        if (!currentClassInfo || !currentClassInfo.skills['독바르기']) {
             replier.reply("⚠️ 현재 직업은 사용할 수 없는 스킬입니다.");
             return;
        }
        var skill = currentClassInfo.skills['독바르기'];
        if (player.mp < skill.mpCost) {
            replier.reply("⚠️ MP가 부족합니다. (필요 MP: " + skill.mpCost + ")");
            return;
        }
        player.mp -= skill.mpCost;
        player.buffs.poison = {
            extraDamage: skill.extraDamage,
            expires: Date.now() + skill.duration
        };
        account.characters[player.className] = player;
        saveAccount(sender, account);
        replier.reply("🗡️ 무기에 맹독을 발랐습니다. 5분간 공격 시 추가 데미지를 줍니다.");
    },

    // --- [신규] 전직, 펫 진화 명령어 ---

    '/전직': function(player, args, replier, sender, account) {
        var currentClassInfo = GameData.classes[player.className];
        if (player.jobTier !== 1) {
            return replier.reply("⚠️ 이미 전직을 완료했습니다.");
        }
        if (player.level < 50) {
            return replier.reply("⚠️ 전직은 50레벨 이상부터 가능합니다.");
        }
        if (!player.hasItem('영웅의 증표')) {
            return replier.reply("⚠️ 전직에 필요한 [영웅의 증표]가 없습니다. 전직 퀘스트 '영웅의 길'을 완료하세요.");
        }

        var nextJobs = currentClassInfo.nextJob;
        if (!nextJobs) {
            return replier.reply("오류: 현재 직업의 전직 정보가 없습니다.");
        }

        var targetJob = args[0];
        if (!targetJob || !nextJobs[targetJob]) {
            var jobList = Object.keys(nextJobs).map(function(job) {
                return job + ' (' + nextJobs[job] + ')';
            }).join(', ');
            return replier.reply("⚠️ 전직할 직업을 선택해주세요.\n사용법: /전직 [직업이름]\n선택 가능: " + jobList);
        }

        // 1. 전직 아이템 소모
        player.removeItem('영웅의 증표', 1);

        // 2. 직업 정보 변경
        var oldClassName = player.className;
        var newClassInfo = GameData.classes[targetJob];
        player.className = targetJob;
        player.jobTier = newClassInfo.jobTier;

        // 3. 능력치 재설정 (레벨업 보너스는 유지, 기본 스탯만 변경)
        var levelBonus = (player.level - 1);
        player.baseMaxHp = newClassInfo.hp + (levelBonus * 20);
        player.baseMaxMp = newClassInfo.mp + (levelBonus * 10);
        player.baseAtt = newClassInfo.att + (levelBonus * 3);
        player.baseDef = newClassInfo.def + (levelBonus * 2);
        player.hp = player.getMaxHp();
        player.mp = player.getMaxMp();

        // 4. 데이터 저장
        delete account.characters[oldClassName]; // 이전 직업 데이터 삭제
        account.characters[player.className] = player; // 키를 새 직업으로 변경하여 저장
        account.activeCharacterName = player.className;
        saveAccount(sender, account);

        replier.reply("🎉축하합니다! 성공적으로 [" + targetJob + "](으)로 전직했습니다!🎉\n새로운 능력과 스킬을 확인해보세요!");
    },

    '/펫진화': function(player, args, replier, sender, account) {
        var pet = account.pet;
        if (!pet) {
            return replier.reply("⚠️ 진화시킬 펫이 없습니다.");
        }

        var evolutionInfo = GameData.petEvolutions[pet.type];
        if (!evolutionInfo) {
            return replier.reply("⚠️ [" + pet.name + "]은(는) 더 이상 진화할 수 없는 형태입니다.");
        }

        if (pet.level < evolutionInfo.requiredLevel) {
            return replier.reply("⚠️ 펫 레벨이 부족합니다. (필요 레벨: " + evolutionInfo.requiredLevel + ")");
        }

        var requiredItem = evolutionInfo.requiredItem;
        if (!player.hasItem(requiredItem)) {
            return replier.reply("⚠️ 진화에 필요한 [" + requiredItem + "] 아이템이 없습니다.");
        }

        // 1. 진화 아이템 소모
        player.removeItem(requiredItem, 1);

        // 2. 펫 정보 변경
        var oldPetName = pet.name;
        var oldPetType = pet.type;
        var newPetType = evolutionInfo.evolvesTo;
        var newPetData = GameData.pets[newPetType];

        pet.type = newPetType;
        // 이름이 기본 이름과 같았다면, 진화 후의 기본 이름으로 변경
        if (oldPetName === GameData.pets[oldPetType].name) {
            pet.name = newPetData.name;
        }
        // 진화 후 레벨은 유지, 경험치는 초기화
        pet.exp = 0;
        pet.maxExp = Math.floor(pet.maxExp * 1.2); // 다음 레벨업 필요 경험치 소폭 상승

        // 3. 데이터 저장
        account.characters[player.className] = player; // 아이템 소모 내역 저장을 위해
        saveAccount(sender, account);

        replier.reply("✨ 눈부신 빛과 함께 [" + oldPetName + "]이(가) [" + pet.name + "](으)로 진화했습니다! ✨");
    },


    // --- 펫 시스템 명령어 ---
    '/펫': function(player, args, replier, sender, account) {
        replier.reply(
            '--- 🐾 펫 명령어 🐾 ---\n' +
            ' • /펫정보: 내 펫의 상태를 확인합니다.\n' +
            ' • /펫알부화: 펫 알을 부화시켜 새로운 펫을 얻습니다.\n' +
            ' • /펫먹이주기: 펫에게 먹이를 주어 성장시킵니다.\n' +
            ' • /펫동행: 펫과 함께 다니거나 쉬게 합니다.\n' +
            ' • /펫이름변경 [새이름]: 펫의 이름을 변경합니다.\n' +
            ' • /펫진화: 펫을 다음 단계로 진화시킵니다.'
        );
    },
    '/펫알부화': function(player, args, replier, sender, account) {
        if (account.pet) {
            replier.reply("⚠️ 이미 펫을 보유하고 있습니다. 한 번에 한 마리의 펫만 키울 수 있습니다.");
            return;
        }
        if (!player.hasItem('펫 알')) {
            replier.reply("⚠️ 부화시킬 [펫 알]이 없습니다. 사냥이나 상자를 통해 얻을 수 있습니다.");
            return;
        }

        player.removeItem('펫 알', 1);

        var petTypes = Object.keys(GameData.pets).filter(function(petType) {
            // 진화 전 펫만 부화하도록 필터링
            return !GameData.petEvolutions[petType] || !Object.values(GameData.petEvolutions).some(function(evo) { return evo.evolvesTo === petType; });
        });
        var newPetType = petTypes[Math.floor(Math.random() * petTypes.length)];
        var petData = GameData.pets[newPetType];

        account.pet = {
            name: petData.name,
            type: newPetType,
            level: 1,
            exp: 0,
            maxExp: 100,
            friendship: 0,
            isActive: true // 처음 부화 시 자동으로 동행
        };

        account.characters[player.className] = player;
        saveAccount(sender, account);

        replier.reply("🎉 펫 알에서 [" + newPetType + "]이(가) 부화했습니다! /펫정보 명령어로 확인해보세요!");
    },
    '/펫정보': function(player, args, replier, sender, account) {
        var pet = account.pet;
        if (!pet) {
            replier.reply("⚠️ 보유한 펫이 없습니다. /펫알부화 명령어로 펫을 얻어보세요.");
            return;
        }

        var petData = GameData.pets[pet.type];
        var buffValue = petData.buff.baseValue + (petData.buff.growth * (pet.level - 1));
        var buffTypeKr = { 'att': '공격력', 'def': '방어력', 'maxHp': '최대HP' }[petData.buff.type];

        var msg = '--- 🐾 내 펫 정보 🐾 ---\n' +
            ' • 이름: ' + pet.name + ' (' + pet.type + ')\n' +
            ' • 레벨: ' + pet.level + ' (EXP: ' + pet.exp + '/' + pet.maxExp + ')\n' +
            ' • 친밀도: ' + pet.friendship + '\n' +
            ' • 상태: ' + (pet.isActive ? '동행중' : '휴식중') + '\n' +
            ' • 능력: ' + petData.description + '\n' +
            ' • 동행효과: ' + buffTypeKr + ' +' + buffValue;

        var evolutionInfo = GameData.petEvolutions[pet.type];
        if (evolutionInfo) {
            msg += '\n • 진화정보: Lv.' + evolutionInfo.requiredLevel + ' 달성 및 [' + evolutionInfo.requiredItem + '] 사용 시 [' + evolutionInfo.evolvesTo + '](으)로 진화 가능';
        }

        replier.reply(msg);
    },
    '/펫먹이주기': function(player, args, replier, sender, account) {
        var pet = account.pet;
        if (!pet) {
            replier.reply("⚠️ 먹이를 줄 펫이 없습니다.");
            return;
        }
        if (!player.hasItem('펫 먹이')) {
            replier.reply("⚠️ [펫 먹이]가 부족합니다. 상점에서 구매하거나 조합할 수 있습니다.");
            return;
        }

        player.removeItem('펫 먹이', 1);
        pet.friendship += 5;
        var expGain = 20;
        var levelUpMsg = addPetExp(pet, expGain);

        account.characters[player.className] = player;
        saveAccount(sender, account);

        var replyMsg = "펫 [" + pet.name + "]에게 먹이를 주었습니다. 친밀도가 5 올랐습니다.\n" + levelUpMsg;
        replier.reply(replyMsg);
    },
    '/펫동행': function(player, args, replier, sender, account) {
        var pet = account.pet;
        if (!pet) {
            replier.reply("⚠️ 함께할 펫이 없습니다.");
            return;
        }
        pet.isActive = !pet.isActive;
        saveAccount(sender, account);
        if (pet.isActive) {
            replier.reply("✅ [" + pet.name + "]과(와) 함께 모험을 시작합니다.");
        } else {
            replier.reply("✅ [" + pet.name + "]이(가) 휴식을 시작합니다.");
        }
    },
    '/펫이름변경': function(player, args, replier, sender, account) {
        var pet = account.pet;
        if (!pet) {
            replier.reply("⚠️ 이름을 변경할 펫이 없습니다.");
            return;
        }
        var newName = args.join(' ');
        if (!newName) {
            replier.reply("⚠️ 변경할 펫의 이름을 입력해주세요. 예: /펫이름변경 용용이");
            return;
        }
        if (newName.length > 10) {
            replier.reply("⚠️ 펫 이름은 10자 이하로 설정해주세요.");
            return;
        }
        var oldName = pet.name;
        pet.name = newName;
        saveAccount(sender, account);
        replier.reply("✅ 펫의 이름이 '" + oldName + "'에서 '" + newName + "'(으)로 변경되었습니다.");
    }
};

// -------------------------------------------
// 8. 메인 응답 처리 함수 (Response)
// -------------------------------------------
function checkPlayerState(player, cmd) {
    var sender = player.sender;
    var state = null;
    var allowedCommands = [];
    var message = "";
    var alwaysAllowed = ['/내정보', '/인벤토리', '/장비', '/퀘스트', '/내캐릭터', '/저장', '/도움말', '/명령어', '/펫', '/펫정보', '/캐릭터변경'];
    var combatSkills = ['/강타', '/파이어볼', '/힐', '/독바르기']; // 전투 중에만 사용 가능한 스킬 목록 расширение

    if (battleSession[sender]) {
        state = "battle";
        allowedCommands = ['/공격', '/도망', '/사용'].concat(combatSkills).concat(alwaysAllowed);
        message = getBattleStatus(sender);
    } else if (pvpSession[sender]) {
        state = "pvp";
        allowedCommands = ['/공격', '/도망', '/사용'].concat(combatSkills).concat(alwaysAllowed);
        message = getPvpStatus(sender);
    } else if (player.party && raidSession[player.party]) {
        state = "raid";
        allowedCommands = ['/어비스공격', '/어비스포기', '/사용'].concat(combatSkills).concat(alwaysAllowed);
        message = getRaidStatus(player.party);
    } else if (restSession[sender]) {
        state = "rest";
        allowedCommands = ['/취침중단'].concat(alwaysAllowed);
        message = "현재 휴식 중입니다... (/취침중단 으로 취소)";
    } else if (fishingSession[sender]) {
        state = "fishing";
        allowedCommands = ['/낚시중지'].concat(alwaysAllowed);
        message = "현재 낚시 중입니다... (/낚시중지 로 취소)";
    } else if (shopSession[sender]) {
        state = "shop";
        allowedCommands = ['/구매', '/나가기'].concat(alwaysAllowed);
        message = "현재 상점 이용 중입니다... (/구매, /나가기 사용 가능)";
    } else if (tradeSessions[sender]) {
        state = "trade";
        allowedCommands = ['/거래올리기', '/거래골드', '/거래확인', '/거래취소'].concat(alwaysAllowed);
        message = "현재 거래 중입니다... (/거래취소 로 취소)";
    }

    if (state && allowedCommands.indexOf(cmd) === -1) {
        return "⚠️ 다른 행동 중에는 이 명령어를 사용할 수 없습니다.\n" + message;
    }
    return null;
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (!msg.startsWith('/')) {
        return;
    }

    var account = accounts[sender];
    if (!account) {
        account = loadAccount(sender);
        if (account) {
            accounts[sender] = account;
        }
    }
    if (!account) {
        account = { activeCharacterName: null, characters: {}, pet: null };
        accounts[sender] = account;
    }

    var player = null;
    if (account.activeCharacterName && account.characters[account.activeCharacterName]) {
        player = account.characters[account.activeCharacterName];
        players[sender] = player;
    }

    var cmd = msg.split(' ')[0];
    var args = msg.split(' ').slice(1);

    if (!player) {
        var allowedGuestCommands = ['/생성', '/rpg', '/명령어', '/도움말', '/내캐릭터', '/캐릭터변경'];
        if (allowedGuestCommands.indexOf(cmd) !== -1) {
            commandHandlers[cmd](null, args, replier, sender, account);
        } else {
            replier.reply('🌳 묘냥의 숲에 오신 것을 환영합니다! 🌳\n"/생성 [이름] [직업]"으로 먼저 캐릭터를 만들어주세요.');
        }
        return;
    }

    var stateViolationMessage = checkPlayerState(player, cmd);
    if (stateViolationMessage) {
        replier.reply(stateViolationMessage);
        return;
    }

    var handler = commandHandlers[cmd];
    if (handler) {
        try {
            handler(player, args, replier, sender, account);
        } catch (e) {
            Log.e("명령어 " + cmd + " 실행 중 오류 발생: " + e + " (Line: " + e.lineNumber + ")");
            replier.reply("죄송합니다. 명령어 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.");
        }
    } else {
        replier.reply("⚠️ 알 수 없는 명령어입니다. /명령어 또는 /도움말 을 확인해주세요.");
    }
}

(function() {
    updateRankingCache();
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function(predicate) {
                if (this == null) { throw new TypeError('"this" is null or not defined'); }
                var o = Object(this);
                var len = o.length >>> 0;
                if (typeof predicate !== 'function') { throw new TypeError('predicate must be a function'); }
                var thisArg = arguments[1];
                var k = 0;
                while (k < len) {
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) { return kValue; }
                    k++;
                }
                return undefined;
            }
        });
    }
    if (!Array.prototype.findIndex) {
        Object.defineProperty(Array.prototype, 'findIndex', {
            value: function(predicate) {
                if (this == null) { throw new TypeError('"this" is null or not defined'); }
                var o = Object(this);
                var len = o.length >>> 0;
                if (typeof predicate !== 'function') { throw new TypeError('predicate must be a function'); }
                var thisArg = arguments[1];
                var k = 0;
                while (k < len) {
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) { return k; }
                    k++;
                }
                return -1;
            }
        });
    }
    if (!Array.prototype.every) {
        Object.defineProperty(Array.prototype, 'every', {
            value: function(callbackfn, thisArg) {
                'use strict';
                var T, k;
                if (this == null) { throw new TypeError('this is null or not defined'); }
                var O = Object(this);
                var len = O.length >>> 0;
                if (typeof callbackfn !== 'function') { throw new TypeError(); }
                if (arguments.length > 1) { T = thisArg; }
                k = 0;
                while (k < len) {
                    var kValue;
                    if (k in O) {
                        kValue = O[k];
                        var testResult = callbackfn.call(T, kValue, k, O);
                        if (!testResult) { return false; }
                    }
                    k++;
                }
                return true;
            }
        });
    }
    if (!Array.prototype.reduce) {
        Object.defineProperty(Array.prototype, 'reduce', {
            value: function(callback) {
                if (this === null) { throw new TypeError('Array.prototype.reduce called on null or undefined'); }
                if (typeof callback !== 'function') { throw new TypeError(callback + ' is not a function'); }
                var o = Object(this);
                var len = o.length >>> 0;
                var k = 0;
                var value;
                if (arguments.length >= 2) {
                    value = arguments[1];
                } else {
                    while (k < len && !(k in o)) { k++; }
                    if (k >= len) { throw new TypeError('Reduce of empty array with no initial value'); }
                    value = o[k++];
                }
                while (k < len) {
                    if (k in o) { value = callback(value, o[k], k, o); }
                    k++;
                }
                return value;
            }
        });
    }
    if (!Array.prototype.filter) {
        Object.defineProperty(Array.prototype, 'filter', {
            value: function(func, thisArg) {
                'use strict';
                if (!((typeof func === 'Function' || typeof func === 'function') && this)) throw new TypeError();
                var len = this.length >>> 0,
                    res = new Array(len),
                    t = this, c = 0, i = -1;
                var thisContext = thisArg === undefined ? this : thisArg;
                while (++i !== len) {
                    if (i in this) {
                        if (func.call(thisContext, t[i], i, t)) {
                            res[c++] = t[i];
                        }
                    }
                }
                res.length = c;
                return res;
            }
        });
    }
    if (typeof String.prototype.startsWith !== 'function') {
        String.prototype.startsWith = function(str) {
            return this.slice(0, str.length) === str;
        };
    }
    if (!Array.prototype.map) {
        Object.defineProperty(Array.prototype, 'map', {
            value: function(callback, thisArg) {
                var T, A, k;
                if (this == null) { throw new TypeError('this is null or not defined'); }
                var O = Object(this);
                var len = O.length >>> 0;
                if (typeof callback !== 'function') { throw new TypeError(callback + ' is not a function'); }
                if (arguments.length > 1) { T = thisArg; }
                A = new Array(len);
                k = 0;
                while (k < len) {
                    var kValue, mappedValue;
                    if (k in O) {
                        kValue = O[k];
                        mappedValue = callback.call(T, kValue, k, O);
                        A[k] = mappedValue;
                    }
                    k++;
                }
                return A;
            }
        });
    }
    if (!Object.values) {
        Object.values = function(obj) {
            var values = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    values.push(obj[key]);
                }
            }
            return values;
        };
    }
    if (!Array.prototype.some) {
        Object.defineProperty(Array.prototype, 'some', {
            value: function(fun /*, thisArg */) {
                'use strict';
                if (this == null) { throw new TypeError('Array.prototype.some called on null or undefined'); }
                if (typeof fun !== 'function') { throw new TypeError(); }
                var t = Object(this);
                var len = t.length >>> 0;
                var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
                for (var i = 0; i < len; i++) {
                    if (i in t && fun.call(thisArg, t[i], i, t)) {
                        return true;
                    }
                }
                return false;
            }
        });
    }
})();


