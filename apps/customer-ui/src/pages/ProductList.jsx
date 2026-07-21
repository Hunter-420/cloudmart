import { useEffect, useState } from 'react';
import { getProducts, addToCart } from '../services/api';
import ProductCard from '../components/ProductCard';
import styles from './ProductList.module.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({ limit: 20 });
        setProducts(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      alert('Added to cart!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className={styles.state}>Loading products...</div>;
  if (error) return <div className={styles.stateError}>Error: {error}. Make sure the API Gateway is running.</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} {...product} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
