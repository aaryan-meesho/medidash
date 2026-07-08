import { useEffect, useState } from 'react';

const PADDING = 10;

function waitForRect(getTarget, attemptsLeft = 20) {
  return new Promise((resolve) => {
    function check() {
      const node = getTarget();
      if (node) {
        resolve(node.getBoundingClientRect());
        return;
      }
      if (attemptsLeft <= 0) {
        resolve(null);
        return;
      }
      attemptsLeft -= 1;
      requestAnimationFrame(check);
    }
    check();
  });
}

function placeTooltip(rect) {
  const spaceBelow = window.innerHeight - rect.bottom;
  const placeAbove = spaceBelow < 220 && rect.top > 220;

  const style = { position: 'fixed', maxWidth: '320px' };
  if (placeAbove) {
    style.bottom = `${window.innerHeight - rect.top + PADDING + 12}px`;
  } else {
    style.top = `${rect.bottom + PADDING + 12}px`;
  }

  const left = Math.min(Math.max(rect.left, 16), window.innerWidth - 336);
  style.left = `${left}px`;

  return style;
}

export default function SpotlightTour({ steps, onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [advancing, setAdvancing] = useState(false);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    let cancelled = false;

    async function locate() {
      const found = await waitForRect(() => step.ref.current);
      if (cancelled) return;
      if (!found) {
        // Nothing to point at (e.g. no search results) - skip this step.
        if (isLastStep) onFinish();
        else setStepIndex((i) => i + 1);
        return;
      }
      setRect(found);
    }

    setRect(null);
    locate();

    function handleReflow() {
      const node = step.ref.current;
      if (node) setRect(node.getBoundingClientRect());
    }
    window.addEventListener('resize', handleReflow);
    window.addEventListener('scroll', handleReflow, true);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleReflow);
      window.removeEventListener('scroll', handleReflow, true);
    };
  }, [stepIndex, step, isLastStep, onFinish]);

  async function handleNext() {
    setAdvancing(true);
    try {
      if (step.onAdvance) await step.onAdvance();
    } finally {
      setAdvancing(false);
    }
    if (isLastStep) onFinish();
    else setStepIndex((i) => i + 1);
  }

  if (!rect) return null;

  const highlightBox = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  return (
    <div className="spotlight-tour">
      <div
        className="spotlight-tour__mask"
        style={{ top: 0, left: 0, right: 0, height: Math.max(highlightBox.top, 0) }}
      />
      <div
        className="spotlight-tour__mask"
        style={{
          top: highlightBox.top + highlightBox.height,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <div
        className="spotlight-tour__mask"
        style={{
          top: highlightBox.top,
          left: 0,
          width: Math.max(highlightBox.left, 0),
          height: highlightBox.height,
        }}
      />
      <div
        className="spotlight-tour__mask"
        style={{
          top: highlightBox.top,
          left: highlightBox.left + highlightBox.width,
          right: 0,
          height: highlightBox.height,
        }}
      />

      <div className="spotlight-tour__ring" style={highlightBox} />

      <div className="spotlight-tour__tooltip" style={placeTooltip(rect)}>
        <div className="spotlight-tour__dots">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`spotlight-tour__dot${index === stepIndex ? ' spotlight-tour__dot--active' : ''}`}
            />
          ))}
        </div>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <div className="spotlight-tour__actions">
          <button className="link-button" onClick={onFinish}>
            Skip
          </button>
          <button className="search-button" onClick={handleNext} disabled={advancing}>
            {advancing ? 'Loading...' : isLastStep ? 'Get started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
