import Link from "next/link";
import { Facebook, Youtube, Instagram, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-serif text-xl font-bold text-white">Unkora</span>
            </div>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              বাংলাদেশের প্রিমিয়াম অনলাইন শপ। বই, লেদার, বেবি প্রোডাক্ট, ইসলামিক পণ্য ও অর্গানিক ফুড।
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "https://facebook.com/unkora", label: "Facebook" },
                { icon: Youtube, href: "https://youtube.com/@unkora", label: "YouTube" },
                { icon: Instagram, href: "https://instagram.com/unkora", label: "Instagram" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-charcoal-700 hover:bg-primary-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">শপিং</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: "বই", href: "/category/books" },
                { name: "লেদার পণ্য", href: "/category/leather" },
                { name: "বেবি প্রোডাক্ট", href: "/category/baby" },
                { name: "ইসলামিক লাইফস্টাইল", href: "/category/islamic" },
                { name: "অর্গানিক ফুড", href: "/category/organic" },
                { name: "ফ্ল্যাশ সেল", href: "/flash-sale" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary-400 transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">অ্যাকাউন্ট</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: "লগইন / রেজিস্ট্রেশন", href: "/auth/login" },
                { name: "আমার অর্ডার", href: "/account/orders" },
                { name: "উইশলিস্ট", href: "/account/wishlist" },
                { name: "প্রোফাইল", href: "/account" },
                { name: "লয়্যালটি পয়েন্ট", href: "/account/loyalty" },
                { name: "রিভিউ", href: "/account/reviews" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary-400 transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">যোগাযোগ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>support@unkora.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2">পেমেন্ট পদ্ধতি</p>
              <div className="flex gap-2 flex-wrap">
                {["bKash", "Nagad", "SSL", "COD"].map((p) => (
                  <span
                    key={p}
                    className="px-2 py-1 bg-charcoal-700 rounded text-xs text-gray-300"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-charcoal-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Unkora. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300">গোপনীয়তা নীতি</Link>
            <Link href="/terms" className="hover:text-gray-300">শর্তাবলী</Link>
            <Link href="/return-policy" className="hover:text-gray-300">রিটার্ন পলিসি</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
