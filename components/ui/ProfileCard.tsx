"use client"

import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";
import "./ProfileCard.css";

const DEFAULT_BEHIND_GRADIENT =
  "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(0,0%,100%,var(--card-opacity)) 4%,hsla(0,0%,95%,calc(var(--card-opacity)*0.75)) 10%,hsla(0,0%,85%,calc(var(--card-opacity)*0.5)) 50%,hsla(0,0%,70%,0) 100%),radial-gradient(35% 52% at 55% 20%,#ffffffc4 0%,#ffffff00 100%),radial-gradient(100% 100% at 50% 50%,#ffffffff 1%,#ffffff00 76%),conic-gradient(from 124deg at 50% 50%,#ffffffff 0%,#f0f0f0ff 33%,#e0e0e0ff 66%,#ffffffff 100%)";

const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)";

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const round = (value: number, precision = 3) =>
  parseFloat(value.toFixed(precision));

const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

interface ProfileCardProps {
  avatarUrl?: string;
  iconUrl?: string;
  grainUrl?: string;
  behindGradient?: string;
  innerGradient?: string;
  showBehindGradient?: boolean;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl = "/images/avatar-placeholder.jpg",
  iconUrl = "/images/foxbuilt-logo.png",
  grainUrl = "/images/grain.png",
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = "",
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = "Javi A. Torres",
  title = "Software Engineer",
  handle = "javicodes",
  status = "Online",
  contactText = "Contact",
  showUserInfo = true,
  onContactClick,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [glareKey, setGlareKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null;

    let rafId: number | null = null;

    const updateCardTransform = (
      offsetX: number,
      offsetY: number,
      card: HTMLElement,
      wrap: HTMLDivElement
    ) => {
      const width = card.clientWidth;
      const height = card.clientHeight;

      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5))}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      };

      Object.entries(properties).forEach(([property, value]) => {
        wrap.style.setProperty(property, value);
      });
    };

    const createSmoothAnimation = (
      duration: number,
      startX: number,
      startY: number,
      card: HTMLElement,
      wrap: HTMLDivElement
    ) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;

      const animationLoop = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = clamp(elapsed / duration, 0, 1);
        const easedProgress = easeInOutCubic(progress);

        const currentX = adjust(easedProgress, 0, 1, startX, targetX);
        const currentY = adjust(easedProgress, 0, 1, startY, targetY);

        updateCardTransform(currentX, currentY, card, wrap);

        if (progress < 1) {
          rafId = requestAnimationFrame(animationLoop);
        }
      };

      rafId = requestAnimationFrame(animationLoop);
    };

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
    };
  }, [enableTilt]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      const rect = card.getBoundingClientRect();
      animationHandlers.updateCardTransform(
        event.clientX - rect.left,
        event.clientY - rect.top,
        card,
        wrap
      );
    },
    [animationHandlers]
  );

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;

    if (!card || !wrap || !animationHandlers) return;

    animationHandlers.cancelAnimation();
    wrap.classList.add("active");
    card.classList.add("active");
  }, [animationHandlers]);

  const handlePointerLeave = useCallback(
    (event: PointerEvent) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      animationHandlers.createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        event.offsetX,
        event.offsetY,
        card,
        wrap
      );
      wrap.classList.remove("active");
      card.classList.remove("active");
    },
    [animationHandlers]
  );

  const handleMobileTiltAnimation = useCallback(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;
    
    if (!card || !wrap) return;
    
    // Prevent multiple animations at once
    if (wrap.classList.contains('mobile-tilt-animation')) return;
    
    // Play sound effect
    const audio = new Audio('/METALSHIMMER.mp3');
    audio.volume = 0.5; // Set volume to 50% so it's not too loud
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    // No glare animation for mobile - removed setGlareKey
    
    // Add a class to trigger CSS animation
    wrap.classList.add('mobile-tilt-animation');
    
    // Animate background position for logo movement
    const animateBackgroundPosition = (progress: number) => {
      // Only do first half of circular motion (0 to π instead of 0 to 2π)
      const angle = progress * Math.PI;
      const radius = 15; // Percentage of movement
      const centerX = 50 + Math.sin(angle) * radius;
      const centerY = 50 + Math.cos(angle) * radius;
      
      wrap.style.setProperty('--background-x', `${centerX}%`);
      wrap.style.setProperty('--background-y', `${centerY}%`);
    };
    
    // Animate over 600ms (normal speed for half motion)
    const duration = 600;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      animateBackgroundPosition(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Smoothly return to center
        wrap.style.setProperty('--background-x', '50%');
        wrap.style.setProperty('--background-y', '50%');
      }
    };
    
    requestAnimationFrame(animate);
    
    // Remove the class after animation completes
    setTimeout(() => {
      wrap.classList.remove('mobile-tilt-animation');
    }, 800);
  }, []);

  // Set isMobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return;

    const card = cardRef.current;
    const wrap = wrapRef.current;

    if (!card || !wrap) return;

    const pointerMoveHandler = handlePointerMove;
    const pointerEnterHandler = handlePointerEnter;
    const pointerLeaveHandler = handlePointerLeave;

    // Check if mobile/touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Add click handler for sound and glare effect
    const handleCardClick = () => {
      // Play sound
      const audio = new Audio('/METALSHIMMER.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
      
      // Trigger glare animation by updating the key
      setGlareKey(prev => prev + 1);
    };

    if (isTouchDevice) {
      // On mobile, use simple touch animation instead of tracking
      card.addEventListener("touchstart", handleMobileTiltAnimation);
    } else {
      // On desktop, use full mouse tracking
      card.addEventListener("pointerenter", pointerEnterHandler);
      card.addEventListener("pointermove", pointerMoveHandler as any);
      card.addEventListener("pointerleave", pointerLeaveHandler as any);
      card.addEventListener("click", handleCardClick);
    }

    const initialX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;

    animationHandlers.updateCardTransform(initialX, initialY, card, wrap);
    animationHandlers.createSmoothAnimation(
      ANIMATION_CONFIG.INITIAL_DURATION,
      initialX,
      initialY,
      card,
      wrap
    );

    return () => {
      if (isTouchDevice) {
        card.removeEventListener("touchstart", handleMobileTiltAnimation);
      } else {
        card.removeEventListener("pointerenter", pointerEnterHandler);
        card.removeEventListener("pointermove", pointerMoveHandler as any);
        card.removeEventListener("pointerleave", pointerLeaveHandler as any);
        card.removeEventListener("click", handleCardClick);
      }
      animationHandlers.cancelAnimation();
    };
  }, [
    enableTilt,
    enableMobileTilt,
    animationHandlers,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handleMobileTiltAnimation,
  ]);

  const cardStyle = useMemo(
    () =>
    ({
      "--icon": iconUrl ? `url(${iconUrl})` : "none",
      "--grain": grainUrl ? `url(${grainUrl})` : "none",
      "--behind-gradient": showBehindGradient
        ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT)
        : "none",
      "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
    } as React.CSSProperties),
    [iconUrl, grainUrl, showBehindGradient, behindGradient, innerGradient]
  );

  const handleContactClick = useCallback(() => {
    onContactClick?.();
  }, [onContactClick]);

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${className}`.trim()}
      style={cardStyle}
    >
      <section ref={cardRef} className="pc-card">
        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />
          <div 
            key={`glare-${glareKey}`}
            className="pc-custom-glare"
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(-30deg, transparent 40%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 60%, transparent 70%)`,
              backgroundSize: isMobile ? '200% 200%' : '300% 300%',
              backgroundPosition: '-200% -200%',
              transition: 'none',
              pointerEvents: 'none',
              zIndex: 100,
              animation: glareKey > 0 ? 'glareSwipe 1200ms cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
              opacity: glareKey > 0 ? 1 : 0,
            }}
          />
          <div className="pc-content pc-avatar-content">
            <img
              className="avatar"
              src={avatarUrl}
              alt={`${name || "User"} avatar`}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            {showUserInfo && (
              <div className="pc-user-info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <img
                      src={miniAvatarUrl || avatarUrl}
                      alt={`${name || "User"} mini avatar`}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = "0.5";
                        target.src = avatarUrl;
                      }}
                    />
                  </div>
                  <div className="pc-user-text">
                    <div className="pc-handle">@{handle}</div>
                    <div className="pc-status">{status}</div>
                  </div>
                </div>
                <button
                  className="pc-contact-btn"
                  onClick={handleContactClick}
                  style={{ pointerEvents: "auto" }}
                  type="button"
                  aria-label={`Contact ${name || "user"}`}
                >
                  {contactText}
                </button>
              </div>
            )}
          </div>
          <div className="pc-content">
            <div className="pc-details">
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);

export default ProfileCard;