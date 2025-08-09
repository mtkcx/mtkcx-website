import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useWebsiteContent';
const Footer = () => {
  const { t, isRTL } = useLanguage();
  const { content: settings } = useSiteSettings();

  const companyName = settings.company_name || t('footer.company_name');
  const companyEmail = settings.company_email || 'info@mtkc.com';
  const companyPhone = settings.company_phone || '+1 (555) 123-4567';
  const companyAddress = settings.company_address || t('footer.address');
  const copyrightText = settings.footer_copyright || `© 2024 ${companyName}. All rights reserved.`;
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{companyName}</h3>
            <p className="text-primary-foreground/80 leading-relaxed text-sm">
              {t('footer.company_desc')}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/p/MT-Detailing-61558524899198/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5 flex-shrink-0" />
              </a>
              <a href="https://www.instagram.com/mt.kcx" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5 flex-shrink-0" />
              </a>
              <a href="https://www.tiktok.com/@mt.kcx" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.quick_links')}</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.products')}</Link></li>
              <li><Link to="/courses" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.courses')}</Link></li>
              <li><Link to="/gallery" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.wrapping')}</Link></li>
              <li><Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('nav.about')}</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.policies')}</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('footer.privacy_policy')}</Link></li>
              <li><Link to="/terms-of-service" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('footer.terms_of_service')}</Link></li>
              <li><Link to="/shipping-policy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('footer.shipping_policy')}</Link></li>
              <li><Link to="/return-policy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('footer.return_policy')}</Link></li>
              <li><Link to="/refund-policy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{t('footer.refund_policy')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('footer.services')}</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>{t('footer.service_1')}</li>
              <li>{t('footer.service_2')}</li>
              <li>{t('footer.service_3')}</li>
              <li>{t('footer.service_4')}</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('nav.contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/80">{companyEmail}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/80">{companyPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/80">{companyAddress}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/80">{copyrightText}</p>
        </div>
      </div>
    </footer>;
};
export default Footer;