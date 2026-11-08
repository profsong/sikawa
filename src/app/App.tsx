import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePwaUpdate } from './usePwaUpdate';
import { decks, allPrinciples, getDeck } from '../siikawa/decks';
import {
  activePrinciples,
  lessonCount,
  lessonPrinciples,
  localDay,
  addDays,
} from '../siikawa/engine';
import {
  loadSnapshot,
  startLesson,
  startReview,
  startPractice,
  submitAnswer,
  advanceSession,
  saveSettings,
  purchaseRoomItem,
  exportBackup,
  importBackup,
  resetDatabase,
} from '../siikawa/storage';
import type { Snapshot, Session, Attempt, Principle } from '../siikawa/model';
import { Icon, type IconName } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { LearningPath } from '../components/LearningPath';
import { AvatarRoom } from '../features/reviews/AvatarRoom';
import { companionNames } from '../core/avatar';
import { APP_ICON_PATH, APP_NAME } from '../core/branding';

type Tab = 'today' | 'map' | 'reviews' | 'library' | 'progress' | 'settings';
const navigation: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'today', label: '오늘의 탐험', icon: 'home' },
  { id: 'map', label: '모험 지도', icon: 'map' },
  { id: 'reviews', label: '복습함', icon: 'leaf' },
  { id: 'library', label: '나의 원리장', icon: 'book' },
  { id: 'progress', label: '성장 기록', icon: 'chart' },
  { id: 'settings', label: '설정', icon: 'settings' },
];
const subjectOrder = ['수학', '물리', '화학', '생명과학', '지구과학'];
const deckList = [...decks].sort(
  (a, b) =>
    subjectOrder.indexOf(a.principles[0]?.subject) - subjectOrder.indexOf(b.principles[0]?.subject),
);
const phaseLabels = {
  memory: '기억 채우기',
  explore: '원리 탐험',
  explain: '설명 연습',
  mission: '면접 미션',
  retest: '오답 다시 도전',
  review: '원리 테스트',
};
const formatNumber = (value: number) => value.toLocaleString('ko-KR');

