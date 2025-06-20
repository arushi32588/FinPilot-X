import React, { useEffect, useRef, useState } from 'react';

const AnimatedNumber = ({ value, duration = 1200, prefix = '', suffix = '', decimals = 0, start = 0 }) => {
  const [display, setDisplay] = useState(start);
  const raf = useRef();
  const startTimestamp = useRef();
  const prevValue = useRef(start);

  useEffect(() => {
    let cancelled = false;
    prevValue.current = display;
    function animate(ts) {
      if (!startTimestamp.current) startTimestamp.current = ts;
      const progress = Math.min((ts - startTimestamp.current) / duration, 1);
      const next = prevValue.current + (value - prevValue.current) * progress;
      setDisplay(progress < 1 ? next : value);
      if (progress < 1 && !cancelled) {
        raf.current = requestAnimationFrame(animate);
      }
    }
    raf.current = requestAnimationFrame(animate);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
      startTimestamp.current = null;
    };
    // eslint-disable-next-line
  }, [value, duration]);

  const formatted =
    prefix +
    Number(display)
      .toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) +
    suffix;

  return <span>{formatted}</span>;
};

export default AnimatedNumber; 