import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'bottom-center';
export type WatermarkType = 'text' | 'image' | 'both';

export interface WatermarkConfig {
  enabled: boolean;
  type: WatermarkType;
  text: string;
  position: WatermarkPosition;
  opacity: number; // 0.1 to 1.0
  fontSize: number; // 12 to 48
  textColor: string;
  showBackgroundBadge: boolean;
  imageUrl: string;
  imageSize: number; // 24 to 160 px
  margin: number; // px from borders
}

const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  enabled: true,
  type: 'both',
  text: 'AI Video Studio Pro',
  position: 'top-right',
  opacity: 0.85,
  fontSize: 22,
  textColor: '#FFFFFF',
  showBackgroundBadge: true,
  imageUrl: '/logo.jpg',
  imageSize: 42,
  margin: 28,
};

interface WatermarkContextType {
  config: WatermarkConfig;
  updateConfig: (updates: Partial<WatermarkConfig>) => void;
  resetConfig: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  drawWatermarkOnCanvas: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    customConfig?: Partial<WatermarkConfig>
  ) => void;
}

const WatermarkContext = createContext<WatermarkContextType | null>(null);

const STORAGE_KEY = 'ai_video_studio_watermark_config';

export const WatermarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WatermarkConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_WATERMARK_CONFIG, ...JSON.parse(saved) };
      }
    } catch (_e) {
      // fallback
    }
    return DEFAULT_WATERMARK_CONFIG;
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (_e) {
      // ignore
    }
  }, [config]);

  // Preload image
  useEffect(() => {
    if (config.imageUrl) {
      if (!imageCacheRef.current.has(config.imageUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = config.imageUrl;
        img.onload = () => {
          imageCacheRef.current.set(config.imageUrl, img);
        };
      }
    }
  }, [config.imageUrl]);

  const updateConfig = useCallback((updates: Partial<WatermarkConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_WATERMARK_CONFIG);
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Universal canvas drawer helper
  const drawWatermarkOnCanvas = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    customConfig?: Partial<WatermarkConfig>
  ) => {
    const active = { ...config, ...customConfig };
    if (!active.enabled) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0.05, Math.min(1, active.opacity));

    const margin = active.margin || 24;
    const isBoth = active.type === 'both';
    const isText = active.type === 'text' || isBoth;
    const isImage = (active.type === 'image' || isBoth) && Boolean(active.imageUrl);

    // Font setup
    ctx.font = `600 ${active.fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textBaseline = 'middle';

    const textMetrics = isText ? ctx.measureText(active.text) : { width: 0 };
    const textWidth = textMetrics.width;
    const textHeight = active.fontSize;

    const imgSize = isImage ? active.imageSize : 0;
    const spacing = isBoth ? 10 : 0;
    const totalContentWidth = (isImage ? imgSize : 0) + spacing + (isText ? textWidth : 0);
    const totalContentHeight = Math.max(isImage ? imgSize : 0, isText ? textHeight : 0);

    // Calculate Anchor Box (X, Y)
    let boxX = margin;
    let boxY = margin;

    switch (active.position) {
      case 'top-left':
        boxX = margin;
        boxY = margin;
        break;
      case 'top-right':
        boxX = width - totalContentWidth - margin;
        boxY = margin;
        break;
      case 'bottom-left':
        boxX = margin;
        boxY = height - totalContentHeight - margin;
        break;
      case 'bottom-right':
        boxX = width - totalContentWidth - margin;
        boxY = height - totalContentHeight - margin;
        break;
      case 'bottom-center':
        boxX = (width - totalContentWidth) / 2;
        boxY = height - totalContentHeight - margin;
        break;
      case 'center':
        boxX = (width - totalContentWidth) / 2;
        boxY = (height - totalContentHeight) / 2;
        break;
    }

    // Optional Background Badge
    if (active.showBackgroundBadge) {
      const paddingX = 14;
      const paddingY = 8;
      const bgX = boxX - paddingX;
      const bgY = boxY - paddingY;
      const bgW = totalContentWidth + paddingX * 2;
      const bgH = totalContentHeight + paddingY * 2;
      const radius = 12;

      ctx.fillStyle = 'rgba(11, 15, 25, 0.72)';
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, bgW, bgH, radius);
      ctx.fill();

      // Subtle glowing border
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    let currentX = boxX;

    // Draw Image/Logo
    if (isImage) {
      let cachedImg = imageCacheRef.current.get(active.imageUrl);
      if (!cachedImg) {
        cachedImg = new Image();
        cachedImg.crossOrigin = 'anonymous';
        cachedImg.src = active.imageUrl;
        imageCacheRef.current.set(active.imageUrl, cachedImg);
      }

      if (cachedImg.complete && cachedImg.naturalWidth > 0) {
        const imgY = boxY + (totalContentHeight - imgSize) / 2;
        // Clip rounded corners for logo image
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(currentX, imgY, imgSize, imgSize, 8);
        ctx.clip();
        ctx.drawImage(cachedImg, currentX, imgY, imgSize, imgSize);
        ctx.restore();
      }

      currentX += imgSize + spacing;
    }

    // Draw Text
    if (isText && active.text) {
      const textY = boxY + totalContentHeight / 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillStyle = active.textColor || '#FFFFFF';
      ctx.fillText(active.text, currentX, textY);
    }

    ctx.restore();
  }, [config]);

  return (
    <WatermarkContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        isModalOpen,
        openModal,
        closeModal,
        drawWatermarkOnCanvas,
      }}
    >
      {children}
    </WatermarkContext.Provider>
  );
};

export const useWatermark = (): WatermarkContextType => {
  const context = useContext(WatermarkContext);
  if (!context) {
    throw new Error('useWatermark must be used within a WatermarkProvider');
  }
  return context;
};
