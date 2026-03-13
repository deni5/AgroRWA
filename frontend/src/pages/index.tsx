import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-green-700 text-white py-24 text-center">
        <h1 className="text-5xl font-bold mb-6">AgroRWA</h1>
        <p className="text-xl max-w-2xl mx-auto mb-10">
          Tokenization of agricultural assets. Invest in real farms and harvest yields using blockchain.
        </p>
        <Link href="/marketplace">
          <button className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold">Explore Marketplace</button>
        </Link>
      </section>

      <section className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Tokenized Farm Assets</h3>
            <p className="text-gray-600">Agricultural projects are converted into blockchain tokens, allowing fractional investment.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Farmer Ratings</h3>
            <p className="text-gray-600">Each farm has a reliability score based on historical yields and verification audits.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Secondary Market</h3>
            <p className="text-gray-600">Trade farm tokens on the marketplace before the harvest date.</p>
          </div>
        </div>
      </section>

      <section className="text-center py-16">
        <h2 className="text-3xl font-bold mb-6">Start investing in agriculture today</h2>
        <Link href="/marketplace">
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg">Go to Marketplace</button>
        </Link>
      </section>
    </div>
  )
}
