Position

static: position: static;
relative: position: relative;
absolute: position: absolute;
fixed: position: fixed;
sticky: position: sticky;

top-{size}: top: {size};
right-{size}: right: {size};
bottom-{size}: bottom: {size};
left-{size}: left: {size};
inset-{size}: top: {size}; right: {size}; bottom: {size}; left: {size};
inset-x-{size}: left: {size}; right: {size};
inset-y-{size}: top: {size}; bottom: {size};

z-0: z-index: 0;
z-10: z-index: 10;
z-20: z-index: 20;
z-30: z-index: 30;
z-40: z-index: 40;
z-50: z-index: 50;
z-auto: z-index: auto;

visible: visibility: visible;
invisible: visibility: hidden;
collapse: visibility: collapse;

--------------------------------------------------

Display & Flexbox

display:
block: display: block;
inline-block: display: inline-block;
inline: display: inline;
flex: display: flex;
inline-flex: display: inline-flex;
grid: display: grid;
hidden: display: none;

flex-direction:
flex-row: flex-direction: row;
flex-col: flex-direction: column;
flex-row-reverse: flex-direction: row-reverse;
flex-col-reverse: flex-direction: column-reverse;

flex-wrap:
flex-wrap: flex-wrap: wrap;
flex-nowrap: flex-wrap: nowrap;
flex-wrap-reverse: flex-wrap: wrap-reverse;

justify-content (가로 정렬 - row 기준):
justify-start: justify-content: flex-start;
justify-end: justify-content: flex-end;
justify-center: justify-content: center;
justify-between: justify-content: space-between;
justify-around: justify-content: space-around;
justify-evenly: justify-content: space-evenly;

align-items (세로 정렬 - row 기준):
items-start: align-items: flex-start;
items-end: align-items: flex-end;
items-center: align-items: center;
items-baseline: align-items: baseline;
items-stretch: align-items: stretch;

flex (아이템 크기 비율):
flex-1: flex: 1 1 0%;
flex-auto: flex: 1 1 auto;
flex-initial: flex: 0 1 auto;
flex-none: flex: none;

gap (자식 요소 간 간격, Size 규칙 동일 적용):
gap-{size}: gap: {size};
gap-x-{size}: column-gap: {size};
gap-y-{size}: row-gap: {size};

--------------------------------------------------

Grid Layout 

grid-cols (열 개수 지정):
grid-cols-1: grid-template-columns: repeat(1, minmax(0, 1fr));
grid-cols-2: grid-template-columns: repeat(2, minmax(0, 1fr));
grid-cols-3: grid-template-columns: repeat(3, minmax(0, 1fr));
grid-cols-4: grid-template-columns: repeat(4, minmax(0, 1fr));
grid-cols-none: grid-template-columns: none;

col-span (열 차지 범위):
col-auto: grid-column: auto;
col-span-1: grid-column: span 1 / span 1;
col-span-2: grid-column: span 2 / span 2;
col-span-full: grid-column: 1 / -1;
col-start-1: grid-column-start: 1;
col-end-3: grid-column-end: 3;

grid-rows (행 개수 지정):
grid-rows-1: grid-template-rows: repeat(1, minmax(0, 1fr));
grid-rows-2: grid-template-rows: repeat(2, minmax(0, 1fr));
grid-rows-3: grid-template-rows: repeat(3, minmax(0, 1fr));
grid-rows-none: grid-template-rows: none;

row-span (행 차지 범위):
row-auto: grid-row: auto;
row-span-1: grid-row: span 1 / span 1;
row-span-2: grid-row: span 2 / span 2;
row-span-full: grid-row: 1 / -1;
row-start-1: grid-row-start: 1;
row-end-3: grid-row-end: 3;

--------------------------------------------------

Spacing (여백)

Padding (내부 여백):
p-{size}: padding: {size};
px-{size}: padding-left: {size}; padding-right: {size};
py-{size}: padding-top: {size}; padding-bottom: {size};
pt-{size}: padding-top: {size};
pr-{size}: padding-right: {size};
pb-{size}: padding-bottom: {size};
pl-{size}: padding-left: {size};

Margin (외부 여백):
m-{size}: margin: {size};
mx-{size}: margin-left: {size}; margin-right: {size};
my-{size}: margin-top: {size}; margin-bottom: {size};
mt-{size}: margin-top: {size};
mr-{size}: margin-right: {size};
mb-{size}: margin-bottom: {size};
ml-{size}: margin-left: {size};

