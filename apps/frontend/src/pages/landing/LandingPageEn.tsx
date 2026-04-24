import { Check, ArrowRight, Package, Users, FileText, DollarSign, Calendar, TrendingUp, BarChart3, Shield, Zap, Menu, X, Star, Globe, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'MGA'>('EUR');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { 
      icon: Package, 
      title: 'Inventory Management', 
      desc: 'Real-time stock tracking with automatic alerts and low-stock notifications',
      color: 'from-blue-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    { 
      icon: Users, 
      title: 'CRM & Suppliers', 
      desc: 'Centralize your contacts and transaction history in one powerful dashboard',
      color: 'from-green-500 to-green-600',
      gradient: 'bg-gradient-to-br from-green-50 to-green-100'
    },
    { 
      icon: FileText, 
      title: 'Smart Invoicing', 
      desc: 'Create professional invoices in seconds with customizable templates',
      color: 'from-purple-500 to-purple-600',
      gradient: 'bg-gradient-to-br from-purple-50 to-purple-100'
    },
    { 
      icon: DollarSign, 
      title: 'Financial Analytics', 
      desc: 'Monitor your finances with intuitive dashboards and detailed insights',
      color: 'from-yellow-500 to-yellow-600',
      gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100'
    },
    { 
      icon: Calendar, 
      title: 'Payroll Management', 
      desc: 'Automate salary calculations and social charges processing',
      color: 'from-red-500 to-red-600',
      gradient: 'bg-gradient-to-br from-red-50 to-red-100'
    },
    { 
      icon: TrendingUp, 
      title: 'Reports & Analytics', 
      desc: 'Analyze performance with detailed charts and business intelligence',
      color: 'from-indigo-500 to-indigo-600',
      gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100'
    },
  ];

  const stats = [
    { number: '50K+', label: 'Active Users', icon: Users },
    { number: '1M+', label: 'Invoices Generated', icon: FileText },
    { number: '99.9%', label: 'Uptime', icon: Activity },
    { number: '150+', label: 'Countries', icon: Globe }
  ];

  const plans = [
    {
      name: 'Starter',
      subtitle: 'Perfect for small teams',
      price: {
        EUR: { monthly: '7', yearly: '71' },
        USD: { monthly: '8', yearly: '78' },
        MGA: { monthly: '35000', yearly: '350000' }
      },
      features: [
        'Up to 5 users',
        'Unlimited invoices',
        'Basic reports',
        'Email support',
        'Mobile app access',
        '5GB storage'
      ],
      cta: 'Start Free Trial',
      highlight: false
    },
    {
      name: 'Professional',
      subtitle: 'For growing businesses',
      price: {
        EUR: { monthly: '19', yearly: '194' },
        USD: { monthly: '21', yearly: '211' },
        MGA: { monthly: '95000', yearly: '950000' }
      },
      features: [
        'Up to 25 users',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access',
        '50GB storage',
        'Multi-currency',
        'Automated workflows'
      ],
      cta: 'Start Free Trial',
      highlight: true,
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      subtitle: 'Custom solutions',
      price: {
        EUR: { monthly: 'Custom', yearly: 'Custom' },
        USD: { monthly: 'Custom', yearly: 'Custom' },
        MGA: { monthly: 'Custom', yearly: 'Custom' }
      },
      features: [
        'Unlimited users',
        'Dedicated infrastructure',
        '24/7 phone support',
        'Custom development',
        'On-site training',
        'Unlimited storage',
        'SLA guarantee',
        'White-label option'
      ],
      cta: 'Contact Sales',
      highlight: false
    }
  ];

  const currencies = {
    EUR: { symbol: '€', label: 'EUR' },
    USD: { symbol: '$', label: 'USD' },
    MGA: { symbol: 'Ar', label: 'MGA' }
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc',
      location: 'San Francisco, USA',
      text: 'This platform transformed how we manage our business. The automation features alone save us 15 hours per week!',
      rating: 5
    },
    {
      name: 'Marcus Chen',
      role: 'Finance Director',
      location: 'Singapore',
      text: 'Best business management solution we\'ve tried. Intuitive, powerful, and the support team is outstanding.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Operations Manager',
      location: 'Barcelona, Spain',
      text: 'Finally, a tool that does everything we need. The ROI was clear within the first month.',
      rating: 5
    }
  ];

  const benefits = [
    { icon: Zap, title: 'Fast & Efficient', desc: 'Optimized interface' },
    { icon: Shield, title: 'Secure', desc: 'Encrypted data' },
    { icon: BarChart3, title: 'Scalable', desc: 'Grows with you' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 opacity-50"></div>
                <img src="/public/logo.PNG" alt="Logo" className="h-12 relative" />
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Testimonials
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Resources
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button className="px-5 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Sign In
              </button>
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105">
                Start Free Trial
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t animate-fade-in">
              <nav className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Testimonials
                </a>
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <button className="px-4 py-2 text-center text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                    Sign In
                  </button>
                  <button className="px-4 py-2 text-center bg-blue-600 text-white rounded-lg font-medium">
                    Start Free Trial
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-7xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Trusted by 50,000+ businesses worldwide
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Business Management
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl">
              All-in-one platform for invoicing, inventory, accounting, and analytics. 
              <span className="font-semibold text-gray-900"> Automate your workflows</span> and focus on growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 shadow-2xl shadow-blue-500/40 transition-all hover:scale-105">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-50 border-2 border-gray-200 transition-all">
                Watch Demo
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 flex items-center gap-4 flex-wrap mb-16">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Cancel anytime
              </span>
            </p>

            {/* Dashboard Preview Below */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500">
                    app.factura.mg/dashboard
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Revenue</p>
                        <p className="text-lg font-bold text-gray-900">$128,450</p>
                      </div>
                    </div>
                    <div className="text-green-600 text-sm font-semibold">+12%</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-gray-600">Invoices</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">247</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-gray-600">Products</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">1,523</p>
                    </div>
                  </div>

                  <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 flex items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-blue-500 rounded-t opacity-70 hover:opacity-100 transition-all"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-xl p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Order</p>
                      <p className="font-semibold text-gray-900">#12847</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-xl p-4 animate-float animation-delay-2000">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <p className="text-sm font-medium">Invoice Sent!</p>
                  </div>
                  <p className="text-xs text-gray-500">Client: Acme Corp</p>
                </div>

                <div className="bg-white rounded-xl shadow-xl p-4 animate-float animation-delay-4000">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Stock Updated</p>
                  </div>
                  <p className="text-xs text-gray-500">+250 items added</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Everything You Need
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline operations with our comprehensive suite of business management tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
                    {feature.desc}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-4">
              Simple, Transparent Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              All plans include 14-day free trial. No credit card required.
            </p>
          </div>

          {/* Currency and Billing Toggle */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
              {(Object.keys(currencies) as Array<keyof typeof currencies>).map((key) => (
                <button
                  key={key}
                  onClick={() => setCurrency(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currency === key
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {currencies[key].label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  -17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const currentPrice = plan.price[currency][billingPeriod];
              const isCustom = currentPrice === 'Custom';
              
              return (
                <div 
                  key={index} 
                  className={`relative p-8 rounded-3xl transition-all duration-500 ${
                    plan.highlight 
                      ? 'bg-white text-gray-900 scale-105 shadow-2xl' 
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/15'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-1.5 rounded-full font-semibold shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className={`text-sm ${plan.highlight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {plan.subtitle}
                    </p>
                  </div>

                  <div className="mb-8">
                    {isCustom ? (
                      <div className="text-4xl font-bold">{currentPrice}</div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-5xl font-bold">
                            {currency === 'MGA' 
                              ? parseInt(currentPrice).toLocaleString('en-US')
                              : currentPrice}
                          </span>
                          <span className={plan.highlight ? 'text-gray-600' : 'text-gray-400'}>
                            {currencies[currency].symbol}
                          </span>
                        </div>
                        <p className={`text-sm ${plan.highlight ? 'text-gray-600' : 'text-gray-400'}`}>
                          per {billingPeriod === 'monthly' ? 'month' : 'year'}
                        </p>
                        {billingPeriod === 'yearly' && !isCustom && (
                          <p className="text-xs text-green-600 font-semibold mt-2">
                            💰 Save 17% with yearly plan
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-green-600' : 'text-green-400'}`} />
                        <span className={`text-sm ${plan.highlight ? 'text-gray-700' : 'text-gray-300'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`w-full py-4 rounded-xl font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                        : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-gray-400 mt-12">
            All plans include free updates • Cancel anytime • Money-back guarantee
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Loved by Thousands
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied businesses worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Globe className="w-3 h-3" />
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-10 opacity-95">
            Join 50,000+ businesses already using our platform to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:bg-gray-100 shadow-2xl transition-all hover:scale-105">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl text-lg font-semibold hover:bg-white/20 border-2 border-white/30 transition-all backdrop-blur-sm">
              Schedule a Demo
            </button>
          </div>
          <p className="mt-6 text-blue-100 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/public/logo.PNG" alt="Logo" className="h-10" />
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                The complete business management solution for modern enterprises. 
                Streamline operations, automate workflows, and scale with confidence.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Factura. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}