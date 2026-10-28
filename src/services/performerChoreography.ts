/**
 * Performer Choreography & Acting Engine
 * Renders real-time animated characters that sing, act, and dance in sync with audio songs.
 * Supports distinct performance archetypes with dynamic lip-sync, expressive gestures,
 * rhythmic head/body bobbing, stage lighting, and style-tailored visual effects.
 */

export type PerformanceStyle = 
  | 'jingle_presenter'    // বিজ্ঞাপন ও জিঙ্গেল উপস্থাপক (Commercial/Jingle actor with mic & festive party)
  | 'pop_dj_stage'        // পপ ও ডিজে কনসার্ট (Pop star/DJ with lasers, sunglasses & crowd)
  | 'baul_folk_acoustic'  // বাউল ও মাটির সুর (Folk singer with Ektara & village twilight)
  | 'romantic_hero'       // রোমান্টিক সিনেমাটিক অভিনয় (Soulful emotional actor, hand to heart)
  | 'rock_star'           // রক ও ব্যান্ড ফ্রন্টম্যান (High energy rocker, stand mic & stage flashes)
  | 'lofi_chill';         // লো-ফাই ক্যাফে স্টুডিও (Chill anime vibe, headphones & warm desk lamp)

export interface PerformanceStyleConfig {
  id: PerformanceStyle;
  nameBn: string;
  nameEn: string;
  icon: string;
  descriptionBn: string;
  defaultBpm: number;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  stageType: 'festive_commercial' | 'neon_concert' | 'rustic_village' | 'romantic_cinema' | 'rock_arena' | 'lofi_studio';
}

export const PERFORMANCE_STYLES: PerformanceStyleConfig[] = [
  {
    id: 'jingle_presenter',
    nameBn: 'বিজ্ঞাপন ও জিঙ্গেল উপস্থাপক',
    nameEn: 'Commercial & Jingle Presenter',
    icon: '🎙️',
    descriptionBn: 'উদ্যমী উপস্থাপক, ডায়নামিক মাইক, শুভেচ্ছা অঙ্গভঙ্গি, উৎসবের কনফেটি ও ব্যানার।',
    defaultBpm: 125,
    primaryColor: '#f59e0b',
    accentColor: '#ef4444',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    stageType: 'festive_commercial'
  },
  {
    id: 'pop_dj_stage',
    nameBn: 'পপ ও ডিজে ড্যান্স কনসার্ট',
    nameEn: 'Pop & DJ Dance Stage',
    icon: '🕺',
    descriptionBn: 'আধুনিক পপ তারকা, সানগ্লাস, হেডসেট মাইক, সুইপিং লেজার লাইট ও দর্শকদের ভিড়।',
    defaultBpm: 128,
    primaryColor: '#06b6d4',
    accentColor: '#ec4899',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    stageType: 'neon_concert'
  },
  {
    id: 'baul_folk_acoustic',
    nameBn: 'বাউল ও লোকসঙ্গীত সাধক',
    nameEn: 'Baul & Folk Maestro',
    icon: '🪕',
    descriptionBn: 'ঐতিহ্যবাহী একতারা বাদক, গেরুয়া বসন, নদীর ঘাট ও প্রদীপের স্নিগ্ধ আলোয় ভাবাবেগ।',
    defaultBpm: 78,
    primaryColor: '#f97316',
    accentColor: '#fbbf24',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    stageType: 'rustic_village'
  },
  {
    id: 'romantic_hero',
    nameBn: 'রোমান্টিক সিনেমাটিক অভিনয়',
    nameEn: 'Romantic Melodic Hero',
    icon: '💖',
    descriptionBn: 'গভীর আবেগময় চোখের চাহনি, বুকে হাত রেখে গান গাওয়া, বৃষ্টি ও গোধূলির নরম আলো।',
    defaultBpm: 70,
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    glowColor: 'rgba(225, 29, 72, 0.35)',
    stageType: 'romantic_cinema'
  },
  {
    id: 'rock_star',
    nameBn: 'রকস্টার ও ব্যান্ড ফ্রন্টম্যান',
    nameEn: 'Rockstar & Band Frontman',
    icon: '⚡',
    descriptionBn: 'হাই-এনার্জি হেডব্যাংগিং, স্ট্যান্ড মাইক গ্রিপ, তীব্র স্ট্রোব লাইট ও ইলেকট্রিক রিফ।',
    defaultBpm: 135,
    primaryColor: '#8b5cf6',
    accentColor: '#38bdf8',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    stageType: 'rock_arena'
  },
  {
    id: 'lofi_chill',
    nameBn: 'লো-ফাই ক্যাফে আর্টিস্ট',
    nameEn: 'Lofi Cafe Studio Artist',
    icon: '☕',
    descriptionBn: 'হেডফোন পরে ছন্দে মাথা দোলানো, কফির বাষ্প, কাঁচের জানালায় বৃষ্টি ও ভিনাইল রেকর্ড।',
    defaultBpm: 82,
    primaryColor: '#6366f1',
    accentColor: '#a855f7',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    stageType: 'lofi_studio'
  }
];

