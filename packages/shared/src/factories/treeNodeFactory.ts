import {Factory} from 'fishery';
import type {TreeNode} from '../types/tree';

export const treeNodeFactory = Factory.define<TreeNode>(({sequence, params}) => {
    const budget = params.budget ?? 100_000_000;
    const spent = params.spent ?? Math.round(budget * (0.6 + ((sequence * 7) % 45) / 100));

    // 수식: 집행률 자동 계산
    const rawRate = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const achievementRate = params.achievementRate ?? rawRate;

    // 비즈니스 룰: 상태 판별
    let status: '정상' | '주의' | '초과' = '정상';
    if (achievementRate > 100) {
        status = '초과';
    } else if (achievementRate < 70) {
        status = '주의';
    }

    return {
        id: params.id ?? `NODE-${String(sequence).padStart(4, '0')}`,
        name: params.name ?? `단위 프로젝트 ${sequence}`,
        code: params.code ?? `PRJ-${String(sequence).padStart(3, '0')}`,
        manager: params.manager ?? '담당자',
        category: params.category ?? '단위 프로젝트',
        budget,
        spent,
        achievementRate,
        status: params.status ?? status,
        children: params.children
    };
});
