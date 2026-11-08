import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { AvatarRoomScene } from '../../components/AvatarRoomScene';
import { Icon } from '../../components/Icon';
import { Mascot, MascotMark, type AvatarId } from '../../components/Mascot';
import { resolveAvatar } from '../../core/avatar';
import {
  getRoomItem,
  roomItems,
  roomSlot,
  type RoomCategory,
  type RoomItem,
  type RoomSelection,
} from '../../core/room-catalog';
import '../../styles/avatar-room.css';

const categories: { id: RoomCategory; label: string }[] = [
  { id: 'background', label: '배경' },
  { id: 'outfit', label: '옷' },
  { id: 'accessory', label: '액세서리' },
];

function ItemPreview({
  item,
  avatar,
  room,
}: {
  item: RoomItem;
  avatar: AvatarId;
  room: RoomSelection;
}) {
  const preview = { ...room, [roomSlot(item.category)]: item.id };
  return (
    <div className={`room-item-preview room-item-preview--${item.category}`} aria-hidden="true">
      {item.category === 'background' ? (
        <AvatarRoomScene avatar={avatar} room={preview} preview />
      ) : item.category === 'outfit' ? (
        <Mascot variant={avatar} size={122} wardrobe={{ outfitId: item.id, accessoryId: 'none' }} />
      ) : (
        <MascotMark variant={avatar} size={108} wardrobe={preview} />
      )}
    </div>
  );
}