function SubjectMark({ subject, small = false }: { subject: string; small?: boolean }) {
  const index = Math.max(0, subjectOrder.indexOf(subject));
  return (
    <span className={`subject-mark subject-${index} ${small ? 'small' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" width="40" height="40">
        {index === 0 ? (
          <>
            <rect x="7" y="3" width="26" height="33" rx="6" fill="#a560e8" />
            <rect x="12" y="8" width="16" height="7" rx="2" fill="#eedaff" />
            <path
              d="M12 22h6m-3-3v6m8-3h6m-17 8h6m5-2 5 5m0-5-5 5"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : index === 1 ? (
          <>
            <path d="m23 2-16 21h12l-2 15 17-22H22Z" fill="#ff9600" />
            <path
              d="m21 5-9 14h7"
              fill="none"
              stroke="#ffc800"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </>
        ) : index === 2 ? (
          <>
            <path
              d="M15 5h10m-8 1v12L7 31q-2 5 4 5h18q6 0 4-5L23 18V6"
              fill="#d9f2ff"
              stroke="#1cb0f6"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path d="m13 25-4 7q-1 2 2 2h18q3 0 2-2l-4-7Z" fill="#1cb0f6" />
            <circle cx="19" cy="27" r="2" fill="white" />
            <circle cx="24" cy="30" r="1.5" fill="white" />
          </>
        ) : index === 3 ? (
          <>
            <path d="M32 5Q4 4 6 25q2 18 21 7Q36 24 32 5" fill="#58cc02" />
            <path
              d="M8 35 27 12m-7 8v-7m-1 9h7m-14 7v-9"
              stroke="#358a00"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="20" cy="20" r="16" fill="#1cb0f6" />
            <path d="m10 8 5 4-3 8-6 1m15-17-2 8 8 4 6-3m-4 11-8-4-6 6 4 9" fill="#58cc02" />
            <ellipse
              cx="20"
              cy="20"
              rx="21"
              ry="7"
              fill="none"
              stroke="#a7e9ff"
              strokeWidth="3"
              transform="rotate(-25 20 20)"
            />
          </>
        )}
      </svg>
    </span>
  );
}
function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
function Evidence({ text, quote, show }: { text: string; quote?: string; show: boolean }) {
  if (!show || !quote || !text.includes(quote)) return <>{text}</>;
  const index = text.indexOf(quote);
  return (
    <>
      {text.slice(0, index)}
      <mark>{quote}</mark>
      {text.slice(index + quote.length)}
    </>
  );
}
function Source({ value }: { value: string }) {
  const urls = value.match(/https?:[^\s)）]+/g) ?? [];
  return (
    <details className="source-details">
      <summary>출제 개념의 참고 자료</summary>
      <p>{value}</p>
      {urls.map((url, i) => (
        <a href={url} target="_blank" rel="noreferrer" key={i}>
          공식 참고 자료 열기 ↗
        </a>
      ))}
    </details>
  );
}
export function App() {
  const [data, setData] = useState<Snapshot>();
  const [tab, setTab] = useState<Tab>('today');
  const [sessionId, setSessionId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const canUpdate = !!data && !busy && !sessionId;
  const { online, offlineReady, updateReady, applyUpdate } = usePwaUpdate(
    canUpdate,
    tab === 'today',
    pending,
  );
  useEffect(() => {
    void loadSnapshot()
      .then(setData)
      .catch(() => setError('기기 저장소를 열지 못했어요. 저장 공간을 확인하고 다시 열어 주세요.'));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = data?.settings.theme ?? 'forest';
  }, [data?.settings.theme]);
  async function run(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
      setData(await loadSnapshot());
    } catch (e) {
      setError(
        e instanceof Error && e.message.length < 180
          ? e.message
          : '처리하지 못했어요. 저장된 기록을 확인한 뒤 다시 시도해 주세요.',
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  function navigate(next: Tab) {
    setTab(next);
    setSessionId(undefined);
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  if (!data)
    return (
      <main className="startup">
        <Mascot />
        <h1>{APP_NAME}</h1>
        <p role="status">{error || '오늘의 원리 탐험을 준비하고 있어요…'}</p>
        {error && (
          <button className="primary" onClick={() => location.reload()}>
            다시 열기
          </button>
        )}
      </main>
    );
  const deck = decks.find((d) => d.id === data.settings.deckId) ?? deckList[0];
  if (!deck)
    return (
      <main className="startup">
        <h1>원리장을 확인해 주세요</h1>
        <p>content/decks 폴더에 원리장을 추가한 뒤 다시 빌드해 주세요.</p>
      </main>
    );
  const principles = activePrinciples(deck),
    count = lessonCount(deck),
    completed = data.sessions.filter(
      (s) => s.kind === 'lesson' && s.deckId === deck.id && s.status === 'completed',
    );
  const completedIndexes = new Set(completed.map((s) => s.lessonIndex));
  const nextIndex = Array.from({ length: count }, (_, i) => i).find(
    (i) => !completedIndexes.has(i),
  );
  const inProgress = data.sessions.find(
    (s) => s.deckId === deck.id && s.kind === 'lesson' && s.status === 'in_progress',
  );
  const focused = data.sessions.find((s) => s.id === sessionId);
  const today = localDay();
  const due = data.reviews.filter((r) => r.dueDay <= today);
  const learned = data.reviews.length;
  const mastered = data.reviews.filter((r) => r.mastered).length;
  const currentPrinciples = lessonPrinciples(deck, inProgress?.lessonIndex ?? nextIndex ?? 0);
  const subject = principles[0]?.subject ?? '수학';
  const avatar = data.settings.avatarId;
  async function begin(index?: number) {
    await run(async () => {
      const session = await startLesson(deck.id, index);
      setSessionId(session.id);
    });
  }
  async function beginReview() {
    await run(async () => {
      const session = await startReview(deck.id);
      setSessionId(session.id);
    });
  }
  const chooseDeck = (id: string) =>
    void run(async () => {
      await saveSettings({ deckId: id });
    });
  const answered =
    focused &&
    data.attempts.find(
      (a) => a.sessionId === focused.id && a.stepId === focused.steps[focused.index]?.id,
    );
  const pageTitle = navigation.find((n) => n.id === tab)?.label ?? '오늘의 탐험';
  return (
    <div className={`app-shell ${focused && focused.status !== 'completed' ? 'is-learning' : ''}`}>
      <div className="workspace">
        <header className="topbar">
          <span className="breadcrumb">{focused ? '원리 탐험' : pageTitle}</span>
          <div className="topbar-right">
            <span className="header-brand">
              <img src={`${import.meta.env.BASE_URL}${APP_ICON_PATH}`} alt="" width={28} height={28} />
              <b>{APP_NAME}</b>
            </span>
            <span className="header-stat xp-stat" aria-label={`획득한 XP ${data.earnedXp}`}>
              <Icon name="spark" size={25} />
              <b>{formatNumber(data.earnedXp)}</b>
            </span>
            <span className="header-stat learned-stat" aria-label={`학습한 원리 ${learned}개`}>
              <Icon name="book" size={25} />
              <b>{learned}</b>
            </span>
            <button
              className="profile"
              onClick={() => navigate('reviews')}
              aria-label="나의 친구와 복습함"
            >
              <Mascot size={45} variant={avatar} />
            </button>
          </div>
        </header>
        <main className="page" id="main-content">
          {error && (
            <div className="alert error" role="alert">
              {error}
              <button onClick={() => setError('')} aria-label="오류 알림 닫기">
                ×
              </button>
            </div>
          )}
          {notice && (
            <div className="alert" role="status">
              {notice}
              <button onClick={() => setNotice('')} aria-label="알림 닫기">
                ×
              </button>
            </div>
          )}
          {updateReady && (
            <div className="alert">
              새 원리 탐험이 도착했어요.
              <button disabled={!canUpdate || !online} onClick={applyUpdate}>
                업데이트 적용
              </button>
            </div>
          )}
          {focused ? (
            focused.status === 'completed' ? (
              <Completion
                session={focused}
                data={data}
                onHome={() => navigate('today')}
                onReview={() => navigate('reviews')}
              />
            ) : (
              <QuestCard
                key={focused.steps[focused.index]?.id}
                session={focused}
                attempt={answered}
                busy={busy}
                onExit={() => navigate(tab)}
                onSubmit={(answer, usedHint) =>
                  void run(async () => {
                    await submitAnswer(focused.id, answer, usedHint);
                  })
                }
                onNext={() =>
                  void run(async () => {
                    await advanceSession(focused.id);
                  })
                }
              />
            )
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">
                    {tab === 'today'
                      ? `${APP_NAME} · ${new Date().getMonth() + 1}월 ${new Date().getDate()}일`
                      : '기억에서 이해로, 이해에서 설명으로'}
                  </span>
                  <h1>
                    {tab === 'today' ? (
                      <>
                        오늘의 <em>원리 탐험</em>
                      </>
                    ) : (
                      pageTitle
                    )}
                  </h1>
                  <p>
                    {tab === 'today'
                      ? '원리를 기억하고, 내 말로 설명하는 힘을 길러요.'
                      : tab === 'library'
                        ? '궁금한 원리를 꺼내 읽고, 개념과 이유를 함께 연결해요.'
                        : tab === 'map'
                          ? '여섯 가지 원리마다 새로운 탐험이 펼쳐져요.'
                          : tab === 'reviews'
                            ? '기억을 다시 만나고, 나만의 작은 연구실도 꾸며요.'
                            : tab === 'progress'
                              ? '매일의 작은 시도가 생각하는 힘으로 자라고 있어요.'
                              : '학습은 내 방식대로, 기록은 내 기기에.'}
                  </p>
                </div>
                {tab === 'today' && (
                  <span className="date-stamp">
                    <Icon name="leaf" size={17} />
                    나만의 속도로 자라기
                  </span>
                )}
              </div>
              {(tab === 'today' || tab === 'map') && (
                <div className="deck-picker" role="group" aria-label="학습할 원리장">
                  {deckList.map((d) => {
                    const sub = d.principles[0]?.subject ?? '';
                    return (
                      <button
                        key={d.id}
                        disabled={busy}
                        onClick={() => chooseDeck(d.id)}
                        className={`deck-pill ${deck.id === d.id ? 'selected' : ''}`}
                        aria-pressed={deck.id === d.id}
                      >
                        <SubjectMark subject={sub} small />
                        <span>{sub}</span>
                        <small>{activePrinciples(d).length}</small>
                      </button>
                    );
                  })}
                </div>
              )}
              {tab === 'today' && (
                <>
                  <div className="home-columns">
                    <div className="learning-column">
                      <section className="hero-panel">
                        <div className="hero-copy">
                          <span className="unit-label">
                            {subject} 원리장 ·{' '}
                            {Math.min(
                              count,
                              (inProgress?.lessonIndex ?? nextIndex ?? count - 1) + 1,
                            )}{' '}
                            / {count}회차
                          </span>
                          <h2>{deck.title}</h2>
                          <p>개념을 발견하고, 내 말로 설명해요!</p>
                        </div>
                        <button className="unit-guide" onClick={() => navigate('library')}>
                          <Icon name="book" size={24} />
                          <span>가이드</span>
                        </button>
                      </section>
                      <section className="next-lesson-card">
                        <Mascot size={168} variant={avatar} wardrobe={data.settings.room} />
                        <div>
                          <h3>
                            {nextIndex === undefined && !inProgress
                              ? '이 원리장을 완주했어요!'
                              : '준비됐나요? 탐험을 이어 가요!'}
                          </h3>
                          <p>기본 20문제 · 오답은 마지막에 한 번 더</p>
                          <button
                            className="primary hero-button"
                            disabled={busy || (!inProgress && nextIndex === undefined)}
                            onClick={() => void begin(inProgress?.lessonIndex ?? nextIndex)}
                          >
                            {inProgress
                              ? `${inProgress.lessonIndex + 1}회차 이어 하기`
                              : nextIndex === undefined
                                ? '이 원리장 탐험 완료'
                                : `${nextIndex + 1}회차 탐험 시작`}
                            <Icon name="arrow" size={20} />
                          </button>
                        </div>
                      </section>
                      <LearningPath
                        deck={deck}
                        completedIndexes={completedIndexes}
                        nextIndex={nextIndex}
                        inProgressIndex={inProgress?.lessonIndex}
                        busy={busy}
                        onStart={(i) => void begin(i)}
                        compact
                      />
                    </div>
                  </div>
                  <section className="panel">
                    <SectionTitle
                      eyebrow="하루 20문제, 네 가지 경험"
                      title="오늘의 탐험은 이렇게 흘러가요"
                    >
                      <span className="text-tag">오답 재도전은 별도</span>
                    </SectionTitle>
                    <div className="flow-grid">
                      {[
                        {
                          n: '01',
                          title: '기억 채우기',
                          count: '4문제',
                          text: '지난 원리를 다시 꺼내요',
                          icon: 'leaf',
                        },
                        {
                          n: '02',
                          title: '원리 탐험',
                          count: '12문제',
                          text: '여섯 원리를 다른 상황에서',
                          icon: 'spark',
                        },
                        {
                          n: '03',
                          title: '설명 연습',
                          count: '2문제',
                          text: '이유를 내 말로 설명해요',
                          icon: 'sound',
                        },
                        {
                          n: '04',
                          title: '면접 미션',
                          count: '2문제',
                          text: '자료 속 근거를 찾아요',
                          icon: 'flag',
                        },
                      ].map((f) => (
                        <div className="flow-item" key={f.n}>
                          <span className="flow-number">{f.n}</span>
                          <div className="flow-icon">
                            <Icon name={f.icon as IconName} />
                          </div>
                          <h3>
                            {f.title}
                            <small>{f.count}</small>
                          </h3>
                          <p>{f.text}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="panel">
                    <SectionTitle eyebrow="이번 탐험의 씨앗" title="오늘 만날 원리">
                      <button className="text-button" onClick={() => navigate('library')}>
                        원리장 모두 보기 <Icon name="arrow" size={16} />
                      </button>
                    </SectionTitle>
                    <div className="seed-grid">
                      {currentPrinciples.map((p, i) => (
                        <div className="seed-item" key={p.id}>
                          <span>{String(i + 1).padStart(2, '0')}</span>
                          <div>
                            <h3>{p.name}</h3>
                            <p>{p.summary}</p>
                          </div>
                          <Icon name="leaf" size={18} />
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
              {tab === 'map' && (
                <section className="map-panel">
                  <div className="map-unit-banner">
                    <SubjectMark subject={subject} />
                    <div>
                      <span>
                        {principles.length}개 원리 · {count}회차
                      </span>
                      <h2>{deck.title}</h2>
                    </div>
                    <span className="map-completed">
                      {completedIndexes.size}/{count}
                    </span>
                  </div>
                  <LearningPath
                    deck={deck}
                    completedIndexes={completedIndexes}
                    nextIndex={nextIndex}
                    inProgressIndex={inProgress?.lessonIndex}
                    busy={busy}
                    onStart={(i) => void begin(i)}
                  />
                </section>
              )}
              {tab === 'library' && (
                <Library
                  data={data}
                  onPractice={(id) =>
                    void run(async () => {
                      const session = await startPractice(id);
                      setSessionId(session.id);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    })
                  }
                />
              )}
              {tab === 'reviews' && (
                <div className="review-layout">
                  <div>
                    <AvatarRoom
                      avatar={avatar}
                      room={data.settings.room}
                      ownedItemIds={data.ownedItemIds}
                      balance={data.balance}
                      busy={busy}
                      onSelect={(id) =>
                        void run(async () => {
                          await purchaseRoomItem(id);
                          setNotice('나의 연구실에 적용했어요.');
                        })
                      }
                    />
                    <div className="companion-picker" aria-label="탐험 친구 선택">
                      {(['lumi', 'momo', 'nova'] as const).map((id) => (
                        <button
                          key={id}
                          disabled={busy}
                          aria-pressed={id === avatar}
                          className={id === avatar ? 'selected' : ''}
                          onClick={() =>
                            void run(async () => {
                              await saveSettings({ avatarId: id });
                            })
                          }
                        >
                          <Mascot size={63} variant={id} />
                          <span>{companionNames[id]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="review-stack">
                    <section className="panel review-test">
                      <span className="label-pill">기억을 꺼내는 연습</span>
                      <h2>원리 테스트</h2>
                      <p>
                        배운 원리 전체에서 10문제를 골라요.
                        <br />
                        최근에 틀린 원리를 더 자주 만나요.
                      </p>
                      <div className="test-split">
                        <span>
                          <b>5</b>객관식
                        </span>
                        <span>+</span>
                        <span>
                          <b>5</b>개념어 입력
                        </span>
                      </div>
                      <button
                        className="primary"
                        disabled={busy || learned === 0}
                        onClick={() => void beginReview()}
                      >
                        {data.sessions.some(
                          (s) => s.kind === 'review' && s.status === 'in_progress',
                        )
                          ? '원리 테스트 이어 하기'
                          : '원리 테스트 시작'}
                        <Icon name="arrow" size={18} />
                      </button>
                      <small>
                        {learned
                          ? `배운 원리 ${learned}개 · 완료 시 첫 정답 비율로 XP 지급`
                          : '먼저 오늘의 탐험에서 원리를 배워 주세요.'}
                      </small>
                    </section>
                    <button className="library-link panel" onClick={() => navigate('library')}>
                      <Icon name="book" size={31} />
                      <span>
                        <b>나의 원리장 펼치기</b>
                        <small>개념과 핵심 원리를 한눈에</small>
                      </span>
                      <Icon name="arrow" />
                    </button>
                    <section className="panel schedule-note">
                      <Icon name="clock" />
                      <h3>언제 다시 만나나요?</h3>
                      <p>
                        1 · 1 · 3 · 7 · 14 · 30일 간격으로 기억을 살펴요. 힌트를 본 정답과 스스로
                        설명한 기록은 구분해서 남겨요.
                      </p>
                    </section>
                  </div>
                </div>
              )}
              {tab === 'progress' && <Progress data={data} mastered={mastered} />}
              {tab === 'settings' && (
                <SettingsPanel
                  data={data}
                  busy={busy}
                  onSave={(value) =>
                    void run(async () => {
                      await saveSettings(value);
                    })
                  }
                  onExport={() =>
                    void run(async () => {
                      const text = await exportBackup();
                      const url = URL.createObjectURL(
                        new Blob([text], { type: 'application/json' }),
                      );
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${APP_NAME}-${localDay()}.json`;
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                      setNotice('백업 파일을 저장했어요.');
                    })
                  }
                  onImport={(file) =>
                    void run(async () => {
                      if (file.size > 20 * 1024 * 1024)
                        throw new Error(`20MB 이하의 ${APP_NAME} 백업 파일을 골라 주세요.`);
                      await importBackup(await file.text());
                      setSessionId(undefined);
                      setNotice('학습 기록과 구매 내역을 복원했어요.');
                    })
                  }
                  onReset={() =>
                    void run(async () => {
                      await resetDatabase();
                      setSessionId(undefined);
                      setNotice(`이 기기의 ${APP_NAME} 학습 기록을 초기화했어요.`);
                    })
                  }
                />
              )}
              <footer className="page-footer">
                <span>
                  <span className="footer-sprout">✦</span> 작은 원리에서 시작하는 큰 발견
                </span>
                <span>
                  {online
                    ? offlineReady
                      ? '오프라인 학습 준비 완료'
                      : '기기에 학습 기록 저장 중'
                    : '오프라인으로 학습 중'}
                </span>
              </footer>
            </>
          )}
        </main>
      </div>
      <nav className="bottom-nav" aria-label="하단 주 메뉴">
        {navigation
          .filter((n) => n.id !== 'settings')
          .map((n) => (
            <button
              key={n.id}
              className={tab === n.id && !focused ? 'active' : ''}
              onClick={() => navigate(n.id)}
              aria-label={n.label}
            >
              <span className="bottom-nav-icon">
                <Icon name={n.icon} size={25} />
                {n.id === 'reviews' && due.length > 0 && (
                  <b className="bottom-nav-badge">{due.length}</b>
                )}
              </span>
              <span>
                {n.id === 'today'
                  ? '오늘'
                  : n.id === 'progress'
                    ? '성장'
                    : n.id === 'map'
                      ? '지도'
                      : n.id === 'library'
                        ? '원리장'
                        : '복습'}
              </span>
            </button>
          ))}
        <button
          className={tab === 'settings' ? 'active' : ''}
          onClick={() => navigate('settings')}
          aria-label="설정"
        >
          <Icon name="settings" size={21} />
          <span>설정</span>
        </button>
      </nav>
    </div>
  );
}

