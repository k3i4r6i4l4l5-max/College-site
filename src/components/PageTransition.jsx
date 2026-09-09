import React, { useEffect, useRef, useState } from 'react';

const FADE_DURATION = 260;
const COURSE_SWIPE_DURATION = 520;

// Query-параметры меняют состояние текущей страницы (например, поиск),
// поэтому переход запускается только при изменении самого пути.
function locationKey(location) {
  return location.pathname;
}

/**
 * Сохраняет предыдущую страницу на время анимации и переключает между
 * обычным затуханием и вертикальным переходом между курсами.
 */
export function PageTransition({ location, transitionIntent, children }) {
  const [displayedLocation, setDisplayedLocation] = useState(location);
  const [outgoingLocation, setOutgoingLocation] = useState(null);
  const [phase, setPhase] = useState('visible');
  const [transitionStyle, setTransitionStyle] = useState('fade');
  const [swipeDirection, setSwipeDirection] = useState('down');
  const [transitionSequence, setTransitionSequence] = useState(0);
  const displayedKey = useRef(locationKey(location));
  const displayedLocationRef = useRef(location);

  // Запускает новую анимацию при каждом изменении адреса, включая быстрые переходы.
  useEffect(() => {
    const nextKey = locationKey(location);
    if (nextKey === displayedKey.current) {
      displayedLocationRef.current = location;
      setDisplayedLocation(location);
      return undefined;
    }

    const requestedTransition = transitionIntent?.current || { style: 'fade', direction: 'down' };
    const requestedStyle = typeof requestedTransition === 'string'
      ? requestedTransition
      : requestedTransition.style;
    const requestedDirection = typeof requestedTransition === 'string'
      ? 'down'
      : requestedTransition.direction;

    if (transitionIntent) {
      transitionIntent.current = { style: 'fade', direction: 'down' };
    }

    // Системная настройка и настройка приложения полностью отключают переход.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.dataset.reduceMotion === 'true';
    if (reducedMotion) {
      displayedKey.current = nextKey;
      displayedLocationRef.current = location;
      setDisplayedLocation(location);
      setOutgoingLocation(null);
      setTransitionStyle('fade');
      setPhase('visible');
      window.scrollTo(0, 0);
      return undefined;
    }

    // Запоминает обе страницы, чтобы CSS мог одновременно анимировать вход и выход.
    const nextStyle = requestedStyle === 'course-swipe' ? 'course-swipe' : 'fade';
    const previousLocation = displayedLocationRef.current;
    displayedKey.current = nextKey;
    displayedLocationRef.current = location;
    setTransitionStyle(nextStyle);
    setSwipeDirection(requestedDirection === 'up' ? 'up' : 'down');
    setOutgoingLocation(previousLocation);
    setDisplayedLocation(location);
    setTransitionSequence(sequence => sequence + 1);
    setPhase(nextStyle === 'course-swipe' ? 'swiping' : 'fading');
    window.scrollTo(0, 0);

    const duration = nextStyle === 'course-swipe' ? COURSE_SWIPE_DURATION : FADE_DURATION;
    const timeout = window.setTimeout(() => {
      setOutgoingLocation(null);
      setPhase('visible');
      setTransitionStyle('fade');
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [location.pathname, location.search, location.hash, transitionIntent]);

  const transitionActive = phase !== 'visible' && outgoingLocation;
  const visibleLocation = locationKey(location) === displayedKey.current ? location : displayedLocation;

  return (
    <div
      className={`page-transition transition-${transitionStyle} direction-${swipeDirection} is-${phase}`}
      data-transition-phase={phase}
      data-transition-style={transitionStyle}
      data-transition-direction={swipeDirection}
      data-transition-sequence={transitionSequence}
      aria-busy={phase !== 'visible'}
    >
      {transitionActive ? (
        <>
          <div
            key={`incoming-${transitionSequence}-${locationKey(displayedLocation)}`}
            className="page-transition-surface is-incoming"
          >
            {children(displayedLocation)}
          </div>
          <div
            key={`outgoing-${transitionSequence}-${locationKey(outgoingLocation)}`}
            className="page-transition-surface is-outgoing"
            aria-hidden="true"
          >
            {children(outgoingLocation)}
          </div>
        </>
      ) : children(visibleLocation)}
    </div>
  );
}