export function AvatarRoom({
  avatar,
  room,
  ownedItemIds,
  balance,
  busy,
  onSelect,
  message,
}: {
  avatar: AvatarId;
  room: RoomSelection;
  ownedItemIds: readonly string[];
  balance: number;
  busy: boolean;
  onSelect: (itemId: string) => void;
  message?: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<RoomCategory>('background');
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const id = useId();
  const background = getRoomItem(room.backgroundId);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = categories.findIndex((item) => item.id === category);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 2
          : (current + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
    const target = categories[next].id;
    setCategory(target);
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>(`[data-category="${target}"]`)
      ?.focus();
  }

  return (
    <section
      className="avatar-room"
      data-testid="avatar-room"
      aria-label="아바타의 방"
      data-avatar-id={resolveAvatar(avatar)}
      data-background-id={room.backgroundId}
      data-outfit-id={room.outfitId}
      data-accessory-id={room.accessoryId}
    >
      <div className="avatar-room-heading">
        <div>
          <span className="room-eyebrow">나의 작은 연구실</span>
          <h2>우리의 작은 방</h2>
        </div>
        <span
          className="room-balance"
          data-testid="room-balance"
          aria-label={`사용 가능한 꾸미기 XP ${balance.toLocaleString('ko-KR')}`}
        >
          <Icon name="spark" size={17} />
          <b>{balance.toLocaleString('ko-KR')}</b>
          <span>XP</span>
        </span>
      </div>
      <button
        ref={opener}
        className="avatar-room-open"
        onClick={() => setOpen(true)}
        aria-label="방 꾸미기"
        aria-haspopup="dialog"
      >
        <AvatarRoomScene avatar={avatar} room={room} />
        <span className="room-scene-name">
          <span className="room-online-dot" />
          {background?.name ?? '민트 공부방'}
        </span>
        <span className="room-customize-label">
          <Icon name="spark" size={19} />방 꾸미기
          <Icon name="arrow" size={17} />
        </span>
      </button>
      <p className="room-caption">차곡차곡 모은 XP로, 우리만의 모습을 만들어요.</p>

      <dialog
        ref={dialog}
        className="room-shop"
        data-testid="room-shop"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onCancel={() => setOpen(false)}
        onClose={() => {
          setOpen(false);
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <div className="room-shop-grip" aria-hidden="true" />
        <header className="room-shop-header">
          <div>
            <span className="room-eyebrow">MAKE IT YOURS</span>
            <h2 id={`${id}-title`}>방 꾸미기</h2>
          </div>
          <button
            className="room-shop-close"
            onClick={() => setOpen(false)}
            aria-label="꾸미기 닫기"
            autoFocus
          >
            <Icon name="close" size={22} />
          </button>
        </header>
        <div className="room-shop-summary">
          <div className="room-shop-avatar">
            <Mascot variant={avatar} size={92} wardrobe={room} />
          </div>
          <div>
            <strong>조금씩 나다워지는 방</strong>
            <p id={`${id}-description`}>
              구매하면 XP가 차감되고 바로 장착돼요.
              <br />
              보유한 아이템은 언제든 무료로 바꿔요.
            </p>
          </div>
        </div>
        <div className="room-shop-wallet">
          <span>
            <Icon name="spark" size={19} />
            사용할 수 있는 XP
          </span>
          <strong data-testid="room-shop-balance" aria-live="polite" aria-atomic="true">
            {balance.toLocaleString('ko-KR')} <small>XP</small>
          </strong>
        </div>
        <div className="room-shop-tabs" role="tablist" aria-label="꾸미기 종류">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${id}-tab-${item.id}`}
              aria-selected={category === item.id}
              aria-controls={`${id}-items`}
              tabIndex={category === item.id ? 0 : -1}
              onClick={() => setCategory(item.id)}
              onKeyDown={moveTab}
              data-category={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        {message && (
          <p className="room-shop-message" role="alert">
            {message}
          </p>
        )}
        <div
          className="room-shop-content"
          role="tabpanel"
          id={`${id}-items`}
          aria-labelledby={`${id}-tab-${category}`}
          aria-busy={busy}
          tabIndex={0}
        >
          {category === 'background' && (
            <p className="room-background-note">배경은 구매한 뒤 미리보기가 나타나요.</p>
          )}
          <div className="room-item-grid">
            {roomItems
              .filter((item) => item.category === category)
              .map((item) => {
                const owned = item.price === 0 || ownedItemIds.includes(item.id);
                const selected = room[roomSlot(category)] === item.id;
                const affordable = owned || balance >= item.price;
                const action = selected ? (
                  '장착 중'
                ) : owned ? (
                  '무료로 장착'
                ) : (
                  <>
                    <span>{item.price.toLocaleString('ko-KR')} XP</span>
                    <span>구매하고 장착</span>
                  </>
                );
                const ariaLabel = selected
                  ? `${item.name} 장착 중`
                  : owned
                    ? `${item.name} 무료로 장착`
                    : `${item.name} ${item.price} XP로 구매하고 장착`;
                return (
                  <article
                    className={`room-item ${item.category === 'background' && !owned ? 'room-item--description-only' : ''} ${selected ? 'is-equipped' : ''} ${!affordable ? 'is-unaffordable' : ''}`}
                    key={item.id}
                    data-testid="room-item"
                    data-item-id={item.id}
                    data-owned={owned}
                    data-equipped={selected}
                  >
                    {(item.category !== 'background' || owned) && (
                      <div className="room-item-picture">
                        <ItemPreview item={item} avatar={avatar} room={room} />
                        {selected ? (
                          <span className="room-item-badge">
                            <Icon name="check" size={13} />
                            장착
                          </span>
                        ) : owned ? (
                          <span className="room-item-badge is-owned">보유</span>
                        ) : null}
                      </div>
                    )}
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <button
                      className={`room-item-action ${!owned ? 'room-item-action--purchase' : ''}`}
                      data-item-id={item.id}
                      disabled={busy || selected || !affordable}
                      onClick={() => onSelect(item.id)}
                      aria-label={ariaLabel}
                      aria-describedby={!affordable ? `${id}-${item.id}-need` : undefined}
                    >
                      {selected && <Icon name="check" size={15} />}
                      {action}
                    </button>
                    {!affordable && (
                      <small className="room-item-shortfall" id={`${id}-${item.id}-need`}>
                        {(item.price - balance).toLocaleString('ko-KR')} XP 더 모으면 만나요
                      </small>
                    )}
                  </article>
                );
              })}
          </div>
        </div>
      </dialog>
    </section>
  );
}
