import styles from './style.module.css';
import LogoImage from '../../public/images/logo.png';
import Image from 'next/image';
import Link from 'next/link';



const Logo =()=>{
    return(
        <div className={styles.logo}>
            <Link className={styles.link} href='/'>
            <div className={styles.images}>
                <Image className={styles.img} src={LogoImage} alt='LogoImage' />
            </div>
            <div className={styles.header}>
                <h3 className={styles.title}>Arm Food City</h3>
            </div>
            </Link>
        </div>
    )
}

export default Logo;