음수 Margin (클래스 앞에 - 추가):
-m-{size}: margin: -{size};
-mt-{size}: margin-top: -{size};
-mx-{size}: margin-left: -{size}; margin-right: -{size};

가운데 정렬 (Margin Auto):
m-auto: margin: auto;
mx-auto: margin-left: auto; margin-right: auto;
my-auto: margin-top: auto; margin-bottom: auto;

--------------------------------------------------

Sizing (크기)

Width (너비):
w-{size}: width: {size};
w-auto: width: auto;
w-1/2: width: 50%;
w-full: width: 100%;
w-screen: width: 100vw;
w-min: width: min-content;
w-max: width: max-content;
w-fit: width: fit-content;

Min/Max Width:
min-w-0: min-width: 0px;
min-w-full: min-width: 100%;
min-w-min: min-width: min-content;
min-w-max: min-width: max-content;
min-w-fit: min-width: fit-content;
max-w-0: max-width: 0rem;
max-w-none: max-width: none;
max-w-full: max-width: 100%;
max-w-min: max-width: min-content;
max-w-max: max-width: max-content;
max-w-fit: max-width: fit-content;
max-w-screen-sm: max-width: 640px;
max-w-screen-md: max-width: 768px;
max-w-screen-lg: max-width: 1024px;
max-w-screen-xl: max-width: 1280px;

Height (높이):
h-{size}: height: {size};
h-auto: height: auto;
h-1/2: height: 50%;
h-full: height: 100%;
h-screen: height: 100vh;
h-min: height: min-content;
h-max: height: max-content;
h-fit: height: fit-content;

Min/Max Height:
min-h-0: min-height: 0px;
min-h-full: min-height: 100%;
min-h-screen: min-height: 100vh;
min-h-min: min-height: min-content;
min-h-max: min-height: max-content;
min-h-fit: min-height: fit-content;
max-h-0: max-height: 0px;
max-h-full: max-height: 100%;
max-h-screen: max-height: 100vh;
max-h-min: max-height: min-content;
max-h-max: max-height: max-content;
max-h-fit: max-height: fit-content;

--------------------------------------------------

Typography (타이포그래피)

Font Family (글꼴):
font-sans: font-family: ui-sans-serif, system-ui, sans-serif;
font-serif: font-family: ui-serif, Georgia, serif;
font-mono: font-family: ui-monospace, SFMono-Regular, monospace;

Font Size (글자 크기):
text-xs: font-size: 0.75rem; line-height: 1rem;
text-sm: font-size: 0.875rem; line-height: 1.25rem;
text-base: font-size: 1rem; line-height: 1.5rem;
text-lg: font-size: 1.125rem; line-height: 1.75rem;
text-xl: font-size: 1.25rem; line-height: 1.75rem;
text-2xl: font-size: 1.5rem; line-height: 2rem;
text-3xl: font-size: 1.875rem; line-height: 2.25rem;
text-4xl: font-size: 2.25rem; line-height: 2.5rem;
text-5xl: font-size: 3rem; line-height: 1;

Font Weight (글자 굵기):
font-thin: font-weight: 100;
font-extralight: font-weight: 200;
font-light: font-weight: 300;
font-normal: font-weight: 400;
font-medium: font-weight: 500;
font-semibold: font-weight: 600;
font-bold: font-weight: 700;
font-extrabold: font-weight: 800;
font-black: font-weight: 900;

Letter Spacing (자간):
tracking-tighter: letter-spacing: -0.05em;
tracking-tight: letter-spacing: -0.025em;
tracking-normal: letter-spacing: 0em;
tracking-wide: letter-spacing: 0.025em;
tracking-wider: letter-spacing: 0.05em;
tracking-widest: letter-spacing: 0.1em;

Line Height (행간/줄간격):
leading-none: line-height: 1;
leading-tight: line-height: 1.25;
leading-snug: line-height: 1.375;
leading-normal: line-height: 1.5;
leading-relaxed: line-height: 1.625;
leading-loose: line-height: 2;
leading-{size}: line-height: {size};

Text Align (정렬):
text-left: text-align: left;
text-center: text-align: center;
text-right: text-align: right;
text-justify: text-align: justify;

