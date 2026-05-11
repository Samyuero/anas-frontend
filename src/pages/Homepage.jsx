import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer';

import { BASE_URL } from '../config';
const Homepage = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes, slideRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/slides'),
      ]);
      const allProducts = prodRes.data?.data?.data || prodRes.data?.data || prodRes.data || [];
      setProducts(Array.isArray(allProducts) ? allProducts : []);
      const cats = catRes.data?.data || catRes.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
      const allSlides = slideRes.data?.data || [];
      setSlides(Array.isArray(allSlides) ? allSlides : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getProductImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${BASE_URL}/uploads/products/${img}`;
  };

  const getSlideImageUrl = (slide) => {
    if (slide.image_url) return slide.image_url;
    if (slide.image) return `${BASE_URL}/uploads/slides/${slide.image}`;
    return '';
  };

  const getPrice = (p) => {
    const sale = parseFloat(p.sale_price);
    const regular = parseFloat(p.regular_price);
    return sale > 0 ? sale : regular;
  };

  const getProductLink = (product) => {
    if (product.slug) return `/product/${product.slug}`;
    return `/product/${product.id}`;
  };

  // Find the brand name for a slide by matching its title to a product
  const getSlideBrand = (slide) => {
    if (!slide) return '';
    const match = products.find(p =>
      p.name && slide.title &&
      (p.name.toLowerCase().includes(slide.title.toLowerCase()) ||
       slide.title.toLowerCase().includes(p.name.toLowerCase()))
    );
    return match?.brand?.brandName || '';
  };

  const getFeatured = () => {
    const featured = products.filter(p => p.featured === 1 || p.featured === true);
    return featured.length > 0 ? featured : products.slice(0, 8);
  };

  const activeSlide = slides[currentSlide];
  const featuredProducts = getFeatured();

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const getCategoryImageUrl = (cat) => {
    if (cat.image) {
      if (cat.image.startsWith('http')) return cat.image;
      return `${BASE_URL}/uploads/categories/${cat.image}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slideshow */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
        {/* Background Text - from slide tagline */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none select-none z-0">
          <span className="text-[10rem] md:text-[16rem] font-bold text-gray-100 tracking-widest">
            {activeSlide ? activeSlide.tagline?.split(' ')[0]?.toUpperCase() || 'NEW' : 'NEW'}
          </span>
        </div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none select-none z-0">
          <span className="text-[6rem] md:text-[10rem] font-bold text-gray-100 tracking-widest">
            {activeSlide ? activeSlide.tagline?.split(' ').slice(1).join(' ')?.toUpperCase() || 'ARRIVAL' : 'ARRIVAL'}
          </span>
        </div>

        {activeSlide ? (
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[500px] z-10">
            <div>
              {/* Brand Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-gray-400"></div>
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-gray-500">
                  {getSlideBrand(activeSlide) || 'Brands'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-2 tracking-wide leading-tight">
                {activeSlide.title}
              </h1>
              {/* Subtitle */}
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 italic mb-8">
                {activeSlide.subTitle}
              </h2>

              {/* Shop Now */}
              <a href={activeSlide.link} target={activeSlide.link?.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                className="inline-block text-sm font-medium text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors mb-12">
                Learn More
              </a>

              {/* Slide Controls */}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <button onClick={prevSlide} className="hover:text-gray-700 transition-colors p-1"><ChevronLeft size={16} /></button>
                {slides.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-gray-900 w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'}`} />
                ))}
                <button onClick={nextSlide} className="hover:text-gray-700 transition-colors p-1"><ChevronRight size={16} /></button>
                <span className="ml-2">
                  <span className="text-gray-900 font-medium">{String(currentSlide + 1).padStart(2, '0')}</span>
                  <span className="mx-1">——</span>
                  <span>{String(slides.length).padStart(2, '0')}</span>
                </span>
              </div>
            </div>

            {/* Slide Image */}
            <div className="flex items-center justify-center">
              <img key={currentSlide} src={getSlideImageUrl(activeSlide)} alt={activeSlide.title}
                className="w-80 md:w-[28rem] h-80 md:h-[28rem] object-contain drop-shadow-2xl animate-fadeIn"
                onError={(e) => { e.target.src = '/images/placeholder.png'; }} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[500px] z-10 relative">
            <p className="text-gray-400">{loading ? 'Loading...' : 'No slides available. Add slides from admin panel.'}</p>
          </div>
        )}
      </div>

      {/* Product Categories - Display Only (not clickable) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
        <h3 className="text-center text-sm font-medium tracking-widest uppercase text-gray-500 mb-8">Product Categories</h3>
        <div className="relative">
          <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
            onClick={() => document.getElementById('catCarousel').scrollBy({ left: -220, behavior: 'smooth' })}>
            <ChevronLeft size={20} />
          </button>

          <div id="catCarousel" className="flex gap-4 overflow-x-auto scroll-smooth px-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.length > 0 ? categories.map((cat) => {
              const catName = cat.categoryName || cat.name;
              const catImg = getCategoryImageUrl(cat);
              return (
                <div key={cat.id} className="flex-shrink-0 w-40">
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    {catImg ? (
                      <img src={catImg} alt={catName}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
                    )}
                  </div>
                  <p className="text-xs text-center text-gray-600 font-medium">{catName}</p>
                </div>
              );
            }) : (
              <p className="text-gray-400 text-sm">No categories yet</p>
            )}
          </div>

          <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
            onClick={() => document.getElementById('catCarousel').scrollBy({ left: 220, behavior: 'smooth' })}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Featured Products - Centered */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-medium tracking-widest uppercase text-gray-500">Featured Products</h3>
            <Link to="/shop" className="text-xs text-gray-500 hover:text-slate-900 underline">View All</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            {featuredProducts.slice(0, 8).map((product) => (
              <Link key={product.id} to={getProductLink(product)} className="group w-full">
                <div className="aspect-[4/5] bg-gray-50 rounded-lg mb-3 overflow-hidden relative border border-gray-100 mx-auto">
                  <img src={getProductImageUrl(product.image)} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <h4 className="text-sm font-medium text-slate-900 mb-1 truncate text-center">{product.name}</h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium text-slate-900">₱{getPrice(product).toFixed(2)}</span>
                  {parseFloat(product.sale_price) > 0 && parseFloat(product.sale_price) < parseFloat(product.regular_price) && (
                    <span className="text-xs text-gray-400 line-through">₱{parseFloat(product.regular_price).toFixed(2)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default Homepage;