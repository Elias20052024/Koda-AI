import React from 'react';
import { Link } from 'wouter';
import { Code2, Twitter, Linkedin, Github, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-border/30 bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#33D6D1]/5 to-[#7A4DFF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#7A4DFF]/5 to-[#33D6D1]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-3 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#33D6D1] to-[#7A4DFF] text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Code2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#33D6D1] to-[#35B7FF] bg-clip-text text-transparent">Koda AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Intelligent internship matching powered by AI. Connecting top IT talent with forward-thinking companies through skill-based discovery.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-[#33D6D1] transition-all group">
                <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-[#35B7FF] transition-all group">
                <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-[#7A4DFF] transition-all group">
                <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/internships" className="text-sm text-muted-foreground hover:text-[#33D6D1] transition-colors group flex items-center space-x-2">
                  <span>Browse Internships</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-[#33D6D1] transition-colors group flex items-center space-x-2">
                  <span>Features</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-[#33D6D1] transition-colors group flex items-center space-x-2">
                  <span>Pricing</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-[#35B7FF] transition-colors group flex items-center space-x-2">
                  <span>About Us</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-[#35B7FF] transition-colors group flex items-center space-x-2">
                  <span>Contact</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <a href="mailto:hello@kodaai.com" className="text-sm text-muted-foreground hover:text-[#35B7FF] transition-colors group flex items-center space-x-2">
                  <span>Email Us</span>
                  <Mail className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-[#7A4DFF] transition-colors group flex items-center space-x-2">
                  <span>Privacy Policy</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-[#7A4DFF] transition-colors group flex items-center space-x-2">
                  <span>Terms of Service</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Koda AI Inc. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with modern technology for the future of internship recruitment
          </p>
        </div>
      </div>
    </footer>
  );
}
