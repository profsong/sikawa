import { companionImages, resolveAvatar, type CompanionId } from '../core/avatar';
import { getRoomItem } from '../core/room-catalog';
import { MascotAccessory } from './MascotAccessory';
import { MascotOutfit } from './MascotOutfit';

export type AvatarId = CompanionId;
export interface MascotWardrobe {
  outfitId?: string;
  accessoryId?: string;
}
interface MascotProps {
  variant?: AvatarId;
  size?: number;
  mood?: 'happy' | 'thinking' | 'celebrate' | 'encourage';
  wardrobe?: MascotWardrobe;
  className?: string;
}

/** The original three basic garments use the same local SVG coordinates as the catalog. */
function BasicOutfit({ outfitId }: { outfitId: string }) {
  if (!['blue-hoodie', 'green-varsity', 'sailor'].includes(outfitId))
    return <MascotOutfit outfitId={outfitId} />;
  const blue = outfitId === 'blue-hoodie';
  const varsity = outfitId === 'green-varsity';
  const fill = blue ? '#2799E1' : varsity ? '#35AA82' : '#F8FCFF';
  const stroke = blue ? '#1479B8' : varsity ? '#218466' : '#2476AD';
  return (
    <g>
      <path
        d="M78 143q42-16 84 0l14 67q-56 20-112 0Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m78 147-18 20 12 24m90-44 18 20-12 24"
        fill="none"
        stroke={varsity ? '#F4F4D9' : fill}
        strokeWidth="17"
        strokeLinecap="round"
      />
      {blue ? (
        <>
          <path
            d="m101 165-2 14m40-14 2 14"
            stroke="#D3F5FF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M100 190h40l7 15H93Z"
            fill="#1986CA"
            stroke="#126FA7"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="m120 171 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#FFE17D" />
        </>
      ) : varsity ? (
        <>
          <path d="M120 149v61M76 204q44 11 88 0" stroke="#EAF8D6" strokeWidth="4" />
          <path
            d="M140 170v16h12"
            fill="none"
            stroke="#F6F8DD"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="115" cy="175" r="2" fill="#FFF4AE" />
          <circle cx="115" cy="188" r="2" fill="#FFF4AE" />
        </>
      ) : (
        <>
          <path d="m82 151 38 26 38-26-10 30-28-7-28 7Z" fill="#277EAF" />
          <path d="m87 155 33 22 33-22" fill="none" stroke="#E6F9FF" strokeWidth="2.5" />
          <path d="m120 174-8 18 8 10 8-10Z" fill="#68CEAC" />
          <circle cx="120" cy="177" r="5" fill="#F8DA70" />
          <path d="M76 206q44 10 88 0" stroke="#277EAF" strokeWidth="4" />
        </>
      )}
    </g>
  );
}

/** The illustrated avatar stays intact. Only explicitly equipped items add an SVG layer. */
function PhotoAvatar({
  variant,
  size,
  mood = 'happy',
  wardrobe,
  className = '',
  face = false,
}: MascotProps & { size: number; face?: boolean }) {
  const id = resolveAvatar(variant);
  const image = companionImages[id];
  const outfit = getRoomItem(wardrobe?.outfitId ?? 'original');
  const accessory = getRoomItem(wardrobe?.accessoryId ?? 'none');
  const showOutfit = outfit?.category === 'outfit' && outfit.id !== 'original';
  const showAccessory = accessory?.category === 'accessory' && accessory.id !== 'none';
  return (
    <svg
      className={`mascot mascot-photo mascot-photo--${id} ${className}`.trim()}
      width={size}
      height={size}
      viewBox={face ? image.faceViewBox : '0 0 240 240'}
      aria-hidden="true"
      focusable="false"
      data-avatar-id={id}
      data-avatar-image={image.path}
      data-mood={mood}
      fill="none"
    >
      <image
        href={`${import.meta.env.BASE_URL}${image.path}`}
        x="0"
        y="0"
        width="240"
        height="240"
        preserveAspectRatio="xMidYMid meet"
      />
      {showOutfit && (
        <g
          className="photo-wardrobe-overlay photo-outfit"
          data-outfit-id={outfit.id}
          transform={image.outfitTransform}
        >
          <BasicOutfit outfitId={outfit.id} />
        </g>
      )}
      {showAccessory && (
        <g
          className="photo-wardrobe-overlay photo-accessory"
          data-accessory-id={accessory.id}
          transform={
            accessory.id === 'mint-scarf'
              ? image.neckAccessoryTransform
              : image.faceAccessoryTransform
          }
        >
          <MascotAccessory variant={id} accessoryId={accessory.id} />
        </g>
      )}
    </svg>
  );
}

export function Mascot({ size = 180, ...props }: MascotProps) {
  return <PhotoAvatar {...props} size={size} face={size <= 48} />;
}
export function MascotMark({ size = 40, ...props }: MascotProps) {
  return <PhotoAvatar {...props} size={size} face />;
}
