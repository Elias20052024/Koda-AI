'use client';

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion, type Variants } from 'framer-motion';
import {
  Code2,
  ArrowRight,
  Zap,
  Target,
  ShieldCheck,
  CheckCircle2,
  Brain,
  Sparkles,
  Users,
  Award,
  BarChart3,
  Clock,
  Lock,
  Mail,
  Github,
  Linkedin,
  Twitter,
  ChevronDown,
  GraduationCap,
  Building2,
  BookOpen,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const floatingVariant: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: 'easeInOut' as any,
    },
  },
};

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems = [
    {
      question: 'What is Koda AI?',
      answer: 'Koda AI is an intelligent internship matching platform that connects IT students with companies seeking technical talent. We use AI to match students based on their technical skills, experience, and learning goals with internship opportunities that fit their growth trajectory.',
    },
    {
      question: 'How does AI matching work?',
      answer: 'Our AI analyzes student profiles including technical skills, projects, assessments, and academic background, then compares them against company internship requirements. The system calculates compatibility scores across multiple dimensions and presents the best matches first.',
    },
    {
      question: 'Is Koda AI free?',
      answer: 'Koda AI is currently in MVP stage and registration is free for all users. We are working on sustainable pricing models that align value for all parties.',
    },
    {
      question: 'Who can register?',
      answer: 'Students currently enrolled in accredited universities can register as students. Companies and universities can register with valid business or academic credentials.',
    },
    {
      question: 'How do universities participate?',
      answer: 'Universities can verify student enrollment, monitor internship placements, and gain insights into how their students are performing in real-world opportunities. This helps universities improve their career support programs.',
    },
    {
      question: 'How do companies recruit interns?',
      answer: 'Companies post internship positions, and our AI surfaces qualified student matches. Companies review profiles, conduct interviews, and manage the entire hiring workflow through our dashboard.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ============================================================
          SECTION 1: HERO
          ============================================================ */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#33D6D1]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-br from-[#7A4DFF]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
        </div>

        <div className="container px-4 md:px-8 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center rounded-full border bg-gradient-to-r from-[#33D6D1]/10 to-[#7A4DFF]/10 px-4 py-2 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4 mr-2 text-[#33D6D1]" />
                Intelligent internship matching powered by AI
              </motion.div>
            </div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground mb-8 text-center leading-tight"
            >
              Find the{' '}
              <span className="block">
                <span className="bg-gradient-to-r from-[#33D6D1] via-[#35B7FF] to-[#7A4DFF] bg-clip-text text-transparent">
                  perfect match.
                </span>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto text-center leading-relaxed"
            >
              Koda AI connects talented IT students with companies through intelligent skill-based matching. 
              Experience faster recruitment, better fits, and the future of internship discovery.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF] text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-90 transition-all w-full sm:w-auto"
                onClick={() => setLocation('/register')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base w-full sm:w-auto"
                onClick={() => setLocation('/register')}
              >
                For Companies
              </Button>
            </motion.div>

            {/* Floating Feature Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
            >
              {[
                { icon: Brain, label: 'AI Matching', color: 'from-[#33D6D1]' },
                { icon: Zap, label: 'Recommendations', color: 'from-[#35B7FF]' },
                { icon: Award, label: 'Skill Assessment', color: 'from-[#7A4DFF]' },
                { icon: ShieldCheck, label: 'Verified Profiles', color: 'from-[#33D6D1]' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={floatingVariant}
                  initial="initial"
                  animate="animate"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  className="bg-gradient-to-br from-card to-muted/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm hover:border-border transition-all group"
                >
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${feature.color} to-[#7A4DFF] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: BUILT FOR STUDENTS, COMPANIES & UNIVERSITIES
          ============================================================ */}
      <section className="py-24 relative overflow-hidden">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Built for Students,
              <br />
              Companies & Universities
            </h2>
            <p className="text-lg text-muted-foreground">
              Every user type benefits from our intelligent platform designed for career growth and talent acquisition.
            </p>
          </motion.div>

          {/* Three Column Layout */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Students Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 rounded-2xl p-8 h-full hover:border-[#33D6D1]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#33D6D1]/10">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#33D6D1] to-[#35B7FF] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">For Students</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Discover internships tailored to your skills. Build your profile, take technical assessments, and find opportunities that match your growth trajectory.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Personalized internship discovery',
                    'Skill-based recommendations',
                    'Application tracking',
                    'Career growth insights',
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#33D6D1] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full group-hover:border-[#33D6D1] group-hover:text-[#33D6D1]"
                  onClick={() => setLocation('/register')}
                >
                  Join as Student
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Companies Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 rounded-2xl p-8 h-full hover:border-[#35B7FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#35B7FF]/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#35B7FF]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#35B7FF] to-[#7A4DFF] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                  <Building2 className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">For Companies</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Find pre-qualified interns matched to your needs. Streamline recruitment and discover talent from diverse backgrounds based on pure technical skill.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'AI-powered candidate matching',
                    'Pre-qualified applicants',
                    'Unified hiring dashboard',
                    'Faster time-to-hire',
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#35B7FF] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-[#35B7FF] to-[#7A4DFF] text-white border-0 hover:opacity-90"
                  onClick={() => setLocation('/register')}
                >
                  Register Company
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Universities Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 rounded-2xl p-8 h-full hover:border-[#7A4DFF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#7A4DFF]/10">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#7A4DFF] to-[#33D6D1] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">For Universities</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Verify student enrollment, monitor internship placements, and gain insights into student career outcomes to improve academic programs.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Student verification',
                    'Internship tracking',
                    'Career outcome analytics',
                    'Academic partnerships',
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-[#7A4DFF] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full group-hover:border-[#7A4DFF] group-hover:text-[#7A4DFF]"
                  onClick={() => setLocation('/register')}
                >
                  Register University
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: WHY CHOOSE KODA AI
          ============================================================ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-muted/30 to-transparent">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Koda AI</h2>
            <p className="text-lg text-muted-foreground">
              Experience the future of internship recruitment and career discovery.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                icon: Brain,
                title: 'AI-Powered Matching',
                description: 'Advanced algorithms analyze skills and preferences to create perfect matches.',
              },
              {
                icon: Zap,
                title: 'Skill-Based Discovery',
                description: 'Find opportunities based on technical abilities, not just resume keywords.',
              },
              {
                icon: ShieldCheck,
                title: 'Verified Profiles',
                description: 'All student accounts verified by academic institutions for authenticity.',
              },
              {
                icon: Clock,
                title: 'Faster Recruitment',
                description: 'Reduce time-to-hire with pre-qualified candidates and streamlined workflows.',
              },
              {
                icon: BarChart3,
                title: 'Centralized Management',
                description: 'Manage internship postings, applications, and offers in one unified dashboard.',
              },
              {
                icon: Sparkles,
                title: 'Modern Experience',
                description: 'Clean, intuitive interface designed for students, companies, and universities.',
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="group bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#33D6D1] to-[#7A4DFF] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: KEY FEATURES
          ============================================================ */}
      <section className="py-24">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to succeed in your internship journey or recruitment process.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {[
              { icon: Brain, title: 'AI Skill Assessment', desc: 'Technical evaluations that measure real competency' },
              { icon: Target, title: 'Smart Matching', desc: 'Intelligent algorithm connects the right people' },
              { icon: Users, title: 'Student Dashboard', desc: 'Manage profile, applications, and opportunities' },
              { icon: Building2, title: 'Company Portal', desc: 'Post positions and manage hiring workflow' },
              { icon: ShieldCheck, title: 'University Verification', desc: 'Verify enrollment and monitor placements' },
              { icon: BarChart3, title: 'Application Tracking', desc: 'Track every step of the hiring process' },
              { icon: Mail, title: 'Smart Notifications', desc: 'Stay updated on matches and opportunities' },
              { icon: Lock, title: 'Secure Auth', desc: 'Enterprise-grade security for all users' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="group bg-card border border-border/30 rounded-xl p-6 hover:border-[#33D6D1]/50 hover:shadow-lg hover:shadow-[#33D6D1]/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#33D6D1]/5 to-[#7A4DFF]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#33D6D1] to-[#7A4DFF] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold mb-2 text-foreground text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: HOW KODA AI WORKS - TIMELINE
          ============================================================ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-muted/20 to-transparent">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How Koda AI Works</h2>
            <p className="text-lg text-muted-foreground">
              From registration to internship offer in 8 simple steps.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {[
                { num: 1, title: 'Register', desc: 'Create your account as a student, company, or university' },
                { num: 2, title: 'Complete Profile', desc: 'Add your skills, experience, and career preferences' },
                { num: 3, title: 'Technical Assessment', desc: 'Take our AI-powered skill evaluation tests' },
                { num: 4, title: 'AI Analysis', desc: 'Our system analyzes your unique skill profile' },
                { num: 5, title: 'Receive Matches', desc: 'Get personalized internship recommendations' },
                { num: 6, title: 'Apply', desc: 'Apply to opportunities that match your goals' },
                { num: 7, title: 'Company Review', desc: 'Companies review your profile and match score' },
                { num: 8, title: 'Get Offer', desc: 'Receive internship offers and start your journey' },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="flex gap-6 md:gap-8 group"
                >
                  {/* Timeline circle and line */}
                  <div className="flex flex-col items-center relative">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#33D6D1] to-[#7A4DFF] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform z-10">
                      {step.num}
                    </div>
                    {idx !== 7 && (
                      <div className="w-1 h-20 bg-gradient-to-b from-primary/40 to-primary/10 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-2 pb-8">
                    <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: PLATFORM PREVIEW
          ============================================================ */}
      <section className="py-24">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Platform Preview</h2>
            <p className="text-lg text-muted-foreground">
              Experience the modern interface built for efficiency and ease of use.
            </p>
          </motion.div>

          {/* Preview Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Student Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-2xl overflow-hidden hover:border-[#33D6D1]/50 transition-all hover:shadow-xl hover:shadow-[#33D6D1]/10">
                {/* Header */}
                <div className="h-12 bg-gradient-to-r from-[#33D6D1]/20 to-[#35B7FF]/20 border-b border-border/30 flex items-center px-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Matches</p>
                      <h3 className="text-2xl font-bold text-foreground">3 New Opportunities</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#33D6D1] to-[#35B7FF] opacity-20"></div>
                  </div>

                  {/* Mock cards */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-background border border-border/30 rounded-lg p-4 hover:border-[#33D6D1]/50 transition-all group/card"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">Frontend Engineer Intern</p>
                          <p className="text-xs text-muted-foreground">Tech Startup Inc.</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold bg-gradient-to-r from-[#33D6D1] to-[#35B7FF] bg-clip-text text-transparent">
                            {92 - i * 2}%
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 bg-[#33D6D1]/10 text-[#33D6D1] text-xs rounded font-medium">React</span>
                        <span className="px-2 py-1 bg-[#35B7FF]/10 text-[#35B7FF] text-xs rounded font-medium">TypeScript</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">Student Dashboard</p>
            </motion.div>

            {/* Company Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-2xl overflow-hidden hover:border-[#35B7FF]/50 transition-all hover:shadow-xl hover:shadow-[#35B7FF]/10">
                {/* Header */}
                <div className="h-12 bg-gradient-to-r from-[#35B7FF]/20 to-[#7A4DFF]/20 border-b border-border/30 flex items-center px-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Postings</p>
                      <h3 className="text-2xl font-bold text-foreground">2 Positions Open</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#35B7FF] to-[#7A4DFF] opacity-20"></div>
                  </div>

                  {/* Mock cards */}
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-background border border-border/30 rounded-lg p-4 hover:border-[#35B7FF]/50 transition-all group/card"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">Backend Engineer Intern</p>
                          <p className="text-xs text-muted-foreground">{8 + i * 3} qualified applicants</p>
                        </div>
                        <div className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded font-medium">Active</div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 bg-[#35B7FF]/10 text-[#35B7FF] text-xs rounded font-medium">Node.js</span>
                        <span className="px-2 py-1 bg-[#7A4DFF]/10 text-[#7A4DFF] text-xs rounded font-medium">PostgreSQL</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">Company Dashboard</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: FAQ
          ============================================================ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Koda AI.
            </p>
          </motion.div>

          {/* FAQ Items */}
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="group"
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === idx ? null : idx)
                  }
                  className="w-full flex items-center justify-between p-6 bg-card border border-border/50 rounded-lg hover:border-[#33D6D1]/50 transition-all text-left"
                >
                  <h3 className="font-bold text-foreground text-lg pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      expandedFAQ === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Answer */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedFAQ === idx ? 'auto' : 0,
                    opacity: expandedFAQ === idx ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-muted/30 border border-t-0 border-border/50 rounded-b-lg text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 8: FINAL CTA
          ============================================================ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-gradient-to-br from-[#33D6D1]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#7A4DFF]/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-8 mx-auto relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ready to Find Your Next Internship?
            </h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              Join Koda AI today and connect with internship opportunities powered by intelligent matching. 
              Whether you're a student looking to launch your career, a company seeking top talent, 
              or a university verifying placements, we have you covered.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF] text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-90 transition-all"
                onClick={() => setLocation('/register')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                onClick={() => setLocation('/register')}
              >
                Register Company
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
