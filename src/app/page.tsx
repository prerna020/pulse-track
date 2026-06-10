"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Radar,
  Target,
  Cpu,
  Sparkles,
  Eye,
  Brain,
  Bell,
  Mail,
  Settings,
  LineChart,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Star
} from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });

// Reusable Section Component with Framer Motion scroll animations
const Section = ({ children, className = "", id = "" }: { children: React.ReactNode, className?: string, id?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-[#f5f0e8] text-[#1a1208] overflow-x-hidden ${inter.className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg-base: #f5f0e8;
          --bg-card: #ffffff;
          --surface-elevated: #faf7f2;
          --border-subtle: rgba(26,18,8,0.1);
          --border-strong: rgba(26,18,8,0.2);
          --text-primary: #1a1208;
          --text-secondary: #5c4a32;
          --text-tertiary: #9c8570;
          
          --accent-amber: #c17f2a;
          --accent-terracotta: #c8956c;
          --accent-red: #a63d2f;
          --accent-olive: #6b7c3f;
          --accent-brown: #8b5e3c;
        }
        
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
        }

        @keyframes drift-1 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes drift-2 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(0.9); }
          66% { transform: translate(20px, -20px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes drift-3 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, 40px) scale(1.05); }
          66% { transform: translate(-30px, -30px) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }

        .orb-1 { animation: drift-1 12s infinite ease-in-out; }
        .orb-2 { animation: drift-2 15s infinite ease-in-out; animation-delay: -2s; }
        .orb-3 { animation: drift-3 10s infinite ease-in-out; animation-delay: -5s; }

        @keyframes pulse-dot-amber {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(193, 127, 42, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(193, 127, 42, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(193, 127, 42, 0); }
        }
        @keyframes pulse-dot-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(166, 61, 47, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(166, 61, 47, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(166, 61, 47, 0); }
        }
        
        .pulse-amber { animation: pulse-dot-amber 2s infinite; }
        .pulse-red { animation: pulse-dot-red 2s infinite; }

        @keyframes float {
          0% { transform: translateY(-4px); }
          50% { transform: translateY(4px); }
          100% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 3s infinite ease-in-out;
        }

        .dash-anim {
          stroke-dasharray: 6, 6;
          animation: dash-move 1s linear infinite;
        }
        @keyframes dash-move {
          to { stroke-dashoffset: -12; }
        }
        
        @keyframes bounce-scroll {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .animate-bounce-scroll {
          animation: bounce-scroll 2s infinite ease-in-out;
        }
      `}} />

      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
        style={{
          background: 'rgba(245,240,232,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(26,18,8,0.08)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-6 h-6 text-[#c17f2a]" />
            <span className="text-xl font-bold tracking-tight text-[#1a1208]">PulseTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#1a1208] hover:bg-[#1a1208] hover:text-[#f5f0e8] transition px-4 py-2 border border-[#1a1208] rounded-full hidden sm:block">
              Sign In
            </Link>
            <Link href="/login" className="text-sm font-semibold bg-[#1a1208] text-[#f5f0e8] px-5 py-2 rounded-full hover:bg-[#3d2b1f] transition">
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* SECTION 1 - HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden bg-[#f5f0e8]">
        <div className="absolute inset-0 noise-bg opacity-100 z-0"></div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(193,127,42,0.08), transparent)' }}></div>

        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px] orb-1 z-0" style={{ background: 'rgba(193,127,42,0.12)' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px] orb-2 z-0" style={{ background: 'rgba(200,149,108,0.1)' }}></div>
        <div className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full blur-[90px] orb-3 z-0" style={{ background: 'rgba(107,124,63,0.08)' }}></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto mt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8"
            style={{ background: 'rgba(193,127,42,0.12)', borderColor: 'rgba(193,127,42,0.3)' }}
          >
            <div className="w-2 h-2 rounded-full bg-[#c17f2a] pulse-amber"></div>
            <span className="text-sm font-medium text-[#8b6914]">AI-Powered Competitive Intelligence</span>
          </motion.div>

          <h1 className="text-[52px] sm:text-[72px] font-[800] tracking-[-2px] leading-[1.05] text-[#1a1208] mb-6">
            <motion.div className="flex flex-wrap justify-center">
              {["Know", "every", "move"].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="mr-3 sm:mr-4"
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`${playfair.className} italic font-[700] text-[#c17f2a]`}
            >
              your competitors make.
            </motion.div>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-[18px] text-[#5c4a32] leading-[1.7] max-w-2xl mb-10"
          >
            PulseTrack monitors competitor websites 24/7, detects changes, and uses AI to explain what it means for your business,  before your competition gets ahead.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-[#1a1208] text-[#f5f0e8] font-semibold rounded-full text-lg hover:bg-[#3d2b1f] hover:scale-[1.03] transition-all flex items-center justify-center gap-2">
                Start Monitoring Free <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="#dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent border text-[#1a1208] font-medium rounded-full text-lg hover:border-opacity-100 transition flex items-center justify-center gap-2 group" style={{ borderColor: 'rgba(26,18,8,0.4)' }}>
                See how it works <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 text-sm text-[#9c8570] font-medium"
          >
            No credit card required · Free forever plan · Setup in 2 minutes
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-16 flex items-center gap-4 border-t pt-8"
            style={{ borderColor: 'rgba(26,18,8,0.1)' }}
          >
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#f5f0e8] bg-[#c17f2a] flex items-center justify-center text-xs font-bold text-white">SC</div>
              <div className="w-10 h-10 rounded-full border-2 border-[#f5f0e8] bg-[#c8956c] flex items-center justify-center text-xs font-bold text-white">MW</div>
              <div className="w-10 h-10 rounded-full border-2 border-[#f5f0e8] bg-[#6b7c3f] flex items-center justify-center text-xs font-bold text-white">PN</div>
            </div>
            <div className="text-sm text-[#5c4a32]">
              Trusted by <span className="text-[#1a1208] font-semibold">500+</span> founders and PMs
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-scroll text-[#9c8570]">
          <ArrowDown className="w-6 h-6" />
        </div>
      </section>

      {/* SECTION 2 - DASHBOARD MOCKUP */}
      <section id="dashboard" className="py-24 px-6 bg-[#f5f0e8] border-t border-[rgba(26,18,8,0.06)] relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-[48px] font-bold text-[#1a1208] mb-4">Your competitor intelligence, at a glance</h2>
            <p className="text-[18px] text-[#5c4a32]">Everything you need to stay ahead in one clean dashboard.</p>
          </div>

          <Section>
            <motion.div 
              initial={{ scale: 0.96 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="max-w-[900px] mx-auto bg-[#ffffff] rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(26,18,8,0.06),_0_40px_80px_rgba(26,18,8,0.12)]"
              style={{ border: '1px solid rgba(26,18,8,0.12)' }}
            >
              {/* Dashboard Top Bar */}
              <div className="h-14 border-b border-[rgba(26,18,8,0.08)] px-6 flex items-center justify-between bg-[#ffffff]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-4">
                    <div className="w-3 h-3 rounded-full bg-[#a63d2f]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#c8956c]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#6b7c3f]"></div>
                  </div>
                  <span className="font-semibold text-sm text-[#1a1208]">PulseTrack Dashboard</span>
                </div>
                <div className="text-xs text-[#9c8570] font-medium">Today, June 10</div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#faf7f2] border border-[rgba(26,18,8,0.06)] rounded-xl p-4">
                    <div className="text-[#9c8570] text-xs font-semibold uppercase tracking-wider mb-2">Competitors Tracked</div>
                    <div className="text-3xl font-bold text-[#c17f2a]">12</div>
                  </div>
                  <div className="bg-[#faf7f2] border border-[rgba(26,18,8,0.06)] rounded-xl p-4">
                    <div className="text-[#9c8570] text-xs font-semibold uppercase tracking-wider mb-2">Changes This Week</div>
                    <div className="text-3xl font-bold text-[#c8956c]">8</div>
                  </div>
                  <div className="bg-[#faf7f2] border border-[rgba(26,18,8,0.06)] rounded-xl p-4">
                    <div className="text-[#9c8570] text-xs font-semibold uppercase tracking-wider mb-2">High Urgency</div>
                    <div className="text-3xl font-bold text-[#a63d2f]">3</div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#1a1208] mb-4">Recent Changes</h3>
                
                {/* Feed Items */}
                <div className="flex flex-col gap-3">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start sm:items-center gap-4 bg-[#ffffff] hover:bg-[#faf7f2] transition border border-[rgba(26,18,8,0.06)] rounded-xl p-4 border-l-4 border-l-[#a63d2f]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#ff6b00] flex-shrink-0 flex items-center justify-center text-white font-bold">S</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1a1208] text-sm">Stripe</span>
                        <span className="text-[#9c8570] text-xs">•</span>
                        <span className="text-[#5c4a32] text-sm">Pricing</span>
                      </div>
                      <p className="text-sm text-[#5c4a32] truncate sm:whitespace-normal">Free plan discontinued. Pro plan price increased from $15 to $25/month.</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-[#fdf0ee] border border-[#a63d2f]/20 text-[#a63d2f] text-[10px] font-bold rounded uppercase tracking-wide">High</span>
                      <span className="text-xs text-[#9c8570]">2 hours ago</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-start sm:items-center gap-4 bg-[#ffffff] hover:bg-[#faf7f2] transition border border-[rgba(26,18,8,0.06)] rounded-xl p-4 border-l-4 border-l-[#c8956c]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1a1208] border border-[rgba(26,18,8,0.1)] flex-shrink-0 flex items-center justify-center text-white font-bold">N</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1a1208] text-sm">Notion</span>
                        <span className="text-[#9c8570] text-xs">•</span>
                        <span className="text-[#5c4a32] text-sm">Homepage</span>
                      </div>
                      <p className="text-sm text-[#5c4a32] truncate sm:whitespace-normal">Hero messaging changed from 'connected workspace' to 'AI-powered workspace'.</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-[#fdf5f0] border border-[#c8956c]/30 text-[#b86a3a] text-[10px] font-bold rounded uppercase tracking-wide">Medium</span>
                      <span className="text-xs text-[#9c8570]">Yesterday</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                    className="flex items-start sm:items-center gap-4 bg-[#ffffff] hover:bg-[#faf7f2] transition border border-[rgba(26,18,8,0.06)] rounded-xl p-4 border-l-4 border-l-[#6b7c3f]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#5e6ad2] flex-shrink-0 flex items-center justify-center text-white font-bold">L</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1a1208] text-sm">Linear</span>
                        <span className="text-[#9c8570] text-xs">•</span>
                        <span className="text-[#5c4a32] text-sm">Blog</span>
                      </div>
                      <p className="text-sm text-[#5c4a32] truncate sm:whitespace-normal">Published new post: 'How we scaled to 1M users'</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-[#f2f5ee] border border-[#6b7c3f]/30 text-[#5a6e35] text-[10px] font-bold rounded uppercase tracking-wide">Low</span>
                      <span className="text-xs text-[#9c8570]">2 days ago</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* SECTION 3 - HOW IT WORKS */}
      <section className="py-24 px-6 bg-[#ede8de] border-t border-[rgba(26,18,8,0.06)]">
        <div className="max-w-6xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-[48px] font-bold text-[#1a1208]">Set up in minutes. Intelligence delivered daily.</h2>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Animated dashed line connecting steps - hidden on mobile */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] z-0">
              <svg width="100%" height="100%" preserveAspectRatio="none">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="rgba(26,18,8,0.15)" strokeWidth="2" className="dash-anim" />
              </svg>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-[#ffffff] border border-[rgba(26,18,8,0.1)] hover:border-[rgba(26,18,8,0.25)] rounded-2xl p-6 relative z-10 transition-colors"
            >
              <div className="w-12 h-12 bg-[rgba(193,127,42,0.12)] border border-[rgba(193,127,42,0.2)] rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[#c17f2a]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1208] mb-3">Add your competitors</h3>
              <p className="text-[#5c4a32] text-[15px] leading-relaxed mb-6">Paste any competitor URL. Choose which pages to monitor pricing, homepage, features, changelog. Takes 30 seconds.</p>
              
              <div className="bg-[#faf7f2] rounded-lg p-3 border border-[rgba(26,18,8,0.08)] flex items-center gap-2">
                <div className="w-4 h-4 text-[#9c8570]"></div>
                <div className="text-sm text-[#1a1208] font-mono overflow-hidden border-r-2 border-[rgba(26,18,8,0.5)] pr-1 animate-pulse">stripe.com/pricing</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-[#ffffff] border border-[rgba(26,18,8,0.1)] hover:border-[rgba(26,18,8,0.25)] rounded-2xl p-6 relative z-10 transition-colors"
            >
              <div className="w-12 h-12 bg-[rgba(193,127,42,0.12)] border border-[rgba(193,127,42,0.2)] rounded-xl flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-[#c17f2a]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1208] mb-3">We scrape. You sleep.</h3>
              <p className="text-[#5c4a32] text-[15px] leading-relaxed mb-6">Our engine crawls competitor pages every day, detects changes down to sentence level, and filters out the noise.</p>
              
              <div className="h-10 bg-[#faf7f2] rounded-lg border border-[rgba(26,18,8,0.08)] flex items-center justify-between px-4 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-around opacity-30">
                  <div className="w-1 h-full bg-[#c17f2a]"></div>
                  <div className="w-1 h-full bg-[#c17f2a]"></div>
                  <div className="w-1 h-full bg-[#c17f2a]"></div>
                  <div className="w-1 h-full bg-[#c17f2a]"></div>
                </div>
                <motion.div 
                  animate={{ x: [0, 200] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-2 h-2 rounded-full bg-[#c17f2a] shadow-[0_0_8px_rgba(193,127,42,0.5)] relative z-10"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-[#ffffff] border border-[rgba(26,18,8,0.1)] hover:border-[rgba(26,18,8,0.25)] rounded-2xl p-6 relative z-10 transition-colors"
            >
              <div className="w-12 h-12 bg-[rgba(193,127,42,0.12)] border border-[rgba(193,127,42,0.2)] rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-[#c17f2a]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1208] mb-3">AI explains what matters</h3>
              <p className="text-[#5c4a32] text-[15px] leading-relaxed mb-6">Not just 'something changed' we tell you what changed, why it likely happened, and exactly what you should do about it.</p>
              
              <div className="bg-[#faf7f2] rounded-lg p-3 border border-[rgba(26,18,8,0.08)] border-l-2 border-l-[#c17f2a]">
                <div className="w-3/4 h-2 bg-[#c17f2a]/20 rounded mb-2"></div>
                <div className="w-full h-2 bg-[rgba(26,18,8,0.1)] rounded mb-1.5"></div>
                <div className="w-5/6 h-2 bg-[rgba(26,18,8,0.1)] rounded"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - AI ANALYSIS */}
      <section className="py-24 px-6 bg-[#f5f0e8] relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6b7c3f]/30 bg-[#6b7c3f]/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#6b7c3f]" />
              <span className="text-xs font-semibold text-[#6b7c3f] tracking-wide uppercase">Powered by Groq + Llama 3.3</span>
            </div>
            
            <h2 className="text-3xl sm:text-[48px] font-bold text-[#1a1208] leading-tight mb-6">
              Not just alerts.<br/>Strategic intelligence.
            </h2>
            
            <p className="text-[18px] text-[#5c4a32] leading-relaxed mb-8">
              Generic tools tell you something changed. PulseTrack tells you why it happened, what it means for your business, and what your next move should be.
            </p>
            
            <ul className="space-y-4">
              {[
                "What changed (exact content diff)",
                "Why it likely happened (strategic reasoning)",
                "Impact on your product or pricing",
                "Recommended action to take"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#c17f2a] flex-shrink-0 mt-0.5" />
                  <span className="text-[#1a1208]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-[#ffffff] border border-[rgba(26,18,8,0.1)] border-l-[2px] border-l-[#c17f2a] rounded-2xl p-6 shadow-[0_20px_40px_rgba(26,18,8,0.06)] relative"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(26,18,8,0.08)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#6b7c3f]" />
                <span className="font-semibold text-[#1a1208]">AI Analysis · Stripe · Pricing</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fdf0ee] rounded border border-[#a63d2f]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a63d2f] pulse-red"></div>
                <span className="text-[10px] font-bold text-[#a63d2f] uppercase tracking-wider">High Urgency</span>
              </div>
            </div>

            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
                <h4 className="text-[11px] font-bold text-[#9c8570] uppercase tracking-wider mb-2">What changed</h4>
                <p className="text-[15px] text-[#1a1208]">Free plan removed. Pro plan repriced from $15 → $25/month.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }}>
                <h4 className="text-[11px] font-bold text-[#9c8570] uppercase tracking-wider mb-2">Why it happened</h4>
                <p className="text-[15px] text-[#5c4a32]">Stripe is moving upmarket. Removing free tier reduces support costs and signals focus on SMB/enterprise.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} viewport={{ once: true }}>
                <h4 className="text-[11px] font-bold text-[#9c8570] uppercase tracking-wider mb-2">Impact on you</h4>
                <p className="text-[15px] text-[#5c4a32]">Opportunity to capture Stripe's churned free users by offering a competitive free tier.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} viewport={{ once: true }} className="bg-[#faf5ec] border-l-2 border-l-[#c17f2a] rounded-r-lg p-4">
                <h4 className="text-[11px] font-bold text-[#c17f2a] uppercase tracking-wider mb-2">Recommended action</h4>
                <p className="text-[15px] text-[#1a1208] font-medium">Launch a free plan with 1,000 API calls/month this quarter.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 - FEATURES GRID */}
      <section className="py-24 px-6 bg-[#ede8de] border-y border-[rgba(26,18,8,0.06)]">
        <div className="max-w-6xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-[48px] font-bold text-[#1a1208]">Everything you need to stay ahead</h2>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: "Daily Monitoring", desc: "Competitor pages scraped every 24 hours automatically. No manual checking needed." },
              { icon: Brain, title: "AI Analysis", desc: "Groq-powered Llama 3.3 explains every change with strategic context." },
              { icon: Bell, title: "Smart Alerts", desc: "Urgency-based alerts. Only get notified for what actually matters." },
              { icon: Mail, title: "Weekly Digest", desc: "AI-written email summary every Monday. Your competitive landscape in 2 minutes." },
              { icon: Settings, title: "Custom Rules", desc: "Define your own monitoring rules per competitor. We enforce your standards." },
              { icon: LineChart, title: "Change History", desc: "Full timeline of every competitor change with searchable history." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
                className="bg-[#ffffff] border border-[rgba(26,18,8,0.1)] hover:border-[rgba(26,18,8,0.25)] rounded-2xl p-6 transition-all hover:scale-[1.02] cursor-default group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-5 bg-[rgba(193,127,42,0.12)]">
                  <feature.icon className="w-5 h-5 text-[#c17f2a]" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1208] mb-2">{feature.title}</h3>
                <p className="text-[15px] text-[#5c4a32] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - TESTIMONIALS */}
      <section className="py-24 px-6 bg-[#f5f0e8]">
        <div className="max-w-6xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-[48px] font-bold text-[#1a1208]">Founders love PulseTrack</h2>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "I found out my main competitor dropped their price before any of my customers did. PulseTrack paid for itself in the first week.",
                name: "Sarah Chen",
                title: "Founder, Launchpad SaaS",
                initials: "SC",
                color: "from-[#c17f2a] to-[#a36920]"
              },
              {
                quote: "The AI analysis is what sets it apart. It doesn't just tell me what changed — it tells me what to do about it.",
                name: "Marcus Williams",
                title: "Head of Product, Flowbase",
                initials: "MW",
                color: "from-[#c8956c] to-[#a6744f]"
              },
              {
                quote: "We caught a competitor launching a direct feature against us 3 days before their announcement. Game changer.",
                name: "Priya Nair",
                title: "CEO, Stackly",
                initials: "PN",
                color: "from-[#6b7c3f] to-[#4e5b2e]"
              }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-[#faf7f2] border border-[rgba(26,18,8,0.08)] rounded-2xl p-8 flex flex-col h-full"
              >
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-[#c17f2a] text-[#c17f2a]" />)}
                </div>
                <p className="text-[16px] text-[#1a1208] leading-relaxed mb-8 flex-grow">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold text-[#f5f0e8]`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1a1208] text-sm">{t.name}</div>
                    <div className="text-xs text-[#9c8570]">{t.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 - PRICING */}
      <section className="py-24 px-6 bg-[#ede8de] border-t border-[rgba(26,18,8,0.06)]">
        <div className="max-w-4xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-[48px] font-bold text-[#1a1208] mb-4">Simple pricing. Serious intelligence.</h2>
              <p className="text-[18px] text-[#5c4a32]">Start free. Upgrade when you're ready.</p>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[700px] mx-auto items-center">
            {/* Free */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[#ffffff] border border-[rgba(26,18,8,0.1)] rounded-3xl p-8"
            >
              <h3 className="text-xl font-semibold text-[#1a1208] mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-[#1a1208]">$0</span>
                <span className="text-[#5c4a32]">/ month</span>
              </div>
              <p className="text-sm text-[#5c4a32] mb-8 pb-8 border-b border-[rgba(26,18,8,0.1)]">Perfect to get started</p>
              
              <ul className="space-y-4 mb-8">
                {["3 competitors", "5 pages per competitor", "Daily monitoring", "AI analysis", "Email digest"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[15px] text-[#1a1208]">
                    <CheckCircle2 className="w-5 h-5 text-[#9c8570]" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <Link href="/login" className="block w-full">
                <button className="w-full py-3.5 rounded-xl border border-[rgba(26,18,8,0.4)] text-[#1a1208] font-semibold hover:bg-[rgba(26,18,8,0.05)] transition-colors">
                  Get Started Free
                </button>
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-[#ffffff] border border-[rgba(193,127,42,0.5)] rounded-3xl p-8 relative animate-float shadow-[0_20px_40px_rgba(26,18,8,0.08)]"
              style={{ background: 'radial-gradient(ellipse at top, rgba(193,127,42,0.06), transparent), #ffffff' }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(193,127,42,0.12)] text-[#8b6914] text-[11px] font-bold uppercase tracking-wider rounded-full">
                Most Popular
              </div>
              
              <h3 className="text-xl font-semibold text-[#1a1208] mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-[#1a1208]">$29</span>
                <span className="text-[#5c4a32]">/ month</span>
              </div>
              <p className="text-sm text-[#5c4a32] mb-8 pb-8 border-b border-[rgba(26,18,8,0.1)]">For serious founders and PMs</p>
              
              <ul className="space-y-4 mb-8">
                {["Unlimited competitors", "All page types", "Hourly monitoring", "Priority AI analysis", "Slack alerts", "Custom rules", "API access"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[15px] text-[#1a1208]">
                    <CheckCircle2 className="w-5 h-5 text-[#c17f2a]" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <Link href="/login" className="block w-full">
                <button className="w-full py-3.5 rounded-xl bg-[#1a1208] text-[#f5f0e8] font-semibold hover:bg-[#3d2b1f] transition-colors shadow-[0_10px_20px_rgba(26,18,8,0.15)] hover:shadow-[0_15px_25px_rgba(26,18,8,0.2)]">
                  Start Pro Free
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 8 - FINAL CTA */}
      <section className="py-32 px-6 bg-[#f5f0e8] relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] z-0 pointer-events-none" style={{ background: 'rgba(193,127,42,0.08)' }}></div>
        
        <Section className="relative z-10 flex flex-col items-center">
          <h2 className="text-[40px] sm:text-[56px] font-[800] tracking-tight text-[#1a1208] mb-6">Stop guessing. Start knowing.</h2>
          <p className="text-[20px] text-[#5c4a32] max-w-2xl mb-10">Join 500+ founders who always know what their competitors are doing.</p>
          
          <Link href="/login">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(26,18,8,0.15)" }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-[#1a1208] text-[#f5f0e8] font-bold rounded-full text-lg transition-all flex items-center gap-2"
            >
              Start Monitoring Free <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </Section>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#ede8de] border-t border-[rgba(26,18,8,0.1)] py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-[#c17f2a]" />
              <span className="text-lg font-bold text-[#1a1208]">PulseTrack</span>
            </div>
            <span className="text-sm text-[#5c4a32]">AI-powered competitor intelligence</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-[#5c4a32] hover:text-[#1a1208] transition">Sign In</Link>
            <Link href="/login" className="text-sm font-medium text-[#5c4a32] hover:text-[#1a1208] transition">Get Started</Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[rgba(26,18,8,0.1)] flex items-center justify-center md:justify-start">
          <span className="text-sm text-[#5c4a32]">© 2025 PulseTrack · Built with Next.js</span>
        </div>
      </footer>

    </div>
  );
}
