import styles from './ProductCard.module.css';

const ProductCard = ({ id, name, price, description, stock, imageUrl, onAddToCart }) => {
  return (
    <div className={styles.card}>
      <img
        src={imageUrl || `https://placehold.co/300x180?text=${encodeURIComponent(name)}`}
        alt={name}
        className={styles.image}
      />
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description?.substring(0, 80)}...</p>
        <div className={styles.footer}>
          <span className={styles.price}>${price?.toFixed(2)}</span>
          <span className={stock > 0 ? styles.inStock : styles.outOfStock}>
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </span>
        </div>
        <button
          className={styles.addBtn}
          disabled={stock === 0}
          onClick={() => onAddToCart && onAddToCart(id)}
        >
          {stock > 0 ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
