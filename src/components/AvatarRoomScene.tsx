import { useId } from 'react';
import { companionNames, resolveAvatar } from '../core/avatar';
import { defaultRoom, getRoomItem, type RoomSelection } from '../core/room-catalog';
import { Mascot, type AvatarId } from './Mascot';
import { RoomBackgrounds } from './RoomBackgrounds';

const roomThemes = new Set([
  'rain-library',
  'bamboo-hideout',
  'cloud-cabin',
  'coral-studio',
  'moon-observatory',
  'winter-chalet',
  'spring-greenhouse',
  'seaside-lighthouse',
  'music-studio',
  'night-camp',
]);

/** A local SVG room; the character keeps the same face in every outfit. */
export function AvatarRoomScene({
  avatar,
  room = defaultRoom,
  className = '',
  label,
  preview = false,
}: {
  avatar: AvatarId;
  room?: RoomSelection;
  className?: string;
  label?: string;
  preview?: boolean;
}) {
  const clipId = `room-window-${useId().replace(/:/g, '')}`;
  const night = room.backgroundId === 'star-loft';
  const ocean = room.backgroundId === 'ocean-window';
  const garden = room.backgroundId === 'sky-garden';
  const themed = roomThemes.has(room.backgroundId);
  const wall = night ? '#465B8D' : ocean ? '#D7F0F6' : garden ? '#D7F0FF' : '#E1F3E7';
  const floor = night ? '#8B9FBD' : ocean ? '#A8DCE1' : garden ? '#C4E4C8' : '#B7DBCA';
  const frame = night ? '#C1D2EA' : '#FFFCED';
  const description = [
    companionNames[resolveAvatar(avatar)],
    getRoomItem(room.backgroundId)?.name ?? '민트 공부방',
    getRoomItem(room.outfitId)?.name ?? '원래 옷',
    getRoomItem(room.accessoryId)?.name ?? '액세서리 없이',
  ].join(', ');
  return (
    <div
      className={`avatar-room-scene ${night ? 'room-night' : ''} ${className}`}
      role="img"
      aria-label={label ?? description}
      data-testid={preview ? undefined : 'avatar-room-scene'}
      data-avatar-id={resolveAvatar(avatar)}
      data-background-id={room.backgroundId}
      data-outfit-id={room.outfitId}
      data-accessory-id={room.accessoryId}
    >
      <svg
        className="room-scenery"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {themed ? (
          <RoomBackgrounds id={room.backgroundId} />
        ) : (
          <>
            <defs>
              <clipPath id={clipId}>
                {ocean ? (
                  <circle cx="106" cy="116" r="64" />
                ) : (
                  <rect x="40" y="50" width="132" height="146" rx="28" />
                )}
              </clipPath>
            </defs>
            <rect width="400" height="400" rx="28" fill={wall} />
            {night && (
              <>
                <path d="M0 87 200 0l200 87" stroke="#667CAE" strokeWidth="10" />
                <path d="m218 31 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#FFE4A0" />
                <circle cx="350" cy="50" r="2.5" fill="#D9EAFF" />
                <circle cx="294" cy="29" r="2" fill="#D9EAFF" />
              </>
            )}
            <path d="M0 276h400v124H0Z" fill={floor} />
            <path d="M0 276h400" stroke={night ? '#697EAA' : '#9DC9BD'} strokeWidth="9" />
            <g stroke={night ? '#7E91AF' : '#A0CABC'} strokeWidth="2" opacity=".65">
              <path d="M0 322h400M0 375h400M87 279 54 400m132-121-7 121m132-121 29 121" />
            </g>
            <ellipse
              cx="200"
              cy="335"
              rx="119"
              ry="39"
              fill={night ? '#526F9C' : '#86CBB7'}
              opacity=".45"
            />
            <ellipse cx="200" cy="330" rx="115" ry="36" fill={night ? '#BCD7EA' : '#F5F4D7'} />
            <ellipse
              cx="200"
              cy="330"
              rx="101"
              ry="27"
              stroke={night ? '#A3C4DB' : '#E0E6C1'}
              strokeWidth="2"
            />

            {ocean ? (
              <circle cx="106" cy="116" r="73" fill="#7BC1CF" />
            ) : (
              <rect
                x="31"
                y="43"
                width="150"
                height="161"
                rx="34"
                fill={night ? '#344A76' : '#BDD8CC'}
              />
            )}
            <g clipPath={`url(#${clipId})`}>
              <rect x="30" y="39" width="154" height="169" fill={night ? '#203A68' : '#99DDF4'} />
              {night ? (
                <>
                  <path d="M132 64a25 25 0 1 0 16 37 23 23 0 0 1-16-37Z" fill="#FFE8A0" />
                  <g fill="#EDF5FE">
                    <circle cx="60" cy="79" r="2" />
                    <circle cx="97" cy="57" r="2.5" />
                    <circle cx="73" cy="129" r="2" />
                    <circle cx="148" cy="154" r="2" />
                  </g>
                  <path d="m101 112 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#FFF2BD" />
                  <path d="M30 175q36-35 65-9t90-10v57H30Z" fill="#2E5686" />
                </>
              ) : (
                <>
                  <circle cx="144" cy="77" r="17" fill="#FFE89D" />
                  <path d="M44 94q1-13 14-13 6-15 19-5 14-6 20 7 16-1 16 11Z" fill="#F8FFFF" />
                  <path
                    d="M114 125q2-10 12-10 6-11 15-3 12-4 17 7 12 0 12 7Z"
                    fill="#F8FFFF"
                    opacity=".9"
                  />
                  {ocean ? (
                    <>
                      <path d="M30 140q25-9 50 0t50 0 54 0v69H30Z" fill="#53BBCF" />
                      <path d="M30 163q25-9 50 0t50 0 54 0v46H30Z" fill="#298FAF" />
                      <path
                        d="m47 153 20 1m36 22 24 1m11-29 20 1"
                        stroke="#BBEFF4"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path d="m83 130 18-32v32Z" fill="#FFF7DA" />
                      <path d="M74 133h38l-8 9H83Z" fill="#F4C76D" />
                    </>
                  ) : (
                    <>
                      <path d="M30 166q38-38 76-3t83-8v60H30Z" fill="#8FCBA9" />
                      <path d="M30 186q33-30 66-9t88-4v40H30Z" fill="#67B88E" />
                    </>
                  )}
                </>
              )}
            </g>
            {ocean ? (
              <>
                <circle cx="106" cy="116" r="68" stroke={frame} strokeWidth="9" />
                <g fill="#D7A966">
                  <circle cx="106" cy="47" r="3" />
                  <circle cx="175" cy="116" r="3" />
                  <circle cx="106" cy="185" r="3" />
                  <circle cx="37" cy="116" r="3" />
                </g>
              </>
            ) : (
              <>
                <rect
                  x="37"
                  y="47"
                  width="138"
                  height="152"
                  rx="30"
                  stroke={frame}
                  strokeWidth="8"
                />
                <path d="M106 51v144M40 124h132" stroke={frame} strokeWidth="6" />
                <path d="M28 204h157" stroke={frame} strokeWidth="10" strokeLinecap="round" />
              </>
            )}

            <rect
              x="254"
              y="58"
              width="95"
              height="7"
              rx="3.5"
              fill={night ? '#B4C6DF' : '#9DB8A5'}
            />
            <path d="M266 64v10m70-10v10" stroke={night ? '#B4C6DF' : '#9DB8A5'} strokeWidth="4" />
            <rect
              x="264"
              y="25"
              width="15"
              height="32"
              rx="3"
              fill="#58ABC8"
              transform="rotate(-9 264 25)"
            />
            <rect x="284" y="20" width="14" height="38" rx="3" fill="#E9BC66" />
            <rect x="301" y="29" width="13" height="29" rx="3" fill="#76BDA0" />
            <path
              d="m289 27 4 0m-4 22h4m12-12h5"
              stroke="#FFF5D8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M329 43q-9-15-1-21 8 5 4 19m-1-3q8-12 14-7-2 9-13 10" fill="#58AB87" />
            <path d="M322 42h19l-3 16h-13Z" fill="#F3D2B4" />
            <rect x="273" y="94" width="60" height="67" rx="10" fill={frame} />
            <rect
              x="280"
              y="101"
              width="46"
              height="53"
              rx="6"
              fill={night ? '#8299BD' : '#D3ECE2'}
            />
            <path
              d="m302 111 6 12 13 2-10 10 2 13-11-6-11 6 2-13-10-10 13-2Z"
              fill={night ? '#FFE4A0' : '#F7D27D'}
            />
            <path d="m283 154 39 0" stroke="#E4CF9D" strokeWidth="3" />

            <g>
              <ellipse cx="58" cy="302" rx="34" ry="10" fill="#557F76" opacity=".15" />
              <path
                d="M57 263v-57m0 34-20-22m21 35 22-21"
                stroke="#388F77"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M57 230q-34-1-31-26 24-4 31 26m1 17q31 0 31-26-25-2-31 26m0-26q-18-24-3-39 20 10 3 39"
                fill={night ? '#5CB99B' : '#52B58B'}
              />
              <path
                d="M57 229q-13-12-25-19m27 36 24-18"
                stroke="#8DD4AB"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M36 260h43l-6 36q-15 9-31 0Z" fill="#F1C2A0" />
              <rect x="32" y="255" width="51" height="11" rx="5" fill="#FFD7B4" />
              <path d="M46 273v14" stroke="#FBE2C4" strokeWidth="5" strokeLinecap="round" />
            </g>
            <g>
              <path
                d="M305 290v34m60-34v34"
                stroke={night ? '#4D6684' : '#91B4A0'}
                strokeWidth="8"
                strokeLinecap="round"
              />
              <rect
                x="294"
                y="279"
                width="80"
                height="16"
                rx="6"
                fill={night ? '#B9CCDE' : '#F6D9AD'}
              />
              <rect x="304" y="266" width="52" height="12" rx="3" fill="#4BA7C5" />
              <path d="M312 270h37" stroke="#D5F1ED" strokeWidth="3" strokeLinecap="round" />
              <rect
                x="310"
                y="253"
                width="51"
                height="12"
                rx="3"
                fill="#E7B762"
                transform="rotate(4 310 253)"
              />
              <path d="M331 247h16q1-17-8-18-9 1-8 18Z" fill={frame} />
              <path
                d="M336 226q-8-8 2-15"
                stroke={night ? '#B9D5DF' : '#A7CDBF'}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
            {garden && (
              <>
                <path
                  d="M212 0v46m0 0q-17 14-29 0m29 0q16 15 30 1"
                  stroke="#69B68F"
                  strokeWidth="4"
                />
                <path d="M197 44h30l-5 24h-20Z" fill="#F7DBAB" />
                <path
                  d="M210 45q-19-27-28-11 3 14 28 11m5 0q20-26 28-10-3 15-28 10"
                  fill="#64BD8E"
                />
                <circle cx="210" cy="33" r="8" fill="#F5B1C0" />
                <circle cx="210" cy="33" r="3" fill="#F8DA76" />
                <path d="m349 196 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#FFDA79" />
              </>
            )}
            <path
              d="m24 348 3 5 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z"
              fill={night ? '#DEDAA5' : '#F5E3A0'}
            />
          </>
        )}
      </svg>
      <div className="room-scene-character">
        <Mascot variant={avatar} size={240} wardrobe={room} mood="happy" />
      </div>
    </div>
  );
}
