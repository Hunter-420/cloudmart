import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>☁️ CloudMart</div>
      <ul className={styles.navLinks}>
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li><a href="/cart">Cart</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
