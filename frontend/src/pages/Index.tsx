import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, Droplets, CloudRain, Wifi, Shield, Zap, Bell, Mail, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import emailjs from "@emailjs/browser";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize EmailJS on component mount
  useEffect(() => {
    emailjs.init("u8p2_hpboSFT0Ovr4");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Send email using EmailJS
      await emailjs.send(
        "service_urq8bf9", // Service ID
        "template_pfwvnof", // Template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        }
      );

      // Success: Show message and reset form
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      
      // Hide success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      // Handle error
      const errorMessage = err instanceof Error ? err.message : "Failed to send message. Please try again.";
      setError(errorMessage);
      console.error("EmailJS error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactScroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const features = [
    {
      icon: <Thermometer className="w-8 h-8" />,
      title: "Temperature Monitoring",
      description: "Real-time temperature tracking to ensure optimal drying conditions.",
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Humidity Sensing",
      description: "Know exactly when your clothes are dry with accurate humidity data.",
    },
    {
      icon: <CloudRain className="w-8 h-8" />,
      title: "Rain Detection",
      description: "Get instant alerts when rain is detected to protect your laundry.",
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Alerts",
      description: "Receive notifications when your laundry needs attention.",
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "IoT Connected",
      description: "Connect your smart sensors for seamless monitoring.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security.",
    },
  ];

  return (
    <Layout showBackground>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6 animate-float">
            <img src={logo} alt="Chrita.tn" className="h-24 w-auto" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Smart Laundry
            <span className="text-primary"> Management</span>
          </h1>
          <p className="text-lg md:text-2xl font-bold mb-8 max-w-2xl mx-auto text-white drop-shadow-lg" style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(79, 195, 247, 0.3)' }}>
            Rain or shine — your laundry stays fine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="gradient" size="xl" className="w-full sm:w-auto pointer-events-auto cursor-pointer" type="button">
                    <Zap className="w-5 h-5" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="glass" 
                  size="xl" 
                  className="w-full sm:w-auto pointer-events-auto cursor-pointer" 
                  type="button"
                  onClick={handleContactScroll}
                >
                  Contact
                </Button>
              </>
            ) : (
              <Link to="/signup">
                <Button variant="gradient" size="xl" className="w-full sm:w-auto pointer-events-auto cursor-pointer" type="button">
                  <Zap className="w-5 h-5" />
                  Get Started Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you manage your laundry smarter, not harder.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const isHovered = hoveredIndex === index;
            const tiltX = isHovered ? (mousePosition.y - 50) / 10 : 0;
            const tiltY = isHovered ? (mousePosition.x - 50) / 10 : 0;
            
            return (
              <Card 
                key={index} 
                variant="glass" 
                className={`group cursor-pointer hover:shadow-glow hover:shadow-primary/20 hover:border-primary/30 transition-all duration-500 ease-out ${!isHovered ? 'hover:-translate-y-2 hover:scale-[1.02]' : ''}`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transform: isHovered 
                    ? `perspective(1000px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale(1.02)` 
                    : undefined,
                  transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out, box-shadow 0.5s ease-out'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setMousePosition({ x: 50, y: 50 });
                }}
                onMouseMove={(e) => {
                  if (isHovered) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMousePosition({ x, y });
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary/20 transition-all duration-500 ease-out group-hover:shadow-lg group-hover:shadow-primary/30">
                    <div className="group-hover:animate-pulse">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1 inline-block group-hover:tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed group-hover:leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          </div>

          {/* Contact Form */}
          <Card variant="glass" className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your message here..."
                  rows={5}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {isSubmitted && (
                    <p className="text-success text-sm font-medium">
                      ✓ Message sent successfully! We'll be in touch soon.
                    </p>
                  )}
                  {error && (
                    <p className="text-destructive text-sm font-medium">
                      ✕ {error}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="pointer-events-auto cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 pt-16 pb-8 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Chrita.tn" className="h-8 w-auto" />
              <span className="font-semibold text-primary">Chrita.tn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Smart laundry management for everyone.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Email</p>
                <a href="mailto:contact@chrita.tn" className="text-primary hover:underline">
                  contact@chrita.tn
                </a>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Phone</p>
                <a href="tel:+21673123456" className="text-primary hover:underline">
                  +216 73 123 456
                </a>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Response Time</p>
                <p className="text-foreground">Within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-muted-foreground hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Chrita.tn. All rights reserved.
          </p>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
