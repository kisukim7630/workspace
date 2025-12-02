'use client';

import { useState } from 'react';
import { analyzeSpending } from '../actions/gemini';
import ReactMarkdown from 'react-markdown';

interface Transaction {
    id: number;
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
    date: Date;
}

interface AIGuideProps {
    transactions: Transaction[];
}

export default function AIGuide({ transactions }: AIGuideProps) {
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        setIsOpen(true);
        try {
            const result = await analyzeSpending(transactions);
            if (result.success) {
                setAnalysis(result.message || '분석 결과가 없습니다.');
            } else {
                setAnalysis(result.message || '오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('AI Analysis Error:', error);
            setAnalysis('분석 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-600 flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                        />
                    </svg>
                    AI 소비 분석
                </h2>
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            분석 중...
                        </>
                    ) : (
                        '분석 시작'
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    {loading ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-purple-200 rounded w-3/4"></div>
                            <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                            <div className="h-4 bg-purple-200 rounded w-5/6"></div>
                        </div>
                    ) : (
                        <div className="prose prose-purple max-w-none text-gray-700 whitespace-pre-wrap">
                            {analysis}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
