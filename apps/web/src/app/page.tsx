// apps/web/src/app/page.tsx
import Link from 'next/link';
import Navbar from '../components/Navbar'; // Переконайся, що шлях правильний

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 pb-12 max-w-7xl mx-auto">
      <Header />

      {/* Головний банер (Hero Section) */}
      <section className="bg-white rounded-[2rem] p-10 md:p-14 mb-12 shadow-sm border border-green-50">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a4328] mb-4 leading-tight">
          Agricultural Assets<br />
          Tokenized & Verified
        </h1>
        <p className="text-lg text-[#2d6a4f] mb-8 max-w-3xl">
          Farmers issue tokens backed by real crops, equipment, and land. Certified oracles verify every asset. Investors trade with confidence.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/marketplace" className="bg-[#1a4328] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#2d6a4f] transition-colors shadow-md">
            Browse Assets
          </Link>
          <Link href="/create-asset" className="bg-[#2d6a4f] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#40916c] transition-colors shadow-md">
            List Your Asset
          </Link>
          <Link href="/kyc" className="bg-green-100 text-[#1a4328] px-6 py-3 rounded-xl font-medium hover:bg-green-200 transition-colors">
            Register as Emitter
          </Link>
        </div>
      </section>

      {/* Секція типів токенів */}
      <section>
        <h2 className="text-2xl font-bold text-[#1a4328] mb-6 px-2">Four Types of Agricultural Tokens</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Картка 1: Forward Token */}
          <div className="bg-white rounded-[2rem] p-8 flex flex-col justify-between shadow-sm border border-green-50 hover:shadow-md transition-shadow">
            <div>
              <div className="text-5xl mb-6">🌾</div>
              <h3 className="text-xl font-bold text-[#1a4328] mb-3">Forward Token</h3>
              <p className="text-[#2d6a4f] mb-8">
                Future harvest rights. Price anchored to Pyth spot × discount.
              </p>
            </div>
            <Link href="/market" className="text-[#1a4328] font-semibold hover:underline flex items-center">
              Explore Markets <span className="ml-1">↗</span>
            </Link>
          </div>

          {/* Картка 2: Asset Token */}
          <div className="bg-white rounded-[2rem] p-8 flex flex-col justify-between shadow-sm border border-green-50 hover:shadow-md transition-shadow">
            <div>
              <div className="text-5xl mb-6">🚜</div>
              <h3 className="text-xl font-bold text-[#1a4328] mb-3">Asset Token</h3>
              <p className="text-[#2d6a4f] mb-8">
                Equipment, commodity, land. Backed by oracle-appraised collateral.
              </p>
            </div>
            <Link href="/marketplace" className="text-[#1a4328] font-semibold hover:underline flex items-center">
              View Collaterals <span className="ml-1">↗</span>
            </Link>
          </div>

          {/* Картка 3: Credit Token */}
          <div className="bg-white rounded-[2rem] p-8 flex flex-col justify-between shadow-sm border border-green-50 hover:shadow-md transition-shadow">
            <div>
              <div className="text-5xl mb-6">💳</div>
              <h3 className="text-xl font-bold text-[#1a4328] mb-3">Credit Token</h3>
              <p className="text-[#2d6a4f] mb-8">
                10-25% APY agricultural bonds with quarterly coupon payments.
              </p>
            </div>
            <Link href="/portfolio" className="text-[#1a4328] font-semibold hover:underline flex items-center">
              Provide Liquidity <span className="ml-1">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
