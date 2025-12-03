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

    // 최근 거래 내역 상세 정보 (최근 10개)
    const recentTransactions = transactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10)
      .map((t) => `${t.category}: ${t.description} (${t.amount.toLocaleString()}원) - ${t.date.toLocaleDateString('ko-KR')}`)
      .join('\n');

    // 월별 지출 추이 분석
    const monthlyExpenses: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
        monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + t.amount;
      });

    const monthlyTrend = Object.entries(monthlyExpenses)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => `${month}: ${amount.toLocaleString()}원`)
      .join(', ');

    const prompt = `
당신은 재정 전문가 AI입니다. 다음은 사용자의 소비 내역 분석 데이터입니다.

## 📊 재정 요약
- 총 수입: ${totalIncome.toLocaleString()}원
- 총 지출: ${totalExpense.toLocaleString()}원
- 잔액: ${(totalIncome - totalExpense).toLocaleString()}원
- 지출 상위 카테고리: ${topCategories || '데이터 없음'}

## 📈 월별 지출 추이
${monthlyTrend || '데이터 없음'}

## 💳 최근 거래 내역 (최근 10개)
${recentTransactions || '거래 내역이 없습니다.'}

## 📝 분석 요청사항
위 데이터를 바탕으로 다음을 수행해주세요:

1. **소비 패턴 분석**: 사용자의 소비 습관을 심층적으로 분석해주세요.
   - 어떤 카테고리에 가장 많은 지출을 하는지
   - 월별 지출 추이가 어떻게 변하는지
   - 불필요한 지출이나 개선 가능한 부분이 있는지

2. **구체적인 개선 제안**: 앞으로의 재정 관리를 위한 실질적이고 실행 가능한 조언을 3-5가지 제공해주세요.
   - 각 제안은 구체적인 금액이나 비율을 포함해주세요
   - 단기/중기/장기 목표를 구분해주세요

3. **격려와 동기부여**: 친근하고 격려하는 어조로 작성해주세요.

한국어로 답변해주시고, 마크다운 형식을 사용하여 가독성을 높여주세요.
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
