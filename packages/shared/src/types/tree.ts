export interface TreeNode {
    id: string;
    name: string;
    code: string;
    manager: string;
    category: string;
    budget: number;
    spent: number;
    achievementRate: number;
    status: '정상' | '주의' | '초과';
    children?: TreeNode[];
}
