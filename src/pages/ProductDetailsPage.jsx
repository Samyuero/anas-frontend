import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, Share2, Minus, Plus, Star } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer';

import { BASE_URL } from '../config';
const ProductDetailsPage = ({ refreshCartCount }) => {
  const { slug } = useParams(); // This receives either slug or id from the URL
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // Review form state - auto-fill from logged-in user
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [reviewForm, setReviewForm] = useState({
    name: loggedInUser?.name || loggedInUser?.firstName ? `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim() : '',
    email: loggedInUser?.email || '',
    rating: 5,
    review: ''
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  // Check if product is in wishlist after product loads
  useEffect(() => {
    if (product && loggedInUser) {
      checkWishlistStatus();
    }
  }, [product]);

  const checkWishlistStatus = async () => {
    try {
      const res = await api.post('/wishlist/check', { product_id: product.id });
      if (res.data.success) {
        setInWishlist(res.data.in_wishlist);
      }
    } catch (e) { /* ignore if not logged in */ }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${slug}`);
      const data = response.data.data || response.data;
      setProduct(data);
      if (data.related_products) {
        setRelatedProducts(data.related_products);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const price = product.sale_price || product.retail_price || product.regular_price;
      const response = await api.post('/cart/add', {
        product_id: product.id,
        quantity: quantity,
        price: parseFloat(price)
      });
      if (response.data.success) {
        setInCart(true);
        setCartMessage('Item added to cart!');
        if (refreshCartCount) refreshCartCount();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        setCartMessage('Please login to add items to cart');
      } else if (error.response?.data?.message) {
        setCartMessage(error.response.data.message);
      } else {
        setCartMessage('Error adding to cart');
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!loggedInUser) {
      setCartMessage('Please login to use wishlist');
      return;
    }
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/remove/${product.id}`);
        setInWishlist(false);
      } else {
        await api.post('/wishlist/add', { product_id: product.id });
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.email || !reviewForm.review) return;

    setReviewSubmitting(true);
    setReviewMessage('');
    try {
      const response = await api.post(`/products/${product.id}/reviews`, reviewForm);
      if (response.data.success) {
        setReviewMessage('Review submitted successfully!');
        setReviewForm({ name: '', email: '', rating: 5, review: '' });
        // Re-fetch product to get updated reviews & average
        fetchProduct();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.data?.message) {
        setReviewMessage(error.response.data.message);
      } else {
        setReviewMessage('Error submitting review. Please try again.');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getAllImages = () => {
    if (!product) return [];
    // Handle both array and string formats
    if (Array.isArray(product.images)) {
      return product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    }
    const images = [];
    if (product.image) images.push(product.image);
    if (typeof product.images === 'string' && product.images) {
      const gallery = product.images.split(',').filter(img => img.trim());
      images.push(...gallery);
    }
    return images;
  };

  // Render star rating (filled/empty)
  const renderStars = (rating, size = 'w-4 h-4') => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  const images = getAllImages();
  // Determine if images are full URLs or just filenames
  const getImageSrc = (img) => {
    if (!img) return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='674' height='674'%3E%3Crect width='674' height='674' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
    if (img.startsWith('http')) return img;
    return `${BASE_URL}/uploads/products/${img}`;
  };

  const displayPrice = product.sale_price || product.retail_price || product.regular_price;
  const originalPrice = product.regular_price || product.wholesale_price;
  const averageRating = product.average_rating || 0;
  const reviewsCount = product.reviews_count || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-slate-900">HOME</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-slate-900">THE SHOP</Link>
          <span>/</span>
          <span className="text-slate-900">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 relative group">
              <img
                src={getImageSrc(images[selectedImage] || images[0])}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='674' height='674'%3E%3Crect width='674' height='674' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"; }}
              />
              {/* Left/Right Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  {/* Image counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                    {selectedImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-slate-900' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img
                      src={getImageSrc(img)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {renderStars(averageRating)}
              </div>
              <span className="text-sm text-gray-500">
                {averageRating > 0 ? `${averageRating} / 5` : ''} ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <div className="mb-4">
              {product.sale_price && product.sale_price > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 line-through text-lg">₱{parseFloat(originalPrice).toFixed(2)}</span>
                  <span className="text-2xl font-semibold text-slate-900">₱{parseFloat(product.sale_price).toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-2xl font-semibold text-slate-900">₱{parseFloat(originalPrice).toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{product.short_description}</p>

            {/* Cart Message */}
            {cartMessage && (
              <div className={`mb-4 p-3 rounded text-sm ${inCart ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {cartMessage}
              </div>
            )}

            {/* Add to Cart */}
            {inCart ? (
              <Link to="/cart" className="inline-block px-8 py-3 bg-yellow-500 text-white rounded font-medium hover:bg-yellow-600 transition-colors mb-4">
                Go to Cart
              </Link>
            ) : (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:text-slate-900"><Minus className="w-4 h-4" /></button>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 text-center py-2 border-x border-gray-300 text-sm" min="1" />
                  <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 hover:text-slate-900"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={handleAddToCart} className="px-8 py-3 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors">Add to Cart</button>
              </div>
            )}

            <div className="flex items-center gap-6 mb-6">
              <button onClick={handleToggleWishlist} className={`flex items-center gap-2 text-sm ${inWishlist ? 'text-red-500' : 'text-gray-600 hover:text-slate-900'}`}>
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
                <span>{inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex gap-2 text-sm"><span className="text-gray-500 font-medium">SKU:</span><span className="text-gray-700">{product.SKU || product.sku}</span></div>
              <div className="flex gap-2 text-sm"><span className="text-gray-500 font-medium">Categories:</span><span className="text-gray-700">{product.category?.categoryName || product.category?.name || 'N/A'}</span></div>
              <div className="flex gap-2 text-sm"><span className="text-gray-500 font-medium">Tags:</span><span className="text-gray-700">{product.brand?.brandName || product.brand?.name || 'N/A'}</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-t border-gray-200">
          <div className="flex gap-8 border-b border-gray-200">
            {['description', 'additional', 'reviews'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-500 hover:text-slate-900'}`}>
                {tab === 'description' ? 'Description' : tab === 'additional' ? 'Additional Information' : `Reviews (${reviewsCount})`}
              </button>
            ))}
          </div>
          <div className="py-8">
            {activeTab === 'description' && <div className="text-gray-600 text-sm leading-relaxed">{product.description}</div>}
            {activeTab === 'additional' && (
              <div className="space-y-3">
                <div className="flex gap-4 text-sm"><span className="font-medium text-slate-900 w-32">Weight</span><span className="text-gray-600">{product.weight || '1.25'} kg</span></div>
                <div className="flex gap-4 text-sm"><span className="font-medium text-slate-900 w-32">Dimensions</span><span className="text-gray-600">{product.dimensions || '90 x 60 x 90 cm'}</span></div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Average Rating Summary */}
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-900">{averageRating > 0 ? averageRating : '—'}</div>
                    <div className="text-sm text-gray-500 mt-1">out of 5</div>
                  </div>
                  <div>
                    <div className="flex mb-1">{renderStars(averageRating, 'w-5 h-5')}</div>
                    <p className="text-sm text-gray-500">{reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}</p>
                  </div>
                </div>

                {/* Existing Reviews */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                  {(product.reviews && product.reviews.length > 0) ? product.reviews.map((review) => (
                    <div key={review.id || review.name} className="flex gap-4 pb-6 mb-6 border-b border-gray-100 last:border-0">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{review.name?.charAt(0)?.toUpperCase() || '?'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h6 className="font-medium text-sm text-slate-900">{review.name}</h6>
                          <div className="flex">{renderStars(review.rating, 'w-3 h-3')}</div>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{review.created_at}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.review}</p>
                      </div>
                    </div>
                  )) : <p className="text-gray-500 text-sm mb-6">No reviews yet. Be the first to review this product!</p>}
                </div>

                {/* Write a Review Form */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

                  {reviewMessage && (
                    <div className={`mb-4 p-3 rounded text-sm ${reviewMessage.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {reviewMessage}
                    </div>
                  )}

                  {loggedInUser ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4 max-w-xl">
                      {/* Posting as */}
                      <p className="text-sm text-gray-500">
                        Posting as <span className="font-medium text-slate-800">{reviewForm.name}</span> ({reviewForm.email})
                      </p>

                      {/* Star Rating Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-7 h-7 cursor-pointer ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review *</label>
                        <textarea
                          value={reviewForm.review}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                          required
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 resize-none"
                          placeholder="Share your experience with this product..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="px-8 py-3 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-600 text-sm mb-3">Please log in to write a review.</p>
                      <Link to="/login" className="inline-block px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                        Log In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold uppercase mb-6">Related <strong>Products</strong></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((rp) => (
                <Link key={rp.id} to={`/product/${rp.id}`} className="group">
                  <div className="aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden mb-3">
                    <img src={getImageSrc(rp.image)} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='330' height='400'%3E%3Crect width='330' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"; }} />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{rp.category?.categoryName || rp.category?.name}</p>
                  <h6 className="text-sm font-medium text-slate-900 mb-1">{rp.name}</h6>
                  <span className="text-sm text-slate-900">₱{parseFloat(rp.sale_price || rp.regular_price).toFixed(2)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;