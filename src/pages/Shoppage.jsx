import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';

const Shop = ({ refreshCartCount }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [wishlistIds, setWishlistIds] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filters - initialize category from URL if present
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const catParam = searchParams.get('category');
    return catParam ? [parseInt(catParam)] : [];
  });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([1, 500]);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting and display
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('default');
  const [gridCols, setGridCols] = useState(3);

  // Expand/collapse sections
  const [showCategories, setShowCategories] = useState(true);
  const [showBrands, setShowBrands] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [cartToast, setCartToast] = useState('');

  // FETCH PRODUCTS — now with API filtering
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params from filters
      const params = new URLSearchParams();

      if (selectedCategories.length > 0) {
        params.append('categories', selectedCategories.join(','));
      }

      if (selectedBrands.length > 0) {
        params.append('brands', selectedBrands.join(','));
      }

      // Only send price filters if they differ from default
      if (priceRange[0] > 1) {
        params.append('min_price', priceRange[0]);
      }
      if (priceRange[1] < 500) {
        params.append('max_price', priceRange[1]);
      }

      if (sortBy !== 'default') {
        params.append('sort', sortBy);
      }

      params.append('per_page', productsPerPage);
      params.append('page', currentPage);

      const response = await api.get(`/products?${params.toString()}`);

      // Handle Laravel paginate response structure
      let productData = [];
      let total = 0;
      let lastPageNum = 1;

      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        // Laravel paginate: data.data.data = items, data.data.total = total
        productData = response.data.data.data;
        total = response.data.data.total || productData.length;
        lastPageNum = response.data.data.last_page || 1;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        productData = response.data.data;
        total = productData.length;
      } else if (Array.isArray(response.data)) {
        productData = response.data;
        total = productData.length;
      }

      setProducts(productData);
      setTotalResults(total);
      setLastPage(lastPageNum);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalResults(0);
      setLastPage(1);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [selectedCategories, selectedBrands, priceRange, sortBy, productsPerPage, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      let catData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        catData = response.data.data;
      } else if (Array.isArray(response.data)) {
        catData = response.data;
      }
      setCategories(catData);
    } catch (error) {
      console.error('Categories error:', error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      let brandData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        brandData = response.data.data;
      } else if (Array.isArray(response.data)) {
        brandData = response.data;
      }
      setBrands(brandData);
    } catch (error) {
      console.error('Brands error:', error);
      setBrands([]);
    }
  };

  // Initial load for categories and brands (once)
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchWishlistIds();
  }, []);

  // Fetch user's wishlisted product IDs
  const fetchWishlistIds = async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        const items = Array.isArray(res.data.data) ? res.data.data : Object.values(res.data.data || {});
        setWishlistIds(items.map(i => i.product_id));
      }
    } catch (e) { /* not logged in */ }
  };

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (wishlistIds.includes(productId)) {
        await api.delete(`/wishlist/remove/${productId}`);
        setWishlistIds(prev => prev.filter(id => id !== productId));
      } else {
        await api.post('/wishlist/add', { product_id: productId });
        setWishlistIds(prev => [...prev, productId]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  // Refetch products whenever filters, sorting, or pagination changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add to Cart handler
  const addToCart = async (product) => {
    try {
      const price = parseFloat(product.wholesale_price || product.regular_price || 0);
      const response = await api.post('/cart/add', {
        product_id: product.id,
        quantity: 1,
        price: price
      });

      if (response.data.success) {
        if (refreshCartCount) refreshCartCount();
        setCartToast(`"${product.name}" added to cart!`);
        setTimeout(() => setCartToast(''), 3000);
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        setCartToast('Please login to add items to cart');
        setTimeout(() => { setCartToast(''); navigate('/login'); }, 1500);
      } else if (error.response?.data?.message) {
        setCartToast(error.response.data.message);
        setTimeout(() => setCartToast(''), 3000);
      }
    }
  };

  // Toggle handlers — reset to page 1 when filters change
  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  // Price range change — debounce slightly or reset page
  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1);
  };

  // Grid column classes based on selection
  const getGridClasses = () => {
    const base = 'grid gap-6 ';
    switch (gridCols) {
      case 2:
        return base + 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return base + 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return base + 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return base + 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Calculate display range
  const startIndex = products.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * productsPerPage, totalResults);

  // Helper to safely get category/brand name from product
  const getCategoryName = (product) => {
    if (!product.category) return '';
    if (typeof product.category === 'string') return product.category;
    return product.category.categoryName || product.category.name || '';
  };

  const getBrandName = (product) => {
    if (!product.brand) return '';
    if (typeof product.brand === 'string') return product.brand;
    return product.brand.brandName || product.brand.name || '';
  };

  if (initialLoad && loading && products.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Cart Toast Notification */}
      {cartToast && (
        <div className="fixed top-24 right-6 z-50 animate-slideIn">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm">
            <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs">✓</span>
            <span>{cartToast}</span>
            <button onClick={() => setCartToast('')} className="ml-2 text-gray-400 hover:text-white text-lg">&times;</button>
          </div>
        </div>
      )}
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-slate-900">HOME</Link>
          <span>/</span>
          <span className="text-slate-900">THE SHOP</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            {/* Product Categories */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center justify-between w-full py-2 text-sm font-semibold text-slate-900 uppercase tracking-wide"
              >
                Product Categories
                {showCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showCategories && (
                <div className="mt-3 space-y-2">
                  {categories.map((cat, index) => (
                    <label key={index} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => toggleCategory(cat.name)}
                          className="w-4 h-4 border-gray-300 rounded text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-slate-900 transition-colors">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">{cat.count}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Brands */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <button
                onClick={() => setShowBrands(!showBrands)}
                className="flex items-center justify-between w-full py-2 text-sm font-semibold text-slate-900 uppercase tracking-wide"
              >
                Brands
                {showBrands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showBrands && (
                <div className="mt-3 space-y-2">
                  {brands.map((brand, index) => (
                    <label key={index} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.name)}
                          onChange={() => toggleBrand(brand.name)}
                          className="w-4 h-4 border-gray-300 rounded text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-slate-900 transition-colors">
                          {brand.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">{brand.count}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="pb-4">
              <button
                onClick={() => setShowPrice(!showPrice)}
                className="flex items-center justify-between w-full py-2 text-sm font-semibold text-slate-900 uppercase tracking-wide"
              >
                Price
                {showPrice ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showPrice && (
                <div className="mt-4">
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                      className="absolute h-2 bg-slate-900 rounded-full"
                      style={{
                        left: `${(priceRange[0] / 500) * 100}%`,
                        right: `${100 - (priceRange[1] / 500) * 100}%`
                      }}
                    />
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
                      className="absolute w-full h-2 opacity-0 cursor-pointer"
                    />
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                      className="absolute w-full h-2 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>Min Price: ₱{priceRange[0]}</span>
                    <span>Max Price: ₱{priceRange[1]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing {totalResults > 0 ? `${startIndex} to ${endIndex}` : '0'} of {totalResults} results
              </p>

              <div className="flex items-center gap-4">
                {/* Items Per Page */}
                <div className="relative">
                  <select
                    value={productsPerPage}
                    onChange={(e) => {
                      setProductsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-gray-200 text-sm text-gray-700 py-2 pl-3 pr-8 rounded cursor-pointer hover:border-gray-300 focus:outline-none focus:border-gray-400"
                  >
                    <option value={12}>SHOW</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={102}>102</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort By */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-gray-200 text-sm text-gray-700 py-2 pl-3 pr-8 rounded cursor-pointer hover:border-gray-300 focus:outline-none focus:border-gray-400"
                  >
                    <option value="default">DEFAULT</option>
                    <option value="date-new">DATE, NEW TO OLD</option>
                    <option value="date-old">DATE, OLD TO NEW</option>
                    <option value="price-low">PRICE, LOW TO HIGH</option>
                    <option value="price-high">PRICE, HIGH TO LOW</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="mr-1">VIEW</span>
                  {[2, 3, 4].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setGridCols(cols)}
                      className={`w-6 h-6 flex items-center justify-center text-xs rounded ${gridCols === cols
                        ? 'text-slate-900 font-semibold'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">No products found.</p>
              </div>
            ) : (
              <div className={getGridClasses()}>
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group block"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x300/cccccc/666666?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}

                      {/* Heart icon */}
                      <button
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm opacity-100 transition-opacity hover:bg-gray-50"
                        onClick={(e) => toggleWishlist(e, product.id)}
                      >
                        <Heart className={`h-4 w-4 transition-colors ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                      </button>

                      {/* Add to Cart overlay */}
                      <div
                        className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-full bg-white text-slate-900 text-sm font-semibold uppercase tracking-wide py-3 px-4 shadow-lg hover:bg-slate-900 hover:text-white transition-colors duration-300"
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {getCategoryName(product)}
                    </div>
                    <h3 className="font-medium text-slate-900 mb-2 line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        WholeSale Price: <span className="font-medium">₱{parseFloat(product.wholesale_price || 0).toFixed(2)}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Retail Price: <span className="font-medium">₱{parseFloat(product.retail_price || 0).toFixed(2)}</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination — now using API last_page */}
            {lastPage > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>

                {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center border rounded ${currentPage === page
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                  disabled={currentPage === lastPage}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                ANA'S
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your trusted inventory management solution for frozen goods and retail products.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Contact
              </h4>
              <p className="text-sm text-gray-500">
                support@Anas.com
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-400">
              © 2026 . All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Shop;