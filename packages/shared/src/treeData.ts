import {treeNodeFactory} from './factories/treeNodeFactory';
import type {TreeNode} from './types/tree';

/**
 * 단위 프로젝트 생성 헬퍼
 */
function project(id: string, name: string, code: string, manager: string, budget: number, spent: number): TreeNode {
    return treeNodeFactory.build({
        id,
        name,
        code,
        manager,
        category: '단위 프로젝트',
        budget,
        spent
    });
}

/**
 * 부서 생성 헬퍼 (하위 프로젝트들의 예산과 집행액을 자동 롤업 합산)
 */
function department(id: string, name: string, code: string, manager: string, children: TreeNode[]): TreeNode {
    let budget = 0;
    let spent = 0;
    for (let i = 0; i < children.length; i++) {
        budget += children[i].budget ?? 0;
        spent += children[i].spent ?? 0;
    }
    return treeNodeFactory.build({
        id,
        name,
        code,
        manager,
        category: '부서',
        budget,
        spent,
        children
    });
}

/**
 * 사업본부 생성 헬퍼 (하위 부서들의 예산과 집행액을 자동 롤업 합산)
 */
function division(id: string, name: string, code: string, manager: string, children: TreeNode[]): TreeNode {
    let budget = 0;
    let spent = 0;
    for (let i = 0; i < children.length; i++) {
        budget += children[i].budget ?? 0;
        spent += children[i].spent ?? 0;
    }
    return treeNodeFactory.build({
        id,
        name,
        code,
        manager,
        category: '사업본부',
        budget,
        spent,
        children
    });
}

/**
 * 수식과 상태 검증, 상위 계층 예산/실적 자동 집계가 적용된 전사 8대 사업본부 조직/프로젝트 트리 데이터셋
 */
