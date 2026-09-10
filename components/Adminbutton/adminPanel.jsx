import Link from 'next/link';
import styles from './style.module.css';


const AdminButton=({title,href})=>{
    return(
        <Link href={href}className={styles.adminButton}>
            <h3>{title}</h3>
        </Link>
    )
}

export default AdminButton;