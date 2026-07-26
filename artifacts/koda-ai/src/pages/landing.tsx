import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Code2, ArrowRight, Zap, Target, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="container px-4 md:px-8 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium mb-8"
            >
              <span className="flex h-2 w-2 rounded-full brand-gradient mr-2"></span>
              The premier network for emerging engineering talent
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8"
            >
              Find the talent that <br className="hidden md:block"/>
              <span className="brand-gradient-text">builds the future.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Koda AI maps complex technical skills between IT students and high-growth companies. No noise, just precise matches powered by intelligent analysis.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="h-12 px-8 text-base brand-gradient text-white border-0 hover:opacity-90 w-full sm:w-auto" onClick={() => setLocation('/register')}>
                Start hiring talent
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto bg-white hover:bg-gray-50" onClick={() => setLocation('/register')}>
                I'm a student
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats / Logos placeholder */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container px-4 md:px-8 mx-auto">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">Trusted by engineering teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
            {/* Logos represented as text/shapes for simplicity */}
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 rounded bg-foreground"></div> Acme Corp</div>
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-foreground"></div> Nexus Labs</div>
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 rotate-45 bg-foreground"></div> Vertex</div>
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-sm border-2 border-foreground"></div> Quantum</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Precision matching engine</h2>
            <p className="text-lg text-muted-foreground">We evaluate code repositories, academic background, and technical assessments to create a multi-dimensional profile of every candidate.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Skill Mapping</h3>
              <p className="text-muted-foreground leading-relaxed">Our AI analyzes job descriptions and student profiles to find overlaps in over 500+ specific technology nodes.</p>
            </div>
            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#33D6D1]/10 to-[#7A4DFF]/10 rounded-bl-full blur-2xl"></div>
              <div className="h-12 w-12 rounded-lg brand-gradient text-white flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Match Scoring</h3>
              <p className="text-muted-foreground leading-relaxed">Every application comes with a calculated match score and explanation, saving engineering managers hours of resume review.</p>
            </div>
            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">University Verified</h3>
              <p className="text-muted-foreground leading-relaxed">Student accounts are linked to and verified by their academic institutions, guaranteeing genuine enrollment status and GPA.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Proposition */}
      <section className="py-24 bg-foreground text-background">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">For Engineering Teams</h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-[#33D6D1] shrink-0" />
                  <span className="text-gray-300">Cut top-of-funnel noise by 80% with AI-driven pre-qualification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-[#33D6D1] shrink-0" />
                  <span className="text-gray-300">Discover hidden talent from non-target universities based on pure skill</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-[#33D6D1] shrink-0" />
                  <span className="text-gray-300">Manage the entire workflow from posting to offer in one clean interface</span>
                </li>
              </ul>
              <Button variant="outline" className="text-foreground bg-background hover:bg-gray-100" onClick={() => setLocation('/register')}>
                Create Company Account
              </Button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-12 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#33D6D1]/20 to-[#7A4DFF]/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
              
              {/* Mockup UI Component */}
              <div className="bg-background rounded-lg p-6 shadow-2xl relative z-10 border border-border/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-foreground font-bold">JD</div>
                    <div>
                      <h4 className="font-bold text-foreground">John Doe</h4>
                      <p className="text-xs text-muted-foreground">Frontend Engineer</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#33D6D1]">
                    <span className="font-bold text-sm text-foreground">94%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-muted rounded w-full"></div>
                  <div className="h-2 bg-muted rounded w-4/5"></div>
                  <div className="flex gap-2 mt-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">React</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">TypeScript</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">GraphQL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary opacity-[0.02]"></div>
        <div className="container px-4 md:px-8 mx-auto relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to find your match?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">Join thousands of students and companies already using Koda AI to connect talent with opportunity.</p>
          <Button size="lg" className="h-14 px-10 text-lg brand-gradient text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl transition-all" onClick={() => setLocation('/register')}>
            Join Koda AI today
          </Button>
        </div>
      </section>
    </div>
  );
}
