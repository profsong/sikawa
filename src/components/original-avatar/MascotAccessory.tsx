import type { CompanionId } from './avatar';

export function MascotAccessory({
  accessoryId,
  variant,
}: {
  accessoryId?: string;
  variant: CompanionId;
}) {
  const monkey = variant === 'monchichi';
  const cat = variant === 'sichiware';
  if (accessoryId === 'mint-ribbon')
    return (
      <g
        transform={`translate(${variant === 'sipompurin' ? 170 : 73} ${monkey ? 65 : cat ? 58 : 69}) rotate(${variant === 'sipompurin' ? 16 : -18})`}
      >
        <path
          d="m-6 7-8 25 12-5 7 5 1-25m3 0 7 24 7-7 12 2-18-23"
          fill="#72CBB0"
          stroke="#429E8E"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M-5-4q-24-21-27-6-2 11 4 20 7 9 24-7m9-7q24-21 27-6 2 11-4 20-7 9-24-7"
          fill="#A2E4CC"
          stroke="#4DAF9B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="m-24-6 17 6-16 5m47-11-17 6 16 5"
          stroke="#D9F7E6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <rect
          x="-6"
          y="-7"
          width="13"
          height="17"
          rx="5"
          fill="#73CBB1"
          stroke="#4DAF9B"
          strokeWidth="1.5"
        />
      </g>
    );
  if (accessoryId === 'star-hairpin')
    return (
      <g transform={`translate(${monkey ? 160 : 168} ${cat ? 64 : 74}) rotate(18)`}>
        <path
          d="M-22 3h37q6 0 6 5t-6 5h-37q-6 0-6-5t6-5Z"
          fill="#98D3E7"
          stroke="#548FAC"
          strokeWidth="1.7"
        />
        <path d="M-20 8H14" stroke="#DDF5FA" strokeWidth="2" strokeLinecap="round" />
        <path
          d="m0-18 6 12 13 2-10 10 2 13L0 13l-12 6 2-13-10-10 14-2Z"
          fill="#FFE6A1"
          stroke="#D6B56C"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m-2-9 3 5 6 1"
          stroke="#FFF7D3"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="m23-14 2 5 5 1-4 3 1 5-4-2-5 2 1-5-3-3 5-1Z" fill="#C6ECE8" />
      </g>
    );
  if (accessoryId === 'moon-hairpin')
    return (
      <g transform={`translate(${monkey ? 75 : cat ? 73 : 65} ${cat ? 68 : 78}) rotate(-15)`}>
        <path
          d="M-19 10h33q5 0 5 4t-5 4h-33q-5 0-5-4t5-4Z"
          fill="#9CCBD8"
          stroke="#5F93AA"
          strokeWidth="1.7"
        />
        <path
          d="M5-20a20 20 0 1 0 11 34C2 16-8 4-5-8q2-8 10-12Z"
          fill="#D5D8F4"
          stroke="#8B9AC5"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M-13-6q-5 10 4 16" stroke="#F1F0FF" strokeWidth="2.8" strokeLinecap="round" />
        <path
          d="m18-9 3 6 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1Z"
          fill="#FFE7A7"
          stroke="#D8BC77"
          strokeWidth="1.2"
        />
      </g>
    );
  if (accessoryId === 'butterfly-clip')
    return (
      <g transform={`translate(${monkey ? 77 : cat ? 73 : 64} ${cat ? 62 : 76}) rotate(-18)`}>
        <path
          d="M-3 1C-27-30-40-2-15 9-30 24-4 30-1 9M3 1C27-30 40-2 15 9 30 24 4 30 1 9"
          fill="#A6DDED"
          stroke="#588FAE"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M-6 1q-14-15-17-4 2 8 14 10m15-6q14-15 17-4-2 8-14 10" fill="#B6E6CF" />
        <path
          d="M-7 14q-10 8-9 2m23-2q10 8 9 2"
          stroke="#DFF5E6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="m-2-3-6-8m10 8 6-8" stroke="#557F96" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M0-2v17" stroke="#E3BE76" strokeWidth="5" strokeLinecap="round" />
        <circle cy="-3" r="3" fill="#F8D891" />
      </g>
    );
  if (accessoryId === 'daisy-pin')
    return (
      <g transform={`translate(${monkey ? 163 : 171} ${cat ? 65 : 76})`}>
        <path
          d="M-5 15q-27 0-19-16 21 0 19 16m14 2q24-5 20-18-20 2-20 18"
          fill="#86C7A8"
          stroke="#5AA589"
          strokeWidth="1.5"
        />
        {Array.from({ length: 8 }, (_, index) => (
          <ellipse
            key={index}
            cx="0"
            cy="-12"
            rx="6.5"
            ry="11"
            transform={`rotate(${index * 45})`}
            fill="#FFFEED"
            stroke="#DCE7D1"
            strokeWidth="1.4"
          />
        ))}
        <circle r="9" fill="#F2CD74" stroke="#D8B15B" strokeWidth="1.6" />
        <path
          d="m-3-3 1-1m5 2 1 1m-5 4 1 0"
          stroke="#FFF0B6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    );
  if (accessoryId === 'pearl-headband') {
    const offset = monkey ? 11 : cat ? 0 : 7;
    return (
      <g transform={`translate(0 ${offset})`}>
        <path
          d="M61 82q7-40 59-40t59 40"
          fill="none"
          stroke="#639DAB"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {[
          [64, 73],
          [71, 61],
          [81, 52],
          [94, 46],
          [107, 43],
          [120, 42],
          [133, 43],
          [146, 46],
          [159, 52],
          [169, 61],
          [176, 73],
        ].map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="5.8" fill="#FFF9E6" stroke="#C3D9CF" strokeWidth="1.4" />
            <circle cx={x - 1.8} cy={y - 1.8} r="1.7" fill="#FFFFFF" />
          </g>
        ))}
        <path d="m171 81 3 7-4 6-4-7Z" fill="#ACE0CE" stroke="#6AB49D" strokeWidth="1.4" />
      </g>
    );
  }
  if (accessoryId === 'heart-sunglasses') {
    const left = monkey ? 99 : 94;
    const right = monkey ? 141 : 146;
    return (
      <g stroke="#378398" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path
          d={`M${left - 17} 102l-11-4M${right + 17} 102l11-4M${left + 18} 104q${(right - left - 36) / 2}-5 ${right - left - 36} 0`}
          fill="none"
        />
        {[left, right].map((x) => (
          <g key={x} transform={`translate(${x} 107)`}>
            <path
              d="M0-7C-9-19-22-10-16 1L0 17 16 1C22-10 9-19 0-7Z"
              fill="#9FE0D9"
              fillOpacity=".2"
            />
            <path d="m-12-4 3-3m17 0 3 3" stroke="#F7FFFF" strokeWidth="1.8" />
          </g>
        ))}
      </g>
    );
  }
  if (accessoryId === 'mint-scarf')
    return (
      <g stroke="#4A9C8A" strokeWidth="1.8" strokeLinejoin="round">
        <path d="m140 165 21 9-4 15-9-4-8 3-6-20" fill="#77CDB2" />
        <path d="m145 165 15 0 15 15-9 1-4 7-19-18" fill="#A0DFCA" />
        <path d="M85 155q35 19 70 0l-3 17q-32 15-64 0Z" fill="#8BD8BE" />
        <path
          d="M91 164q25 12 46 4m10 8 9 4"
          fill="none"
          stroke="#D9F5E5"
          strokeWidth="2.7"
          strokeLinecap="round"
        />
        <path d="M140 163q8-6 14 1l-4 11-11-4Z" fill="#65BCA4" />
        <path d="m151 183 2 4m-6-4 2 3" stroke="#C9EFDA" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    );
  if (accessoryId === 'lucky-clover')
    return (
      <g transform={`translate(${monkey ? 66 : cat ? 62 : 53} ${cat ? 76 : 84}) rotate(-22)`}>
        <path
          d="M0 3q8 16 2 29"
          fill="none"
          stroke="#4D9D7C"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {[0, 90, 180, 270].map((angle, index) => (
          <path
            key={angle}
            transform={`rotate(${angle})`}
            d="M0 2C-20-5-14-24-4-18 0-15 0-11 0-11S0-15 4-18C14-24 20-5 0 2Z"
            fill={index % 2 ? '#9AD9B5' : '#72C3A1'}
            stroke="#4F9E7F"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ))}
        <path
          d="M0-5v-9M5 0h9M0 5v9M-5 0h-9"
          stroke="#C5EBC8"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle r="3.5" fill="#F4DB93" />
      </g>
    );
  if (accessoryId === 'blue-beret')
    return (
      <g transform={cat ? 'translate(4 7) scale(.96 .95)' : undefined}>
        <path
          d="M126 19q-4-9 4-13"
          fill="none"
          stroke="#5595B8"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M70 45C64 28 89 15 123 14q44-1 53 22 6 15-15 18l-62 4Q78 57 70 45Z"
          fill="#92D3EB"
          stroke="#5CA6CA"
          strokeWidth="2"
        />
        <path
          d="M82 50q41 9 81-3l-2 12q-40 12-75 0Z"
          fill="#6AB6D7"
          stroke="#5199BD"
          strokeWidth="1.8"
        />
        <path
          d="M83 36q14-13 38-13"
          fill="none"
          stroke="#CBEEF6"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="m155 28 2 5 6 1-5 4 1 6-5-3-5 3 1-6-4-4 6-1Z"
          fill="#F8E3A4"
          stroke="#D3BD7F"
          strokeWidth="1"
        />
      </g>
    );
  if (accessoryId === 'round-glasses') {
    const left = variant === 'monchichi' ? 99 : 94;
    const right = variant === 'monchichi' ? 141 : 146;
    return (
      <g stroke="#284E68" strokeWidth="3.5" fill="none" strokeLinecap="round">
        <circle cx={left} cy="109" r="17" fill="#E4F8FF" fillOpacity=".16" />
        <circle cx={right} cy="109" r="17" fill="#E4F8FF" fillOpacity=".16" />
        <path
          d={`M${left + 17} 107q${(right - left - 34) / 2} -5 ${right - left - 34} 0M${left - 17} 105l-10-4M${right + 17} 105l10-4`}
        />
        <path d={`m${left - 9} 100-3 6M${right - 9} 100l-3 6`} stroke="white" strokeWidth="2" />
      </g>
    );
  }
  if (accessoryId === 'star-headphones')
    return (
      <g>
        <path
          d="M48 106V94a72 72 0 0 1 144 0v12"
          fill="none"
          stroke="#27769F"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path d="M48 93a72 72 0 0 1 144 0" fill="none" stroke="#89D9F2" strokeWidth="4" />
        <rect
          x="37"
          y="94"
          width="23"
          height="39"
          rx="10"
          fill="#75D7B2"
          stroke="#248C79"
          strokeWidth="3"
        />
        <rect
          x="180"
          y="94"
          width="23"
          height="39"
          rx="10"
          fill="#75D7B2"
          stroke="#248C79"
          strokeWidth="3"
        />
        <path
          d="m49 104 3 6 6 1-5 4 1 7-5-3-5 3 1-7-5-4 6-1Zm143 0 3 6 6 1-5 4 1 7-5-3-5 3 1-7-5-4 6-1Z"
          fill="#FFF0A6"
        />
      </g>
    );
  if (accessoryId === 'flower-crown')
    return (
      <g>
        <path
          d="M75 63q45-26 90 0"
          fill="none"
          stroke="#48A987"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path d="M76 61q-15-17-18-3 4 10 18 3m88 0q15-17 18-3-4 10-18 3" fill="#77CF9A" />
        {[
          [-36, 60],
          [-18, 51],
          [0, 48],
          [18, 51],
          [36, 60],
        ].map(([offset, y], index) => (
          <g key={offset} transform={`translate(${120 + offset} ${y})`}>
            <path
              d="M0-10C5-13 10-7 7-3c8 0 9 8 3 11-5 2-7-2-10-3-3 5-10 7-12 0-1-5 4-7 6-9-4-5-1-9 6-6Z"
              fill={index % 2 ? '#F9B9C6' : '#FFF2B8'}
              stroke={index % 2 ? '#E7A0B2' : '#ECD88F'}
              strokeWidth="1"
            />
            <circle r="3.5" fill="#E9B947" />
          </g>
        ))}
      </g>
    );
  return null;
}
