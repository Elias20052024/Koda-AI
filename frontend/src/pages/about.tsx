'use client';

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building2,
  BookOpen,
  Zap,
  Target,
  Users,
  Lock,
  Globe,
  Layers,
  Shield,
  ListChecks,
  ChevronDown,
  Rocket,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as any },
  },
};

const floatIn = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' as any },
  },
};

export default function AboutPage() {
  const [, setLocation] = useLocation();
  const [expanded, setExpanded] = useState<number | null>(0);

  const faqItems = [
    {
      question: 'What is Koda AI?',
      answer:
        'Koda AI is an internship platform for IT students, companies, and universities, with transparent rule-based matching and verified placement workflows.',
    },
    {
      question: 'Who can use Koda AI?',
      answer:
        'Students, companies, and universities can all benefit. Students discover internships, companies recruit qualified interns, and universities support verified placements.',
    },
    {
      question: 'How are internships matched?',
      answer:
        'Configurable rules compare technical skills, project experience, assessment results, and eligibility criteria with company requirements. Match results include a score breakdown and evidence coverage.',
    },
    {
      question: 'Can companies join?',
      answer:
        'Yes. Companies can create profiles, post internship openings, set role requirements, and review applicants with transparent matching evidence.',
    },
    {
      question: 'How do universities participate?',
      answer:
        'Universities can verify student enrollment, track internship placements, and strengthen industry collaboration through our secure platform.',
    },
    {
      question: 'Is Koda AI free for students?',
      answer:
        'Koda AI is currently in MVP and student registration is free. We are focused on building the core matching experience first.',
    },
  ];

  return (
    <div className="flex flex-col bg-background text-foreground">
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-28 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-[#33D6D1]/10 blur-3xl" />
          <div className="absolute -bottom-16 right-0 w-80 h-80 rounded-full bg-[#7A4DFF]/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr] items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center rounded-full border border-white/10 bg-gradient-to-r from-[#33D6D1]/10 to-[#7A4DFF]/10 px-4 py-2 text-sm font-medium text-[#33D6D1] mb-6">
                <Sparkles className="mr-2 h-4 w-4" />
                Skills-based internships for IT talent
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground">
                Building the Future of IT Internship Recruitment
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Koda AI helps IT students find internships and enables companies to discover candidates through configurable skill-based matching.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF] text-white border-0 shadow-xl shadow-[#33D6D1]/20 hover:shadow-2xl"
                  onClick={() => setLocation('/register')}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/10 text-foreground"
                  onClick={() => setLocation('/contact')}
                >
                  Contact Us
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative mx-auto max-w-xl"
            >
              <div className="rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-[0_60px_120px_-60px_rgba(11,19,43,0.65)] backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b132b] p-6 text-white shadow-lg">
                  <div className="absolute -left-10 top-10 h-36 w-36 rounded-full bg-[#33D6D1]/20 blur-3xl" />
                  <div className="absolute -right-8 bottom-12 h-32 w-32 rounded-full bg-[#7A4DFF]/20 blur-3xl" />
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[#a0dffc]">Koda AI</p>
                      <h2 className="mt-3 text-2xl font-semibold">Internship match studio</h2>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#33D6D1]/15 text-[#33D6D1]">
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-[#cbd5e1]">Smart matching</p>
                        <p className="mt-2 font-medium text-white">Skill-based recommendations</p>
                      </div>
                    </div>
                    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#7A4DFF]/15 text-[#7A4DFF]">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-[#cbd5e1]">Verified profiles</p>
                        <p className="mt-2 font-medium text-white">Trustworthy internship candidates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start"
          >
            <motion.div variants={item} className="space-y-6">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#35B7FF]">Our Story</span>
              <h2 className="text-3xl sm:text-4xl font-bold">Why we built Koda AI</h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Many talented IT students struggle to find internships because traditional recruitment relies heavily on resumes instead of practical skills. At the same time, companies spend significant time reviewing applications without an efficient way to identify the most suitable candidates.
              </p>
              <p className="text-lg leading-8 text-muted-foreground">
                Koda AI was created to bridge this gap with transparent matching rules and reviewed technical assessments that connect students with internship opportunities.
              </p>
            </motion.div>

            <motion.div variants={item} className="space-y-6">
              <Card className="rounded-[2rem] border border-border/80 bg-card/95 p-8 shadow-xl shadow-[#0b132b]/10">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full bg-[#33D6D1]/10 px-3 py-1 text-sm font-medium text-[#33D6D1]">Real problem, practical solution</div>
                  <h3 className="text-2xl font-semibold">A realistic approach to internship matching</h3>
                  <p className="text-muted-foreground leading-7">
                    We focus on practical skills and verified profiles, not perfect resumes. That makes the internship process faster, fairer, and more useful for students, employers, and universities.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div className="grid gap-6 lg:grid-cols-2">
            <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-[1.75rem] border border-border/70 bg-card/95 p-8 shadow-lg shadow-[#0b132b]/5">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#33D6D1]">Our Mission</span>
              <h3 className="mt-4 text-3xl font-bold">Our Mission</h3>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                To simplify internship recruitment by connecting IT students, companies, and universities through a platform that promotes skills-based opportunities and supports career development.
              </p>
            </motion.div>
            <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-[1.75rem] border border-border/70 bg-card/95 p-8 shadow-lg shadow-[#0b132b]/5">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7A4DFF]">Our Vision</span>
              <h3 className="mt-4 text-3xl font-bold">Our Vision</h3>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                To become a trusted internship platform that helps students launch successful careers while enabling companies and universities to build stronger talent pipelines.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/60 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#35B7FF]">Our Values</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Principles that guide every match</h2>
          </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {[
              {
                title: 'Innovation',
                description: 'We continuously improve internship recruitment through technology.',
                icon: Zap,
                color: 'from-[#33D6D1] to-[#35B7FF]',
              },
              {
                title: 'Transparency',
                description: 'We believe recruitment should be fair, honest, and skill-driven.',
                icon: Shield,
                color: 'from-[#35B7FF] to-[#7A4DFF]',
              },
              {
                title: 'Collaboration',
                description: 'Students, companies, and universities achieve better outcomes together.',
                icon: Users,
                color: 'from-[#7A4DFF] to-[#33D6D1]',
              },
              {
                title: 'Growth',
                description: 'We support continuous learning and career development.',
                icon: Target,
                color: 'from-[#33D6D1] to-[#7A4DFF]',
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                variants={item}
                className="group rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-lg shadow-[#0b132b]/5 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${value.color} text-white shadow-xl shadow-[#0b132b]/10`}>
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-7">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#33D6D1]">Who We Serve</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Built for students, companies, and universities</h2>
          </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="grid gap-6 lg:grid-cols-3"
          >
            {[
              {
                title: 'Students',
                description: 'Find internships that match your skills and career goals.',
                icon: GraduationCap,
                accent: 'from-[#33D6D1] to-[#35B7FF]',
              },
              {
                title: 'Companies',
                description: 'Recruit IT interns efficiently using configurable role and skill requirements.',
                icon: Building2,
                accent: 'from-[#35B7FF] to-[#7A4DFF]',
              },
              {
                title: 'Universities',
                description: 'Support students and strengthen industry collaboration through verified internship tracking.',
                icon: BookOpen,
                accent: 'from-[#7A4DFF] to-[#33D6D1]',
              },
            ].map((itemCard) => (
              <motion.div
                key={itemCard.title}
                variants={item}
                className="group rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-lg shadow-[#0b132b]/5 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${itemCard.accent} text-white shadow-xl shadow-[#0b132b]/10`}>
                  <itemCard.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{itemCard.title}</h3>
                <p className="text-muted-foreground leading-7">{itemCard.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/60 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7A4DFF]">Why Koda AI</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold">The platform features powering next-generation internship discovery</h2>
          </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { title: 'Configurable internship matching', icon: Target },
              { title: 'Technical skill assessments', icon: ListChecks },
              { title: 'Verified student profiles', icon: ShieldCheck },
              { title: 'Centralized internship management', icon: Layers },
              { title: 'Modern dashboards', icon: Globe },
              { title: 'Secure authentication', icon: Lock },
              { title: 'Scalable platform', icon: Rocket },
              { title: 'Responsive design', icon: Target },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-lg shadow-[#0b132b]/5 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#33D6D1]/10 text-[#33D6D1]">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-6">A polished, professional experience built for modern internship workflows.</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      <section className="border-t border-border/60 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7A4DFF]">Frequently Asked Questions</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Common questions about Koda AI</h2>
          </div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={container} className="space-y-4">
            {faqItems.map((faq, index) => {
              const isOpen = expanded === index;
              return (
                <motion.div
                  key={faq.question}
                  variants={item}
                  className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/95 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-lg font-semibold text-foreground">{faq.question}</span>
                    <span className={`transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </span>
                  </button>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="px-6"
                  >
                    {isOpen && (
                      <div className="pb-6 text-muted-foreground leading-7">{faq.answer}</div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="rounded-[2rem] border border-border/70 bg-gradient-to-r from-[#33D6D1]/10 via-[#35B7FF]/10 to-[#7A4DFF]/10 p-10 shadow-xl shadow-[#33D6D1]/10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={item}>
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#35B7FF]">Join the future</span>
                <h2 className="mt-4 text-4xl font-bold">Join the Future of Internship Recruitment</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Whether you are a student looking for opportunities, a company searching for talented interns, or a university supporting student success, Koda AI connects you through one practical platform.
                </p>
              </motion.div>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={item} className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF] text-white border-0 shadow-xl shadow-[#33D6D1]/20 hover:shadow-2xl"
                  onClick={() => setLocation('/register')}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/10 text-foreground"
                  onClick={() => setLocation('/contact')}
                >
                  Contact Us
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
