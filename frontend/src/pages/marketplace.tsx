type Asset = {
  id: string
  name: string
  farmer: string
  location: string
  crop: string
  expectedYield: number
  tokenSupply: number
  pricePerToken: number
  harvestDate: string
  riskScore: number
}

const mockAssets: Asset[] = [
  {
    id: 'farm1',
    name: 'Wheat Harvest 2026',
    farmer: 'Ivan Petrenko',
    location: 'Poltava Region',
    crop: 'Wheat',
    expectedYield: 120,
    tokenSupply: 10000,
    pricePerToken: 5,
    harvestDate: '2026-09-01',
    riskScore: 0.32,
  },
  {
    id: 'farm2',
    name: 'Corn Harvest 2026',
    farmer: 'Oleh Bondarenko',
    location: 'Cherkasy Region',
    crop: 'Corn',
    expectedYield: 200,
    tokenSupply: 15000,
    pricePerToken: 4,
    harvestDate: '2026-10-10',
    riskScore: 0.41,
  },
  {
    id: 'farm3',
    name: 'Sunflower Harvest 2026',
    farmer: 'Andrii Melnyk',
    location: 'Kherson Region',
    crop: 'Sunflower',
    expectedYield: 95,
    tokenSupply: 9000,
    pricePerToken: 6,
    harvestDate: '2026-08-15',
    riskScore: 0.28,
  },
]

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="bg-white shadow rounded-xl p-5">
      <h3 className="text-xl font-semibold mb-2">{asset.name}</h3>
      <p className="text-gray-600 text-sm">Farmer: {asset.farmer}</p>
      <p className="text-gray-600 text-sm">Location: {asset.location}</p>
      <p className="text-gray-600 text-sm">Crop: {asset.crop}</p>

      <div className="mt-4 space-y-1 text-sm">
        <p>Expected Yield: {asset.expectedYield} tons</p>
        <p>Price / Token: ${asset.pricePerToken}</p>
        <p>Harvest: {asset.harvestDate}</p>
        <p>
          Risk Score: <span className="font-semibold">{asset.riskScore}</span>
        </p>
      </div>

      <button className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg">View Asset</button>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">AgroRWA Marketplace</h1>
          <p className="text-gray-600">Invest in tokenized agricultural assets (mock data)</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {mockAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </div>
  )
}
