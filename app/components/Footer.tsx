"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const { effectiveTheme } = useTheme();

  const footerLinks = {
    platform: {
      title: "Platform",
      links: [
        { label: "Assistant", href: "/assistant" },
        { label: "Vault", href: "/vault" },
        { label: "Knowledge", href: "/knowledge" },
        { label: "Workflows", href: "/workflows" },
        { label: "Microsoft Integrations", href: "/integrations/microsoft" },
        { label: "Partnerships", href: "/partnerships" }
      ]
    },
    solutions: {
      title: "Solutions",
      links: [
        { label: "Innovation", href: "/solutions/innovation" },
        { label: "In-House", href: "/solutions/in-house" },
        { label: "Transactional", href: "/solutions/transactional" },
        { label: "Litigation", href: "/solutions/litigation" },
        { label: "Collaboration", href: "/solutions/collaboration" }
      ]
    },
    about: {
      title: "About",
      links: [
        { label: "Customers", href: "/customers" },
        { label: "Security", href: "/security" },
        { label: "Company", href: "/company" },
        { label: "Newsroom", href: "/newsroom" },
        { label: "Careers", href: "/careers" },
        { label: "Law Schools", href: "/law-schools" }
      ]
    },
    resources: {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Videos", href: "/videos" },
        { label: "Guides", href: "/guides" },
        { label: "Legal", href: "/legal" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Press Kit", href: "/press" }
      ]
    }
  };

  const socialLinks = [
    { label: "X", href: "https://x.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "YouTube", href: "https://youtube.com" }
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Logo Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/image/logo_candidate1 복사본.png"
                alt="Ruleout Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-normal text-gray-400 mb-4">
              {footerLinks.platform.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-white hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-sm font-normal text-gray-400 mb-4">
              {footerLinks.solutions.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.solutions.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-white hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-normal text-gray-400 mb-4">
              {footerLinks.about.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.about.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-white hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-normal text-gray-400 mb-4">
              {footerLinks.resources.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-white hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-4 md:mb-0">
            Copyright © 2025 Ruleout AI Corporation. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
