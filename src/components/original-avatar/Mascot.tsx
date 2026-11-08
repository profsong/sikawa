import { resolveAvatar, type CompanionId } from './avatar';
import { MascotAccessory } from './MascotAccessory';
import { CompanionOutfitHood, MascotOutfit, OutfitSleeveStripes } from './MascotOutfit';

export type AvatarId = CompanionId | 'lumi' | 'momo' | 'nova';
type Mood = 'happy' | 'thinking' | 'celebrate' | 'encourage';

const newOutfitColors: Record<
  string,
  { body: string; sleeve: string; trim: string; light: string }
> = {
  'nike-hoodie': { body: '#284B70', sleeve: '#284B70', trim: '#1A3554', light: '#729DB8' },
  'adidas-puffer': { body: '#398EAA', sleeve: '#398EAA', trim: '#24667F', light: '#7BC7CD' },
  'burberry-coat': { body: '#D8B98D', sleeve: '#E3CBA3', trim: '#AA8D68', light: '#F2E3C6' },
  'mint-cardigan': { body: '#8BD4BC', sleeve: '#94D9C1', trim: '#55A98E', light: '#DBF5DE' },
  'denim-jacket': { body: '#75ACCE', sleeve: '#7DB7D4', trim: '#477E9F', light: '#C0E2E9' },
  'striped-knit': { body: '#F6F1D9', sleeve: '#F6F1D9', trim: '#6DA5BB', light: '#BDDDE5' },
  'lavender-sweater': { body: '#B8B3DD', sleeve: '#C3BEE4', trim: '#8885B6', light: '#E8E3F8' },
  raincoat: { body: '#F1D97B', sleeve: '#F1D97B', trim: '#CAA956', light: '#FFF1B4' },
  'cozy-fleece': { body: '#F0E9D3', sleeve: '#F0E9D3', trim: '#B5BC9B', light: '#FFFCED' },
  'ribbon-dress': { body: '#93D1BF', sleeve: '#F7F1D9', trim: '#5EA68E', light: '#D2ECE3' },
};

export interface MascotWardrobe {
  outfitId?: string;
  accessoryId?: string;
}

function outfitColors(outfitId: string) {
  if (newOutfitColors[outfitId]) return newOutfitColors[outfitId];
  if (outfitId === 'blue-hoodie')
    return { body: '#2799E1', sleeve: '#2799E1', trim: '#1479B8', light: '#81D5FA' };
  if (outfitId === 'green-varsity')
    return { body: '#35AA82', sleeve: '#F4F4D9', trim: '#218466', light: '#B9F2CD' };
  if (outfitId === 'sailor')
    return { body: '#F8FCFF', sleeve: '#F8FCFF', trim: '#2476AD', light: '#B5E6F6' };
  return { body: '#202328', sleeve: '#202328', trim: '#121519', light: '#46494E' };
}

function OutfitDetails({ outfitId }: { outfitId: string }) {
  if (outfitId === 'blue-hoodie')
    return (
      <g>
        <path d="m101 165-2 14m40-14 2 14" stroke="#D3F5FF" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M100 190h40l7 15H93Z"
          fill="#1986CA"
          stroke="#126FA7"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="m120 171 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#FFE17D" />
      </g>
    );
  if (outfitId === 'green-varsity')
    return (
      <g>
        <path d="M120 163v45" stroke="#EAF8D6" strokeWidth="4" />
        <path d="M76 204q44 11 88 0" stroke="#EAF8D6" strokeWidth="7" />
        <path d="M76 204q44 11 88 0" stroke="#278B6D" strokeWidth="2" />
        <path
          d="M140 173v16h12"
          fill="none"
          stroke="#F6F8DD"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="116" cy="177" r="2" fill="#FFF4AE" />
        <circle cx="116" cy="190" r="2" fill="#FFF4AE" />
      </g>
    );
  if (outfitId === 'sailor')
    return (
      <g>
        <path d="m82 158 38 26 38-26-10 30-28-7-28 7Z" fill="#277EAF" />
        <path d="m87 162 33 22 33-22" fill="none" stroke="#E6F9FF" strokeWidth="2.5" />
        <path d="m120 181-8 18 8 10 8-10Z" fill="#68CEAC" />
        <circle cx="120" cy="184" r="5" fill="#F8DA70" />
        <path d="M76 206q44 10 88 0" stroke="#277EAF" strokeWidth="4" />
      </g>
    );
  return null;
}

