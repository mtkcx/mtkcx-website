import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">KochChemie East</h3>
            <p className="text-primary-foreground/80 leading-relaxed">
              Official KochChemie distributor providing premium car care products, professional training, and expert wrapping services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/products" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.products')}</a></li>
              <li><a href="/courses" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.courses')}</a></li>
              <li><a href="/wrapping" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.wrapping')}</a></li>
              <li><a href="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.about')}</a></li>
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
                <span className="text-primary-foreground/80">info@kochchemie-east.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/80">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/80">Professional Center, Business District</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/80">
            © 2024 KochChemie East. All rights reserved. | MT Wraps Division
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;