export interface PerformerChoreographyOptions {
  currentTime: number;
  isPlaying: boolean;
  performanceStyle: PerformanceStyle;
  lyricsLine?: string;
  songTitle?: string;
  artistName?: string;
  aspectRatio?: '16:9' | '9:16';
  primaryEmotion?: string;
}

/**
 * Auto-detects the most suitable performance style from song title, lyrics, and metadata
 */
export function detectPerformanceStyle(title: string, lyrics: string, userStyle?: string): PerformanceStyle {
  const combined = `${title} ${lyrics} ${userStyle || ''}`.toLowerCase();

  // Commercial / Hotel / Restaurant / Jingle / Offer
  if (
    combined.includes('হোটেল') || 
    combined.includes('শেখ ফরিদ') || 
    combined.includes('খাবার') || 
    combined.includes('মাংস') || 
    combined.includes('ভাত') || 
    combined.includes('জিলাপি') || 
    combined.includes('রেস্তোরাঁ') || 
    combined.includes('বিজ্ঞাপন') || 
    combined.includes('অফার') || 
    combined.includes('স্টেশন') || 
    combined.includes('jingle') || 
    combined.includes('commercial') ||
    combined.includes('food')
  ) {
    return 'jingle_presenter';
  }

  // DJ / Dance / Party / Club / Upbeat
  if (
    combined.includes('ডিজে') || 
    combined.includes('dj') || 
    combined.includes('dance') || 
    combined.includes('নাচ') || 
    combined.includes('পার্টি') || 
    combined.includes('disco') ||
    combined.includes('remix') ||
    combined.includes('পপ')
  ) {
    return 'pop_dj_stage';
  }

  // Baul / Folk / Sufi / Ektara / Spiritual
  if (
    combined.includes('বাউল') || 
    combined.includes('একতারা') || 
    combined.includes('অচিন পাখি') || 
    combined.includes('সুফি') || 
    combined.includes('ফকির') || 
    combined.includes('লোকগীতি') || 
    combined.includes('সাঁই') ||
    combined.includes('baul') ||
    combined.includes('folk')
  ) {
    return 'baul_folk_acoustic';
  }

  // Rock / Metal / Electric
  if (
    combined.includes('rock') || 
    combined.includes('রক') || 
    combined.includes('metal') || 
    combined.includes('guitar') || 
    combined.includes('ড্রাম')
  ) {
    return 'rock_star';
  }

  // Lofi / Cafe / Chill
  if (
    combined.includes('lofi') || 
    combined.includes('লো-ফাই') || 
    combined.includes('ক্যাফে') || 
    combined.includes('ঘুম') || 
    combined.includes('কফি')
  ) {
    return 'lofi_chill';
  }

  // Default to romantic hero or user style
  if (userStyle === 'romantic_rain' || combined.includes('বৃষ্টি') || combined.includes('প্রেম') || combined.includes('ভালোবাসা') || combined.includes('মেঘ')) {
    return 'romantic_hero';
  }

  return 'jingle_presenter';
}

/**
 * Main procedural drawing engine: Renders the active performing character and stage effects.
 */
