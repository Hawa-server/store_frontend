import { Link } from "react-router-dom";
import PageContainer from "./PageContainer";
import Logo from "./ui/Logo";
import { useCurrency } from "../context/CurrencyContext";
import { useCategories } from "../context/CategoriesContext";

export default function Footer() {
  const { categories } = useCategories();
  const { settings } = useCurrency();
  const rate = settings?.usdRate ? ` US$ 1 = GH₵ ${settings.usdRate.toFixed(2)}.` : "";

  return (
    <footer className="mt-20 bg-footer text-on-footer lg:mt-28">
      <PageContainer className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr] lg:py-16">
        <div>
          <Logo tone="footer" />
          <p className="mt-3 max-w-sm text-on-footer/85">
            Pay with mobile money. Delivery across Ghana.
          </p>
          <p className="mt-6 max-w-sm text-sm text-on-footer/70">
            Prices are charged in Ghana cedis (GH₵).{rate}
          </p>
        </div>

        {categories.length > 0 && (
          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-on-footer/70 uppercase">Shop</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-6">
              <li>
                <Link
                  to="/products"
                  className="inline-flex min-h-11 items-center text-on-footer/90 hover:text-on-footer hover:underline focus-visible:outline-on-footer"
                >
                  All products
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="inline-flex min-h-11 items-center text-on-footer/90 hover:text-on-footer hover:underline focus-visible:outline-on-footer"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageContainer>
      <div className="border-t border-on-footer/15">
        <PageContainer className="py-5 text-sm text-on-footer/70">
          © {new Date().getFullYear()} ADORN
        </PageContainer>
      </div>
    </footer>
  );
}
