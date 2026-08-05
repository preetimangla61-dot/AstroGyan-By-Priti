import { Link } from "wouter"
import { BookingForm } from "@/components/BookingForm"
import { Star, Moon, Sparkles, ChevronDown } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative stars / ambient light */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute top-[40%] right-[5%] w-[25vw] h-[25vw] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <header className="w-full p-6 md:px-12 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <Star className="text-primary w-6 h-6" />
          <span className="font-serif text-2xl tracking-widest text-primary">AstroGyan</span>
        </div>
        <Link href="/admin" className="text-sm text-foreground/50 hover:text-primary transition-colors">
          Admin
        </Link>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 pt-10 pb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
            <Moon className="w-4 h-4" />
            <span>Vedic Astrology Consultations</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif max-w-4xl leading-tight tracking-tight mb-6">
            Illuminate the <span className="text-primary italic">Cosmic Path</span> of Your Life
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-light mb-12">
            Private, one-on-one Vedic astrology readings with Preeti Mangla. 
            Discover clarity, purpose, and spiritual guidance tailored to your unique birth chart.
          </p>
          <a href="#book" className="group">
            <div className="flex flex-col items-center gap-4 text-primary/70 group-hover:text-primary transition-colors">
              <span className="text-sm uppercase tracking-widest">Book Your Reading</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>
          </a>
        </section>

        {/* Form Section */}
        <section id="book" className="py-24 px-4 md:px-8 relative">
          <div className="absolute inset-0 bg-black/40 skew-y-3 -z-10" />
          <BookingForm />
        </section>

        {/* Testimonials */}
        <section className="py-24 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">Voices of Clarity</h2>
            <p className="text-foreground/60 max-w-xl mx-auto">Hear from those who have found their way through the stars.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Preeti's reading gave me immense peace during a difficult career transition. Her insights were remarkably accurate.", author: "Neha S.", label: "Career Guidance" },
              { text: "I felt truly heard and understood. This wasn't just predictions; it was a deeply spiritual counseling session.", author: "Rahul M.", label: "General Reading" },
              { text: "The relationship reading helped my partner and I understand our dynamic in a completely new light.", author: "Priya & Arun", label: "Marriage Match" }
            ].map((t, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl relative border-t-0 border-l-0">
                <Sparkles className="absolute top-6 right-6 w-5 h-5 text-secondary/40" />
                <p className="text-foreground/80 font-light italic mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-serif text-primary text-lg">{t.author}</p>
                  <p className="text-xs text-foreground/50">{t.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 text-center border-t border-border/30 relative z-10 bg-background">
        <p className="font-serif text-primary text-xl mb-4">AstroGyan by Preeti Mangla</p>
        <p className="text-sm text-foreground/40">© {new Date().getFullYear()} AstroGyan. All rights reserved.</p>
      </footer>
    </div>
  )
}
