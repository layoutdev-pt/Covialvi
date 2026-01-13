import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SellPropertyWizard } from '@/components/sell-property-wizard';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <SellPropertyWizard />
      <Footer />
    </div>
  );
}