export function drawPerformerChoreography(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PerformerChoreographyOptions
) {
  const {
    currentTime,
    isPlaying,
    performanceStyle,
    lyricsLine = '',
    songTitle = '',
    aspectRatio = '16:9'
  } = options;

  const styleCfg = PERFORMANCE_STYLES.find(s => s.id === performanceStyle) || PERFORMANCE_STYLES[0];
  const bpm = styleCfg.defaultBpm;
  const beatFreq = (bpm / 60) * Math.PI * 2;
  const time = currentTime;

  // Audio-reactive amplitude estimate
  // Simulates vocal delivery pulses and musical kick timing
  const isVocalActive = isPlaying && lyricsLine.trim().length > 0;
  const beatPulse = isPlaying ? Math.abs(Math.sin(time * beatFreq * 0.5)) : 0.2;
  const vocalPulse = isVocalActive ? (0.5 + 0.5 * Math.sin(time * 12 + Math.cos(time * 4))) : 0.1;

  ctx.save();

  // -------------------------------------------------------------
  // 1. DYNAMIC STAGE LIGHTING & BACKDROP FX
  // -------------------------------------------------------------
  drawDynamicStageLighting(ctx, width, height, time, isPlaying, styleCfg);

  // -------------------------------------------------------------
  // 2. STAGE PROPS & BACKGROUND ELEMENTS
  // -------------------------------------------------------------
  drawStageProps(ctx, width, height, time, isPlaying, styleCfg, songTitle);

  // -------------------------------------------------------------
  // 3. THE ANIMATED PERFORMER CHARACTER (ACTOR)
  // -------------------------------------------------------------
  // Actor Positioning:
  // For 16:9: Center-right or center stage, leaving room for kinetic subtitles
  // For 9:16: Center stage
  const charX = aspectRatio === '16:9' ? width * 0.5 : width * 0.5;
  const charY = height * 0.76;
  const charScale = aspectRatio === '16:9' ? Math.min(width, height) * 0.0019 : Math.min(width, height) * 0.0022;

  drawCharacterActor(
    ctx, 
    charX, 
    charY, 
    charScale, 
    time, 
    isPlaying, 
    beatPulse, 
    vocalPulse, 
    styleCfg, 
    lyricsLine
  );

  // -------------------------------------------------------------
  // 4. FOREGROUND CROWD / STAGE GLOW / PARTICLES
  // -------------------------------------------------------------
  drawForegroundEffects(ctx, width, height, time, isPlaying, styleCfg);

  ctx.restore();
}

/**
 * Stage Lighting: Moving spotlights, neon beam sweeps, ambient colored flares
 */