Text Decoration & Transform:
underline: text-decoration-line: underline;
overline: text-decoration-line: overline;
line-through: text-decoration-line: line-through;
no-underline: text-decoration-line: none;
uppercase: text-transform: uppercase;
lowercase: text-transform: lowercase;
capitalize: text-transform: capitalize;
normal-case: text-transform: none;

Text Color (글자 색상):
text-transparent: color: transparent;
text-current: color: currentColor;
text-black: color: #000;
text-white: color: #fff;
text-{color}-{shade}: color: {hex-code}; (예: text-blue-500, text-red-600)

--------------------------------------------------

Backgrounds (배경)

Background Color (배경 색상):
bg-transparent: background-color: transparent;
bg-current: background-color: currentColor;
bg-black: background-color: #000;
bg-white: background-color: #fff;
bg-{color}-{shade}: background-color: {hex-code}; (예: bg-gray-100, bg-green-500)

Background Size:
bg-auto: background-size: auto;
bg-cover: background-size: cover;
bg-contain: background-size: contain;

Background Position:
bg-bottom: background-position: bottom;
bg-center: background-position: center;
bg-left: background-position: left;
bg-right: background-position: right;
bg-top: background-position: top;

Background Repeat:
bg-repeat: background-repeat: repeat;
bg-no-repeat: background-repeat: no-repeat;
bg-repeat-x: background-repeat: repeat-x;
bg-repeat-y: background-repeat: repeat-y;
bg-repeat-round: background-repeat: round;
bg-repeat-space: background-repeat: space;

Background Attachment:
bg-fixed: background-attachment: fixed;
bg-local: background-attachment: local;
bg-scroll: background-attachment: scroll;

--------------------------------------------------

[ 8단계: Borders (테두리) ]

Border Radius (모서리 둥글기):
rounded-none: border-radius: 0px;
rounded-sm: border-radius: 0.125rem;
rounded: border-radius: 0.25rem;
rounded-md: border-radius: 0.375rem;
rounded-lg: border-radius: 0.5rem;
rounded-xl: border-radius: 0.75rem;
rounded-2xl: border-radius: 1rem;
rounded-3xl: border-radius: 1.5rem;
rounded-full: border-radius: 9999px;

Border Width (테두리 두께):
border-0: border-width: 0px;
border: border-width: 1px;
border-2: border-width: 2px;
border-4: border-width: 4px;
border-8: border-width: 8px;

방향별 Border Width:
border-t: border-top-width: 1px;
border-r: border-right-width: 1px;
border-b: border-bottom-width: 1px;
border-l: border-left-width: 1px;
border-t-{width}: border-top-width: {width}px;

Border Color (테두리 색상):
border-transparent: border-color: transparent;
border-white: border-color: #fff;
border-black: border-color: #000;
border-{color}-{shade}: border-color: {hex-code}; (예: border-blue-500)

Border Style (테두리 스타일):
border-solid: border-style: solid;
border-dashed: border-style: dashed;
border-dotted: border-style: dotted;
border-double: border-style: double;
border-none: border-style: none;

Outline:
outline-none: outline: 2px solid transparent; outline-offset: 2px;
outline: outline-style: solid;
outline-dashed: outline-style: dashed;
outline-dotted: outline-style: dotted;
outline-double: outline-style: double;
outline-{color}-{shade}: outline-color: {hex-code};

--------------------------------------------------

[ 9단계: Effects (효과) ]

Box Shadow (그림자):
shadow-sm: box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
shadow: box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
shadow-md: box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
shadow-lg: box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
shadow-xl: box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
shadow-2xl: box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
shadow-inner: box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
shadow-none: box-shadow: 0 0 #0000;

Opacity (투명도):
opacity-0: opacity: 0;
opacity-5: opacity: 0.05;
opacity-10: opacity: 0.1;
opacity-20: opacity: 0.2;
opacity-25: opacity: 0.25;
opacity-50: opacity: 0.5;
opacity-75: opacity: 0.75;
opacity-100: opacity: 1;

--------------------------------------------------

[ 10단계: Transitions & Animation (전환 및 애니메이션) ]

Transition Property (전환 속성):
transition-none: transition-property: none;
transition-all: transition-property: all;
transition: transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
transition-colors: transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
transition-opacity: transition-property: opacity;
transition-shadow: transition-property: box-shadow;
transition-transform: transition-property: transform;

