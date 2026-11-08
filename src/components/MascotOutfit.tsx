
/** New garments share the body coordinates, but have independent cuts and details. */
export function MascotOutfit({ outfitId }: { outfitId: string }) {
  switch (outfitId) {
    case 'navy-hoodie':
      return (
        <g>
          <path
            d="M76 144q44-16 88 0l10 65q-54 21-108 0Z"
            fill="#284B70"
            stroke="#1A3554"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M70 206q50 17 100 0l-1 8q-49 15-98 0Z" fill="#1F3F60" />
          <path
            d="m94 166-3 15m55-15 3 15"
            stroke="#ABCAD9"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M95 195h50l8 13q-33 9-66 0Z" fill="#234365" stroke="#527793" strokeWidth="1.5" />

          <path d="m119 177 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#FFFDF5" />
          <path d="m96 204 4-4m44 4-4-4" stroke="#7899AD" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      );
    case 'sky-puffer':
      return (
        <g>
          <path
            d="M75 140q45-20 90 0l14 62q2 14-17 17-42 9-84 0-19-3-17-17Z"
            fill="#398EAA"
            stroke="#24667F"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="m82 143 6-12q32-10 64 0l6 12-8 24-30-7-30 7Z"
            fill="#58A8B7"
            stroke="#2F7D92"
            strokeWidth="2"
          />
          <path
            d="M72 171q48 12 96 0M68 190q52 12 104 0M67 207q53 12 106 0"
            fill="none"
            stroke="#286F87"
            strokeWidth="2"
          />
          <path
            d="M75 168q13 4 26 5m36 0q14-1 27-5M72 187l17 3m62 0 17-3"
            stroke="#74BFC8"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M120 157v59" stroke="#DFEEDB" strokeWidth="3" />
          <rect x="117" y="175" width="6" height="8" rx="2" fill="#C8DFD7" />
          <path d="m82 195 12 7m64-7-12 7" stroke="#194F6B" strokeWidth="3" strokeLinecap="round" />
          <g fill="#F5F9E9">
            <circle cx="145" cy="175" r="5" /><circle cx="145" cy="175" r="2.5" fill="#398EAA" />

          </g>
        </g>
      );
    case 'beige-trench':
      return (
        <g>
          <path
            d="M79 141q41-12 82 0l16 73q-25 12-56 9-31 3-58-9Z"
            fill="#D8B98D"
            stroke="#AA8D68"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M122 160v62m-41-17-7 11m85-11 7 11" stroke="#B49570" strokeWidth="1.7" />
          <path
            d="m84 142 17-5 19 28-16 19-19-25 7-1Zm72 0-17-5-19 28 16 19 19-25-7-1Z"
            fill="#F0E1C2"
            stroke="#B89D78"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="m94 146 17 27m-23-16 19-7m-8 20 16-6m31-18-17 27m23-16-19-7m8 20-16-6"
            stroke="#8C806C"
            strokeWidth="3"
          />
          <path
            d="m98 143 16 25m-24-17 15-5m3 28 9-5m25-26-16 25m24-17-15-5m-3 28-9-5"
            stroke="#C58477"
            strokeWidth="1.3"
          />
          <path
            d="M72 189q48 9 96 0v10q-48 9-96 0Z"
            fill="#BFA072"
            stroke="#A58A63"
            strokeWidth="1.5"
          />
          <rect
            x="112"
            y="190"
            width="17"
            height="11"
            rx="2"
            fill="#DCC499"
            stroke="#927B5C"
            strokeWidth="2"
          />
          <path d="M120 192v7" stroke="#927B5C" strokeWidth="1.5" />
          <path d="M130 195h24l-5 14-8-4 3-9" fill="#CDB080" stroke="#A58A63" strokeWidth="1.2" />
          {[179, 208].map((y) => (
            <g key={y} fill="#92775B">
              <circle cx="106" cy={y} r="2.6" />
              <circle cx="134" cy={y} r="2.6" />
            </g>
          ))}
          <path
            d="m79 180 13 3m69-3-13 3"
            stroke="#A98B66"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      );
    case 'mint-cardigan':
      return (
        <g>
          <path
            d="M79 146q41-14 82 0l11 62q-52 14-104 0Z"
            fill="#8BD4BC"
            stroke="#55A98E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="m99 149 21 34 21-34"
            fill="#FFF5DF"
            stroke="#72B99E"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M120 181v30M73 205q47 11 94 0" stroke="#68B69B" strokeWidth="5" />
          {[187, 197, 207].map((y) => (
            <circle
              key={y}
              cx="120"
              cy={y}
              r="2.5"
              fill="#F6E5B4"
              stroke="#C6B780"
              strokeWidth=".8"
            />
          ))}
          <path
            d="M80 184h23v15q-12 8-23 0Zm57 0h23v15q-12 8-23 0Z"
            fill="#A3DEC7"
            stroke="#65AF94"
            strokeWidth="1.6"
          />
          <path d="M81 187h21m36 0h21" stroke="#E0F4DD" strokeWidth="2" />
        </g>
      );
    case 'denim-jacket':
      return (
        <g>
          <path
            d="M77 142q43-15 86 0l10 63q-53 10-106 0Z"
            fill="#75ACCE"
            stroke="#477E9F"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M111 151h18l3 54h-24Z" fill="#F8F4DF" />
          <path
            d="m82 143 21-5 17 23-15 12-24-20 10-1Zm76 0-21-5-17 23 15 12 24-20-10-1Z"
            fill="#96C7DC"
            stroke="#568DAA"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M109 168v37m22-37v37M70 203q50 10 100 0" stroke="#527F9D" strokeWidth="3" />
          <path
            d="M82 176h22v16l-11 5-11-5Zm54 0h22v16l-11 5-11-5Z"
            fill="#659ABC"
            stroke="#477E9F"
            strokeWidth="1.3"
          />
          <path
            d="m82 176 11 8 11-8m32 0 11 8 11-8M74 201q46 8 92 0"
            fill="none"
            stroke="#E9D8AB"
            strokeWidth="1.6"
            strokeDasharray="2 2"
          />
          <g fill="#E8D4A2">
            <circle cx="93" cy="182" r="1.8" />
            <circle cx="147" cy="182" r="1.8" />
            <circle cx="126" cy="180" r="2" />
            <circle cx="126" cy="192" r="2" />
            <circle cx="126" cy="202" r="2" />
          </g>
        </g>
      );
    case 'striped-knit':
      return (
        <g>
          <path
            d="M80 145q40-12 80 0l10 55q5 14-13 16-37 8-74 0-18-2-13-16Z"
            fill="#F6F1D9"
            stroke="#9EBBBB"
            strokeWidth="2"
          />
          <path
            d="M77 163q43 10 86 0l2 8q-45 11-90 0Zm-4 20q47 11 94 0l2 9q-49 12-98 0Zm-3 21q50 11 100 0l-1 7q-49 14-98 0Z"
            fill="#6DA5BB"
          />
          <path
            d="M96 148q24 13 48 0"
            fill="none"
            stroke="#82B4C4"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M79 211v5m8-3v5m8-4v6m50-6v6m8-7v5m8-7v5" stroke="#B8D8DC" strokeWidth="1.6" />
        </g>
      );
    case 'lavender-sweater':
      return (
        <g>
          <path
            d="M74 147q46-18 92 0l9 57q1 15-17 15H82q-18 0-17-15Z"
            fill="#B8B3DD"
            stroke="#8885B6"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M94 147q26 17 52 0"
            fill="none"
            stroke="#9C96C9"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M70 209q50 10 100 0v8q-50 10-100 0Z" fill="#A59FCF" />
          <path d="M78 212v6m7-5v6m7-5v6m56-6v6m7-7v6m7-7v6" stroke="#D2CEEC" strokeWidth="1.5" />
          <path
            d="M103 187q-1-9 8-9 3-11 13-6 9-2 11 7 8-1 8 8Z"
            fill="#E3F4EB"
            stroke="#A2C9C3"
            strokeWidth="1.5"
          />
          <path
            d="m112 192-2 4m12-3-1 4m12-5-1 4"
            stroke="#86C5CD"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    case 'raincoat':
      return (
        <g>
          <path
            d="M80 141q40-16 80 0l17 71q-57 18-114 0Z"
            fill="#F1D97B"
            stroke="#CAA956"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M120 156v64" stroke="#D2B55D" strokeWidth="3" />
          <path
            d="M79 157q41 14 82 0l4 19-45-6-45 6Z"
            fill="#FBE59C"
            stroke="#D9BC69"
            strokeWidth="1.6"
          />
          <path
            d="M81 184h24v18l-12 5-12-5Zm54 0h24v18l-12 5-12-5Z"
            fill="#F8E497"
            stroke="#D6B866"
            strokeWidth="1.5"
          />
          <path
            d="m81 184 12 7 12-7m30 0 12 7 12-7"
            fill="#FFF0B4"
            stroke="#D6B866"
            strokeWidth="1.4"
          />
          {[178, 192, 206].map((y) => (
            <circle key={y} cx="120" cy={y} r="2.8" fill="#6AB2A3" />
          ))}
          <path d="M69 208q51 14 102 0" fill="none" stroke="#FFF1B4" strokeWidth="2.5" />
        </g>
      );
    case 'cozy-fleece':
      return (
        <g>
          <path
            d="M78 143q6-10 15-6 9-9 17-4 10-6 20 0 8-5 17 4 9-4 15 6l12 59q6 9-2 14-5 7-12 3-8 7-16 2-10 5-18 1-12 5-21 0-8 5-16 0-9 5-15-2-8 2-10-8-5-7 1-12Z"
            fill="#F0E9D3"
            stroke="#C4C5A7"
            strokeWidth="2"
          />
          <path
            d="m84 148 7-13q29-11 58 0l7 13-8 14-28-4-28 4Z"
            fill="#FFF7E4"
            stroke="#C8CCAD"
            strokeWidth="1.5"
          />
          <path d="M120 157v63" stroke="#6AA88D" strokeWidth="4" />
          <rect x="117" y="171" width="6" height="9" rx="2" fill="#467D6C" />
          <path d="M137 171h20v21h-20Z" fill="#ABD2BA" stroke="#75AD94" strokeWidth="1.4" />
          <path d="M139 177h16" stroke="#578E7B" strokeWidth="2" />
          <path d="m78 198 15 5m69-5-15 5" stroke="#9FBBA0" strokeWidth="3" strokeLinecap="round" />
          <path
            d="m82 174 3-1m17 8 3 1m-21 8 3-1m12 20 3 1m42-4 3-1m14-7 2 1m-7-31 2 1"
            stroke="#FFFBEF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      );
    case 'ribbon-dress':
      return (
        <g>
          <path
            d="M82 143q38-13 76 0l-10 40 30 33q-58 18-116 0l30-33Z"
            fill="#93D1BF"
            stroke="#5EA68E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="m90 146 30 16 30-16-4 19-26-6-26 6Z"
            fill="#FFF7E6"
            stroke="#A7CBB7"
            strokeWidth="1.3"
          />
          <path d="M89 182q31 8 62 0" fill="none" stroke="#5C99B8" strokeWidth="6" />
          <path
            d="m115 181-12 21 9-2 4 6 8-23m1 0 7 20 5-6 9 2-17-19"
            fill="#73AFC9"
            stroke="#548EA9"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M117 179q-18-14-21-4-4 9 3 15 7 4 19-6m5-5q18-14 21-4 4 9-3 15-7 4-19-6"
            fill="#91C7DB"
            stroke="#548EA9"
            strokeWidth="1.5"
          />
          <circle cx="120" cy="181" r="5" fill="#66A2BF" />
          <path
            d="m89 192-13 21m26-17-7 22m58-26 13 21m-26-17 7 22M67 216q53 14 106 0"
            fill="none"
            stroke="#B8E2CD"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      );
    default:
      return null;
  }
}

/** Sits behind the companion's ears and face; never changes the face crop. */
