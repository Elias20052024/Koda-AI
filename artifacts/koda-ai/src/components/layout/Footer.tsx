import React from 'react';
import { Link } from 'wouter';
import { Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md brand-gradient text-white">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">Koda AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              The premium internship matching platform for top IT students and forward-thinking companies. Powered by intelligent skill mapping.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/internships" className="text-sm text-muted-foreground hover:text-foreground">Browse Internships</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Koda AI Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Social links placeholder */}
            <span className="w-5 h-5 rounded bg-muted"></span>
            <span className="w-5 h-5 rounded bg-muted"></span>
            <span className="w-5 h-5 rounded bg-muted"></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
