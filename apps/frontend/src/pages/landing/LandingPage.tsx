import { Link } from 'react-router-dom';
import { Check, ArrowRight, Package, Users, FileText, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: Package, title: 'Gestion Articles', desc: 'Stock et inventaire' },
    { icon: Users, title: 'Clients & Fournisseurs', desc: 'Relations professionnelles' },
    { icon: FileText, title: 'Facturation', desc: 'Factures intelligentes' },
    { icon: DollarSign, title: 'Comptabilité', desc: 'Suivi financier' },
    { icon: Calendar, title: 'Paie', desc: 'Gestion des salaires' },
    { icon: TrendingUp, title: 'Rapports', desc: 'Analyses en temps réel' },
  ];

  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      features: ['3 utilisateurs', '100 articles', '50 factures/mois'],
    },
    {
      name: 'Starter',
      price: '49 000',
      features: ['10 utilisateurs', 'Articles illimités', 'Support email'],
      popular: true
    },
    {
      name: 'Professional',
      price: '99 000',
      features: ['25 utilisateurs', 'Multi-entreprise', 'Support prioritaire'],
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      features: ['Utilisateurs illimités', 'Personnalisation', 'Support dédié'],
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Factura.mg</h1>
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2 text-gray-600 hover:text-gray-900">
              Connexion
            </Link>
            <Link to="/register" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Essai Gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            La Solution de Gestion Commerciale<br />
            <span className="text-primary-600">Pensée pour Madagascar</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Simplifiez votre gestion avec Factura.mg : facturation, stock, comptabilité et bien plus encore
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-medium hover:bg-primary-700 shadow-lg"
          >
            Commencer Gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Tout ce dont vous avez besoin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
                <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Tarifs Adaptés à Vos Besoins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-xl shadow-lg p-6 ${plan.popular ? 'ring-2 ring-primary-600 scale-105' : ''}`}>
                {plan.popular && (
                  <span className="bg-primary-600 text-white text-sm px-3 py-1 rounded-full">Populaire</span>
                )}
                <h4 className="text-xl font-bold mt-4 mb-2">{plan.name}</h4>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Sur mesure' && <span className="text-gray-600"> Ar/mois</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/register"
                  className={`block text-center w-full py-3 rounded-lg font-medium ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Choisir
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Prêt à Simplifier Votre Gestion ?</h3>
          <p className="text-xl mb-8 opacity-90">Commencez gratuitement, aucune carte bancaire requise</p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-lg text-lg font-medium hover:bg-gray-100"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 Factura.mg - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
