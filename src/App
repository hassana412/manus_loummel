import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { SiteShell } from "./components/SiteShell";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import CategoriesPage from "./pages/CategoriesPage";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import MyOrders from "./pages/MyOrders";
import OrderSuccess from "./pages/OrderSuccess";
import ProductPage from "./pages/ProductPage";
import SearchPage from "./pages/SearchPage";
import SellerDashboard from "./pages/SellerDashboard";
import SellerOnboarding from "./pages/SellerOnboarding";
import SellerOrders from "./pages/SellerOrders";
import SellerProducts from "./pages/SellerProducts";
import SellerShopEdit from "./pages/SellerShopEdit";
import SellerWallet from "./pages/SellerWallet";
import ShopPage from "./pages/ShopPage";
import ShopsList from "./pages/ShopsList";
import VipUpgrade from "./pages/VipUpgrade";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/recherche" component={SearchPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/boutiques" component={ShopsList} />
      <Route path="/boutique/:slug" component={ShopPage} />
      <Route path="/produit/:id" component={ProductPage} />
      <Route path="/panier" component={Cart} />
      <Route path="/commande" component={Checkout} />
      <Route path="/commande/succes/:id" component={OrderSuccess} />
      <Route path="/mes-commandes" component={MyOrders} />

      <Route path="/devenir-partenaire" component={SellerOnboarding} />
      <Route path="/creer-ma-boutique" component={SellerOnboarding} />
      <Route path="/vendeur" component={SellerDashboard} />
      <Route path="/vendeur/produits" component={SellerProducts} />
      <Route path="/vendeur/commandes" component={SellerOrders} />
      <Route path="/vendeur/wallet" component={SellerWallet} />
      <Route path="/vendeur/boutique" component={SellerShopEdit} />
      <Route path="/vendeur/vip" component={VipUpgrade} />

      <Route path="/admin" component={AdminDashboard} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <CartProvider>
            <SiteShell>
              <Router />
            </SiteShell>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
