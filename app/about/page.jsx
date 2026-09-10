import styles from './style.module.css';
import Image from 'next/image';
import aboutimg from '../../public/images/aboutimg.webp';

export const metadata = {
    title: "О компании Armfruit | Доставка свежих фруктов в Москве",
    description: "Узнайте больше о компании Armfruit. Мы доставляем свежие фрукты, овощи, сухофрукты и орехи с 2024 года. Качество, забота о клиентах, быстрая доставка.",
    keywords: "о компании, Armfruit, Arm food City, доставка фруктов Москва, свежие продукты, качественные фрукты",
    openGraph: {
        title: "О компании Armfruit",
        description: "История, ценности и преимущества нашей компании",
        type: "website",
        locale: "ru_RU",
    },
    alternates: {
        canonical: "https://armfruit.ru/about",
    },
};

export default function About() {
    return (
        <div className={styles.about}>
            <div className={styles.title}>
                <h1>О нас</h1>
            </div>
            <div className={styles.container}>
                <div className={styles.image}>
                    <Image className={styles.img} src={aboutimg} alt='О компании Armfruit' />
                </div>
                <div className={styles.text}>
                    <h2>Добро пожаловать в</h2>
                    <h3>Arm food City</h3>
                    <p>«Arm food City» — организация, деятельность которой направлена на то, чтобы облегчить Вашу повседневную жизнь: сделать процесс покупок проще, предложив онлайн-покупки и услуги доставки. «Arm food City» — это онлайн-платформа, на которой представлен выбор отборных фруктов, овощей, сухофруктов, орехов. Наша специализированная команда с большой ответственностью, добросовестно и с любовью организует весь процесс, начиная от тщательного отбора продуктов, упаковки и заканчивая доставкой до Вашей двери. На армянском рынке наша компания первая сломала стереотипы: что продукт следует увидеть, потрогать, а затем купить. Мы упорным трудом заслужили доверие клиентов.</p>
                </div>
            </div>
        </div>
    );
}