function drawDynamicStageLighting(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isPlaying: boolean,
  style: PerformanceStyleConfig
) {
  // Moving Spotlight 1 (Left to Right Sweep)
  const spot1Angle = isPlaying ? Math.sin(time * 1.2) * 0.45 : -0.2;
  const spot1Color = style.primaryColor;

  ctx.save();
  ctx.globalAlpha = isPlaying ? 0.28 : 0.14;
  ctx.fillStyle = spot1Color;
  ctx.beginPath();
  ctx.moveTo(width * 0.15, -20);
  ctx.lineTo(width * 0.5 + Math.tan(spot1Angle) * height, height);
  ctx.lineTo(width * 0.65 + Math.tan(spot1Angle) * height, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Moving Spotlight 2 (Right to Left Sweep)
  const spot2Angle = isPlaying ? -Math.sin(time * 1.5 + 1.2) * 0.45 : 0.2;
  const spot2Color = style.accentColor;

  ctx.save();
  ctx.globalAlpha = isPlaying ? 0.25 : 0.12;
  ctx.fillStyle = spot2Color;
  ctx.beginPath();
  ctx.moveTo(width * 0.85, -20);
  ctx.lineTo(width * 0.35 + Math.tan(spot2Angle) * height, height);
  ctx.lineTo(width * 0.5 + Math.tan(spot2Angle) * height, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Ambient center stage overhead beam
  const centerBeam = ctx.createRadialGradient(
    width * 0.5, height * 0.45, 20,
    width * 0.5, height * 0.45, width * 0.45
  );
  centerBeam.addColorStop(0, style.glowColor);
  centerBeam.addColorStop(1, 'transparent');
  ctx.fillStyle = centerBeam;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Stage Props: Dynamic banners, DJ booth, or festive restaurant signage
 */
function drawStageProps(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isPlaying: boolean,
  style: PerformanceStyleConfig,
  songTitle: string
) {
  if (style.id === 'jingle_presenter') {
    // Glowing Festive Banner behind performer
    ctx.save();
    const bannerY = height * 0.22 + Math.sin(time * 2) * 3;
    const bannerW = Math.min(width * 0.75, 480);
    const bannerH = 48;
    const bannerX = width * 0.5 - bannerW * 0.5;

    // Glowing frame
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = style.primaryColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = style.primaryColor;
    ctx.shadowBlur = isPlaying ? 16 : 8;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 14);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
    }

    // Banner Text: Song Title or Festive Commercial Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#000000';
    const displayBanner = songTitle.length > 28 ? songTitle.slice(0, 26) + '...' : songTitle || 'HOTEL AL SHEIKH FARID';
    ctx.fillText(`✨ ${displayBanner} ✨`, width * 0.5, bannerY + bannerH * 0.5);

    ctx.restore();
  } else if (style.id === 'pop_dj_stage') {
    // DJ Console / Neon LED Meters in background
    ctx.save();
    const boothY = height * 0.78;
    const boothW = Math.min(width * 0.6, 360);
    const boothX = width * 0.5 - boothW * 0.5;

    ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
    ctx.strokeStyle = style.primaryColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = style.primaryColor;
    ctx.shadowBlur = 10;
    ctx.fillRect(boothX, boothY, boothW, height - boothY);
    ctx.strokeRect(boothX, boothY, boothW, height - boothY);

    // Equalizer LED meters on DJ booth
    const barCount = 18;
    const bw = (boothW - 40) / barCount;
    for (let i = 0; i < barCount; i++) {
      const bh = (Math.sin(time * 8 + i * 0.6) * 0.5 + 0.5) * 22 + 4;
      ctx.fillStyle = i % 3 === 0 ? style.accentColor : style.primaryColor;
      ctx.fillRect(boothX + 20 + i * bw, boothY + 8, bw - 3, bh);
    }
    ctx.restore();
  }
}

/**
 * Character Actor: Renders body, head, hair, eyes, singing mouth, microphone, and gestures
 */
function drawCharacterActor(
  ctx: CanvasRenderingContext2D,
  charX: number,
  charY: number,
  scale: number,
  time: number,
  isPlaying: boolean,
  beatPulse: number,
  vocalPulse: number,
  style: PerformanceStyleConfig,
  lyricsLine: string
) {
  ctx.save();
  ctx.translate(charX, charY);
  ctx.scale(scale, scale);

  // Natural head and body bobbing synced with beat
  const bodyBobY = isPlaying ? Math.sin(time * (style.defaultBpm / 60) * Math.PI * 2) * 5 : 0;
  const bodySwayX = isPlaying ? Math.sin(time * (style.defaultBpm / 60) * Math.PI) * 4 : 0;
  const headTilt = isPlaying ? Math.sin(time * 3) * 0.05 : 0;

  // 1. Shadow on floor
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 60, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(bodySwayX, bodyBobY);

  // 2. Torso / Clothes
  drawTorso(ctx, style);

  // 3. Left Arm & Acting Gesture
  drawLeftArm(ctx, time, isPlaying, style, vocalPulse);

  // 4. Neck & Head
  ctx.save();
  ctx.translate(0, -90);
  ctx.rotate(headTilt);

  // Neck
  ctx.fillStyle = '#f6d8b8';
  ctx.fillRect(-10, 0, 20, 18);

  // Head Base
  ctx.fillStyle = '#ffdfba';
  ctx.beginPath();
  ctx.ellipse(0, -28, 28, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#ffdfba';
  ctx.beginPath();
  ctx.ellipse(-29, -28, 5, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(29, -28, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair Style based on Character Archetype
  drawHair(ctx, style);

  // Eyes & Eyebrows
  drawEyes(ctx, time, isPlaying, vocalPulse, style);

  // Audio-reactive Singing Mouth (Lip-Sync)
  drawSingingMouth(ctx, time, isPlaying, vocalPulse, lyricsLine);

  ctx.restore(); // restore head tilt

  // 5. Right Arm holding Microphone up to mouth
  drawRightArmWithMicrophone(ctx, time, isPlaying, vocalPulse, style);

  ctx.restore();
}

/**
 * Character Torso & Attire based on Performance Style
 */
function drawTorso(ctx: CanvasRenderingContext2D, style: PerformanceStyleConfig) {
  // Shoulders & Chest
  ctx.save();

  if (style.id === 'baul_folk_acoustic') {
    // Saffron Traditional Baul Robe / Kurta
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-42, -75);
    ctx.lineTo(42, -75);
    ctx.lineTo(48, 10);
    ctx.lineTo(-48, 10);
    ctx.closePath();
    ctx.fill();

    // Shoulder Cloth / Uttorio
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-35, -75);
    ctx.lineTo(-12, -75);
    ctx.lineTo(15, 10);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();
  } else if (style.id === 'jingle_presenter') {
    // Smart Blazer & Crisp Shirt
    ctx.fillStyle = '#1e293b'; // Navy blazer
    ctx.beginPath();
    ctx.moveTo(-44, -75);
    ctx.lineTo(44, -75);
    ctx.lineTo(48, 10);
    ctx.lineTo(-48, 10);
    ctx.closePath();
    ctx.fill();

    // Inner White Shirt V
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-16, -75);
    ctx.lineTo(16, -75);
    ctx.lineTo(0, -32);
    ctx.closePath();
    ctx.fill();

    // Red / Gold Tie
    ctx.fillStyle = style.primaryColor;
    ctx.beginPath();
    ctx.moveTo(-4, -65);
    ctx.lineTo(4, -65);
    ctx.lineTo(6, -24);
    ctx.lineTo(0, -16);
    ctx.lineTo(-6, -24);
    ctx.closePath();
    ctx.fill();

    // Lapels
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-44, -75);
    ctx.lineTo(-12, -32);
    ctx.lineTo(-12, 10);
    ctx.moveTo(44, -75);
    ctx.lineTo(12, -32);
    ctx.lineTo(12, 10);
    ctx.stroke();
  } else if (style.id === 'pop_dj_stage') {
    // Futuristic DJ Cyber Jacket
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-45, -75);
    ctx.lineTo(45, -75);
    ctx.lineTo(46, 10);
    ctx.lineTo(-46, 10);
    ctx.closePath();
    ctx.fill();

    // Glowing Neon Stripes
    ctx.strokeStyle = style.primaryColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = style.primaryColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-28, -75);
    ctx.lineTo(-20, 10);
    ctx.moveTo(28, -75);
    ctx.lineTo(20, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    // Romantic / Casual stylish jacket
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(-42, -75);
    ctx.lineTo(42, -75);
    ctx.lineTo(45, 10);
    ctx.lineTo(-45, 10);
    ctx.closePath();
    ctx.fill();

    // Soft collar
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-15, -75);
    ctx.lineTo(15, -75);
    ctx.lineTo(0, -40);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Hair rendering according to archetype
 */
