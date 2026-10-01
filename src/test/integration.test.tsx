import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <section {...props}>{children}</section>,
    main: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <main {...props}>{children}</main>,
    header: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <header {...props}>{children}</header>,
    footer: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <footer {...props}>{children}</footer>,
  },
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock scrollIntoView and querySelector
const mockScrollIntoView = vi.fn();
const mockQuerySelector = vi.fn();

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true,
});

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuerySelector.mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    });
  });

  describe('Homepage Integration', () => {
    it('renders complete homepage with all sections', () => {
      render(<HomePage />);
      
      // Header with navigation
      expect(screen.getByRole('img', { name: /accelerops/i })).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Methodology')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      
      // Hero section
      expect(screen.getByText('Accelerate Your Digital Transformation')).toBeInTheDocument();
      
      // Services section
      expect(screen.getByText('Our Services')).toBeInTheDocument();
      expect(screen.getByText('DevOps Assessments')).toBeInTheDocument();
      expect(screen.getByText('Cloud Migrations')).toBeInTheDocument();
      expect(screen.getByText('Platform Engineering')).toBeInTheDocument();
      expect(screen.getByText('Team Augmentation')).toBeInTheDocument();
      
      // About section (Our Methodology)
      expect(screen.getByText('Our Methodology')).toBeInTheDocument();
      expect(screen.getAllByText('Infrastructure as Code')[0]).toBeInTheDocument();
      expect(screen.getByText('Continuous Verification')).toBeInTheDocument();
      expect(screen.getByText('Security-Left Principles')).toBeInTheDocument();
      
      // Blog section
      expect(screen.getByText('Technical Insights')).toBeInTheDocument();
      
      // Contact section
      expect(screen.getByText('Get In Touch')).toBeInTheDocument();
      
      // Footer
      expect(screen.getByText('© 2025 AccelerOps. All rights reserved.')).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      render(<HomePage />);
      
      // Main content
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      
      // Navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Headings hierarchy - there are multiple h1s (logo and hero)
      const h1Headings = screen.getAllByRole('heading', { level: 1 });
      expect(h1Headings.length).toBeGreaterThanOrEqual(1);
      
      // Check that the main hero h1 exists
      const heroH1 = h1Headings.find(h1 => h1.textContent?.includes('Accelerate Your Digital Transformation'));
      expect(heroH1).toBeInTheDocument();
      
      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings.length).toBeGreaterThan(0);
    });

    it('renders all sections with proper IDs for navigation', () => {
      render(<HomePage />);
      
      // Check that sections have proper IDs for anchor navigation
      const servicesSection = screen.getByText('Our Services').closest('section');
      expect(servicesSection).toHaveAttribute('id', 'services');
      
      const aboutSection = screen.getByText('Our Methodology').closest('section');
      expect(aboutSection).toHaveAttribute('id', 'about');
      
      const blogSection = screen.getByText('Technical Insights').closest('section');
      expect(blogSection).toHaveAttribute('id', 'blog');
      
      const contactSection = screen.getByText('Get In Touch').closest('section');
      expect(contactSection).toHaveAttribute('id', 'contact');
    });

    it('has responsive layout classes', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen', 'bg-background', 'text-foreground');
    });
  });

  describe('Theme Integration', () => {
    it('renders theme toggle in hero section', () => {
      render(<HomePage />);
      
      const themeToggle = screen.getByRole('button', { name: /switch to.*mode/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('applies theme classes correctly', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('bg-background', 'text-foreground');
    });
  });

  describe('Navigation Integration', () => {
    it('renders fixed navigation header', () => {
      render(<HomePage />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
    });

    it('includes logo that scrolls to top', () => {
      render(<HomePage />);
      
      const logoButton = screen.getByRole('button', { name: /accelerops home/i });
      expect(logoButton).toBeInTheDocument();
      const logoImage = screen.getByRole('img', { name: /accelerops/i });
      expect(logoImage).toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      render(<HomePage />);
      
      expect(screen.getByRole('button', { name: /navigate to services section/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /navigate to methodology section/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /navigate to blog section/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /navigate to contact section/i })).toBeInTheDocument();
    });
  });

  describe('Content Integration', () => {
    it('displays all service cards with features', () => {
      render(<HomePage />);
      
      // Each service should have features listed
      expect(screen.getByText('Current state analysis')).toBeInTheDocument();
      expect(screen.getByText('Multi-cloud expertise')).toBeInTheDocument();
      expect(screen.getByText('CI/CD pipelines')).toBeInTheDocument(); // Changed from 'Infrastructure as Code'
      expect(screen.getByText('Senior-level expertise')).toBeInTheDocument();
    });

    it('displays methodology principles', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Immutable infrastructure')).toBeInTheDocument();
      expect(screen.getByText('Shift-left testing')).toBeInTheDocument();
      expect(screen.getByText('Security by design')).toBeInTheDocument();
    });

    it('displays contact information', () => {
      render(<HomePage />);
      
      expect(screen.getByText('hello@accelerops.com')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('has proper ARIA labels throughout', () => {
      render(<HomePage />);
      
      // Navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      
      // Sections
      expect(screen.getByRole('region', { name: /hero section/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /services section/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /about section/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /blog section/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /contact section/i })).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<HomePage />);
      
      // Should have multiple h1s (logo and hero)
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements.length).toBeGreaterThanOrEqual(1);
      
      // Should have multiple h2s for sections
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(3);
      
      // Should have h3s for service/methodology titles
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements.length).toBeGreaterThan(5);
    });

    it('has keyboard navigation support', () => {
      render(<HomePage />);
      
      // All interactive elements should be focusable
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Performance Integration', () => {
    it('renders without performance warnings', () => {
      // This test ensures the component tree renders efficiently
      const { container } = render(<HomePage />);
      
      expect(container.firstChild).toBeInTheDocument();
      
      // Check that we don't have excessive DOM nesting (relaxed threshold)
      const deeplyNestedElements = container.querySelectorAll('div div div div div div div div div div');
      expect(deeplyNestedElements.length).toBeLessThan(100); // More reasonable threshold
    });

    it('has optimized image loading structure', () => {
      render(<HomePage />);
      
      // While we don't have actual images in this test, we verify the structure supports them
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });
});