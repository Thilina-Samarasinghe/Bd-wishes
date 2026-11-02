'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { CardConfig } from '@/utils/encoder';

interface CardPreviewFrameProps {
  config: CardConfig;
  images: string[];
  className?: string;
}

/**
 * Shows the real wish page in an iframe, so the preview always matches what the recipient
 * sees. Confetti and balloons stay inside the frame, and screen-size rules follow the frame's
 * width. The unsaved card is sent by postMessage, so typing does not reload the page.
 */
export default function CardPreviewFrame({ config, images, className }: CardPreviewFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source === frameRef.current?.contentWindow && event.data?.type === 'bd-wishes-preview-ready') {
        setReady(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: 'bd-wishes-preview-config', config: { ...config, images } },
      window.location.origin
    );
  }, [ready, config, images]);

  return <iframe ref={frameRef} src="/wish?preview=1" title="Card preview" className={className} allow="autoplay" />;
}
