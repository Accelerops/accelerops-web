'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/ui/navigation';
import { Hero } from '@/components/sections/hero';
import { Services } from '@/components/sections/services';
import { About } from '@/components/sections/about';
import { Blog } from '@/components/sections/blog';
import { Contact } from '@/components/sections/contact';
import { NAVIGATION_ITEMS } from '@/lib/constants';

/**
 * Homepage component that serves as the main entry point for the AccelerOps website.
 * Integrates all major sections with smooth scrolling navigation and page transitions.
 * 
 * @returns JSX.Element - The complete homepage with all sections
 */
export default function HomePage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Navigation Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="AccelerOps home"
            >
              <Image
                src="/logo.png"
                alt="AccelerOps"
                width={480}
                height={333}
                priority
                className="h-10 w-auto"
              />
            </button>
            <Navigation items={NAVIGATION_ITEMS} />
          </div>
        </div>
      </motion.header>

      {/* Main Content Sections */}
      <div className="pt-16">
        <Hero />
        <Services />
        <About />
        <Blog />
        <Contact />
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-muted/50 border-t border-border/40 py-8"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                © 2025 AccelerOps. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Built with Next.js, TypeScript & Tailwind CSS</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.main>
  );
}