import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  BarChart3,
  Building2,
  FileText,
  GitMerge,
  ShoppingCart,
  Users,
  ChevronRight,
  Star,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Building2,
    title: 'Vendor Onboarding',
    desc: 'Self-registration with admin approval workflow. All vendor profiles verified before they can receive RFQs.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: FileText,
    title: 'RFQ Management',
    desc: 'Create detailed RFQs with line items, categories and deadlines. Instantly invite specific vendors to bid.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: GitMerge,
    title: 'Quotation Comparison',
    desc: 'Side-by-side price and delivery comparison across all vendor bids. System highlights the best value automatically.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Shield,
    title: 'Approval Workflows',
    desc: 'Manager-gated approval chain ensures every purchase order is reviewed before commitment.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: ShoppingCart,
    title: 'Purchase Orders',
    desc: 'Auto-generate POs with GST-inclusive totals, line items and vendor details upon approval.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Spend trends, vendor ratings, PO fulfillment rates — full procurement intelligence at your fingertips.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
];

const WORKFLOW = [
  { step: '01', title: 'Vendor Registers', desc: 'Vendor submits company profile with GST & category details' },
  { step: '02', title: 'Admin Approves', desc: 'Admin reviews and activates vendor in the system' },
  { step: '03', title: 'RFQ Created', desc: 'Procurement officer creates RFQ and selects vendors to invite' },
  { step: '04', title: 'Vendors Quote', desc: 'Selected vendors submit competitive pricing & delivery timelines' },
  { step: '05', title: 'Compare & Select', desc: 'Officer compares quotations and picks the best vendor' },
  { step: '06', title: 'Manager Approves', desc: 'Manager reviews and approves the purchase decision' },
  { step: '07', title: 'PO Generated', desc: 'System auto-generates Purchase Order with all tax details' },
];

const TESTIMONIALS = [
  {
    quote: 'VendorBridge cut our procurement cycle from 3 weeks to 4 days. The comparison table alone saved us lakhs.',
    name: 'Anjali Rao',
    role: 'Head of Procurement, Infosys Ltd.',
    rating: 5,
  },
  {
    quote: 'The approval workflow is seamless. Managers can approve on the go and vendors get notified instantly.',
    name: 'Rajan Mehta',
    role: 'CFO, TechCorp India Pvt. Ltd.',
    rating: 5,
  },
  {
    quote: 'We onboarded 40 vendors in a single day. The GST-inclusive PO generation is a huge time saver.',
    name: 'Priya Nair',
    role: 'Supply Chain Manager, Tata Industries',
    rating: 5,
  },
];

const STATS = [
  { value: '2,400+', label: 'Active Vendors' },
  { value: '₹48Cr+', label: 'PO Value Processed' },
  { value: '92%', label: 'Fulfillment Rate' },
  { value: '4.2 Days', label: 'Avg. Procurement Cycle' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-[#e2e8f0] font-['Inter',sans-serif] overflow-x-hidden">

      {/* ===== NAVBAR ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-[#0a0f0d]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">VendorBridge</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94a3b8]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#94a3b8] hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all"
          >
            Vendor Register
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-6 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        ></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            ENTERPRISE PROCUREMENT PLATFORM
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Smarter Procurement.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Stronger Supplier Bonds.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto leading-relaxed mb-10">
            VendorBridge is an end-to-end procurement ERP that connects your company with verified vendors — from RFQ creation to purchase order generation, all in one unified platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              id="hero-vendor-register"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Register as Vendor <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              id="hero-login"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-300"
            >
              Company Login <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
            </Link>
          </div>

          {/* Stats Row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center hover:border-emerald-500/20 transition-colors">
                <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">Platform Capabilities</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-5 mb-4 tracking-tight">
            Everything You Need to<br />
            <span className="text-emerald-400">Run Procurement at Scale</span>
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            From vendor onboarding to PO generation — every step of the procurement lifecycle in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group relative bg-white/[0.03] hover:bg-white/[0.055] border border-white/5 hover:${f.border} rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== ROLES SECTION ===== */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-emerald-500/5">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">Role-Based Access</span>
          <h2 className="text-4xl font-extrabold text-white mt-5 mb-3 tracking-tight">Four Roles, One Platform</h2>
          <p className="text-[#94a3b8]">Each role sees exactly what it needs — no more, no less.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {[
            { role: 'Admin', color: 'emerald', desc: 'Manages vendors, monitors entire platform, approves registrations', icon: Shield },
            { role: 'Procurement Officer', color: 'blue', desc: 'Creates RFQs, invites vendors, compares quotations', icon: FileText },
            { role: 'Manager', color: 'amber', desc: 'Reviews and approves purchase decisions and workflows', icon: CheckCircle2 },
            { role: 'Vendor', color: 'violet', desc: 'Receives RFQs, submits competitive quotes, tracks orders', icon: Users },
          ].map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.role} className={`bg-white/[0.03] border border-${r.color}-500/20 rounded-2xl p-6 text-center hover:bg-${r.color}-500/5 transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-full bg-${r.color}-500/10 border border-${r.color}-500/20 flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 text-${r.color}-400`} />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{r.role}</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== WORKFLOW ===== */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">7-Step Workflow</span>
            <h2 className="text-4xl font-extrabold text-white mt-5 mb-3 tracking-tight">End-to-End Procurement Flow</h2>
            <p className="text-[#94a3b8]">Every role plays a part — the system ensures nothing is skipped.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-emerald-500/40 via-emerald-500/20 to-transparent hidden sm:block"></div>

            <div className="space-y-5 sm:pl-14">
              {WORKFLOW.map((w, i) => (
                <div
                  key={w.step}
                  className="flex items-start gap-5 bg-white/[0.025] hover:bg-white/[0.04] border border-white/5 hover:border-emerald-500/20 rounded-2xl p-5 transition-all duration-300 relative"
                >
                  {/* Step badge — absolutely positioned on the left line for sm+ */}
                  <div className="hidden sm:flex absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                    {i + 1}
                  </div>
                  <div className="flex sm:hidden w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    {w.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base mb-1">{w.title}</h3>
                    <p className="text-sm text-[#94a3b8]">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-24 px-6 bg-gradient-to-b from-transparent to-emerald-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">Testimonials</span>
            <h2 className="text-4xl font-extrabold text-white mt-5 mb-3 tracking-tight">Trusted by Procurement Teams</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/[0.03] border border-white/5 rounded-2xl p-7 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                <div>
                  <div className="flex mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#94a3b8] leading-relaxed italic mb-6">"{t.quote}"</p>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 blur-sm"></div>
          <div className="bg-white/[0.025] border border-emerald-500/20 rounded-3xl p-14">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Ready to Streamline<br />Your Procurement?
            </h2>
            <p className="text-[#94a3b8] text-lg mb-10">
              Join VendorBridge today. Vendors self-register. Company teams use pre-configured accounts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                id="cta-vendor-register"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
              >
                Register as Vendor <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                id="cta-login"
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all"
              >
                Company Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          </div>
          <span className="font-bold text-white">VendorBridge</span>
        </div>
        <p className="text-xs text-[#94a3b8]">
          © 2026 VendorBridge Procurement ERP · Built for the Odoo × KSV Hackathon
        </p>
      </footer>
    </div>
  );
}