export const mockTreeData: TreeNode[] = [
    division('ORG-1000', '모빌리티DX사업본부', 'DX-001', '김경영 본부장', [
        department('ORG-1100', '스마트팩토리기획팀', 'DX-110', '박지훈 팀장', [
            project('PRJ-1101', '조립 라인 IoT 센서 네트워크 구축', 'PRJ-101', '이현우 수석', 120_000_000, 115_000_000),
            project('PRJ-1102', '차세대 MES 관제 플랫폼 라이선스', 'PRJ-102', '정다은 책임', 130_000_000, 105_000_000)
        ]),
        department('ORG-1200', '품질혁신추진팀', 'DX-120', '최동진 팀장', [
            project('PRJ-1201', 'AI 표면 비전 결함 검사기 도입', 'PRJ-201', '강서윤 선임', 150_000_000, 140_000_000),
            project('PRJ-1202', '통합 공정 데이터 품질 모니터링', 'PRJ-202', '송민호 책임', 100_000_000, 60_000_000)
        ])
    ]),
    division('ORG-2000', '글로벌IT인프라운영본부', 'IT-001', '한상우 본부장', [
        department('ORG-2100', '클라우드인프라팀', 'IT-210', '윤태호 팀장', [
            project('PRJ-2101', '하이브리드 클라우드 엣지 서버 랙', 'PRJ-301', '임수진 책임', 180_000_000, 175_000_000),
            project('PRJ-2102', '초고속 백본 네트워크 증설', 'PRJ-302', '오세훈 수석', 120_000_000, 110_000_000)
        ]),
        department('ORG-2200', '정보보안운영팀', 'IT-220', '조은영 팀장', [
            project('PRJ-2201', '산업제어망 방화벽 체계 고도화', 'PRJ-401', '배진우 선임', 90_000_000, 70_000_000),
            project('PRJ-2202', '단말 보안 관제 솔루션 교체', 'PRJ-402', '신현아 책임', 60_000_000, 35_000_000)
        ])
    ]),
    division('ORG-3000', 'AI로보틱스혁신본부', 'AI-001', '정유진 본부장', [
        department('ORG-3100', '자율주행로봇개발팀', 'AI-310', '곽민수 팀장', [
            project(
                'PRJ-3101',
                '물류센터 AMR 자율이송로봇 군집제어',
                'PRJ-501',
                '서지훈 수석',
                200_000_000,
                190_000_000
            ),
            project('PRJ-3102', '로봇 주행 실시간 3D SLAM 라이다', 'PRJ-502', '한예슬 선임', 150_000_000, 130_000_000)
        ]),
        department('ORG-3200', '지능형비전연구팀', 'AI-320', '임재원 팀장', [
            project('PRJ-3201', '초고속 다객체 추적 비전 AI 모델', 'PRJ-601', '노태양 책임', 140_000_000, 135_000_000),
            project('PRJ-3202', '임베디드 온디바이스 NPU 추론 엔진', 'PRJ-602', '유소은 책임', 110_000_000, 85_000_000)
        ])
    ]),
    division('ORG-4000', '친환경에너지연구본부', 'GR-001', '문창현 본부장', [
        department('ORG-4100', '차세대배터리셀팀', 'GR-410', '장하늘 팀장', [
            project(
                'PRJ-4101',
                '전고체 배터리 고체전해질 나노 합성',
                'PRJ-701',
                '구본승 수석',
                180_000_000,
                160_000_000
            ),
            project(
                'PRJ-4102',
                '고에너지밀도 양극재 코팅 공정 파일럿',
                'PRJ-702',
                '백지영 선임',
                140_000_000,
                120_000_000
            )
        ]),
        department('ORG-4200', '신재생그리드팀', 'GR-420', '황보선 팀장', [
            project('PRJ-4201', '분산형 태양광 스마트 ESS 연계망', 'PRJ-801', '엄태웅 책임', 130_000_000, 110_000_000),
            project(
                'PRJ-4202',
                '전력 계통 주파수 안정화 양방향 인버터',
                'PRJ-802',
                '권보라 연구원',
                100_000_000,
                80_000_000
            )
        ])
    ]),
    division('ORG-5000', '디지털트윈·시뮬레이션사업본부', 'TW-001', '강승우 본부장', [
        department('ORG-5100', '스마트팩토리가상화팀', 'TW-510', '고은별 팀장', [
            project(
                'PRJ-5101',
                '가상 제조 라인 실시간 디지털 트윈 동기화',
                'PRJ-901',
                '서동현 수석',
                160_000_000,
                150_000_000
            ),
            project(
                'PRJ-5102',
                '공정 병목 사전 예측 3D 물리 시뮬레이션',
                'PRJ-902',
                '임채원 선임',
                120_000_000,
                105_000_000
            )
        ]),
        department('ORG-5200', '시뮬레이션엔진연구팀', 'TW-520', '배성훈 팀장', [
            project(
                'PRJ-5201',
                '초고속 유체/열역학 CAE 분산 연산 클러스터',
                'PRJ-911',
                '정하윤 책임',
                140_000_000,
                125_000_000
            ),
            project(
                'PRJ-5202',
                '실시간 다물체 충돌 해석 GPU 가속기',
                'PRJ-912',
                '문태오 연구원',
                100_000_000,
                80_000_000
            )
        ])
    ]),
    division('ORG-6000', '항공우주소재연구본부', 'AS-001', '송하경 본부장', [
        department('ORG-6100', '초경량복합소재팀', 'AS-610', '차승원 팀장', [
            project(
                'PRJ-6101',
                '우주발사체 노즐 탄소나노튜브 하이브리드 코팅',
                'PRJ-1001',
                '안성준 수석',
                210_000_000,
                195_000_000
            ),
            project(
                'PRJ-6102',
                '극저온 액체수소 저장용 복합소재 압력용기',
                'PRJ-1002',
                '이진아 선임',
                170_000_000,
                145_000_000
            )
        ]),
        department('ORG-6200', '특수내열합금팀', 'AS-620', '류지형 팀장', [
            project(
                'PRJ-6201',
                '초음속 내열 니켈계 단결정 초합금 주조',
                'PRJ-1011',
                '천도현 책임',
                170_000_000,
                145_000_000
            ),
            project(
                'PRJ-6202',
                '세라믹 기지 복합재(CMC) 가스 터빈 블레이드',
                'PRJ-1012',
                '김도연 연구원',
                130_000_000,
                105_000_000
            )
        ])
    ]),
    division('ORG-7000', '스마트바이오헬스본부', 'BIO-001', '선우진 본부장', [
        department('ORG-7100', '유전체빅데이터플랫폼팀', 'BIO-710', '황예진 팀장', [
            project(
                'PRJ-7101',
                '전사체 단일세포 시퀀싱 고속 분석 파이프라인',
                'PRJ-1101',
                '지승현 수석',
                150_000_000,
                135_000_000
            ),
            project(
                'PRJ-7102',
                '신약 후보물질 가상 스크리닝 분자 도킹 AI',
                'PRJ-1102',
                '윤하은 책임',
                110_000_000,
                95_000_000
            )
        ]),
        department('ORG-7200', '원격의료모니터링팀', 'BIO-720', '민경훈 팀장', [
            project(
                'PRJ-7201',
                '실시간 생체신호 모니터링 무선 패치 솔루션',
                'PRJ-1111',
                '신동엽 선임',
                120_000_000,
                100_000_000
            ),
            project(
                'PRJ-7202',
                '의무기록(EMR) 자동 요약 의료 LLM 관제 시스템',
                'PRJ-1112',
                '배수빈 연구원',
                100_000_000,
                80_000_000
            )
        ])
    ]),
    division('ORG-8000', '글로벌공급망·물류최적화본부', 'SCM-001', '함석주 본부장', [
        department('ORG-8100', '스마트SCM운영팀', 'SCM-810', '허남규 팀장', [
            project(
                'PRJ-8101',
                '글로벌 복합 해상운송 경로 최적화 및 탄소 추적',
                'PRJ-1201',
                '강민재 수석',
                170_000_000,
                155_000_000
            ),
            project(
                'PRJ-8102',
                'AI 기반 부품 수요 예측 및 재고 자동 발주',
                'PRJ-1202',
                '서지수 책임',
                130_000_000,
                115_000_000
            )
        ]),
        department('ORG-8200', '풀필먼트자동화팀', 'SCM-820', '주성현 팀장', [
            project(
                'PRJ-8201',
                '고속 셔틀 기반 자동 입출고 시스템(AS/RS) 연계',
                'PRJ-1211',
                '손우혁 책임',
                140_000_000,
                125_000_000
            ),
            project(
                'PRJ-8202',
                '다품종 소량 부품 분류 비전 피킹 셀',
                'PRJ-1212',
                '전혜원 선임',
                100_000_000,
                85_000_000
            )
        ])
    ])
];