Transition Duration (전환 시간):
duration-75: transition-duration: 75ms;
duration-100: transition-duration: 100ms;
duration-150: transition-duration: 150ms;
duration-200: transition-duration: 200ms;
duration-300: transition-duration: 300ms;
duration-500: transition-duration: 500ms;
duration-700: transition-duration: 700ms;
duration-1000: transition-duration: 1000ms;

Transition Timing Function (타이밍 함수):
ease-linear: transition-timing-function: linear;
ease-in: transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
ease-out: transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
ease-in-out: transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

Delay (지연 시간):
delay-75: transition-delay: 75ms;
delay-100: transition-delay: 100ms;
delay-200: transition-delay: 200ms;
delay-500: transition-delay: 500ms;

Animation (기본 애니메이션):
animate-none: animation: none;
animate-spin: animation: spin 1s linear infinite;
animate-ping: animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
animate-pulse: animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
animate-bounce: animation: bounce 1s infinite;

--------------------------------------------------

[ 11단계: Interactivity (상호작용) ]

Cursor (커서 모양):
cursor-auto: cursor: auto;
cursor-default: cursor: default;
cursor-pointer: cursor: pointer;
cursor-wait: cursor: wait;
cursor-text: cursor: text;
cursor-move: cursor: move;
cursor-help: cursor: help;
cursor-not-allowed: cursor: not-allowed;

User Select (텍스트 선택 여부):
select-none: user-select: none;
select-text: user-select: text;
select-all: user-select: all;
select-auto: user-select: auto;

Pointer Events (클릭 이벤트 처리):
pointer-events-none: pointer-events: none;
pointer-events-auto: pointer-events: auto;

Resize (크기 조절):
resize-none: resize: none;
resize-y: resize: vertical;
resize-x: resize: horizontal;
resize: resize: both;

--------------------------------------------------

[ 12단계: Transform (변형) ]

Scale (크기 조절):
scale-0: transform: scale(0);
scale-50: transform: scale(.5);
scale-75: transform: scale(.75);
scale-90: transform: scale(.9);
scale-100: transform: scale(1);
scale-110: transform: scale(1.1);
scale-150: transform: scale(1.5);
scale-x-50: transform: scaleX(.5);
scale-y-50: transform: scaleY(.5);

Rotate (회전):
rotate-0: transform: rotate(0deg);
rotate-1: transform: rotate(1deg);
rotate-2: transform: rotate(2deg);
rotate-3: transform: rotate(3deg);
rotate-6: transform: rotate(6deg);
rotate-12: transform: rotate(12deg);
rotate-45: transform: rotate(45deg);
rotate-90: transform: rotate(90deg);
rotate-180: transform: rotate(180deg);
-rotate-45: transform: rotate(-45deg);

Translate (이동):
translate-x-{size}: transform: translateX({size});
translate-y-{size}: transform: translateY({size});
translate-x-1/2: transform: translateX(50%);
translate-y-full: transform: translateY(100%);
-translate-x-full: transform: translateX(-100%);

Skew (비틀기):
skew-x-0: transform: skewX(0deg);
skew-x-3: transform: skewX(3deg);
skew-x-6: transform: skewX(6deg);
skew-x-12: transform: skewX(12deg);
skew-y-3: transform: skewY(3deg);
-skew-x-12: transform: skewX(-12deg);

Transform Origin (변형 기준점):
origin-center: transform-origin: center;
origin-top: transform-origin: top;
origin-top-right: transform-origin: top right;
origin-right: transform-origin: right;
origin-bottom-right: transform-origin: bottom right;
origin-bottom: transform-origin: bottom;
origin-bottom-left: transform-origin: bottom left;
origin-left: transform-origin: left;
origin-top-left: transform-origin: top left;

--------------------------------------------------

[ 13단계: Filters (필터 효과) ]

Blur (흐림 효과):
blur-none: filter: blur(0);
blur-sm: filter: blur(4px);
blur: filter: blur(8px);
blur-md: filter: blur(12px);
blur-lg: filter: blur(16px);
blur-xl: filter: blur(24px);

