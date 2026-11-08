function Sparkles({ color = '#FFF1B5' }: { color?: string }) {
  return (
    <g fill={color}>
      <path d="m54 49 2 6 6 2-6 2-2 6-2-6-6-2 6-2ZM331 91l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
      <circle cx="108" cy="36" r="2" />
      <circle cx="287" cy="40" r="2.5" />
      <circle cx="370" cy="140" r="2" />
      <circle cx="143" cy="92" r="2" />
    </g>
  );
}

function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M0 20Q0 7 13 8 19-7 34 2 48-2 52 11 67 8 70 20Z"
      fill="#F5FCFF"
    />
  );
}

/** Each scene has its own architecture. Coordinates keep the face area clear. */
export function RoomBackgrounds({ id }: { id: string }) {
  switch (id) {
    case 'rain-library':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#DCEAE7" />
          <path d="M0 272h400v128H0Z" fill="#D6BE9D" />
          <path
            d="M0 277h400M0 326h400M0 378h400M80 275 45 400m126-125-8 125m115-125 28 125"
            stroke="#BDA485"
            strokeWidth="2"
          />
          <path d="M15 0h370v20H15Z" fill="#ABC3B8" />
          <path d="M30 221V100a58 58 0 0 1 116 0v121Z" fill="#9AB7B8" />
          <path d="M39 212V103a49 49 0 0 1 98 0v109Z" fill="#688FA6" />
          <path d="M40 172q25-20 48-6t49-11v57H40Z" fill="#547C8A" />
          <g stroke="#C1DFE5" strokeWidth="2.5" strokeLinecap="round">
            <path d="m57 88-5 13m39-33-6 16m33 20-5 13m-56 15-4 12m40-32-5 15m30 37-4 13m-40-12-5 14" />
          </g>
          <path d="M88 56v158M40 140h97" stroke="#EAE7CF" strokeWidth="6" />
          <path d="M27 222h121" stroke="#F5EBD5" strokeWidth="9" strokeLinecap="round" />
          <rect x="289" y="35" width="92" height="244" rx="9" fill="#A1826C" />
          <rect x="297" y="44" width="76" height="224" rx="4" fill="#6B7770" />
          {[83, 140, 197, 254].map((y, row) => (
            <g key={y}>
              <rect x="295" y={y} width="80" height="7" rx="2" fill="#C5AA89" />
              <rect
                x="302"
                y={y - 31}
                width="10"
                height="31"
                rx="2"
                fill={row % 2 ? '#DFAF7F' : '#69B7B2'}
              />
              <rect x="315" y={y - 35} width="13" height="35" rx="2" fill="#E7D498" />
              <rect x="331" y={y - 29} width="11" height="29" rx="2" fill="#86A3C4" />
              <rect
                x="346"
                y={y - 33}
                width="12"
                height="33"
                rx="2"
                fill="#C58C8A"
                transform={`rotate(-7 346 ${y})`}
              />
              <path d={`M306 ${y - 23}h3m13-4h3m12 10h4`} stroke="#F8EDD4" strokeWidth="2" />
            </g>
          ))}
          <path d="M205 0v38" stroke="#738F87" strokeWidth="3" />
          <path d="M176 63q4-28 29-28t29 28Z" fill="#E5B96D" />
          <ellipse cx="205" cy="63" rx="29" ry="7" fill="#FFF1BB" />
          <ellipse cx="200" cy="333" rx="112" ry="38" fill="#B6C7AD" />
          <ellipse cx="200" cy="333" rx="99" ry="29" stroke="#E3E6CC" strokeWidth="3" />
          <path d="M28 295q-5-37 32-39 37 1 40 37-28 24-72 2Z" fill="#6EA79D" />
          <path d="M37 289q20 8 50 0" stroke="#A5CEC0" strokeWidth="3" />
          <rect
            x="42"
            y="246"
            width="34"
            height="10"
            rx="3"
            fill="#E7C783"
            transform="rotate(-9 42 246)"
          />
          <path d="M48 249h21" stroke="#FFF5DB" strokeWidth="2" />
        </g>
      );
    case 'bamboo-hideout':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#E1F0D9" />
          <circle cx="257" cy="81" r="27" fill="#FFF0B8" />
          <path d="M0 185 81 77l91 103L268 95l132 94v93H0Z" fill="#B3D4BA" />
          <path d="M0 227 67 165l86 54 111-69 136 70v65H0Z" fill="#8CBBA3" />
          <path d="M0 260q100-43 200-4t200-12v156H0Z" fill="#C0D6A7" />
          <path d="M0 282h400v118H0Z" fill="#D8D9AF" />
          <path
            d="M0 289h400M0 347h400M106 286 81 400m125-114 4 114m107-114 30 114"
            stroke="#A5B890"
            strokeWidth="4"
          />
          <g stroke="#81AC70" strokeWidth="2" opacity=".35">
            <path d="M0 307h400M0 314h400M0 321h400M0 365h400M0 372h400M0 379h400" />
          </g>
          <path d="M0 18q200-26 400 0v19H0Z" fill="#7BA382" />
          <path d="M10 23h380" stroke="#B7CC91" strokeWidth="6" strokeDasharray="14 5" />
          {[28, 63, 349, 378].map((x, i) => (
            <g key={x}>
              <path
                d={`M${x} 0v281`}
                stroke={i % 2 ? '#7CA979' : '#65956D'}
                strokeWidth={i % 2 ? 11 : 16}
              />
              <path
                d={`M${x - 8} 54h16m-16 65h16m-16 68h16m-16 68h16`}
                stroke="#B7CE94"
                strokeWidth="4"
              />
              <path
                d={`M${x} 112q-27-27-34-9 11 17 34 9m0-26q27-29 33-9-13 15-33 9`}
                fill="#559876"
              />
            </g>
          ))}
          <path
            d="M73 24v49m0 0q-23 28 0 41 23-13 0-41Z"
            fill="#F4E6B4"
            stroke="#C8B67C"
            strokeWidth="3"
          />
          <path d="M62 89h22M73 114v12" stroke="#C8B67C" strokeWidth="3" />
          <ellipse cx="202" cy="336" rx="107" ry="32" fill="#A8C799" />
          <path d="M103 336h198M119 349h166M118 323h166" stroke="#D5DFC0" strokeWidth="2" />
          <path d="M300 252v53m65-53v53" stroke="#8A9D65" strokeWidth="8" />
          <rect x="291" y="241" width="85" height="15" rx="6" fill="#B5C28B" />
          <path d="M300 246h67" stroke="#E1E1B8" strokeWidth="3" />
          <ellipse cx="68" cy="297" rx="38" ry="12" fill="#A88D68" />
          <path d="M45 299v17m47-17v17" stroke="#8A7C5D" strokeWidth="6" />
          <path d="M55 278h20v15H55Z" fill="#F8E9BC" />
          <path d="M75 282q12-2 6 8h-6" stroke="#F8E9BC" strokeWidth="4" />
          <path d="M61 269q-6-6 0-13" stroke="#EFF4DE" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'cloud-cabin':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#CBEAFF" />
          <Cloud x={-20} y={92} scale={1.4} />
          <Cloud x={282} y={55} scale={1.6} />
          <path d="M0 140 200 9l200 131v163H0Z" fill="#FFF1D2" />
          <path
            d="M0 140 200 9l200 131M24 127v176m352-176v176"
            stroke="#C6A67E"
            strokeWidth="13"
            strokeLinejoin="round"
          />
          <path d="M90 90h220M147 51h106" stroke="#E5CD9F" strokeWidth="5" />
          <path d="M173 106V83a27 27 0 0 1 54 0v23Z" fill="#A6DFF4" />
          <path d="M200 58v48m-26-12h53" stroke="#F8FDFF" strokeWidth="4" />
          <rect x="285" y="140" width="62" height="94" rx="28" fill="#A8DEF5" />
          <Cloud x={283} y={182} scale={1.1} />
          <rect x="285" y="140" width="62" height="94" rx="28" stroke="#E4C696" strokeWidth="6" />
          <path d="M279 239h74" stroke="#C7AD87" strokeWidth="6" strokeLinecap="round" />
          <path d="M35 283h330l30 75H5Z" fill="#CDAE84" />
          <path
            d="M28 302h345M19 327h363M115 283l-9 75m94-75v75m87-75 10 75"
            stroke="#B39571"
            strokeWidth="2"
          />
          <path
            d="M0 360q10-33 44-19 16-29 49-10 22-13 42 10 29-14 53 5 23-23 56-4 31-21 53 2 29-20 53 3 37-19 50 13v40H0Z"
            fill="#F4FCFF"
          />
          <path
            d="M0 379q30-17 60 0t60 0 60 0 60 0 60 0 60 0 40 0"
            stroke="#D8EDF8"
            strokeWidth="3"
          />
          <ellipse cx="199" cy="327" rx="108" ry="30" fill="#B1D6D6" />
          <path d="M112 328q85-22 174 0" stroke="#D4EBDB" strokeWidth="4" />
          <path d="M69 100q-12 19 2 31t-1 33" stroke="#8DAEB9" strokeWidth="2" />
          <path d="m69 65 20 22-20 17-18-17Z" fill="#F5BB97" />
          <path d="M69 65v39M51 87h38" stroke="#FFE6CA" strokeWidth="2" />
          <rect x="43" y="190" width="61" height="43" rx="8" fill="#9FC4BD" />
          <path d="M49 198h49v18H49Z" fill="#F2E1B9" />
          <path d="m50 198 23 13 25-13" stroke="#C3A674" strokeWidth="2" />
          <path
            d="M38 237h72M51 238v39m45-39v39"
            stroke="#C1A982"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M317 264h23l-4 23h-15Z" fill="#EDC7A5" />
          <path d="M328 265q-24-10-17-24 16 0 17 24m0-2q18-25 27-10-6 14-27 10" fill="#80B899" />
        </g>
      );
    case 'coral-studio':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#7ACEDC" />
          <path d="M0 201q35-26 69 0t65 0 67 0 65 0 68 0 66 0v199H0Z" fill="#64B7C9" />
          <path
            d="M15 288V177a185 160 0 0 1 370 0v111Z"
            fill="#C8E8E6"
            fillOpacity=".78"
            stroke="#EFF8D8"
            strokeWidth="9"
          />
          <path
            d="M200 17v98M59 65l61 69m221-69-61 69M16 177h75m218 0h75"
            stroke="#E8F3D7"
            strokeWidth="5"
          />
          <path d="M0 280q200-27 400 0v120H0Z" fill="#C7C7DD" />
          <path
            d="M0 301q200-22 400 0M0 349q200-18 400 0M92 272 52 400m148-133v133m105-128 44 128"
            stroke="#ABB6D0"
            strokeWidth="2"
          />
          <g stroke="#EFA6AE" strokeWidth="9" strokeLinecap="round" fill="none">
            <path d="M35 256v-51m0 31-20-15m20-5 18-20M366 248v-68m0 39-18-16m18-3 20-17" />
          </g>
          <g fill="#C9F0ED" opacity=".8">
            <circle cx="28" cy="119" r="6" />
            <circle cx="44" cy="89" r="4" />
            <circle cx="362" cy="110" r="7" />
            <circle cx="349" cy="79" r="3" />
          </g>
          <path d="m258 58 15-6 11 6-11 6Z" fill="#F5D892" />
          <path d="m284 58 8-7v14Z" fill="#F5D892" />
          <path d="m98 49 12-5 9 5-9 5Z" fill="#E7B1C6" />
          <path d="m119 49 7-6v12Z" fill="#E7B1C6" />
          <ellipse cx="200" cy="334" rx="111" ry="33" fill="#EAE5D8" />
          <path d="M115 334q40-24 85 0t85 0" stroke="#B7D9CE" strokeWidth="4" />
          <path
            d="M72 208 43 304m30-96 31 96m-56-32h48"
            stroke="#AB8B72"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect
            x="36"
            y="155"
            width="72"
            height="93"
            rx="5"
            fill="#FFF5DF"
            stroke="#D5B98D"
            strokeWidth="5"
          />
          <path d="M45 227q17-39 27-14t27-19v43H45Z" fill="#8CC8BD" />
          <circle cx="81" cy="181" r="10" fill="#EAAFAD" />
          <path d="M304 267v39m65-39v39" stroke="#8EAFAF" strokeWidth="7" />
          <rect x="296" y="253" width="82" height="16" rx="5" fill="#E5C69F" />
          <path d="M314 253v-21q-7-6-4-13h27q3 7-4 13v21Z" fill="#C793B1" />
          <path d="M315 235h17" stroke="#E7C7D6" strokeWidth="3" />
          <rect x="346" y="232" width="18" height="21" rx="4" fill="#F4D99E" />
          <path
            d="m351 234-4-19m11 19 4-23"
            stroke="#7199A2"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      );
    case 'moon-observatory':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#334F76" />
          <path d="M0 154Q0-36 200-39 400-36 400 154" fill="#274565" />
          <path
            d="M0 154Q0-36 200-39 400-36 400 154M0 154h400M68 0q-18 87-12 154M332 0q18 87 12 154"
            stroke="#64849F"
            strokeWidth="7"
          />
          <ellipse
            cx="201"
            cy="55"
            rx="88"
            ry="61"
            fill="#1F385C"
            stroke="#85A8BE"
            strokeWidth="6"
          />
          <path d="M217 16a28 28 0 1 0 22 43 28 28 0 0 1-22-43Z" fill="#FFE6A7" />
          <Sparkles />
          <path d="M0 276q200-24 400 0v124H0Z" fill="#6B8DAB" />
          <path d="M0 289q200-25 400 0M0 351q200-24 400 0" stroke="#577997" strokeWidth="3" />
          <ellipse cx="200" cy="334" rx="119" ry="36" fill="#A9CAD7" />
          <ellipse
            cx="200"
            cy="334"
            rx="100"
            ry="27"
            stroke="#D6E6DB"
            strokeWidth="2"
            strokeDasharray="5 6"
          />
          <path d="m88 321 5 5 10 0-7 5 2 7-10-4-10 4 2-7-7-5 10 0Z" fill="#F3DDA0" />
          <path
            d="M77 231 45 302m32-71 31 71m-31-71v72"
            stroke="#C4BA9D"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="m44 209 57-40 16 24-57 40Z" fill="#C9DEDE" />
          <path d="m99 165 12-8 21 31-12 8Z" fill="#87BACB" />
          <path d="m40 210 13-9 19 27-13 9Z" fill="#6A9CB8" />
          <path d="m73 226 9 11" stroke="#F5DB9A" strokeWidth="7" />
          <rect
            x="290"
            y="176"
            width="82"
            height="70"
            rx="7"
            fill="#284868"
            stroke="#8AAEBE"
            strokeWidth="5"
          />
          <path d="m306 222 14-26 17 15 20-20" stroke="#99D1D3" strokeWidth="2" />
          <g fill="#F9E8B4">
            <circle cx="306" cy="222" r="3" />
            <circle cx="320" cy="196" r="3" />
            <circle cx="337" cy="211" r="3" />
            <circle cx="357" cy="191" r="3" />
          </g>
          <path d="M330 246v27m-26 0h53" stroke="#88A5B8" strokeWidth="5" />
          <ellipse
            cx="335"
            cy="66"
            rx="24"
            ry="9"
            stroke="#A3C4C9"
            strokeWidth="3"
            transform="rotate(-20 335 66)"
          />
          <circle cx="335" cy="66" r="11" fill="#D7BD85" />
          <path d="M335 0v46" stroke="#9DB4C4" strokeWidth="2" />
        </g>
      );
    case 'winter-chalet':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#E3C9AC" />
          <path
            d="M0 55h400M0 103h400M0 151h400M0 199h400M0 247h400"
            stroke="#D1B18F"
            strokeWidth="3"
          />
          <path
            d="M0 77 200 0l200 77M200 0v83"
            stroke="#AD8969"
            strokeWidth="15"
            strokeLinejoin="round"
          />
          <path d="M0 279h400v121H0Z" fill="#BFA488" />
          <path
            d="M0 324h400M0 372h400M66 280 30 400m128-120-7 120m126-120 25 120"
            stroke="#A98B70"
            strokeWidth="2"
          />
          <rect
            x="263"
            y="80"
            width="104"
            height="119"
            rx="9"
            fill="#AFD5E7"
            stroke="#FFF3DE"
            strokeWidth="8"
          />
          <path d="m266 161 32-48 30 37 22-26 15 31v42H266Z" fill="#E9F5F7" />
          <path d="m286 132 12-19 15 19-9-4-7 4-5-4Z" fill="#FFF" />
          <path d="M315 82v112M267 142h96" stroke="#FFF3DE" strokeWidth="5" />
          <g fill="#F9FFFF">
            <circle cx="283" cy="99" r="2" />
            <circle cx="343" cy="104" r="3" />
            <circle cx="353" cy="176" r="2" />
          </g>
          <path d="M40 59h62v101H40Z" fill="#C3BDB0" />
          <path
            d="M40 84h62M40 113h62M40 142h62M68 59v25m-12 0v29m27 0v29"
            stroke="#A7A699"
            strokeWidth="3"
          />
          <path d="M22 269V166q0-19 19-19h62q18 0 18 19v103Z" fill="#C6C2B3" />
          <path d="M39 264v-58a33 33 0 0 1 66 0v58Z" fill="#6C7772" />
          <path
            d="M55 254q-15-20 7-42-2 14 7 16 6-29 18-32 0 21 13 35 12 15-3 26Z"
            fill="#ECAE68"
          />
          <path d="M69 254q-8-14 8-28 0 9 7 14 9 9 2 16Z" fill="#FFE4A1" />
          <path d="M43 261h57" stroke="#8E7157" strokeWidth="7" strokeLinecap="round" />
          <rect x="15" y="149" width="112" height="10" rx="4" fill="#A18870" />
          <path d="M139 64q62 34 119 0" stroke="#9A9171" strokeWidth="2" />
          <path d="M159 73v23q-12 17-22 4-4-6 4-10l7-3V72Z" fill="#85AE9E" />
          <path d="M225 75v22q12 15 21 3 4-7-4-10l-7-3V73Z" fill="#BD8F91" />
          <ellipse cx="203" cy="335" rx="113" ry="34" fill="#F1E4C8" />
          <path
            d="M112 322h182M101 338h204M125 353h157M151 307v54m30-58v65m31-65v65m31-62v58"
            stroke="#C8C9AE"
            strokeWidth="3"
          />
          <g fill="#C9AC7C" stroke="#A78965" strokeWidth="3">
            <circle cx="323" cy="280" r="14" />
            <circle cx="350" cy="280" r="14" />
            <circle cx="336" cy="258" r="14" />
          </g>
          <g stroke="#EAD1A4" strokeWidth="2">
            <path d="M318 280h10m17 0h10m-24-22h10" />
          </g>
        </g>
      );
    case 'spring-greenhouse':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#D6EDDB" />
          <path d="M0 193q47-43 95 0t102-8 105 7 98-12v130H0Z" fill="#A7D0AF" />
          <path
            d="M7 282V91L200 0l193 91v191Z"
            fill="#E8F6E8"
            fillOpacity=".5"
            stroke="#F3F0D1"
            strokeWidth="10"
          />
          <path
            d="M7 92h386M75 61v221M137 31v99M200 0v130M263 31v99M325 61v221M7 191h89m218 0h79"
            stroke="#F3F0D1"
            strokeWidth="6"
          />
          <path d="M0 281h400v119H0Z" fill="#B9CBA9" />
          <path
            d="M0 317h400M0 369h400M74 281 35 400m114-119-11 119m112-119 16 119m65-119 42 119"
            stroke="#91AD92"
            strokeWidth="2"
          />
          <path
            d="M17 273q3-52 28-87t-8-78M377 280q-30-45-16-80t-7-60"
            stroke="#70A783"
            strokeWidth="5"
          />
          <g fill="#76B98E">
            <path d="M29 225q-31-1-22-22 20 0 22 22m12-25q27-9 23-27-22 0-23 27m-1-44q-28-3-21-22 22 0 21 22M368 239q24-10 22-26-23-1-22 26m-9-45q-24-6-20-23 24-2 20 23" />
          </g>
          <g fill="#F0BDCB">
            <circle cx="37" cy="128" r="8" />
            <circle cx="366" cy="164" r="8" />
            <circle cx="19" cy="247" r="7" />
          </g>
          <g fill="#F9E0A0">
            <circle cx="37" cy="128" r="3" />
            <circle cx="366" cy="164" r="3" />
            <circle cx="19" cy="247" r="3" />
          </g>
          <path
            d="M111 15v43m0 0-24 35 24 29 24-29Z"
            fill="#D0E9D0"
            stroke="#A6BE9D"
            strokeWidth="3"
          />
          <path d="M93 99h36l-18 20Z" fill="#94BA92" />
          <path
            d="M112 108V86m0 13q-17-4-14-14 13 2 14 14m0-8q13-15 18-4-5 9-18 4"
            fill="#63A787"
          />
          <ellipse cx="201" cy="334" rx="109" ry="34" fill="#E5DFB2" />
          <ellipse cx="201" cy="334" rx="97" ry="25" stroke="#C2C591" strokeWidth="3" />
          <path d="M298 251v54m73-54v54" stroke="#A1AE81" strokeWidth="7" />
          <rect x="289" y="240" width="91" height="14" rx="5" fill="#D6C99B" />
          <path d="M302 220h23l-4 20h-15Zm36-8h29l-5 28h-19Z" fill="#DDAF8D" />
          <path d="M313 221v-19m40 9v-24" stroke="#639E79" strokeWidth="3" />
          <path
            d="M312 214q-17-3-15-13 16-1 15 13m41-12q-23-4-17-18 16 0 17 18m1-2q16-21 24-9-5 12-24 9"
            fill="#7EB78B"
          />
          <path d="M40 286q0-20 22-20h16v31H40Z" fill="#80B5B7" />
          <path
            d="m77 275 24-12 3 7-24 17M46 270v-12q8-10 17 0v9"
            stroke="#80B5B7"
            strokeWidth="5"
          />
        </g>
      );
    case 'seaside-lighthouse':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#EFE9D8" />
          <path
            d="M0 229q200 23 400 0M0 255q200 21 400 0M0 27q200 31 400 0"
            stroke="#D7D6C5"
            strokeWidth="2"
          />
          <path d="M0 60q200 36 400 0v144q-200 30-400 0Z" fill="#A8DBE9" />
          <path d="M0 148q200 28 400 0v56q-200 30-400 0Z" fill="#63B3C9" />
          <path d="M0 174q200 27 400 0" stroke="#B3E3E5" strokeWidth="3" />
          <path
            d="M0 60q200 36 400 0M0 204q200 30 400 0M48 67v143m86-132v143m132-143v143m86-154v143"
            stroke="#FDFAE9"
            strokeWidth="8"
          />
          <circle cx="299" cy="115" r="18" fill="#FFE9B3" />
          <Cloud x={55} y={102} scale={0.8} />
          <Cloud x={169} y={88} scale={1.1} />
          <path d="m270 168 12-20v20Zm-7 4h30l-5 6h-20Z" fill="#F9F0CE" />
          <path
            d="M0 0h400v30q-200 26-400 0ZM0 244q200 25 400 0v27q-200 26-400 0Z"
            fill="#D69A91"
          />
          <path d="M0 281q200 30 400 0v119H0Z" fill="#9FBCBB" />
          <path
            d="M0 331q200 21 400 0M0 379q200 13 400 0M99 294 73 400m127-92v92m101-106 26 106"
            stroke="#83A4A6"
            strokeWidth="2"
          />
          <ellipse cx="200" cy="335" rx="112" ry="34" fill="#E6D6AC" />
          <ellipse
            cx="200"
            cy="335"
            rx="104"
            ry="28"
            stroke="#BEAC82"
            strokeWidth="4"
            strokeDasharray="3 4"
          />
          <path d="M367 138v166m-46-146v139" stroke="#6E929B" strokeWidth="5" />
          <path
            d="m321 165 60 9-15 8-58-8m13 23 60 9-15 8-58-8m13 23 60 9-15 8-58-8m13 23 60 9-15 8-58-8"
            fill="#B7CDCC"
            stroke="#799EA3"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="69" cy="259" r="28" fill="#FFF4DB" stroke="#D6AB79" strokeWidth="5" />
          <circle cx="69" cy="259" r="20" stroke="#C3BA91" strokeWidth="2" />
          <path d="m69 241 8 18-8 18-8-18Z" fill="#779FA8" />
          <path d="m69 241 8 18h-8Z" fill="#DE9C82" />
          <path d="M56 287v14m26-14v14" stroke="#AD9C7E" strokeWidth="5" />
          <circle cx="42" cy="38" r="19" stroke="#FFF6DE" strokeWidth="10" />
          <path d="m28 25 5 5m19 18 5 5M28 51l5-5m19-18 5-5" stroke="#CE8C80" strokeWidth="9" />
        </g>
      );
    case 'music-studio':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#D2E6EF" />
          <path d="M0 280h400v120H0Z" fill="#A8C4CC" />
          <path
            d="M0 325h400M0 377h400M72 282 32 400m121-118-8 118m111-118 16 118m65-118 42 118"
            stroke="#8DAEB9"
            strokeWidth="2"
          />
          {[32, 64, 96].map((x) => (
            <rect
              key={x}
              x={x}
              y="39"
              width="23"
              height="100"
              rx="8"
              fill={x === 64 ? '#89B9C8' : '#A1C7D1'}
            />
          ))}
          <rect
            x="149"
            y="33"
            width="104"
            height="83"
            rx="15"
            fill="#E8F3EB"
            stroke="#B4CDC9"
            strokeWidth="5"
          />
          <path d="M168 63h64m-64 13h64m-64 13h64" stroke="#B8D2CD" strokeWidth="2" />
          <path d="M200 82V49l24-5v33" stroke="#539BAE" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="193" cy="84" rx="9" ry="6" fill="#539BAE" />
          <ellipse cx="217" cy="79" rx="9" ry="6" fill="#539BAE" />
          <rect x="285" y="33" width="86" height="86" rx="12" fill="#A5C9D4" />
          <circle cx="328" cy="76" r="32" fill="#436F85" />
          <circle cx="328" cy="76" r="22" stroke="#648CA0" strokeWidth="2" />
          <circle cx="328" cy="76" r="11" fill="#E9C48D" />
          <circle cx="328" cy="76" r="3" fill="#F7E8C5" />
          <path d="M0 153h400" stroke="#A6C5CF" strokeWidth="6" />
          <ellipse cx="200" cy="335" rx="113" ry="34" fill="#DCCBB5" />
          <path d="M107 334h186m-174 11h160m-160-23h160" stroke="#BDBDAA" strokeWidth="2" />
          <path
            d="m44 253 48 56m-2-56-48 56"
            stroke="#6C8C9B"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect x="19" y="223" width="100" height="33" rx="6" fill="#568DA7" />
          <rect x="25" y="234" width="88" height="17" rx="2" fill="#F7F5E6" />
          {[36, 48, 60, 72, 84, 96, 108].map((x) => (
            <path key={x} d={`M${x} 234v17`} stroke="#ABC1C8" strokeWidth="1.5" />
          ))}
          {[33, 45, 69, 81, 93].map((x) => (
            <rect key={x} x={x} y="234" width="6" height="10" rx="1" fill="#34576C" />
          ))}
          <circle cx="30" cy="229" r="2" fill="#A3D6B7" />
          <path
            d="M332 207q-19-9-23 11-1 10 7 18-17 8-12 27 6 23 31 20 25-2 27-24 1-15-14-24 6-11 0-21-5-10-16-7Z"
            fill="#DEB17B"
            stroke="#BC9263"
            strokeWidth="3"
          />
          <path d="m328 233-4-64 13-1 3 66" fill="#9C886E" />
          <rect x="322" y="153" width="16" height="24" rx="5" fill="#C49A6C" />
          <circle cx="331" cy="250" r="11" fill="#6C7778" />
          <path d="m326 169 5 95m-3-95 5 95m-14 1h23" stroke="#EAE0BF" strokeWidth="1.3" />
          <path
            d="m318 284-7 21m34-21 8 21"
            stroke="#6B8B98"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="27" y="164" width="48" height="49" rx="8" fill="#89ADBA" />
          <circle cx="51" cy="191" r="14" fill="#5F889B" />
          <circle cx="51" cy="191" r="7" fill="#A9CCCE" />
        </g>
      );
    case 'night-camp':
      return (
        <g data-room-theme={id}>
          <rect width="400" height="400" fill="#304D73" />
          <path d="M300 28a25 25 0 1 0 20 39 25 25 0 0 1-20-39Z" fill="#F5E2A9" />
          <Sparkles color="#D9E9D8" />
          <path d="M0 203 77 117l74 67 88-79 99 73 62-50v190H0Z" fill="#3E6880" />
          <path d="M0 249q92-43 198-4t202-6v161H0Z" fill="#6A9586" />
          <path d="M0 291q101-28 207 3t193-1v107H0Z" fill="#8FAE8E" />
          <path
            d="M20 266V124m0 29-27 35h54Zm0 33-34 42h68ZM381 253V88m0 29-31 42h62Zm0 39-39 51h78Z"
            fill="#477E76"
          />
          <path d="M20 217v57m361-89v86" stroke="#426E67" strokeWidth="9" />
          <path d="m13 283 67-142 88 142Z" fill="#D6B27C" />
          <path d="m80 141 48 142H34Z" fill="#EAC994" />
          <path d="m80 177 26 106H53Z" fill="#557E7B" />
          <path
            d="M13 283h155M80 141l-3-10"
            stroke="#B49770"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="m13 282-7 9m161-9 9 9" stroke="#D8CFAB" strokeWidth="3" />
          <path
            d="M330 107v112m0-99q12-16 24-5"
            stroke="#799B85"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M352 114v19" stroke="#BED0A5" strokeWidth="2" />
          <rect x="340" y="142" width="25" height="35" rx="8" fill="#F6DE97" />
          <path
            d="M339 141h27m-26 36h25M346 141v-7q6-8 13 0v7"
            stroke="#A5B698"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M352 149v20" stroke="#FFF5CA" strokeWidth="4" strokeLinecap="round" />
          <path d="m91 311 202-1 37 56H66Z" fill="#C5C6A2" />
          <path
            d="M83 326h221M74 343h240M129 311l-14 55m61-55-3 55m53-55 10 55m40-55 20 55"
            stroke="#9CAEA1"
            strokeWidth="3"
          />
          <path
            d="m316 292 43-13m-44-2 43 17"
            stroke="#A68F6E"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <circle cx="315" cy="292" r="7" fill="#CFB98E" />
          <circle cx="357" cy="294" r="7" fill="#CFB98E" />
          <path d="M304 264h25v21h-25Z" fill="#A8C3AF" />
          <path d="M329 268q13-2 8 10h-8" stroke="#A8C3AF" strokeWidth="4" />
          <g fill="#E4E8A0">
            <circle cx="38" cy="89" r="2.5" />
            <circle cx="106" cy="116" r="3" />
            <circle cx="283" cy="210" r="3" />
            <circle cx="363" cy="235" r="2.5" />
            <circle cx="43" cy="319" r="3" />
          </g>
          <g stroke="#C0D3A7" strokeWidth="2" strokeLinecap="round">
            <path d="m34 310 4 2m6 0 4-2m230-107 3 2m5 0 4-2m-190-94 3 2m7 0 4-2" />
          </g>
        </g>
      );
    default:
      return null;
  }
}
