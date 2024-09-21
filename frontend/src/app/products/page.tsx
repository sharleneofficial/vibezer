import React from 'react'
import Link from 'next/link'


const Products = () => {
  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <Link href="/create-brand" className="absolute top-4 right-4">
        <button className="bg-cyan-400 text-white px-4 py-2 rounded-md">
          Create Brand
        </button>
      </Link>
      
      <h1 className="text-6xl font-bold mb-8">VIBEAER</h1>
      
      <p className="text-xl text-center mb-4">
        Welcome to Vibeaer, your one-stop shop for creating groundbreaking phygital NFTs!
      </p>
      
      <p className="text-lg mb-8">
        You have not created any brands yet. Ready to start your journey?
      </p>
      
      <Link href="/create-brand">
        <button className="bg-cyan-400 text-white px-6 py-3 rounded-md text-lg">
          Create Brand
        </button>
      </Link>
    </div>
  )
}

export default Products