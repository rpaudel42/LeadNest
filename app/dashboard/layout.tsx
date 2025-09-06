import MerchantSidebar from '@/components/MerchantSidebar';
import MerchantTopbar from '@/components/MerchantTopbar';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <MerchantSidebar />
        <div className="flex-1 flex flex-col">
          <MerchantTopbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
