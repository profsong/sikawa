import { useId, type CSSProperties } from 'react';
import { lessonCount, lessonPrinciples } from '../siikawa/engine';
import type { Deck } from '../siikawa/model';
import { Icon } from './Icon';
import { Mascot } from './Mascot';
import '../styles/learning-path.css';

interface LearningPathProps {
  deck: Deck;
  completedIndexes: Set<number>;
  nextIndex?: number;
  inProgressIndex?: number;
  busy: boolean;
  onStart: (index: number) => void;
  compact?: boolean;
}

const bends = [0, -1, 0, 1];
const rowHeight = 180;
const centerX = (index: number) => 180 + bends[index % bends.length] * 66;
const centerY = (index: number) => index * rowHeight + 71;

function TrailSparkles() {
  return (
    <svg className="lp-sparkles" viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <path d="m25 5 5 12 13 2-10 9 2 13-10-6-12 6 3-13-10-9 13-2Z" fill="#1cb0f6" />
      <path d="m63 40 3 8 9 1-7 6 2 9-7-4-8 4 2-9-6-6 9-1Z" fill="#ffc800" />
      <circle cx="60" cy="15" r="5" fill="#ffb6dc" />
      <path d="m13 58 6 6m0-6-6 6" stroke="#58cc02" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** A path of real lessons. Display state comes exclusively from saved lesson progress. */
export function LearningPath({
  deck,
  completedIndexes,
  nextIndex,
  inProgressIndex,
  busy,
  onStart,
  compact = false,
}: LearningPathProps) {
  const headingId = useId();
  const descriptionId = useId();
  const count = lessonCount(deck);
  const indexes = Array.from({ length: count }, (_, index) => index);
  const completedCount = indexes.filter((index) => completedIndexes.has(index)).length;
  const firstIncomplete = indexes.find((index) => !completedIndexes.has(index));
  const activeIndex = inProgressIndex ?? nextIndex ?? firstIncomplete;
  const allComplete = count > 0 && completedCount === count;
  const finalY = count * rowHeight + 38;

  return (
    <section
      className={`learning-path ${compact ? 'learning-path--compact' : 'learning-path--full'}`}
      aria-labelledby={headingId}
      data-testid="learning-path"
    >
      <header className="lp-heading">
        <span className="lp-heading-icon">
          <Icon name="book" size={29} />
        </span>
        <div>
          <p className="lp-eyebrow">하나씩, 확실하게!</p>
          <h2 id={headingId}>{compact ? '오늘도 한 걸음 더' : '나의 원리 탐험길'}</h2>
        </div>
        <span
          className="lp-heading-count"
          aria-label={`${count}회차 중 ${completedCount}회차 완료`}
        >
          {completedCount}
          <span> / {count}</span>
        </span>
      </header>
      {!compact && <p className="lp-intro">{deck.title}의 원리를 차례로 만나 보세요.</p>}
      <p className="lp-sr-only" id={descriptionId}>
        원리장에는 {count}회차가 있어요. 앞 회차를 완료하면 다음 회차를 시작할 수 있어요.
      </p>

      {count === 0 ? (
        <p className="lp-empty">이 원리장에 학습할 원리가 아직 없어요.</p>
      ) : (
        <div className="lp-track">
          <svg
            className="lp-route"
            width="360"
            height={finalY + 40}
            viewBox={`0 0 360 ${finalY + 40}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {indexes.slice(1).map((index) => {
              const beforeX = centerX(index - 1);
              const beforeY = centerY(index - 1);
              const x = centerX(index);
              const y = centerY(index);
              const connected = completedIndexes.has(index - 1);
              return (
                <path
                  key={index}
                  className={
                    connected ? 'lp-route-piece lp-route-piece--reached' : 'lp-route-piece'
                  }
                  d={`M${beforeX} ${beforeY} C${beforeX} ${beforeY + 88} ${x} ${y - 88} ${x} ${y}`}
                />
              );
            })}
            <path
              className={`lp-route-piece ${allComplete ? 'lp-route-piece--reached' : ''}`}
              d={`M${centerX(count - 1)} ${centerY(count - 1)} C${centerX(count - 1)} ${finalY - 65} 180 ${finalY - 60} 180 ${finalY}`}
            />
          </svg>

          <ol className="lp-lessons" aria-describedby={descriptionId}>
            {indexes.map((index) => {
              const done = completedIndexes.has(index);
              const precedingComplete = index === 0 || completedIndexes.has(index - 1);
              const current = !done && index === activeIndex && precedingComplete;
              const locked = !done && !current;
              const resumed = current && index === inProgressIndex;
              const principles = lessonPrinciples(deck, index);
              const allNames = principles.map((principle) => principle.name).join(' · ');
              const description = `${principles.length}개 원리: ${allNames}`;
              const statusLabel = done
                ? '완료'
                : locked
                  ? '잠김'
                  : resumed
                    ? '이어 하기'
                    : '시작하기';
              const direction = bends[index % bends.length];
              const style = {
                '--lp-node-left': `${(centerX(index) / 360) * 100}%`,
              } as CSSProperties;
              return (
                <li
                  className={`lp-lesson ${done ? 'lp-lesson--done' : current ? 'lp-lesson--current' : 'lp-lesson--locked'}`}
                  style={style}
                  key={`${deck.id}:${index}`}
                >
                  {current && (
                    <span className="lp-start-label" aria-hidden="true">
                      {resumed ? '이어서 가요!' : '여기서 시작!'}
                    </span>
                  )}
                  <button
                    type="button"
                    className="lp-node"
                    disabled={busy || locked}
                    aria-label={`${index + 1}회차 ${statusLabel}. ${description}`}
                    aria-current={current ? 'step' : undefined}
                    title={`${index + 1}회차 ${statusLabel}\n${description}`}
                    onClick={() => onStart(index)}
                    data-lesson-index={index}
                    data-status={done ? 'completed' : current ? 'current' : 'locked'}
                  >
                    <span className="lp-node-face">
                      <Icon
                        name={done ? 'check' : locked ? 'lock' : 'star'}
                        size={done ? 41 : locked ? 31 : 42}
                      />
                    </span>
                    <span className="lp-node-number" aria-hidden="true">
                      {index + 1}
                    </span>
                  </button>
                  <div className="lp-lesson-caption">
                    <h3>
                      {index + 1}회차{done && <span>완료</span>}
                    </h3>
                    <p title={allNames}>
                      {principles
                        .slice(0, 2)
                        .map((principle) => principle.name)
                        .join(' · ')}
                      {principles.length > 2 && <span> 외 {principles.length - 2}개</span>}
                    </p>
                  </div>
                  {count > 1 && index === 1 && (
                    <div
                      className={`lp-friend ${direction > 0 ? 'lp-friend--left' : 'lp-friend--right'}`}
                      aria-hidden="true"
                    >
                      <Mascot
                        variant="lumi"
                        size={105}
                        mood={allComplete ? 'celebrate' : 'happy'}
                      />
                      <span>{allComplete ? '해냈어요!' : '같이 가요!'}</span>
                    </div>
                  )}
                  {count > 2 && index === (count > 3 ? count - 2 : count - 1) && (
                    <div
                      className={`lp-decor ${direction < 0 ? 'lp-decor--right' : 'lp-decor--left'}`}
                      aria-hidden="true"
                    >
                      <TrailSparkles />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className={`lp-finish ${allComplete ? 'lp-finish--completed' : ''}`}>
            <span className="lp-finish-flag">
              <Icon name="flag" size={29} />
            </span>
            <div>
              <h3>{allComplete ? '이 원리장, 완주했어요!' : '원리장 완주까지 한 걸음씩'}</h3>
              <p>
                {allComplete
                  ? '복습하면서 기억을 더 단단하게 만들어요.'
                  : `${count}번의 탐험, 나만의 속도로 가요.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
