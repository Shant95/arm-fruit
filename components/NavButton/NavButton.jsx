import Link from 'next/link';
import styles from './style.module.css';

const NavButton = ({ text, href = '/', style = {} }) => {
    return (
        <Link href={href} className={styles.NavButton}>
            <p style={style} suppressHydrationWarning>{text}</p>
        </Link>
    );
};

export default NavButton;