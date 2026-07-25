type MowerProps = {
  className?: string;
};

/** Der skulderfalsen ender framme i nesa. Flatene og falsen må treffe samme punkt. */
const SHOULDER_END = "230 159";

/** Jevnt fordelte mønsterklosser rundt dekket. */
const TREAD_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);

/** Kroppen fra logoen. Brukes både som synlig form og som klippebane for skyggeleggingen. */
const BODY_PATH =
  "M129.11,179.43c3.4-3.7,7.3-7.1,9.6-11.7,7.4-14.8,3.8-31.4-9.1-41.6-12.7-10-29.8-9.6-42.8,1-2.3,1.9-4.2,4.9-7.5,1-1.9-2.2-1.9-3.6.2-5.6,5.1-4.6,10.6-8.3,17.3-9.9,3.1-.7,3.8-2.1,4.6-5.2,1.8-7.1,2.5-14.2,2.3-21.5,0-1.2.5-2.4,1.7-2.5,1.7-.1,2.1,1.3,2.1,2.7v8c.1,9.5-1,8.1,8.7,9.3,7.3.9,14.9,3.1,22,2.1,14.1-1.9,24.7,6.1,36.1,11.1,19.7,8.6,38.3,19.6,56.9,30.3,3.8,2.2,5.6,4.7,4.5,9.2-.7,2.7-.3,5.2,1.7,8,2.4,3.4,2,8.1.9,12.3-1,3.8-4.4,3.4-7.2,3.5-10.1.4-20.2.7-30.3.7-22.4,0-44.9,0-67.3-.2-1.4,0-3.1.6-4.6-1.2h0l.2.2h0Z";

/**
 * Robotklipperen fra Hagehjelpen-logoen, tegnet som flat silhuett.
 *
 * Kropp og hjul er de samme to banene som i /logo.svg, plassert i dette
 * koordinatsystemet med gruppe-transformen under. Fargene er snudd (lys grågrønn
 * kropp, mørkt hjul) fordi hero-seksjonen har mørkegrønn bakgrunn – i logoen
 * står den samme silhuetten mørk på hvitt.
 *
 * Retningen er den samme som i logoen: hjulenden ligger bakerst, og klipperen
 * kjører mot høyre med gressavklippet sprutende ut bak hjulet.
 */
