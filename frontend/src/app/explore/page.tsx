"use client"
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Product {
  id: string;
  name: string;
  price: number;    
  image_url: string;
  wallet_address: string;
}

interface Brand {
  wallet_address: string;
  logo_image_url: string;
}

const ExplorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<{ [key: string]: Brand }>({})

  useEffect(() => {
    const fetchProductsAndBrands = async () => {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error fetching products:', productsError)
        return
      }

      setProducts(productsData || [])

      // Fetch brands for the products
      const walletAddresses = Array.from(new Set(productsData?.map(p => p.wallet_address) || []))
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('wallet_address, logo_image_url')
        .in('wallet_address', walletAddresses)

      if (brandsError) {
        console.error('Error fetching brands:', brandsError)
        return
      }

      const brandsMap = (brandsData || []).reduce((acc, brand) => {
        acc[brand.wallet_address] = brand
        return acc
      }, {} as { [key: string]: Brand })

      setBrands(brandsMap)
    }

    fetchProductsAndBrands()
  }, [])
  const ImageComponent: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    return (
      <div className={`relative ${className}`}>
        <Image 
          src={src} 
          alt={alt}
          layout="fill"
          objectFit="cover"
        />
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">New on Discover</h1>
      <p className="text-lg mb-8">New Frontier: Be Among the First to Discover the Newest Phygitals Making Their Debut!</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64">
              <ImageComponent 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full"
              />
              {brands[product.wallet_address] && (
                <div className="absolute top-2 left-2 w-10 h-10">
                  <ImageComponent 
                    src={brands[product.wallet_address].logo_image_url} 
                    alt="Brand Logo"
                    className="rounded-full border-2 border-white"
                  />
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{product.price} $</span>
                <button className="bg-cyan-400 text-white px-4 py-2 rounded hover:bg-cyan-500 transition">
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

}

export default ExplorePage