Brightness (밝기):
brightness-0: filter: brightness(0);
brightness-50: filter: brightness(.5);
brightness-90: filter: brightness(.9);
brightness-100: filter: brightness(1);
brightness-110: filter: brightness(1.1);
brightness-150: filter: brightness(1.5);

Contrast (대비):
contrast-0: filter: contrast(0);
contrast-50: filter: contrast(.5);
contrast-100: filter: contrast(1);
contrast-150: filter: contrast(1.5);

Grayscale / Invert / Sepia (색상 변환):
grayscale-0: filter: grayscale(0);
grayscale: filter: grayscale(100%);
invert-0: filter: invert(0);
invert: filter: invert(100%);
sepia-0: filter: sepia(0);
sepia: filter: sepia(100%);

Drop Shadow (형태 기반 그림자):
drop-shadow-sm: filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05));
drop-shadow: filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06));
drop-shadow-md: filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
drop-shadow-lg: filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));

--------------------------------------------------

[ 14단계: Object Fit & Tables (이미지 및 테이블 제어) ]

Object Fit (img, video 요소 비율 제어):
object-contain: object-fit: contain;
object-cover: object-fit: cover;
object-fill: object-fit: fill;
object-none: object-fit: none;
object-scale-down: object-fit: scale-down;

Object Position:
object-bottom: object-position: bottom;
object-center: object-position: center;
object-left: object-position: left;
object-right: object-position: right;
object-top: object-position: top;

Table Layout:
table-auto: table-layout: auto;
table-fixed: table-layout: fixed;

Border Collapse:
border-collapse: border-collapse: collapse;
border-separate: border-collapse: separate;

--------------------------------------------------

[ 15단계: SVG & Accessibility (접근성) ]

SVG:
fill-current: fill: currentColor;
stroke-current: stroke: currentColor;
stroke-0: stroke-width: 0;
stroke-1: stroke-width: 1;
stroke-2: stroke-width: 2;

Screen Readers (스크린 리더 전용):
sr-only: position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
not-sr-only: position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal;

--------------------------------------------------

[ 16단계: 핵심 Modifiers (접두사 - CSS 속성은 아니지만 필수) ]

Pseudo-classes (상태):
hover:{class}: 마우스를 올렸을 때 적용 (:hover)
focus:{class}: 포커스 되었을 때 적용 (:focus)
active:{class}: 클릭하고 있는 동안 적용 (:active)
disabled:{class}: 비활성화 상태일 때 적용 (:disabled)
first:{class}: 첫 번째 자식 요소일 때 적용 (:first-child)
last:{class}: 마지막 자식 요소일 때 적용 (:last-child)

Responsive (반응형 Breakpoints):
sm:{class}: width 640px 이상일 때 적용 (@media (min-width: 640px))
md:{class}: width 768px 이상일 때 적용 (@media (min-width: 768px))
lg:{class}: width 1024px 이상일 때 적용 (@media (min-width: 1024px))
xl:{class}: width 1280px 이상일 때 적용 (@media (min-width: 1280px))
2xl:{class}: width 1536px 이상일 때 적용 (@media (min-width: 1536px))

Dark Mode (다크 모드):
dark:{class}: 다크 모드 활성화 시 적용 (@media (prefers-color-scheme: dark))

--------------------------------------------------

[ 17단계: Layout 심화 (Overflow, Aspect Ratio 등) ]

Aspect Ratio (종횡비):
aspect-auto: aspect-ratio: auto;
aspect-square: aspect-ratio: 1 / 1;
aspect-video: aspect-ratio: 16 / 9;

Overflow (넘침 처리):
overflow-auto: overflow: auto;
overflow-hidden: overflow: hidden;
overflow-clip: overflow: clip;
overflow-visible: overflow: visible;
overflow-scroll: overflow: scroll;
overflow-x-auto: overflow-x: auto;
overflow-y-hidden: overflow-y: hidden;

Box Sizing:
box-border: box-sizing: border-box;
box-content: box-sizing: content-box;

Float & Clear:
float-right: float: right;
float-left: float: left;
float-none: float: none;
clear-left: clear: left;
clear-right: clear: right;
clear-both: clear: both;
clear-none: clear: none;

--------------------------------------------------

[ 18단계: Flex & Grid 심화 ]

Order (배치 순서):
order-first: order: -9999;
order-last: order: 9999;
order-none: order: 0;
order-1: order: 1;