function MonchichiFace({ mood, outfitId = 'original' }: { mood: Mood; outfitId?: string }) {
  const look = mood === 'thinking' ? 2 : 0;
  const colors = outfitColors(outfitId);
  const hood = ['original', 'blue-hoodie', 'nike-hoodie', 'raincoat'].includes(outfitId);
  return (
    <g>
      {hood && (
        <path
          d="M49 113C39 83 47 40 70 25Q83 8 101 15L145 15Q166 12 182 40C198 69 195 110 181 142Q167 162 120 165Q73 162 57 143Z"
          fill={colors.body}
        />
      )}
      {hood && (
        <path
          d="M63 61Q66 32 91 25M151 26q27 12 28 40"
          fill="none"
          stroke={outfitId === 'original' ? '#30343A' : colors.light}
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      <ellipse cx="120" cy="104" rx="62" ry="58" fill="#C99225" />
      <path
        d="M62 113 58 99l6-5-3-10 9-3-1-11 11-1 4-10 10 3 9-10 10 5 12-7 10 7 12-3 6 9 11 1 1 12 9 5-3 12 5 10-6 10 1 14-9 6-7 11-14-1-13 5-14-4-14 2-8-10-11-2-3-12Z"
        fill="#E4B63E"
      />
      <ellipse cx="66" cy="117" rx="13" ry="17" fill="#E7AC62" />
      <ellipse cx="174" cy="117" rx="13" ry="17" fill="#E7AC62" />
      <ellipse cx="66" cy="117" rx="7" ry="10" fill="#CF8F4E" />
      <ellipse cx="174" cy="117" rx="7" ry="10" fill="#CF8F4E" />
      <ellipse cx="120" cy="114" rx="46" ry="45" fill="#EDBA79" />
      <ellipse cx="120" cy="132" rx="35" ry="25" fill="#F2C78D" />
      <path
        d="M66 94q-5-12 6-19-3-12 11-14 5-10 16-6 7-9 18-3 8-9 17-2 12-4 18 6 13-1 14 10 12 5 6 18l-8 14-10-10-4-10-8 13-9-15-10 14-8-13-11 13-6-12-10 15-7-9-8 16Z"
        fill="#EDC64E"
      />
      <path
        d="m79 74 6-7m14-3 5-4m20 1 5-3m16 9 6 6m-67 27 3-5m69 4-3-6"
        fill="none"
        stroke="#F7D96B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx="88" cy="129" rx="8" ry="5" fill="#EAA16B" opacity=".65" />
      <ellipse cx="152" cy="129" rx="8" ry="5" fill="#EAA16B" opacity=".65" />
      {mood === 'celebrate' ? (
        <g stroke="#25231F" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M92 109q7-10 14 0m28 0q7-10 14 0" />
        </g>
      ) : (
        <>
          <ellipse cx={99 + look} cy={108 - look} rx="7" ry="9" fill="#25231F" />
          <circle cx={97 + look} cy={104 - look} r="2.6" fill="white" />
          <circle cx={102 + look} cy={111 - look} r="1" fill="#A28B6B" />
          <path
            d="m93 102-2-4m7 1-1-4m7 6 2-3"
            stroke="#25231F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {mood === 'encourage' ? (
            <path
              d="M134 109q7-7 14 0"
              stroke="#25231F"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <>
              <ellipse cx={141 + look} cy={108 - look} rx="7" ry="9" fill="#25231F" />
              <circle cx={139 + look} cy={104 - look} r="2.6" fill="white" />
              <circle cx={144 + look} cy={111 - look} r="1" fill="#A28B6B" />
              <path
                d="m135 102-2-4m7 1-1-4m7 6 2-3"
                stroke="#25231F"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}
        </>
      )}
      {mood === 'thinking' && (
        <path d="m92 93 12-3m32 0 11 4" stroke="#9F733E" strokeWidth="2.5" strokeLinecap="round" />
      )}
      <ellipse cx="120" cy="125" rx="8.5" ry="6.5" fill="#242321" />
      <ellipse cx="117" cy="123" rx="3" ry="1.5" fill="#6B6960" />
      <g fill="#9D713F">
        <circle cx="88" cy="120" r="1.1" />
        <circle cx="93" cy="125" r="1" />
        <circle cx="86" cy="126" r="1" />
        <circle cx="152" cy="120" r="1.1" />
        <circle cx="147" cy="125" r="1" />
        <circle cx="154" cy="126" r="1" />
      </g>
      {mood === 'celebrate' ? (
        <>
          <path d="M110 137q10 3 20 0c-1 16-19 16-20 0" fill="#503427" />
          <path d="M114 145q6-4 12 0-6 6-12 0" fill="#E88E78" />
        </>
      ) : (
        <path
          d={mood === 'thinking' ? 'M115 140q5-3 10 0' : 'M111 138q9 8 18 0'}
          stroke="#8B4D32"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {hood && (
        <path
          d="M61 135q9 24 31 25m87-25q-9 24-31 25"
          stroke={outfitId === 'original' ? '#15181C' : colors.trim}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </g>
  );
}

function MonchichiBody({ mood, outfitId = 'original' }: { mood: Mood; outfitId?: string }) {
  const celebrate = mood === 'celebrate';
  const colors = outfitColors(outfitId);
  const newOutfit = !!newOutfitColors[outfitId];
  return (
    <g>
      <ellipse cx="120" cy="231" rx="60" ry="6" fill="#27334A" opacity=".09" />
      <ellipse cx="97" cy="219" rx="23" ry="13" fill="#E2B341" />
      <ellipse cx="143" cy="219" rx="23" ry="13" fill="#E2B341" />
      <ellipse cx="97" cy="223" rx="18" ry="8" fill="#EFBE78" />
      <ellipse cx="143" cy="223" rx="18" ry="8" fill="#EFBE78" />
      <path
        d="m86 220 1 6m7-7 1 8m7-7 1 6m29-6 1 6m7-7 1 8m7-7 1 6"
        stroke="#D69B54"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {newOutfit ? (
        <MascotOutfit outfitId={outfitId} />
      ) : (
        <path d="M81 142q39-10 78 0l14 62q-51 22-106 0Z" fill={colors.body} />
      )}
      <path
        d="M79 151q-21 9-25 34l20 7 20-36M159 151q21 9 25 34l-20 7-20-36"
        fill={colors.sleeve}
      />
      {celebrate ? (
        <>
          <path
            d="M83 158Q57 153 44 125m113 33q26-6 39-33"
            stroke={colors.sleeve}
            strokeWidth="24"
            strokeLinecap="round"
          />
          <ellipse cx="42" cy="119" rx="12" ry="14" fill="#EDBC64" />
          <ellipse cx="198" cy="119" rx="12" ry="14" fill="#EDBC64" />
          <path
            d="m22 83-7-4m201 3 8-6m-12 33 10 3"
            stroke="#65CDA8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="m30 53 4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1Z" fill="#E9B839" />
        </>
      ) : (
        <>
          <ellipse cx="62" cy="192" rx="12" ry="14" fill="#EDBC64" />
          <path
            d={
              mood === 'thinking'
                ? 'M166 180q17-10 7-34'
                : mood === 'encourage'
                  ? 'M166 177q27-7 24-26'
                  : 'M167 177l10 13'
            }
            stroke={colors.sleeve}
            strokeWidth="23"
            strokeLinecap="round"
          />
          <ellipse
            cx={mood === 'thinking' ? 174 : mood === 'encourage' ? 190 : 179}
            cy={mood === 'thinking' ? 142 : mood === 'encourage' ? 146 : 194}
            rx="12"
            ry="14"
            fill="#EDBC64"
          />
          <path d="m57 189 1 7m5-9 1 8" stroke="#D49C4F" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {newOutfit ? (
        <OutfitSleeveStripes outfitId={outfitId} variant="monchichi" mood={mood} />
      ) : (
        <path d="M75 203q45 13 90 0" stroke={colors.trim} strokeWidth="8" strokeLinecap="round" />
      )}
      {outfitId === 'original' ? (
        <>
          <path
            d="m98 169-2 13m48-13 2 13"
            stroke="#46494E"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text
            x="120"
            y="179"
            textAnchor="middle"
            fill="#F7F4EC"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="10"
            letterSpacing=".5"
          >
            ONITSUKA
          </text>
          <text
            x="120"
            y="195"
            textAnchor="middle"
            fill="#F7F4EC"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="18"
            letterSpacing=".3"
          >
            TIGER
          </text>
        </>
      ) : !newOutfit ? (
        <OutfitDetails outfitId={outfitId} />
      ) : null}
      <MonchichiFace mood={mood} outfitId={outfitId} />
      {mood === 'thinking' && <ellipse cx="174" cy="143" rx="10" ry="12" fill="#EDBC64" />}
    </g>
  );
}

function CompanionFace({
  variant,
  mood,
  accessoryId,
  outfitId,
}: {
  variant: Exclude<CompanionId, 'monchichi'>;
  mood: Mood;
  accessoryId?: string;
  outfitId?: string;
}) {
  const cat = variant === 'sichiware';
  const ink = cat ? '#573A33' : '#503522';
  const look = mood === 'thinking' ? 3 : 0;
  return (
    <g>
      <CompanionOutfitHood outfitId={outfitId} />
      {cat ? (
        <>
          <path
            d="M53 75 54 25Q55 14 65 21l39 30m32 0 39-30q10-7 11 4l1 50"
            fill="#68B6DB"
            stroke="#55A5CE"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M43 100Q43 39 120 38t77 62q4 62-77 65T43 100Z"
            fill="#FFFEF8"
            stroke="#DDE7E5"
            strokeWidth="2"
          />
          <path
            d="M44 90q2-52 76-52t76 52q-29 4-53-9-11-6-23 6-12-12-23-6-24 13-53 9Z"
            fill="#68B6DB"
          />
          <path d="m64 45 1-16 16 17m78 0 16-17 1 16" fill="#91CDE7" />
        </>
      ) : (
        <>
          <path
            d="M69 57Q43 53 35 92q-10 45 10 49 17 3 30-43m90-41q26-4 34 35 10 45-10 49-17 3-30-43"
            fill="#F1D990"
            stroke="#E8CD81"
            strokeWidth="2"
          />
          <path d="M57 101Q57 43 120 43t63 58q7 62-63 64T57 101Z" fill="#FFF0B4" />
          {accessoryId !== 'blue-beret' && (
            <>
              <rect x="114" y="15" width="13" height="13" rx="5" fill="#3E281F" />
              <path
                d="M77 43q4-21 43-23 39 2 43 23 2 11-18 12-25-6-50 0-20-1-18-12Z"
                fill="#4A3024"
              />
              <path d="M89 35q15-10 33-9" stroke="#644532" strokeWidth="3" strokeLinecap="round" />
            </>
          )}
        </>
      )}
      {cat && (
        <>
          <ellipse cx="66" cy="128" rx="16" ry="10" fill="#FFD3D5" />
          <ellipse cx="174" cy="128" rx="16" ry="10" fill="#FFD3D5" />
          <path
            d="m57 124-2 7m11-8-2 8m11-7-2 7m94-7-2 7m11-8-2 8m11-7-2 7"
            stroke="#C87676"
            strokeWidth="2.7"
            strokeLinecap="round"
          />
        </>
      )}
      {mood === 'celebrate' ? (
        <g stroke={ink} strokeWidth={cat ? 4 : 3.6} strokeLinecap="round" fill="none">
          <path d="M86 107q8-12 16 0m36 0q8-12 16 0" />
        </g>
      ) : (
        <>
          <ellipse cx={94 + look} cy="106" rx={cat ? 8.5 : 4.5} ry={cat ? 11 : 6.5} fill={ink} />
          <ellipse cx={92 + look} cy="102" rx={cat ? 3.5 : 1.5} ry={cat ? 3 : 2} fill="#FFFDF7" />
          {cat && <ellipse cx={97 + look} cy="111" rx="2" ry="1.3" fill="#B08E7A" />}
          {mood === 'encourage' ? (
            <path d="M138 107q8-9 16 0" stroke={ink} strokeWidth="3.6" strokeLinecap="round" />
          ) : (
            <>
              <ellipse
                cx={146 + look}
                cy="106"
                rx={cat ? 8.5 : 4.5}
                ry={cat ? 11 : 6.5}
                fill={ink}
              />
              <ellipse
                cx={144 + look}
                cy="102"
                rx={cat ? 3.5 : 1.5}
                ry={cat ? 3 : 2}
                fill="#FFFDF7"
              />
              {cat && <ellipse cx={149 + look} cy="111" rx="2" ry="1.3" fill="#B08E7A" />}
            </>
          )}
        </>
      )}
      {cat && (
        <path
          d={mood === 'thinking' ? 'm90 86 9-3m42 0 8 4' : 'm91 85 4-1m50 0 4 1'}
          stroke={ink}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {mood === 'thinking' && !cat && (
        <path d="m90 88 9-3m42 0 8 4" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      )}
      {cat ? (
        <path d="M117 121q3-3 6 0-1 5-3 5t-3-5Z" fill={ink} />
      ) : (
        <path d="M114 116q6-4 12 0-1 8-6 8t-6-8Z" fill={ink} />
      )}
      <path
        d="M120 124v5q-9 11-15 1m15-1q9 11 15 1"
        stroke={ink}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {mood === 'celebrate' ? (
        <>
          <path d="M114 138q6 3 12 0-1 13-6 13t-6-13Z" fill={ink} />
          <path d="M117 145q3-2 6 0-3 5-6 0Z" fill="#EC9B90" />
        </>
      ) : cat && mood !== 'thinking' ? (
        <path d="M115 142q5 5 10 0" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      ) : null}
    </g>
  );
}

function CompanionBody({
  variant,
  mood,
  outfitId = 'original',
  accessoryId,
}: {
  variant: Exclude<CompanionId, 'monchichi'>;
  mood: Mood;
  outfitId?: string;
  accessoryId?: string;
}) {
  const cat = variant === 'sichiware';
  const fur = cat ? '#FFFEF8' : '#FFF0B4';
  const shade = cat ? '#DDE7E5' : '#E8CD81';
  const dressed = outfitId !== 'original';
  const colors = outfitColors(outfitId);
  const newOutfit = !!newOutfitColors[outfitId];
  const sleeve = dressed ? colors.sleeve : fur;
  const seam = dressed ? colors.trim : shade;
  return (
    <g>
      <ellipse cx="120" cy="231" rx="57" ry="6" fill="#27334A" opacity=".08" />
      {!cat && <ellipse cx="175" cy="184" rx="12" ry="10" fill="#F1D990" />}
      <ellipse
        cx="100"
        cy="220"
        rx={cat ? 13 : 23}
        ry="12"
        transform="rotate(-12 100 220)"
        fill={fur}
        stroke={shade}
        strokeWidth="2"
      />
      <ellipse
        cx="140"
        cy="220"
        rx={cat ? 13 : 23}
        ry="12"
        transform="rotate(12 140 220)"
        fill={fur}
        stroke={shade}
        strokeWidth="2"
      />
      <path
        d={
          cat
            ? 'M83 144q37-14 74 0 22 29 9 58-10 25-46 25t-46-25q-13-29 9-58Z'
            : 'M79 133q41-16 82 0 19 29 15 61-3 31-56 32t-56-32q-4-32 15-61Z'
        }
        fill={fur}
        stroke={shade}
        strokeWidth="2"
      />
      {dressed &&
        (newOutfit ? (
          <MascotOutfit outfitId={outfitId} />
        ) : (
          <>
            <path
              d="M81 143q39-14 78 0l12 61q-51 18-102 0Z"
              fill={colors.body}
              stroke={colors.trim}
              strokeWidth="2"
            />
            <OutfitDetails outfitId={outfitId} />
          </>
        ))}
      <path
        d={cat ? 'M87 177q-12 12-17 3m83-3q12 12 17 3' : 'M84 166q-20 8-21 23m93-23q20 8 21 23'}
        stroke={shade}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {mood === 'celebrate' ? (
        <>
          <path
            d="M82 175q-26-9-32-35m108 35q26-9 32-35"
            stroke={seam}
            strokeWidth="23"
            strokeLinecap="round"
          />
          <path
            d="M82 175q-26-9-32-35m108 35q26-9 32-35"
            stroke={sleeve}
            strokeWidth="20"
            strokeLinecap="round"
          />
          {dressed && (
            <>
              <circle cx="50" cy="140" r="10" fill={fur} />
              <circle cx="190" cy="140" r="10" fill={fur} />
            </>
          )}
          <path
            d="m23 110-7-5m207 6-7-5M30 72l-7 5m187-5 7 5"
            stroke="#65CDA8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="m208 33 4 8 9 2-6 7 1 9-8-4-8 4 1-9-6-7 9-2Z" fill="#F3CC58" />
        </>
      ) : (
        <>
          <path d="M81 175q-19 0-21 17" stroke={seam} strokeWidth="23" strokeLinecap="round" />
          <path d="M81 175q-19 0-21 17" stroke={sleeve} strokeWidth="20" strokeLinecap="round" />
          <path
            d={
              mood === 'thinking'
                ? 'M159 180q18-14 13-31'
                : mood === 'encourage'
                  ? 'M159 179q25-7 28-26'
                  : 'M159 175q19 0 21 17'
            }
            stroke={seam}
            strokeWidth="23"
            strokeLinecap="round"
          />
          <path
            d={
              mood === 'thinking'
                ? 'M159 180q18-14 13-31'
                : mood === 'encourage'
                  ? 'M159 179q25-7 28-26'
                  : 'M159 175q19 0 21 17'
            }
            stroke={sleeve}
            strokeWidth="20"
            strokeLinecap="round"
          />
          {dressed && (
            <>
              <circle cx="60" cy="192" r="10" fill={fur} />
              <circle
                cx={mood === 'thinking' ? 172 : mood === 'encourage' ? 187 : 180}
                cy={mood === 'thinking' ? 149 : mood === 'encourage' ? 153 : 192}
                r="10"
                fill={fur}
              />
            </>
          )}
        </>
      )}
      {!cat && !dressed && (
        <g>
          <path
            d="M116 175q-25-20-31-9-5 9 3 25 5 8 28-8m8-8q25-20 31-9 5 9-3 25-5 8-28-8"
            fill="#EBC653"
            stroke="#D5AE3E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="m91 173 22 5-23 7m59-12-22 5 23 7"
            stroke="#FFE187"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="113" y="170" width="14" height="17" rx="6" fill="#F3D476" />
        </g>
      )}
      {newOutfit && <OutfitSleeveStripes outfitId={outfitId} variant={variant} mood={mood} />}
      <CompanionFace variant={variant} mood={mood} accessoryId={accessoryId} outfitId={outfitId} />
      {mood === 'thinking' && (
        <ellipse cx="172" cy="149" rx="10" ry="11" fill={fur} stroke={shade} strokeWidth="2" />
      )}
    </g>
  );
}

/** Decorative SVG companions adapted from the user's supplied character references. */
export function Mascot({
  variant = 'monchichi',
  mood = 'happy',
  size = 160,
  className,
  wardrobe,
}: {
  variant?: AvatarId;
  mood?: Mood;
  size?: number;
  className?: string;
  wardrobe?: MascotWardrobe;
}) {
  const companion = resolveAvatar(variant);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {companion === 'monchichi' ? (
        <MonchichiBody mood={mood} outfitId={wardrobe?.outfitId} />
      ) : (
        <CompanionBody
          variant={companion}
          mood={mood}
          outfitId={wardrobe?.outfitId}
          accessoryId={wardrobe?.accessoryId}
        />
      )}
      <MascotAccessory variant={companion} accessoryId={wardrobe?.accessoryId} />
    </svg>
  );
}

export function MascotMark({
  variant = 'monchichi',
  size = 40,
  className,
  wardrobe,
}: {
  variant?: AvatarId;
  size?: number;
  className?: string;
  wardrobe?: MascotWardrobe;
}) {
  const companion = resolveAvatar(variant);
  return (
    <svg
      width={size}
      height={size}
      viewBox="24 0 192 192"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {companion === 'monchichi' ? (
        <MonchichiFace mood="happy" outfitId={wardrobe?.outfitId} />
      ) : (
        <CompanionFace
          variant={companion}
          mood="happy"
          accessoryId={wardrobe?.accessoryId}
          outfitId={wardrobe?.outfitId}
        />
      )}
      <MascotAccessory variant={companion} accessoryId={wardrobe?.accessoryId} />
    </svg>
  );
}
