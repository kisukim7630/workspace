'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import AIGuide from './components/AIGuide';
import LunchRecommendation from './components/LunchRecommendation';
import LunchVoting, { type LunchVotingRef } from './components/LunchVoting';
import ImageGenerator from './components/ImageGenerator';

type TransactionType = 'income' | 'expense';

interface Category {
  id?: number;
  name: string;
  icon: string;
  is_default?: boolean;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: Date;
}

// 카테고리별 아이콘 컴포넌트
const CategoryIcon = ({ category }: { category: string }) => {
  const iconMap: Record<string, React.ReactElement> = {
    식비: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    교통: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    쇼핑: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    월급: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    기타: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <span className="inline-flex items-center">
      {iconMap[category] || iconMap['기타']}
    </span>
  );
};

// 달력 컴포넌트
const Calendar = ({
  transactions,
  currentMonth,
  onMonthChange,
}: {
  transactions: Transaction[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 해당 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 이전 달로 이동
  const prevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  // 다음 달로 이동
  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  // 날짜별 거래 금액 계산
  const getDayTransactions = (day: number) => {
    const date = new Date(year, month, day);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const dayTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= dayStart && tDate <= dayEnd;
    });

    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, total: income - expense };
  };

  // 오늘 날짜 확인
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {year}년 {monthNames[month]}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const { income, expense, total } = getDayTransactions(day);
          const today = isToday(day);

          return (
            <div
              key={day}
              className={`aspect-square border border-gray-200 rounded-lg p-1 flex flex-col items-center justify-center ${today ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'
                }`}
            >
              <span
                className={`text-xs font-medium mb-1 ${today ? 'text-blue-600' : 'text-gray-700'
                  }`}
              >
                {day}
              </span>
              {income > 0 && (
                <span className="text-[10px] text-blue-600 font-medium">
                  +{formatAmountShort(income)}
                </span>
              )}
              {expense > 0 && (
                <span className="text-[10px] text-red-600 font-medium">
                  -{formatAmountShort(expense)}
                </span>
              )}
              {income === 0 && expense === 0 && (
                <span className="text-[10px] text-gray-400">-</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 짧은 금액 포맷팅 (천 단위 이상만 표시)
const formatAmountShort = (value: number): string => {
  if (value >= 10000) {
    return `${Math.floor(value / 10000)}만`;
  } else if (value >= 1000) {
    return `${Math.floor(value / 1000)}천`;
  }
  return value.toString();
};

// 파이 차트 컴포넌트
const PieChart = ({
  data,
  type,
}: {
  data: { category: string; amount: number; percentage: number }[];
  type: TransactionType;
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        데이터가 없습니다
      </div>
    );
  }

  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#F97316', // orange-500
  ];

  let currentAngle = -90;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg width="200" height="200" className="flex-shrink-0">
        {data.map((item, index) => {
          const angle = (item.percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;

          const x1 =
            centerX + radius * Math.cos((startAngle * Math.PI) / 180);
          const y1 =
            centerY + radius * Math.sin((startAngle * Math.PI) / 180);
          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z',
          ].join(' ');

          return (
            <path
              key={item.category}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="flex-1 space-y-2">
        {data.map((item, index) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: colors[index % colors.length],
              }}
            />
            <span className="text-sm text-gray-700 flex-1">
              {item.category}
            </span>
            <span className="text-sm font-medium text-gray-900">
              ₩{item.amount.toLocaleString('ko-KR')}
            </span>
            <span className="text-sm text-gray-500">
              ({item.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  // 기본 카테고리
  const defaultCategories: Category[] = [
    { name: '식비', icon: '식비' },
    { name: '교통', icon: '교통' },
    { name: '쇼핑', icon: '쇼핑' },
    { name: '월급', icon: '월급' },
    { name: '기타', icon: '기타' },
  ];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('기타');
  const [type, setType] = useState<TransactionType>('expense');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const lunchVotingRef = useRef<LunchVotingRef>(null);

  // 날짜 상태 (기본값: 현재 날짜/시간)
  const getCurrentDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const [transactionDate, setTransactionDate] = useState<string>(getCurrentDateTimeString());

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      setLoading(true);

      // 거래 내역 로드
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (transactionsError) {
        console.error('거래 내역 로드 오류:', transactionsError);
      } else {
        const formattedTransactions: Transaction[] = (transactionsData || []).map(
          (t) => ({
            id: t.id,
            amount: parseFloat(t.amount),
            description: t.description,
            category: t.category,
            type: t.type as TransactionType,
            date: new Date(t.date),
          })
        );
        setTransactions(formattedTransactions);
      }

      // 카테고리 로드
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) {
        console.error('카테고리 로드 오류:', categoriesError);
      } else {
        const loadedCategories: Category[] = (categoriesData || []).map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          is_default: c.is_default,
        }));
        if (loadedCategories.length > 0) {
          setCategories(loadedCategories);
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 금액 포맷팅 함수
  const formatAmount = (value: number): string => {
    return value.toLocaleString('ko-KR');
  };

  // 총 수입 계산
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 총 지출 계산
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 잔액 계산
  const balance = totalIncome - totalExpense;

  // 거래 추가
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('금액을 입력해주세요.');
      return;
    }

    try {
      const transactionAmount = parseFloat(amount.replace(/,/g, ''));
      const selectedDate = new Date(transactionDate);

      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            amount: transactionAmount,
            description: description || '내용 없음',
            category,
            type,
            date: selectedDate.toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('거래 추가 오류:', error);
        alert('거래 추가에 실패했습니다.');
        return;
      }

      const newTransaction: Transaction = {
        id: data.id,
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        type: data.type as TransactionType,
        date: new Date(data.date),
      };

      setTransactions([newTransaction, ...transactions]);
      setAmount('');
      setDescription('');
      setCategory('기타');
      setType('expense');
      setTransactionDate(getCurrentDateTimeString());
    } catch (error) {
      console.error('거래 추가 오류:', error);
      alert('거래 추가에 실패했습니다.');
    }
  };

  // 거래 삭제
  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('거래 삭제 오류:', error);
        alert('거래 삭제에 실패했습니다.');
        return;
      }

      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error('거래 삭제 오류:', error);
      alert('거래 삭제에 실패했습니다.');
    }
  };

  // 금액 입력 처리 (숫자만 허용)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const numValue = parseInt(value, 10);
      setAmount(numValue.toLocaleString('ko-KR'));
    } else {
      setAmount('');
    }
  };

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }
    if (categories.some((c) => c.name === newCategoryName.trim())) {
      alert('이미 존재하는 카테고리입니다.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategoryName.trim(),
            icon: '기타',
            is_default: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('카테고리 추가 오류:', error);
        alert('카테고리 추가에 실패했습니다.');
        return;
      }

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        is_default: data.is_default,
      };

      setCategories([...categories, newCategory]);
      setNewCategoryName('');
    } catch (error) {
      console.error('카테고리 추가 오류:', error);
      alert('카테고리 추가에 실패했습니다.');
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (categoryName: string) => {
    // 기본 카테고리는 삭제 불가
    const categoryToDelete = categories.find((c) => c.name === categoryName);
    if (categoryToDelete?.is_default) {
      alert('기본 카테고리는 삭제할 수 없습니다.');
      return;
    }
    // 사용 중인 카테고리는 삭제 불가
    if (transactions.some((t) => t.category === categoryName)) {
      alert('사용 중인 카테고리는 삭제할 수 없습니다.');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', categoryName);

      if (error) {
        console.error('카테고리 삭제 오류:', error);
        alert('카테고리 삭제에 실패했습니다.');
        return;
      }

      setCategories(categories.filter((c) => c.name !== categoryName));
      if (category === categoryName) {
        setCategory('기타');
      }
    } catch (error) {
      console.error('카테고리 삭제 오류:', error);
      alert('카테고리 삭제에 실패했습니다.');
    }
  };

  // 파이 차트 데이터 계산
  const getPieChartData = (transactionType: TransactionType) => {
    const filtered = transactions.filter((t) => t.type === transactionType);
    const categoryTotals: Record<string, number> = {};

    filtered.forEach((t) => {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + t.amount;
    });

    const total = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0
    );

    return Object.entries(categoryTotals)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: total > 0 ? (amt / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // 최신순 정렬
  const sortedTransactions = [...transactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const today = new Date();
    const transactionDate = new Date(date);
    const diffTime = today.getTime() - transactionDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `오늘 ${transactionDate.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (diffDays === 1) {
      return `어제 ${transactionDate.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return transactionDate.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-center text-gray-800">가계부</h1>

        {/* 점심 메뉴 추천 */}
        <LunchRecommendation onMenusAdded={() => lunchVotingRef.current?.refresh()} />

        {/* 점심 메뉴 투표 */}
        <LunchVoting ref={lunchVotingRef} />

        {/* AI 이미지 생성기 */}
        <ImageGenerator />

        {/* 달력 카드 */}
        <Calendar
          transactions={transactions}
          currentMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
        />

        {/* 요약 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">총 수입</p>
              <p className="text-2xl font-bold text-blue-600">
                ₩{formatAmount(totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">총 지출</p>
              <p className="text-2xl font-bold text-red-600">
                ₩{formatAmount(totalExpense)}
              </p>
            </div>
            <div
              className={`rounded-lg p-4 ${balance >= 0 ? 'bg-green-50' : 'bg-orange-50'
                }`}
            >
              <p className="text-sm text-gray-600 mb-1">잔액</p>
              <p
                className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-orange-600'
                  }`}
              >
                ₩{formatAmount(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* AI 소비 분석 가이드 */}
        <AIGuide transactions={transactions} />

        {/* 그래프 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 수입 파이 차트 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              수입 분석
            </h2>
            <PieChart data={getPieChartData('income')} type="income" />
          </div>

          {/* 지출 파이 차트 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              지출 분석
            </h2>
            <PieChart data={getPieChartData('expense')} type="expense" />
          </div>
        </div>

        {/* 입력 폼 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            수입/지출 기록
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 수입/지출 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구분
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="income"
                    checked={type === 'income'}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="mr-2"
                  />
                  <span className="text-blue-600 font-medium">수입</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="expense"
                    checked={type === 'expense'}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">지출</span>
                </label>
              </div>
            </div>

            {/* 금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                금액 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 점심값, 월급"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 및 시간
              </label>
              <input
                type="datetime-local"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  카테고리
                </label>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="카테고리 관리"
                  title="카테고리 관리"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <CategoryIcon category={category} />
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              기록하기
            </button>
          </form>
        </div>

        {/* 기록 목록 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            기록 목록
          </h2>
          {sortedTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              기록된 내역이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${transaction.type === 'income'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-red-50 border-red-500'
                    }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${transaction.type === 'income'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-red-200 text-red-800'
                          }`}
                      >
                        {transaction.type === 'income' ? '수입' : '지출'}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CategoryIcon category={transaction.category} />
                        <span>{transaction.category}</span>
                      </div>
                    </div>
                    <p className="text-gray-800 font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`text-lg font-bold ${transaction.type === 'income'
                        ? 'text-blue-600'
                        : 'text-red-600'
                        }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}₩
                      {formatAmount(transaction.amount)}
                    </p>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="삭제"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 카테고리 관리 모달 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  카테고리 관리
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 카테고리 추가 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 카테고리 추가
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="카테고리 이름"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCategory();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* 카테고리 목록 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  카테고리 목록
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const isDefault = cat.is_default || defaultCategories.some(
                      (dc) => dc.name === cat.name
                    );
                    const isInUse = transactions.some(
                      (t) => t.category === cat.name
                    );
                    const canDelete = !isDefault && !isInUse;

                    return (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={cat.name} />
                          <span className="text-gray-800">{cat.name}</span>
                          {isDefault && (
                            <span className="text-xs text-gray-500">
                              (기본)
                            </span>
                          )}
                          {isInUse && (
                            <span className="text-xs text-gray-500">
                              (사용 중)
                            </span>
                          )}
                        </div>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteCategory(cat.name)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="삭제"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