function QuestCard({
  session,
  attempt,
  busy,
  onExit,
  onSubmit,
  onNext,
}: {
  session: Session;
  attempt?: Attempt;
  busy: boolean;
  onExit: () => void;
  onSubmit: (answer: string | number[], hint: boolean) => void;
  onNext: () => void;
}) {
  const step = session.steps[session.index];
  const [selected, setSelected] = useState('');
  const [typed, setTyped] = useState('');
  const [checks, setChecks] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(30);
  const [timing, setTiming] = useState(false);
  const [hintShown, setHintShown] = useState(!!step.alwaysHinted || !!attempt?.usedHint);
  useEffect(() => {
    if (!timing || seconds === 0) return;
    const id = setTimeout(() => setSeconds((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [timing, seconds]);
  const answered = !!attempt;
  const isExplain = step.mode === 'explain';
  const correctAnswer = step.choices?.[step.correctIndex ?? 0] ?? step.acceptedAnswers?.[0] ?? '';
  return (
    <div className="quest-layout">
      <div className="quest-top">
        <button className="text-button" onClick={onExit}>
          <Icon name="close" size={17} />
          저장하고 나가기
        </button>
        <span>
          {session.kind === 'review'
            ? '원리 테스트'
            : session.kind === 'practice'
              ? '원리 깊이 연습'
              : `${session.lessonIndex + 1}회차 원리 탐험`}{' '}
          ·{' '}
          <b>
            {Math.min(session.index + 1, session.baseCount)}/{session.baseCount}
          </b>
          {session.index >= session.baseCount ? ' + 오답 재도전' : ''}
        </span>
        <span className="xp-pill">
          <Icon name="spark" size={15} />
          {session.xp} XP
        </span>
      </div>
      <progress className="quest-progress" max={session.steps.length} value={session.index} />
      <section className="question-panel">
        <div className="question-meta">
          <span className="label-pill">{phaseLabels[step.phase]}</span>
          <span className="subject-tag">
            <SubjectMark subject={step.subject} small />
            {step.subject}
          </span>
        </div>
        <span className="question-principle">
          {step.mode === 'recall' ? '기억 속 개념어 꺼내기' : step.name}
        </span>
        {step.passage && (
          <div className="passage">
            <span className="eyebrow">상황과 관찰 자료</span>
            <p>
              <Evidence text={step.passage} quote={step.evidenceQuote} show={answered} />
            </p>
          </div>
        )}
        <h1 className="question-prompt">{step.prompt}</h1>
        {isExplain ? (
          <>
            <p className="help-text">
              먼저 소리 내어 설명해 보세요. 실제로 말한 요소만 체크해요. 녹음하지 않으며,{' '}
              {session.kind === 'practice'
                ? '깊이 연습에는 XP 보상이 없어요.'
                : '설명 완료 XP는 통과 여부와 관계없이 같아요.'}
            </p>
            <button
              className={`timer-button ${timing ? 'running' : ''}`}
              disabled={answered}
              onClick={() => {
                if (seconds === 0) {
                  setSeconds(30);
                  setTiming(true);
                } else setTiming((v) => !v);
              }}
            >
              <Icon name="clock" size={17} />
              {seconds === 0
                ? '30초 다시 시작'
                : `${seconds}초 ${timing ? '잠시 멈추기' : '설명 타이머 시작'}`}
              <small>선택 사항</small>
            </button>
            <div className="rubric-list">
              {step.rubric?.map((r, i) => (
                <label key={r} className={checks.includes(i) ? 'checked' : ''}>
                  <input
                    type="checkbox"
                    disabled={answered || busy}
                    checked={
                      answered ? (attempt.checkedIndices?.includes(i) ?? false) : checks.includes(i)
                    }
                    onChange={() =>
                      setChecks((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]))
                    }
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <p className="help-text">
              채점 요소 {step.passCount ?? 3}개 이상이면 자기 점검 통과 · 설명 연습은 자기 평가
              기록이에요.
            </p>
          </>
        ) : step.mode === 'recall' ? (
          <form
            className="recall-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim() && !answered) onSubmit(typed, hintShown);
            }}
          >
            <label htmlFor="concept-answer">개념어를 입력해 주세요</label>
            {hintShown ? (
              <span className="hint-tag">첫 글자 힌트: {step.hint}</span>
            ) : !answered ? (
              <button type="button" className="text-button" onClick={() => setHintShown(true)}>
                첫 글자 힌트 보기
              </button>
            ) : (
              <small>이번에는 힌트 없이 기억을 꺼냈어요.</small>
            )}
            <input
              id="concept-answer"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="기억나는 개념어"
              value={answered ? attempt.answer : typed}
              disabled={answered || busy}
              onChange={(e) => setTyped(e.target.value)}
            />
            <small>띄어쓰기와 전각·반각 차이는 채점에 영향을 주지 않아요.</small>
          </form>
        ) : (
          <div className="choices">
            {step.choices?.map((choice, i) => {
              const correct = answered && i === step.correctIndex,
                wrong = answered && String(i) === attempt.answer && !attempt.correct;
              return (
                <button
                  key={i}
                  className={`choice ${selected === String(i) ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'incorrect' : ''}`}
                  disabled={answered || busy}
                  aria-pressed={selected === String(i)}
                  onClick={() => setSelected(String(i))}
                >
                  <span className="choice-number">
                    {correct ? <Icon name="check" size={17} /> : String.fromCharCode(65 + i)}
                  </span>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        )}
        {answered ? (
          <div className={`feedback ${attempt.correct ? 'success' : 'try-again'}`} role="status">
            <h2>
              {isExplain
                ? attempt.correct
                  ? '설명 요소를 잘 연결했어요'
                  : '설명하는 연습을 마쳤어요'
                : attempt.correct
                  ? '원리를 잘 발견했어요!'
                  : '다른 관점으로 살펴볼까요?'}
            </h2>
            {!isExplain && !attempt.correct && (
              <p className="correct-answer">정답: {correctAnswer}</p>
            )}
            <p>{step.explanation}</p>
            {step.followUp && (
              <div className="follow-up">
                <b>한 걸음 더 · 꼬리질문</b>
                <p>{step.followUp}</p>
              </div>
            )}
            {step.phase === 'explore' && !attempt.correct && (
              <small>마지막에 같은 원리의 다른 문제로 한 번 더 만나요.</small>
            )}
          </div>
        ) : null}
        <Source value={step.source} />
        <div className="question-actions">
          {answered ? (
            <button className="primary" disabled={busy} onClick={onNext}>
              {session.index === session.steps.length - 1 ? '탐험 마무리' : '다음으로'}
              <Icon name="arrow" size={18} />
            </button>
          ) : (
            <button
              className="primary"
              disabled={
                busy || (!isExplain && (step.mode === 'recall' ? !typed.trim() : !selected))
              }
              onClick={() =>
                onSubmit(
                  isExplain ? checks : step.mode === 'recall' ? typed : selected,
                  step.mode === 'recall' && hintShown,
                )
              }
            >
              {isExplain ? '설명 연습 완료' : '정답 확인'}
              <Icon name="check" size={18} />
            </button>
          )}
        </div>
      </section>
      <p className="quest-save-note">
        <Icon name="shield" size={14} />
        문제를 풀 때마다 기기에 자동 저장해요.
      </p>
    </div>
  );
}
function Completion({
  session,
  data,
  onHome,
  onReview,
}: {
  session: Session;
  data: Snapshot;
  onHome: () => void;
  onReview: () => void;
}) {
  const attempts = data.attempts.filter((a) => a.sessionId === session.id && a.firstTry);
  const correct = attempts.filter((a) => a.correct).length;
  return (
    <section className="completion panel">
      <span className="label-pill">
        {session.kind === 'practice'
          ? '설명과 응용을 함께 연습했어요'
          : '오늘도 한 원리만큼 성장했어요'}
      </span>
      <Mascot
        size={215}
        mood="celebrate"
        variant={data.settings.avatarId}
        wardrobe={data.settings.room}
      />
      <h1>탐험을 마쳤어요!</h1>
      <p>작은 발견들이 생각하는 힘으로 쌓이고 있어요.</p>
      <div className="completion-stats">
        <div>
          <strong>
            {correct}/{session.baseCount}
          </strong>
          <span>첫 시도 정답 · 자기 점검 포함</span>
        </div>
        <div>
          <strong>+{session.xp}</strong>
          <span>획득 XP</span>
        </div>
      </div>
      <button className="primary" onClick={onHome}>
        오늘의 탐험으로
        <Icon name="arrow" size={18} />
      </button>
      <button className="text-button" onClick={onReview}>
        친구의 연구실에 놀러 가기
      </button>
    </section>
  );
}
function Library({ data, onPractice }: { data: Snapshot; onPractice: (id: string) => void }) {
  const [deckId, setDeckId] = useState('all'),
    [search, setSearch] = useState('');
  const selected = deckId === 'all' ? deckList : [getDeck(deckId)];
  const matched = selected
    .flatMap((d) => activePrinciples(d).map((p) => ({ p, d })))
    .filter(({ p }) =>
      `${p.name} ${p.summary} ${p.subject} ${p.conceptAnswers.join(' ')}`.includes(search.trim()),
    );
  return (
    <>
      <div className="library-controls">
        <label className="search-box">
          <Icon name="book" size={19} />
          <input
            aria-label="원리 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="원리 이름이나 개념을 찾아보세요"
          />
        </label>
        <select value={deckId} onChange={(e) => setDeckId(e.target.value)} aria-label="과목 필터">
          <option value="all">모든 과목</option>
          {deckList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.principles[0]?.subject}
            </option>
          ))}
        </select>
      </div>
      <div className="library-info">
        <span>총 {matched.length}가지 원리</span>
        <small>원리장을 읽는 것만으로 진도나 XP가 바뀌지 않아요.</small>
      </div>
      <div className="principle-list">
        {matched.map(({ p }) => (
          <PrincipleCard
            key={p.id}
            principle={p}
            onPractice={() => onPractice(p.id)}
            state={
              data.reviews.find((r) => r.principleId === p.id)?.mastered
                ? '숙련'
                : data.reviews.some((r) => r.principleId === p.id)
                  ? '학습 중'
                  : '아직 만나지 않은 원리'
            }
          />
        ))}
        {!matched.length && (
          <div className="empty-state panel">찾는 원리가 없어요. 다른 개념어로 검색해 보세요.</div>
        )}
      </div>
    </>
  );
}
function PrincipleCard({
  principle: p,
  state,
  onPractice,
}: {
  principle: Principle;
  state: string;
  onPractice: () => void;
}) {
  return (
    <details className="principle-card">
      <summary>
        <SubjectMark subject={p.subject} />
        <div>
          <span className="principle-subject">
            {p.subject} <small>{state}</small>
          </span>
          <h3>{p.name}</h3>
          <p>{p.summary}</p>
        </div>
        <span className="expand-sign">+</span>
      </summary>
      <div className="principle-content">
        <span className="eyebrow">핵심 개념어</span>
        <p className="concept-words">{p.conceptAnswers.join(' · ')}</p>
        <p className="curriculum">{p.curriculum}</p>
        <h4>내 말로 설명해 보기</h4>
        <p>{p.explain.prompt}</p>
        <ul>
          {p.explain.rubric.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <h4>다른 상황에서 원리 찾기</h4>
        <div className="example-list">
          {p.variants.map((v, i) => (
            <details key={v.id}>
              <summary>
                {i + 1}. {v.prompt}
              </summary>
              <ol type="A">
                {v.choices.map((c, j) => (
                  <li className={j === v.correctIndex ? 'answer-correct' : ''} key={c}>
                    {c}
                    {j === v.correctIndex ? ' ✓' : ''}
                  </li>
                ))}
              </ol>
              <p>{v.explanation}</p>
            </details>
          ))}
        </div>
        <h4>꼬리질문</h4>
        <ul>
          {p.followUps.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <Source value={p.source} />
        <small className="review-status">
          기출의 개념을 바탕으로 새로 만든 문항 · 검수 전 초안
        </small>
        <div className="practice-entry">
          <button className="secondary" onClick={onPractice}>
            이 원리 깊이 연습 <Icon name="arrow" size={16} />
          </button>
          <small>설명 + 응용 2문제 · 추가 XP 없이 기억을 단단하게</small>
        </div>
      </div>
    </details>
  );
}
function Progress({ data, mastered }: { data: Snapshot; mastered: number }) {
  const today = localDay(),
    days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const total = data.attempts.filter((a) => a.firstTry && a.mode !== 'explain'),
    correct = total.filter((a) => a.correct).length;
  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon">
            <Icon name="book" />
          </span>
          <div>
            <span>학습한 원리</span>
            <strong>
              {data.reviews.length}
              <small>개</small>
            </strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <Icon name="star" />
          </span>
          <div>
            <span>숙련한 원리</span>
            <strong>
              {mastered}
              <small>개</small>
            </strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <Icon name="check" />
          </span>
          <div>
            <span>첫 시도 정답률</span>
            <strong>
              {total.length ? Math.round((correct / total.length) * 100) : 0}
              <small>%</small>
            </strong>
          </div>
        </div>
      </div>
      <div className="progress-layout">
        <section className="panel">
          <SectionTitle eyebrow="조금씩, 꾸준히" title="지난 7일의 발견" />
          <div className="week-chart">
            {days.map((day) => {
              const n = data.attempts.filter((a) => a.localDay === day && a.firstTry).length,
                max = Math.max(
                  1,
                  ...days.map(
                    (d) => data.attempts.filter((a) => a.localDay === d && a.firstTry).length,
                  ),
                );
              return (
                <div className={day === today ? 'today' : ''} key={day}>
                  <span>{n}</span>
                  <div className="bar-track">
                    <div className="bar" style={{ height: `${Math.max(3, (n / max) * 100)}%` }} />
                  </div>
                  <small>
                    {day === today ? '오늘' : `${Number(day.slice(5, 7))}/${Number(day.slice(8))}`}
                  </small>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel mastery-note">
          <Icon name="leaf" size={31} />
          <h2>기억과 이해를 구분해요</h2>
          <p>
            객관식 정답만으로 숙련이라 하지 않아요. 서로 다른 날의 정답 3회, 스스로 설명한 날 2일,
            미션 정답, 7일 뒤 능동 회상이 함께 쌓여야 해요.
          </p>
          <small>
            첫 글자 힌트를 본 개념어 입력은 독립 회상으로 세지 않아요. 설명 기록은 자기 평가예요.
          </small>
        </section>
      </div>
      <section className="panel">
        <SectionTitle eyebrow="나의 개념 지도" title="과목별 성장" />
        <div className="subject-progress">
          {deckList.map((d) => {
            const ps = activePrinciples(d),
              ids = new Set(ps.map((p) => p.id)),
              learned = data.reviews.filter((r) => ids.has(r.principleId)),
              mastery = learned.filter((r) => r.mastered).length;
            return (
              <div key={d.id}>
                <SubjectMark subject={ps[0]?.subject} />
                <div>
                  <h3>{d.title}</h3>
                  <progress value={learned.length} max={ps.length} />
                  <small>
                    만난 원리 {learned.length}/{ps.length} · 숙련 {mastery}개
                  </small>
                </div>
                <b>{Math.round((learned.length / ps.length) * 100)}%</b>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
function SettingsPanel({
  data,
  busy,
  onSave,
  onExport,
  onImport,
  onReset,
}: {
  data: Snapshot;
  busy: boolean;
  onSave: (value: Partial<Snapshot['settings']>) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}) {
  const [resetOpen, setResetOpen] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="settings-grid">
      <section className="panel">
        <SectionTitle title="나에게 맞는 학습 공간" />
        <label className="setting-row">
          <span>
            <b>기본 원리장</b>
            <small>다음에 앱을 열 때 이어갈 원리장</small>
          </span>
          <select
            value={data.settings.deckId}
            disabled={busy}
            onChange={(e) => onSave({ deckId: e.target.value })}
          >
            {deckList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.principles[0]?.subject}
              </option>
            ))}
          </select>
        </label>
        <div className="setting-row">
          <span>
            <b>화면 테마</b>
            <small>눈이 편한 학습 공간을 골라요</small>
          </span>
          <div className="theme-toggle">
            <button
              aria-pressed={data.settings.theme === 'forest'}
              disabled={busy}
              onClick={() => onSave({ theme: 'forest' })}
            >
              <Icon name="leaf" size={16} />숲
            </button>
            <button
              aria-pressed={data.settings.theme === 'night'}
              disabled={busy}
              onClick={() => onSave({ theme: 'night' })}
            >
              <Icon name="moon" size={16} />밤
            </button>
          </div>
        </div>
      </section>
      <section className="panel">
        <SectionTitle title="기록을 안전하게 보관하기" />
        <p className="muted">
          학습 기록은 이 브라우저에만 저장돼요. 기기를 옮기기 전에는 백업해 주세요. 백업을 가져오면
          현재 기록을 그 파일의 기록으로 바꿔요. 이름을 바꾸기 전의 백업도 가져올 수 있어요.
        </p>
        <div className="backup-actions">
          <button className="primary" disabled={busy} onClick={onExport}>
            <Icon name="shield" size={17} />
            백업 파일 저장
          </button>
          <button className="secondary" disabled={busy} onClick={() => file.current?.click()}>
            백업 가져오기
          </button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const value = e.target.files?.[0];
              if (value) onImport(value);
              e.target.value = '';
            }}
          />
        </div>
      </section>
      <section className="panel">
        <SectionTitle title="홈 화면에서 바로 만나기" />
        <p>
          iPhone Safari에서 이 앱을 열고 공유 버튼 → ‘홈 화면에 추가’를 선택하세요. 한 번 온라인으로
          불러오면 원리장과 학습 화면을 오프라인에서도 사용할 수 있어요.
        </p>
        <small className="muted">
          다른 기기에서 접속하려면 HTTPS 주소로 배포하거나 같은 네트워크의 개발 서버를 사용하세요.
          설치·오프라인 저장에는 HTTPS가 필요해요.
        </small>
      </section>
      <section className="panel">
        <SectionTitle title="원리장과 참고 자료" />
        <p>
          과학고·과학영재학교 공개 기출과 제공된 자료에서 수학·과학 개념을 분석해 문항을 새로
          작성했어요. 기출 원문을 그대로 옮긴 문제집은 아니에요.
        </p>
        <p className="muted">
          현재 원리장은 검수 전 초안입니다. 해설과 풀이를 검토하며 학습에 활용하세요.
        </p>
        <div className="source-links">
          <a href="https://admission.ksa.hs.kr/" target="_blank" rel="noreferrer">
            한국과학영재학교 입학 안내 ↗
          </a>
          <a href="https://sshs.sen.hs.kr/" target="_blank" rel="noreferrer">
            서울과학고등학교 ↗
          </a>
        </div>
        <p className="version">
          {APP_NAME} 0.2.0 · 원리 {allPrinciples.length}개 · 예문{' '}
          {allPrinciples.reduce((s, p) => s + p.variants.length, 0)}개<br />
          로그인·광고·분석 추적·온라인 AI 채점 없이 동작해요.
        </p>
      </section>
      <section className="panel reset-panel">
        <SectionTitle title="기기 기록 초기화" />
        {resetOpen ? (
          <>
            <p>이 기기의 {APP_NAME} 학습·구매·설정을 모두 지웁니다. 백업 파일을 먼저 저장하세요.</p>
            <div className="backup-actions">
              <button
                className="danger"
                disabled={busy}
                onClick={() => {
                  onReset();
                  setResetOpen(false);
                }}
              >
                백업을 확인했고 초기화할게요
              </button>
              <button className="secondary" onClick={() => setResetOpen(false)}>
                취소
              </button>
            </div>
          </>
        ) : (
          <button className="text-button muted" onClick={() => setResetOpen(true)}>
            초기화 옵션 열기
          </button>
        )}
      </section>
    </div>
  );
}
