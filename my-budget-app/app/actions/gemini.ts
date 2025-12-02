'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

interface Transaction {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
}

export async function analyzeSpending(transactions: Transaction[]) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Gemini API Key is missing');
    return {
      success: false,
      message: 'API Key가 설정되지 않았습니다. .env 파일을 확인해주세요.',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 데이터 요약
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, amount]) => `${cat}: ${amount.toLocaleString()}원`)
      .join(', ');

    const prompt = `
      당신은 재정 전문가 AI입니다. 다음은 사용자의 최근 소비 내역 요약입니다.
      
      - 총 수입: ${totalIncome.toLocaleString()}원
      - 총 지출: ${totalExpense.toLocaleString()}원
      - 잔액: ${(totalIncome - totalExpense).toLocaleString()}원
      - 지출 상위 카테고리: ${topCategories}
      
      이 데이터를 바탕으로 사용자의 소비 습관을 분석하고, 앞으로의 재정 관리에 대한 구체적이고 실질적인 조언을 3가지 항목으로 나누어 제공해주세요. 
      친근하고 격려하는 어조로 작성해주세요. 한국어로 답변해주세요.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: text,
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
    });
    return {
      success: false,
      message: `분석 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`,
    };
  }
}
