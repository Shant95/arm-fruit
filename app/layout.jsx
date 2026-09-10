import "./globals.css";
import Header from '../components/Header/header';
import Footer from '../components/Footer/footer';

export const metadata = {
  title: "Armfruit",
  description: "Мой сайт на Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <div className="App">
          <Header />
          <div className="Container">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}