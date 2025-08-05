import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
const Footer = () => {
  const {
    t,
    isRTL
  } = useLanguage();
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">MTKcx</h3>
            <p className="text-primary-foreground/80 leading-relaxed text-sm">
              Official Koch-Chemie distributor providing premium car care products, professional training, and expert wrapping services.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/MTDetailing" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/mt.kcx" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@mt.kcx" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.products')}</Link></li>
              <li><Link to="/courses" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.courses')}</Link></li>
              <li><Link to="/gallery" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.wrapping')}</Link></li>
              <li><Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.about')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Services</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Professional Car Care</li>
              <li>Detailing Training</li>
              <li>Car Wrapping</li>
              <li>Product Distribution</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('nav.contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/80">info@mtkcx.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/80">052-5701-073</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/80">Atarot Industrial Area, Hatamrukim, Jerusalem.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/80">© 2025 MT Wraps. All rights reserved. | Koch-Chemie</p>
        </div>
      </div>
    </footer>;
};
export default Footer;