Flex Grow / Shrink:
flex-grow: flex-grow: 1;
flex-grow-0: flex-grow: 0;
flex-shrink: flex-shrink: 1;
flex-shrink-0: flex-shrink: 0;

Grid Auto Flow:
grid-flow-row: grid-auto-flow: row;
grid-flow-col: grid-auto-flow: column;
grid-flow-dense: grid-auto-flow: dense;
grid-flow-row-dense: grid-auto-flow: row dense;

--------------------------------------------------

[ 19단계: Ring & Divide (테두리 보조) ]

Ring (Box-shadow를 이용한 아웃라인 효과):
ring-0: box-shadow: 0 0 0 0px var(--tw-ring-color);
ring-1: box-shadow: 0 0 0 1px var(--tw-ring-color);
ring-2: box-shadow: 0 0 0 2px var(--tw-ring-color);
ring: box-shadow: 0 0 0 3px var(--tw-ring-color);
ring-{color}-{shade}: --tw-ring-color: {hex-code};
ring-inset: --tw-ring-inset: inset;
ring-offset-2: --tw-ring-offset-width: 2px;

Divide (자식 요소 사이의 테두리):
divide-x: border-left-width: 1px; border-right-width: 0px; (자식 사이 세로선)
divide-y: border-top-width: 1px; border-bottom-width: 0px; (자식 사이 가로선)
divide-{color}-{shade}: border-color: {hex-code};
divide-dashed: border-style: dashed;

--------------------------------------------------

[ 20단계: Gradients (그라데이션 배경) ]

Gradient Direction:
bg-gradient-to-t: background-image: linear-gradient(to top, var(--tw-gradient-stops));
bg-gradient-to-tr: background-image: linear-gradient(to top right, var(--tw-gradient-stops));
bg-gradient-to-r: background-image: linear-gradient(to right, var(--tw-gradient-stops));
bg-gradient-to-b: background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
bg-gradient-to-l: background-image: linear-gradient(to left, var(--tw-gradient-stops));

Gradient Colors:
from-{color}-{shade}: --tw-gradient-from: {hex-code};
via-{color}-{shade}: --tw-gradient-stops: var(--tw-gradient-from), {hex-code}, var(--tw-gradient-to);
to-{color}-{shade}: --tw-gradient-to: {hex-code};

--------------------------------------------------

[ 21단계: Typography 심화 ]

List Style:
list-none: list-style-type: none;
list-disc: list-style-type: disc;
list-decimal: list-style-type: decimal;
list-inside: list-style-position: inside;
list-outside: list-style-position: outside;

Whitespace (공백 처리):
whitespace-normal: white-space: normal;
whitespace-nowrap: white-space: nowrap;
whitespace-pre: white-space: pre;

Word Break (단어 줄바꿈):
break-normal: overflow-wrap: normal; word-break: normal;
break-words: overflow-wrap: break-word;
break-all: word-break: break-all;
truncate: overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

--------------------------------------------------

[ 22단계: Backdrop Filters (유리 질감 효과) ]
(요소 뒤의 배경에 필터 적용)

Backdrop Blur:
backdrop-blur-sm: backdrop-filter: blur(4px);
backdrop-blur: backdrop-filter: blur(8px);
backdrop-blur-md: backdrop-filter: blur(12px);

Backdrop Brightness & Contrast:
backdrop-brightness-50: backdrop-filter: brightness(.5);
backdrop-contrast-125: backdrop-filter: contrast(1.25);

Backdrop Grayscale & Sepia:
backdrop-grayscale: backdrop-filter: grayscale(100%);
backdrop-sepia: backdrop-filter: sepia(100%);

--------------------------------------------------

[ 23단계: Scroll Behavior (스크롤 제어) ]

Scroll Margin & Padding (스크롤 시 요소 여백):
scroll-m-{size}: scroll-margin: {size};
scroll-p-{size}: scroll-padding: {size};

Scroll Snap (스크롤 스냅핑):
snap-none: scroll-snap-type: none;
snap-x: scroll-snap-type: x var(--tw-scroll-snap-strictness);
snap-y: scroll-snap-type: y var(--tw-scroll-snap-strictness);
snap-mandatory: --tw-scroll-snap-strictness: mandatory;
snap-start: scroll-snap-align: start;
snap-center: scroll-snap-align: center;

