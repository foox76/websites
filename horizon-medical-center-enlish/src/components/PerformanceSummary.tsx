import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../App';
import { PerformanceSummaryData } from '../types';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const easeOutQuad = (t: number): number => t * (2 - t);

// Custom hook for counting up animation
const useCountUp = (endValue: string, duration = 2000, start: boolean): number => {
  const [count, setCount] = useState(0);
  const target = parseInt(endValue.replace(/,/g, '').replace(/\+/g, ''), 10);

  useEffect(() => {
    if (!start || isNaN(target)) {
      setCount(0); // Reset if not visible or invalid target
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = timestamp - startTime;
      const relativeProgress = Math.min(progress / duration, 1);

      const easedProgress = easeOutQuad(relativeProgress);
      const currentCount = Math.floor(easedProgress * target);

      setCount(currentCount);

      if (relativeProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target); // Ensure it ends on the exact target value
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [start, target, duration]);

  return count;
};

// Component to display the animated stat
interface StatCounterProps {
  value: string;
  isVisible: boolean;
}

const StatCounter: React.FC<StatCounterProps> = ({ value, isVisible }) => {
  const count = useCountUp(value, 2000, isVisible);
  const hasPlus = value.includes('+');
  const formattedCount = count.toLocaleString();

  return <>{formattedCount}{hasPlus && '+'}</>;
};

interface PerformanceSummaryProps {
  performanceSummary: PerformanceSummaryData;
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ performanceSummary }) => {
  const langContext = useContext(LanguageContext);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });

  if (!langContext) return null;
  const { text } = langContext;

  const stats = [
    { label: text.metricHappyPatients, value: performanceSummary.happyPatients, color: 'bg-blue-500' },
    { label: text.metric5StarReviews, value: performanceSummary.fiveStarReviews, color: 'bg-red-500' },
    { label: text.metricYearsExperience, value: performanceSummary.yearsExperience, color: 'bg-yellow-500' },
    { label: text.metricSuccessfulProcedures, value: performanceSummary.successfulProcedures, color: 'bg-green-500' },
  ];

  return (
    <section ref={ref} className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl font-serif font-bold sm:text-5xl text-brand-dark">{text.performanceSummaryTitle}</h2>
        </div>
        <div className={`mt-12 rounded-lg shadow-xl overflow-hidden grid grid-cols-2 lg:grid-cols-4 text-white font-bold transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '200ms' }}>
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} p-6 sm:p-8 text-center`}>
              <div className="text-sm sm:text-base opacity-90">{stat.label}</div>
              <div className="text-4xl sm:text-5xl mt-2">
                <StatCounter value={stat.value} isVisible={isVisible} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerformanceSummary;