export function Mower({ className }: MowerProps) {
  return (
    <svg
      viewBox="0 0 340 220"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Grunnfarge på skallet – lyset kommer fra øvre venstre */}
        <linearGradient id="mower-logo-body" x1="0.12" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#f2f4ec" />
          <stop offset="45%" stopColor="#ccd4bf" />
          <stop offset="100%" stopColor="#8e9a7c" />
        </linearGradient>

        {/* Mørkere underside, gir kroppen tykkelse */}
        <linearGradient
          id="mower-belly-shade"
          x1="0"
          y1="138"
          x2="0"
          y2="182"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#28311f" stopOpacity="0" />
          <stop offset="100%" stopColor="#28311f" stopOpacity="0.7" />
        </linearGradient>

        {/* Bredt lysfall over det buede skallet */}
        <radialGradient id="mower-sheen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Skygge i hjulbuen der karosseriet krummer inn mot hjulet */}
        <radialGradient id="mower-arch-shade" cx="50%" cy="50%" r="50%">
          <stop offset="66%" stopColor="#1b2716" stopOpacity="0.38" />
          <stop offset="85%" stopColor="#1b2716" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#1b2716" stopOpacity="0" />
        </radialGradient>

        {/* Kuleforming av hjulet: lys øverst til venstre, mørkt nederst til høyre */}
        <radialGradient id="mower-wheel-shade" cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="72%" stopColor="#0f150c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0f150c" stopOpacity="0.5" />
        </radialGradient>

        {/* Felgen er metall: hardt lys øverst til venstre, mørk avrunding motsatt */}
        <radialGradient id="mower-rim" cx="32%" cy="26%" r="52%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#d3dac8" />
          <stop offset="78%" stopColor="#95a184" />
          <stop offset="100%" stopColor="#717d5f" />
        </radialGradient>

        {/* Karosseriet henger over hjulet og kaster skygge ned på det */}
        <linearGradient
          id="mower-wheel-cast"
          x1="0"
          y1="123"
          x2="0"
          y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0b1108" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0b1108" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="mower-logo-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#081006" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#081006" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#081006" stopOpacity="0" />
        </radialGradient>

        <clipPath id="mower-body-clip">
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      <style>{`
        @keyframes flyingClipUp1 {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 0.9; }
          100% { transform: translate(14px, -62px) rotate(180deg) scale(1); opacity: 0; }
        }
        @keyframes flyingClipUp2 {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
          20% { opacity: 1; }
          75% { opacity: 0.85; }
          100% { transform: translate(-10px, -78px) rotate(-220deg) scale(1); opacity: 0; }
        }
        @keyframes flyingClipUp3 {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
          18% { opacity: 1; }
          100% { transform: translate(30px, -70px) rotate(260deg) scale(1); opacity: 0; }
        }
        @keyframes flyingClipUp4 {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
          22% { opacity: 1; }
          100% { transform: translate(4px, -54px) rotate(-160deg) scale(1); opacity: 0; }
        }
        @keyframes flyingClipUp5 {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translate(-22px, -68px) rotate(200deg) scale(1); opacity: 0; }
        }
        .clip-p1 { animation: flyingClipUp1 1.4s infinite linear; }
        .clip-p2 { animation: flyingClipUp2 1.6s infinite linear 0.3s; }
        .clip-p3 { animation: flyingClipUp3 1.3s infinite linear 0.7s; }
        .clip-p4 { animation: flyingClipUp4 1.7s infinite linear 0.15s; }
        .clip-p5 { animation: flyingClipUp5 1.5s infinite linear 0.5s; }
        .clip-p6 { animation: flyingClipUp2 1.45s infinite linear 0.9s; }
        .clip-p7 { animation: flyingClipUp3 1.55s infinite linear 1.1s; }
        .clip-p8 { animation: flyingClipUp1 1.65s infinite linear 0.6s; }
        /* Tettere gressprut når klipperen faktisk kjører */
        .is-moving .clip-p1 { animation-duration: 0.7s; }
        .is-moving .clip-p2 { animation-duration: 0.8s; }
        .is-moving .clip-p3 { animation-duration: 0.65s; }
        .is-moving .clip-p4 { animation-duration: 0.85s; }
        .is-moving .clip-p5 { animation-duration: 0.75s; }
        .is-moving .clip-p6 { animation-duration: 0.72s; }
        .is-moving .clip-p7 { animation-duration: 0.78s; }
        .is-moving .clip-p8 { animation-duration: 0.82s; }
      `}</style>

      {/* Bakkeskygge */}
      <ellipse cx="170" cy="171" rx="118" ry="14" fill="url(#mower-logo-shadow)" />

      {/* Grønt skinn fra knivene under dekket */}
      <ellipse cx="160" cy="166" rx="66" ry="6" fill="#84df38" opacity="0.35" />

      {/*
        Logo-geometri i logoens eget koordinatsystem (viewBox 0 0 300.86 300.03),
        skalert og flyttet slik at hjulet står på bakken her.
      */}
      <g transform="translate(-43.4 -66.6) scale(1.3)">
        {/* Kropp med pisk-antenne, som i logoen */}
        <path
          d={BODY_PATH}
          fill="url(#mower-logo-body)"
          stroke="#3a4433"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Volum i skallet: alt her ligger klippet inne i kroppen */}
        <g clipPath="url(#mower-body-clip)">
          {/* Undersiden faller i skygge */}
          <rect x="70" y="138" width="180" height="46" fill="url(#mower-belly-shade)" />

          {/* To flater møtes i skulderfalsen: toppen vender mot lyset ... */}
          <path
            d={`M113 103 Q 140 104 170 115 Q 205 132 233 148 L ${SHOULDER_END} Q 200 143 172 130 Q 148 120 126 117 Z`}
            fill="#ffffff"
            fillOpacity="0.2"
          />
          {/* ... mens siden vender bort fra det */}
          <path
            d={`M126 117 Q 148 120 172 130 Q 200 143 ${SHOULDER_END} L 236 182 L 126 182 Z`}
            fill="#28311f"
            fillOpacity="0.18"
          />
          {/* Skjørtet nederst ligger enda dypere i skyggen */}
          <path
            d="M131 164 Q 182 169.5 236 170 L 236 182 L 131 182 Z"
            fill="#1b2415"
            fillOpacity="0.3"
          />

          {/* Lyset legger seg langs den buede toppen */}
          <ellipse
            cx="162"
            cy="122"
            rx="64"
            ry="17"
            fill="url(#mower-sheen)"
            transform="rotate(12 162 122)"
          />

          {/* Karosseriet krummer inn mot hjulbuen */}
          <circle cx="109" cy="152.2" r="43" fill="url(#mower-arch-shade)" />

          {/* Nesa krummer bort fra lyset helt fremme */}
          <ellipse cx="246" cy="164" rx="18" ry="28" fill="#28311f" fillOpacity="0.22" />

          {/* Skulderfalsen: mørk fals med høylys på kanten over */}
          <path
            d={`M126 117 Q 148 120 172 130 Q 200 143 ${SHOULDER_END}`}
            stroke="#232c1b"
            strokeOpacity="0.6"
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M126 114.4 Q 148 117.4 172 127.4 Q 200 140.4 229 156.4"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
          />

          {/* Skjørtet nederst skilles ut med en egen fals */}
          <path
            d="M131 164 Q 182 169.5 236 170"
            stroke="#232c1b"
            strokeOpacity="0.42"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Gjenskinn fra plenen langs underkanten */}
          <path
            d="M136 177 Q 186 181 232 177.5"
            stroke="#cfe8a8"
            strokeOpacity="0.22"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Luke med betjeningspanel på toppflaten */}
          <g transform="rotate(22.5 172 124)">
            <rect
              x="150"
              y="119.5"
              width="44"
              height="9"
              rx="3"
              fill="#1d2617"
              fillOpacity="0.16"
              stroke="#232c1b"
              strokeOpacity="0.5"
              strokeWidth="1.1"
            />
            <path
              d="M151.5 121 H 192.5"
              stroke="#ffffff"
              strokeOpacity="0.3"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </g>

          {/* Stoppknappen sitter bak luka, som på en ekte robotklipper */}
          <circle cx="137" cy="113" r="4" fill="#232c1b" fillOpacity="0.45" />
          <circle cx="137" cy="112.2" r="3" fill="#e2483a" />
          <circle cx="136" cy="111.2" r="1.1" fill="#ffffff" fillOpacity="0.5" />

          {/* Hjulbuen skjærer seg inn i karosseriet */}
          <circle
            cx="109"
            cy="152.2"
            r="34"
            stroke="#232c1b"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Skjøt mellom nesa og resten av skallet */}
          <path
            d="M228 150 Q 235 164 232 180"
            stroke="#232c1b"
            strokeOpacity="0.4"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Panelskjøt tvers over skallet, der lokket slutter og nesa tar over */}
          <path
            d="M206 133 Q 203 150 207 167"
            stroke="#232c1b"
            strokeOpacity="0.38"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M208.6 133.8 Q 205.6 150.5 209.6 167.5"
            stroke="#ffffff"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />

          {/* Skarpt høylys helt oppe på kanten */}
          <path
            d="M119 105 Q152 108 178 120 Q208 134 229 147"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Svakt kantlys bak, så bakenden løsner fra bakgrunnen */}
          <path
            d="M232 150 Q238 161 237 174"
            stroke="#ffffff"
            strokeOpacity="0.3"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Felgen bak hjulet, slik at åpningene mellom eikene leser lyst som i logoen */}
        <circle cx="109" cy="152.2" r="28.6" fill="url(#mower-rim)" />

        {/* Hjulet: ring med tre eiker (samme bane som i logoen). Roteres av GSAP på scroll. */}
        <path
          className="mower-wheel"
          d="M109.01,181.43c-16.6,0-29.5-12.9-29.3-29.3.2-16,13.2-29,29.1-29s29.7,13.6,29.5,29.5c-.2,15.8-13.4,28.8-29.4,28.8h.1ZM97.01,168.93c11.5,9.2,29.8-2.9,30.9-9.3,0,0,.3,0,0,0-17.1-5.4-24.4-.3-30.9,9.3ZM105.21,132.13s-.3-4.8,0,0c.6,10.3,10.9,24.6,23.7,21.3h0c2.1-7.5-5-23.5-23.7-21.3ZM100.21,134.13c-13.1,5.5-16.6,21.6-6.7,30.9,9-8.9,11.1-19.2,6.7-30.9h0Z"
          fill="#39432f"
        />

        {/* Mønsteret i dekket ruller sammen med hjulet */}
        <g className="mower-wheel">
          {TREAD_ANGLES.map((angle) => (
            <line
              key={angle}
              x1="109"
              y1="124.6"
              x2="109"
              y2="130.4"
              transform={`rotate(${angle} 109 152.2)`}
              stroke="#788564"
              strokeOpacity="0.55"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Felgkant rundt eikene */}
        <circle
          cx="109"
          cy="152.2"
          r="20.5"
          fill="none"
          stroke="#2b3423"
          strokeOpacity="0.3"
          strokeWidth="1"
        />

        {/* Statisk lyssetting over hjulet – ligger utenfor rotasjonen så høylyset blir stående */}
        <circle cx="109" cy="152.2" r="28.6" fill="url(#mower-wheel-shade)" />
        <circle cx="109" cy="152.2" r="28.6" fill="url(#mower-wheel-cast)" />

        {/* Mørk fuge der dekket møter felgen, øverst der lyset ikke slipper til */}
        <path
          d="M88.4 152.2 A 20.6 20.6 0 0 1 129.6 152.2"
          fill="none"
          stroke="#0f150c"
          strokeOpacity="0.3"
          strokeWidth="3.4"
        />
        <path
          d="M84.9 145.7 A 25 25 0 0 1 115.5 128.1"
          stroke="#f4f6ef"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Navkapsel i midten binder eikene sammen og gir hjulet dybde */}
        <circle cx="109" cy="152.2" r="8.4" fill="#2b3423" />
        <circle
          cx="109"
          cy="152.2"
          r="8.4"
          fill="none"
          stroke="#f0f2ea"
          strokeOpacity="0.28"
          strokeWidth="1.2"
        />
        <circle cx="106.6" cy="149.6" r="2.8" fill="#ffffff" fillOpacity="0.22" />
      </g>

      {/*
        Gressavklipp som spruter opp ved hjulenden – samme side som i logoen,
        og den bakerste siden når klipperen kjører mot høyre. Negativ x-skala
        vender spruten bakover.
      */}
      <g transform="translate(60, 164) scale(-2.3, 2.3)">
        <path d="M 0 0 Q 4 -9 8 -14 Q 5 -5 0 0 Z" fill="#bef264" className="clip-p1" />
        <path d="M -5 2 Q 2 -12 8 -17 Q 3 -6 -5 2 Z" fill="#9aca42" className="clip-p2" />
        <path d="M 5 -2 Q 12 -14 16 -19 Q 8 -8 5 -2 Z" fill="#d9f99d" className="clip-p3" />
        <path d="M -2 -4 Q 5 -11 11 -16 Q 4 -5 -2 -4 Z" fill="#5dc600" className="clip-p4" />
        <path d="M 2 1 Q 8 -11 13 -15 Q 6 -3 2 1 Z" fill="#ecfccb" className="clip-p5" />
        <path d="M -8 0 Q -3 -10 2 -15 Q -2 -5 -8 0 Z" fill="#bef264" className="clip-p6" />
        <path d="M 8 1 Q 14 -9 18 -13 Q 11 -4 8 1 Z" fill="#9aca42" className="clip-p7" />
        <path d="M -1 3 Q 6 -8 9 -13 Q 3 -3 -1 3 Z" fill="#d9f99d" className="clip-p8" />
      </g>
    </svg>
  );
}
