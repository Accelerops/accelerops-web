'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

/**
 * Props interface for the Hero component
 * 
 * @interface HeroProps
 */
export interface HeroProps {
  /** Main tagline text */
  tagline?: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Whether to show the theme toggle */
  showThemeToggle?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Hero section component that serves as the main landing area.
 * Features the AccelerOps tagline with smooth animations and
 * integrated theme toggle functionality.
 * 
 * @param props - Hero component props
 * @returns JSX.Element - Rendered hero section
 * 
 * @example
 * ```tsx
 * <Hero 
 *   tagline="Accelerate Your Digital Transformation"
 *   subtitle="Elite consulting firm specializing in modern infrastructure practices, cloud migrations, and platform engineering."
 *   showThemeToggle={true}
 * />
 * ```
 */
export const Hero: React.FC<HeroProps> = ({
  tagline = 'Accelerate Your Digital Transformation',
  subtitle = 'Elite consulting firm specializing in modern infrastructure practices, cloud migrations, and platform engineering.',
  showThemeToggle = true,
  className,
}) => {
  return (
    <section
      className={cn(
        'relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20',
        className
      )}
      aria-label="Hero section"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Theme Toggle */}
      {showThemeToggle && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute top-8 right-8 z-10"
        >
          <ThemeToggle />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-brand-gradient">
              {tagline}
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Animated Accent Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="mt-12 flex justify-center"
        >
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};