function drawHair(ctx: CanvasRenderingContext2D, style: PerformanceStyleConfig) {
  ctx.save();
  if (style.id === 'baul_folk_acoustic') {
    // Baul Topknot or Long Curly Hair
    ctx.fillStyle = '#261b14';
    ctx.beginPath();
    ctx.ellipse(0, -60, 32, 22, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Bun / Chon
    ctx.beginPath();
    ctx.arc(0, -66, 12, 0, Math.PI * 2);
    ctx.fill();
    // Flowing hair strands
    ctx.beginPath();
    ctx.ellipse(-26, -30, 8, 22, 0.2, 0, Math.PI * 2);
    ctx.ellipse(26, -30, 8, 22, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (style.id === 'pop_dj_stage') {
    // Modern styled undercut with colored highlights
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(0, -48, 30, 20, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Highlight tuft
    ctx.fillStyle = style.primaryColor;
    ctx.beginPath();
    ctx.moveTo(-14, -58);
    ctx.lineTo(-2, -72);
    ctx.lineTo(14, -58);
    ctx.closePath();
    ctx.fill();
  } else {
    // Stylish groomed haircut
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(0, -50, 30, 18, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Sideburns
    ctx.fillRect(-28, -48, 6, 20);
    ctx.fillRect(22, -48, 6, 20);
  }
  ctx.restore();
}

/**
 * Eyes and Eyebrows with natural blinking and expressive emotion
 */
function drawEyes(
  ctx: CanvasRenderingContext2D,
  time: number,
  isPlaying: boolean,
  vocalPulse: number,
  style: PerformanceStyleConfig
) {
  // Blinking physics: brief blink every 3.5s
  const isBlinking = time % 3.6 < 0.16;

  ctx.save();

  if (style.id === 'pop_dj_stage') {
    // Cool Cyber Sunglasses
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = style.primaryColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = style.primaryColor;
    ctx.shadowBlur = 6;

    // Left lens
    ctx.fillRect(-22, -35, 18, 10);
    ctx.strokeRect(-22, -35, 18, 10);
    // Right lens
    ctx.fillRect(4, -35, 18, 10);
    ctx.strokeRect(4, -35, 18, 10);
    // Bridge
    ctx.beginPath();
    ctx.moveTo(-4, -30);
    ctx.lineTo(4, -30);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // Eyebrows
  const browOffset = vocalPulse * 3;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Left Eyebrow
  ctx.beginPath();
  ctx.moveTo(-20, -38 - browOffset);
  ctx.quadraticCurveTo(-12, -42 - browOffset, -6, -38 - browOffset);
  ctx.stroke();

  // Right Eyebrow
  ctx.beginPath();
  ctx.moveTo(6, -38 - browOffset);
  ctx.quadraticCurveTo(12, -42 - browOffset, 20, -38 - browOffset);
  ctx.stroke();

  if (isBlinking) {
    // Closed eyelid line
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, -28);
    ctx.lineTo(-8, -28);
    ctx.moveTo(8, -28);
    ctx.lineTo(18, -28);
    ctx.stroke();
  } else {
    // Sclera (White)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-13, -28, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(13, -28, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris (Deep Brown/Hazel)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(-13, -28, 3.2, 0, Math.PI * 2);
    ctx.arc(13, -28, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-13, -28, 1.6, 0, Math.PI * 2);
    ctx.arc(13, -28, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight highlight ✨
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-14, -29.5, 1, 0, Math.PI * 2);
    ctx.arc(12, -29.5, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Singing Mouth: Real-time Audio-Reactive Lip-sync
 * Morphs seamlessly between closed smile, singing vowels 'A', 'O', 'E'
 */
function drawSingingMouth(
  ctx: CanvasRenderingContext2D,
  time: number,
  isPlaying: boolean,
  vocalPulse: number,
  lyricsLine: string
) {
  ctx.save();
  const mouthY = -14;

  if (!isPlaying || !lyricsLine.trim()) {
    // Resting confident smile
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, mouthY);
    ctx.quadraticCurveTo(0, mouthY + 5, 10, mouthY);
    ctx.stroke();
  } else {
    // Dynamic singing mouth open scale
    // Pulses based on music energy and lyrics rhythm
    const openAmount = Math.max(3, vocalPulse * 12);
    const mouthWidth = 10 + vocalPulse * 6;

    // Dark mouth cavity
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.ellipse(0, mouthY + openAmount * 0.4, mouthWidth * 0.7, openAmount * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper teeth
    if (openAmount > 4) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(-mouthWidth * 0.45, mouthY - 1, mouthWidth * 0.9, 3);
      ctx.fill();
    }

    // Tongue
    if (openAmount > 6) {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, mouthY + openAmount * 0.7, mouthWidth * 0.35, 0, Math.PI);
      ctx.fill();
    }

    // Lip outline
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, mouthY + openAmount * 0.4, mouthWidth * 0.75, openAmount * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Right Arm holding Microphone up to mouth
 */
function drawRightArmWithMicrophone(
  ctx: CanvasRenderingContext2D,
  time: number,
  isPlaying: boolean,
  vocalPulse: number,
  style: PerformanceStyleConfig
) {
  ctx.save();

  // Shoulder at (32, -65)
  const shoulderX = 30;
  const shoulderY = -65;
  // Hand position near mouth at (8, -85)
  const handBob = isPlaying ? Math.sin(time * 6) * 2.5 : 0;
  const handX = 12;
  const handY = -92 + handBob;

  // Arm sleeve
  ctx.strokeStyle = style.id === 'baul_folk_acoustic' ? '#ea580c' : '#1e293b';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(38, -85, handX + 10, handY + 12);
  ctx.stroke();

  // Hand gripping microphone
  ctx.fillStyle = '#ffdfba';
  ctx.beginPath();
  ctx.arc(handX + 2, handY + 6, 7, 0, Math.PI * 2);
  ctx.fill();

  // Metallic Microphone Body & Mesh Grille
  ctx.save();
  ctx.translate(handX, handY);
  ctx.rotate(-0.35);

  // Mic handle
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-4, 0, 8, 22);

  // Mesh Grille head
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(0, -6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Red ON indicator light
  ctx.fillStyle = isPlaying ? '#ef4444' : '#64748b';
  ctx.beginPath();
  ctx.arc(0, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

/**
 * Left Arm & Expressive Acting Gestures
 * In jingle: points, welcomes, gestures
 * In romantic: hand to heart
 * In baul: poetic arm reach
 */
function drawLeftArm(
  ctx: CanvasRenderingContext2D,
  time: number,
  isPlaying: boolean,
  style: PerformanceStyleConfig,
  vocalPulse: number
) {
  ctx.save();

  const shoulderX = -32;
  const shoulderY = -65;

  let handTargetX = -60;
  let handTargetY = -40;

  if (style.id === 'romantic_hero') {
    // Hand over heart on emotional singing
    handTargetX = -8;
    handTargetY = -55;
  } else if (style.id === 'jingle_presenter') {
    // Energetic welcoming arm gesture to audience
    const gestureCycle = Math.sin(time * 2.5);
    handTargetX = -65 + gestureCycle * 12;
    handTargetY = -55 + Math.cos(time * 2.5) * 8;
  } else if (style.id === 'pop_dj_stage') {
    // Fist pump or point up
    handTargetX = -55;
    handTargetY = isPlaying ? -85 + Math.sin(time * 8) * 6 : -50;
  } else {
    // Folk poetic reach
    handTargetX = -58 + Math.sin(time * 1.8) * 8;
    handTargetY = -45;
  }

  // Arm
  ctx.strokeStyle = style.id === 'baul_folk_acoustic' ? '#ea580c' : '#1e293b';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(-50, -60, handTargetX, handTargetY);
  ctx.stroke();

  // Hand
  ctx.fillStyle = '#ffdfba';
  ctx.beginPath();
  ctx.arc(handTargetX, handTargetY, 7.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Foreground Crowd silhouettes, dancing hands, celebratory confetti
 */
function drawForegroundEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isPlaying: boolean,
  style: PerformanceStyleConfig
) {
  // 1. Cheering Crowd Silhouettes at the very bottom
  if (style.id === 'pop_dj_stage' || style.id === 'jingle_presenter') {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 8, 18, 0.85)';
    const handCount = 14;
    const step = width / handCount;

    for (let i = 0; i < handCount; i++) {
      const hx = i * step + 15;
      const handBounce = isPlaying ? Math.sin(time * 6 + i * 1.2) * 12 : 0;
      const hy = height - 15 + handBounce;

      ctx.beginPath();
      ctx.arc(hx, hy, 12, 0, Math.PI * 2);
      ctx.rect(hx - 5, hy, 10, 30);
      ctx.fill();

      // Occasional glowing party glowsticks
      if (i % 3 === 0 && isPlaying) {
        ctx.strokeStyle = i % 2 === 0 ? style.primaryColor : style.accentColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + 8, hy - 20);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();
  }

  // 2. Celebratory Confetti & Musical Notes for Jingles
  if (style.id === 'jingle_presenter' && isPlaying) {
    ctx.save();
    const confettiCount = 16;
    for (let c = 0; c < confettiCount; c++) {
      const cx = (c * 77 + time * 45) % width;
      const cy = (c * 53 + time * 85) % height;
      const size = (c % 3) + 3;

      ctx.fillStyle = c % 2 === 0 ? '#fbbf24' : '#ef4444';
      ctx.fillRect(cx, cy, size, size * 1.5);
    }
    ctx.restore();
  }
}
