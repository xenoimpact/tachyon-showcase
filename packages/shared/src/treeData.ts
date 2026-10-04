import {treeNodeFactory} from './factories/treeNodeFactory';
import type {TreeNode} from './types/tree';

/**
 * treeNodeFactory를 활용하여 수식과 상태가 검증된 3단계 계층 조직/프로젝트 트리 데이터셋
 */
export const mockTreeData: TreeNode[] = [
    treeNodeFactory.build({
        id: 'ORG-1000',
        name: '모빌리티DX사업본부',
        code: 'DX-001',
        manager: '김경영 본부장',
        category: '사업본부',
        budget: 500_000_000,
        spent: 420_000_000,
        children: [
            treeNodeFactory.build({
                id: 'ORG-1100',
                name: '스마트팩토리기획팀',
                code: 'DX-110',
                manager: '박지훈 팀장',
                category: '부서',
                budget: 250_000_000,
                spent: 220_000_000,
                children: [
                    treeNodeFactory.build({
                        id: 'PRJ-1101',
                        name: '조립 라인 IoT 센서 네트워크 구축',
                        code: 'PRJ-101',
                        manager: '이현우 수석',
                        category: '단위 프로젝트',
                        budget: 120_000_000,
                        spent: 115_000_000
                    }),
                    treeNodeFactory.build({
                        id: 'PRJ-1102',
                        name: '차세대 MES 관제 플랫폼 라이선스',
                        code: 'PRJ-102',
                        manager: '정다은 책임',
                        category: '단위 프로젝트',
                        budget: 130_000_000,
                        spent: 105_000_000
                    })
                ]
            }),
            treeNodeFactory.build({
                id: 'ORG-1200',
                name: '품질혁신추진팀',
                code: 'DX-120',
                manager: '최동진 팀장',
                category: '부서',
                budget: 250_000_000,
                spent: 200_000_000,
                children: [
                    treeNodeFactory.build({
                        id: 'PRJ-1201',
                        name: 'AI 표면 비전 결함 검사기 도입',
                        code: 'PRJ-201',
                        manager: '강서윤 선임',
                        category: '단위 프로젝트',
                        budget: 150_000_000,
                        spent: 140_000_000
                    }),
                    treeNodeFactory.build({
                        id: 'PRJ-1202',
                        name: '통합 공정 데이터 품질 모니터링',
                        code: 'PRJ-202',
                        manager: '송민호 책임',
                        category: '단위 프로젝트',
                        budget: 100_000_000,
                        spent: 60_000_000
                    })
                ]
            })
        ]
    }),
    treeNodeFactory.build({
        id: 'ORG-2000',
        name: '글로벌IT인프라운영본부',
        code: 'IT-001',
        manager: '한상우 본부장',
        category: '사업본부',
        budget: 450_000_000,
        spent: 390_000_000,
        children: [
            treeNodeFactory.build({
                id: 'ORG-2100',
                name: '클라우드인프라팀',
                code: 'IT-210',
                manager: '윤태호 팀장',
                category: '부서',
                budget: 300_000_000,
                spent: 285_000_000,
                children: [
                    treeNodeFactory.build({
                        id: 'PRJ-2101',
                        name: '하이브리드 클라우드 엣지 서버 랙',
                        code: 'PRJ-301',
                        manager: '임수진 책임',
                        category: '단위 프로젝트',
                        budget: 180_000_000,
                        spent: 175_000_000
                    }),
                    treeNodeFactory.build({
                        id: 'PRJ-2102',
                        name: '초고속 백본 네트워크 증설',
                        code: 'PRJ-302',
                        manager: '오세훈 수석',
                        category: '단위 프로젝트',
                        budget: 120_000_000,
                        spent: 110_000_000
                    })
                ]
            }),
            treeNodeFactory.build({
                id: 'ORG-2200',
                name: '정보보안운영팀',
                code: 'IT-220',
                manager: '조은영 팀장',
                category: '부서',
                budget: 150_000_000,
                spent: 105_000_000,
                children: [
                    treeNodeFactory.build({
                        id: 'PRJ-2201',
                        name: '산업제어망 방화벽 체계 고도화',
                        code: 'PRJ-401',
                        manager: '배진우 선임',
                        category: '단위 프로젝트',
                        budget: 90_000_000,
                        spent: 70_000_000
                    }),
                    treeNodeFactory.build({
                        id: 'PRJ-2202',
                        name: '단말 보안 관제 솔루션 교체',
                        code: 'PRJ-402',
                        manager: '신현아 책임',
                        category: '단위 프로젝트',
                        budget: 60_000_000,
                        spent: 35_000_000
                    })
                ]
            })
        ]
    })
];