Scroll Behavior:
scroll-smooth: scroll-behavior: smooth;
scroll-auto: scroll-behavior: auto;

--------------------------------------------------

[ 24단계: Columns (다단 레이아웃) ]

Columns (단 개수 지정):
columns-1: columns: 1;
columns-2: columns: 2;
columns-3: columns: 3;
columns-auto: columns: auto;
columns-{size}: columns: {size}; (예: columns-3xs, columns-sm)

Break After / Before / Inside (단 나누기 제어):
break-after-auto: break-after: auto;
break-after-avoid: break-after: avoid;
break-after-column: break-after: column;
break-before-auto: break-before: auto;
break-inside-avoid: break-inside: avoid;
break-inside-avoid-column: break-inside: avoid-column;

--------------------------------------------------

[ 25단계: Typography (폰트 고급 제어) ]

Font Variant Numeric (숫자 표기 방식):
normal-nums: font-variant-numeric: normal;
ordinal: font-variant-numeric: ordinal;
slashed-zero: font-variant-numeric: slashed-zero;
lining-nums: font-variant-numeric: lining-nums;
oldstyle-nums: font-variant-numeric: oldstyle-nums;
proportional-nums: font-variant-numeric: proportional-nums;
tabular-nums: font-variant-numeric: tabular-nums;
diagonal-fractions: font-variant-numeric: diagonal-fractions;
stacked-fractions: font-variant-numeric: stacked-fractions;

Text Underline Offset (밑줄 간격):
underline-offset-auto: text-underline-offset: auto;
underline-offset-1: text-underline-offset: 1px;
underline-offset-2: text-underline-offset: 2px;
underline-offset-4: text-underline-offset: 4px;

Text Decoration Thickness (밑줄 두께):
decoration-auto: text-decoration-thickness: auto;
decoration-from-font: text-decoration-thickness: from-font;
decoration-0: text-decoration-thickness: 0px;
decoration-1: text-decoration-thickness: 1px;
decoration-2: text-decoration-thickness: 2px;
decoration-4: text-decoration-thickness: 4px;

--------------------------------------------------

[ 26단계: Mix Blend Mode (혼합 모드) ]

Mix Blend Mode (요소 배경과의 혼합):
mix-blend-normal: mix-blend-mode: normal;
mix-blend-multiply: mix-blend-mode: multiply;
mix-blend-screen: mix-blend-mode: screen;
mix-blend-overlay: mix-blend-mode: overlay;
mix-blend-darken: mix-blend-mode: darken;
mix-blend-lighten: mix-blend-mode: lighten;
mix-blend-color-dodge: mix-blend-mode: color-dodge;
mix-blend-color-burn: mix-blend-mode: color-burn;
mix-blend-hard-light: mix-blend-mode: hard-light;
mix-blend-soft-light: mix-blend-mode: soft-light;
mix-blend-difference: mix-blend-mode: difference;
mix-blend-exclusion: mix-blend-mode: exclusion;
mix-blend-hue: mix-blend-mode: hue;
mix-blend-saturation: mix-blend-mode: saturation;
mix-blend-color: mix-blend-mode: color;
mix-blend-luminosity: mix-blend-mode: luminosity;

Background Blend Mode (배경 이미지/색상 간의 혼합):
bg-blend-normal: background-blend-mode: normal;
bg-blend-multiply: background-blend-mode: multiply;
bg-blend-screen: background-blend-mode: screen;
bg-blend-overlay: background-blend-mode: overlay;

--------------------------------------------------

[ 27단계: 기타 유용한 속성 ]

Outline Offset:
outline-offset-0: outline-offset: 0px;
outline-offset-1: outline-offset: 1px;
outline-offset-2: outline-offset: 2px;
outline-offset-4: outline-offset: 4px;

Caret Color (입력 커서 색상):
caret-transparent: caret-color: transparent;
caret-current: caret-color: currentColor;
caret-{color}-{shade}: caret-color: {hex-code};

Accent Color (체크박스, 라디오 버튼 등 폼 요소 강조 색상):
accent-auto: accent-color: auto;
accent-transparent: accent-color: transparent;
accent-current: accent-color: currentColor;
accent-{color}-{shade}: accent-color: {hex-code};

Appearance (네이티브 폼 스타일 제거):
appearance-none: appearance: none;