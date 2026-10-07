import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Hook to detect prefers-reduced-motion
 */
export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
};

/**
 * Hook to detect responsive device tier
 */
export const useDeviceTier = () => {
  const [tier, setTier] = useState('desktop');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateTier = () => {
      const w = window.innerWidth;
      if (w < 768) setTier('mobile');
      else if (w < 1024) setTier('tablet');
      else setTier('desktop');
    };
    updateTier();
    window.addEventListener('resize', updateTier);
    return () => window.removeEventListener('resize', updateTier);
  }, []);

  return tier;
};

/**
 * ScrollReveal Component
 * Reversible, viewport-triggered scroll reveal with direction, distance, delay, scale, and blur
 */
export const ScrollReveal = ({
  children,
  as: Component = 'div',
  className = '',
  style = {},
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'none'
  distance = 60, // in pixels
  delay = 0, // in milliseconds
  duration = 650, // in milliseconds
  scale = 1, // initial scale e.g. 0.94 -> 1
  blur = 0, // initial blur in px e.g. 4 -> 0
  initialOpacity = 0,
  threshold = 0.08,
  rootMargin = '0px 0px -50px 0px',
  reversible = true,
  parallaxSpeed = 0, // subtle continuous parallax offset multiplier (e.g. -0.06)
  onRevealChange,
  ...restProps
}) => {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const reducedMotion = useReducedMotion();
  const deviceTier = useDeviceTier();

  useEffect(() => {
    if (onRevealChange) {
      onRevealChange(isRevealed);
    }
  }, [isRevealed, onRevealChange]);

  const distFactor = deviceTier === 'mobile' ? 0.55 : deviceTier === 'tablet' ? 0.75 : 1.0;
  const blurFactor = deviceTier === 'mobile' ? 0.4 : deviceTier === 'tablet' ? 0.75 : 1.0;
  const effectiveDistance = distance * distFactor;
  const effectiveBlur = blur * blurFactor;

  // Viewport IntersectionObserver
  useEffect(() => {
    if (reducedMotion) {
      setIsRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
          } else if (reversible) {
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            // When user scrolls UP and element leaves below the viewport, reset reveal
            if (rect.top > windowHeight) {
              setIsRevealed(false);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reversible, reducedMotion]);

  // Subtle continuous parallax tracking if enabled
  useEffect(() => {
    if (reducedMotion || parallaxSpeed === 0) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const node = ref.current;
          if (node) {
            const rect = node.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.bottom > 0 && rect.top < windowHeight) {
              const delta = rect.top - windowHeight / 2;
              setParallaxY(delta * parallaxSpeed * distFactor);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallaxSpeed, reducedMotion, distFactor]);

  // Compute transform based on direction & distance
  const getTransform = () => {
    if (reducedMotion) return 'none';

    if (!isRevealed) {
      let x = 0;
      let y = 0;
      if (direction === 'up') y = effectiveDistance;
      else if (direction === 'down') y = -effectiveDistance;
      else if (direction === 'left') x = effectiveDistance;
      else if (direction === 'right') x = -effectiveDistance;

      return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    const pY = parallaxY ? `translate3d(0, ${parallaxY.toFixed(1)}px, 0) ` : '';
    return `${pY}scale(1)`;
  };

  const computedStyle = useMemo(() => {
    if (reducedMotion) return style;

    return {
      opacity: isRevealed ? 1 : initialOpacity,
      transform: getTransform(),
      filter: !isRevealed && effectiveBlur > 0.1 ? `blur(${effectiveBlur.toFixed(1)}px)` : 'none',
      transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms ease-out ${delay}ms`,
      willChange: 'transform, opacity, filter',
      ...style,
    };
  }, [isRevealed, parallaxY, reducedMotion, duration, delay, initialOpacity, effectiveBlur, style, direction, effectiveDistance, scale]);

  return (
    <Component ref={ref} className={`scroll-reveal-container ${className}`} style={computedStyle} {...restProps}>
      {children}
    </Component>
  );
};

/**
 * ScrollParallax Component
 * Dedicated continuous scroll-linked emergence & vertical parallax for key product previews
 */
export const ScrollParallax = ({
  children,
  className = '',
  style = {},
  initialY = 150, // Initial translateY when entering bottom of viewport
  initialScale = 0.92,
  initialBlur = 6,
  initialOpacity = 0.15,
  parallaxSpeed = -0.08, // Continuous vertical parallax multiplier
  ...restProps
}) => {
  const ref = useRef(null);
  const [transformStyle, setTransformStyle] = useState({
    opacity: 1,
    transform: 'none',
    filter: 'none',
  });
  const reducedMotion = useReducedMotion();
  const deviceTier = useDeviceTier();

  const distFactor = deviceTier === 'mobile' ? 0.55 : deviceTier === 'tablet' ? 0.75 : 1.0;
  const blurFactor = deviceTier === 'mobile' ? 0.4 : deviceTier === 'tablet' ? 0.75 : 1.0;

  useEffect(() => {
    if (reducedMotion) {
      setTransformStyle({ opacity: 1, transform: 'none', filter: 'none' });
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const node = ref.current;
          if (node) {
            const rect = node.getBoundingClientRect();
            const windowH = window.innerHeight;

            // Element entry progress: 0 when top is at windowH, 1 when top reaches 40% of viewport
            const triggerDistance = windowH * 0.75;
            const progress = Math.min(1, Math.max(0, (windowH - rect.top) / triggerDistance));
            const eased = 1 - Math.pow(1 - progress, 2.5);

            // Continuous parallax while in viewport
            const parallaxOffset = (rect.top - windowH * 0.5) * parallaxSpeed * distFactor;

            const curY = (1 - eased) * (initialY * distFactor) + eased * parallaxOffset;
            const curScale = initialScale + eased * (1 - initialScale);
            const curBlur = (1 - eased) * (initialBlur * blurFactor);
            const curOpacity = initialOpacity + eased * (1 - initialOpacity);

            setTransformStyle({
              opacity: curOpacity.toFixed(2),
              transform: `translate3d(0, ${curY.toFixed(1)}px, 0) scale(${curScale.toFixed(3)})`,
              filter: curBlur > 0.1 ? `blur(${curBlur.toFixed(1)}px)` : 'none',
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [reducedMotion, initialY, initialScale, initialBlur, initialOpacity, parallaxSpeed, distFactor, blurFactor]);

  return (
    <div
      ref={ref}
      className={`scroll-parallax-container ${className}`}
      style={{
        ...transformStyle,
        transition: reducedMotion ? 'none' : 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease-out, filter 0.18s ease-out',
        willChange: 'transform, opacity, filter',
        ...style,
      }}
      {...restProps}
    >
      {children}
    </div>
  );
};

/**
 * StaggerContainer & RevealItem
 * Coordinates sequential appearance of children
 */
export const StaggerContainer = ({
  children,
  as: Component = 'div',
  className = '',
  style = {},
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  reversible = true,
  ...restProps
}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setIsInView(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else if (reversible) {
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top > windowHeight) {
              setIsInView(false);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reversible, reducedMotion]);

  // Clone children to inject `isInView` prop
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child, {
      _containerInView: isInView,
      _defaultIndex: index,
    });
  });

  return (
    <Component ref={ref} className={className} style={style} {...restProps}>
      {enhancedChildren}
    </Component>
  );
};

export const RevealItem = ({
  children,
  as: Component = 'div',
  className = '',
  style = {},
  distance = 70,
  delay = 0, // ms
  duration = 650, // ms
  scale = 0.94,
  blur = 0,
  _containerInView,
  _defaultIndex = 0,
  staggerStep = 100, // ms per item
  ...restProps
}) => {
  const reducedMotion = useReducedMotion();
  const deviceTier = useDeviceTier();

  const distFactor = deviceTier === 'mobile' ? 0.55 : deviceTier === 'tablet' ? 0.75 : 1.0;
  const effectiveDistance = distance * distFactor;
  const totalDelay = delay || _defaultIndex * staggerStep;
  const isRevealed = _containerInView !== undefined ? _containerInView : true;

  const computedStyle = useMemo(() => {
    if (reducedMotion) return style;

    return {
      opacity: isRevealed ? 1 : 0,
      transform: isRevealed ? 'translate3d(0, 0, 0) scale(1)' : `translate3d(0, ${effectiveDistance}px, 0) scale(${scale})`,
      filter: !isRevealed && blur > 0.1 ? `blur(${blur}px)` : 'none',
      transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${totalDelay}ms, opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${totalDelay}ms, filter ${duration}ms ease-out ${totalDelay}ms`,
      willChange: 'transform, opacity, filter',
      ...style,
    };
  }, [isRevealed, reducedMotion, effectiveDistance, scale, blur, duration, totalDelay, style]);

  return (
    <Component className={className} style={computedStyle} {...restProps}>
      {children}
    </Component>
  );
};
