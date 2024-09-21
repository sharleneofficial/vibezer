"use client"
import React, { useState, ChangeEvent, FormEvent, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { parseCookies } from 'nookies'
import { HiUpload, HiPhotograph } from 'react-icons/hi'
import axios from 'axios'
import { cookies } from 'next/headers'
import Cookies from 'cookies-js';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FaSpinner } from 'react-icons/fa';
import { FaGlobe, FaTwitter, FaEnvelope, FaPhone, FaUser, FaLink } from 'react-icons/fa';



// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
// ImageBB API key
const IMAGEBB_API_KEY = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY!


interface FormData {
  brandName: string;
  brandDescription: string;
  logoImage: File | null;
  coverImage: File | null;
  brandRepresentative: string;
  contactEmail: string;
  contactPhone: string;
  shippingAddress: string;
  website: string;
  twitter: string;
  socialLinks: string;
  email: string;
  phone: string;
}

interface BrandData {
  logo_image_url: string;
  brand_name: string;
  brand_description: string;
  brand_representative: string;
  email: string;
  phone: string;
  website: string;
  twitter: string;
  social_links: string;
  shipping_address: string;
  // Add any other fields you're using
}
interface BrandStats {
  totalProducts: number;
  totalSales: number;
  activeListings: number;
  revenue: number;
}
const CreateBrand: React.FC = () => {
  const router = useRouter()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [existingBrand, setExistingBrand] = useState<BrandData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [brandStats, setBrandStats] = useState<BrandStats>({
    totalProducts: 0,
    totalSales: 0,
    activeListings: 0,
    revenue: 0
  })
  const [formData, setFormData] = useState<FormData>({
    brandName: '',
    brandDescription: '',
    logoImage: null,
    coverImage: null,
    brandRepresentative: '',
    contactEmail: '',
    contactPhone: '',
    shippingAddress: '',
    website: '',
    twitter: '',
    socialLinks: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    const fetchBrandAndStats = async () => {
      const cookies = parseCookies()
      const walletAddress = cookies.wallet_address

      if (walletAddress) {
        // Fetch brand data
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single()

        if (brandData) {
          setExistingBrand(brandData)

          // Fetch product count
          const { count: productCount, error: productError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('wallet_address', walletAddress)

          if (productCount !== null) {
            setBrandStats(prevStats => ({
              ...prevStats,
              totalProducts: productCount,
              activeListings: productCount // Assuming all products are active listings
            }))
          }

          // Here you would fetch other statistics like totalSales and revenue
          // For now, we'll leave them as 0
        }
      }
      setIsLoading(false)
    }

    fetchBrandAndStats()
  }, [])
  useEffect(() => {
    const checkExistingBrand = async () => {
      const cookies = parseCookies()
      const walletAddress = cookies.wallet_address

      if (walletAddress) {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single()

        if (data) {
          setExistingBrand(data)
        }
      }
      setIsLoading(false)
    }

    checkExistingBrand()
  }, [])
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData(prevState => ({ ...prevState, [name]: files[0] }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        if (name === 'logoImage') {
          setLogoPreview(reader.result as string)
        } else if (name === 'coverImage') {
          setCoverPreview(reader.result as string)
        }
      }
      reader.readAsDataURL(files[0])
    }
  }
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const cookies = parseCookies()
    const walletAddress = cookies.wallet_address

    try {
      // Upload images to ImageBB
      const logoUrl = await uploadFile(formData.logoImage)
      const coverUrl = await uploadFile(formData.coverImage)

      // Insert data into Supabase
      const { data, error } = await supabase
        .from('brands')
        .insert([
          {
            wallet_address: walletAddress,
            brand_name: formData.brandName,
            brand_description: formData.brandDescription,
            logo_image_url: logoUrl,
            cover_image_url: coverUrl,
            brand_representative: formData.brandRepresentative,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone,
            shipping_address: formData.shippingAddress,
            website: formData.website,
            twitter: formData.twitter,
            social_links: formData.socialLinks,
            email: formData.email,
            phone: formData.phone,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      setIsSubmitted(true)
      toast.success('Brand created successfully!')
    } catch (error) {
      console.error('Error creating brand:', error)
      toast.error('Error creating brand. Please try again.')
    }
  }


  const uploadFile = async (file: File | null): Promise<string | null> => {
    if (!file) return null

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMAGEBB_API_KEY}`, formData)
      return response.data.data.url
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-cyan-500 text-4xl" />
      </div>
    );
  }
  if (existingBrand) {
    return (
      <div className="bg-gradient-to-br from-cyan-100 to-blue-200 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="md:flex">
              {/* Left column for logo and basic info */}
              <div className="md:w-1/3 bg-gradient-to-br from-cyan-500 to-blue-600 p-8 text-white">
                <div className="mb-8">
                  <img 
                    src={existingBrand.logo_image_url} 
                    alt="Brand Logo" 
                    className="w-48 h-48 mx-auto rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-center">{existingBrand.brand_name}</h1>
                <p className="text-sm mb-6 text-center opacity-80">{existingBrand.brand_description}</p>
                <div className="space-y-2">
                  <p className="flex items-center"><FaUser className="mr-2" /> {existingBrand.brand_representative}</p>
                  <p className="flex items-center"><FaEnvelope className="mr-2" /> {existingBrand.email}</p>
                  <p className="flex items-center"><FaPhone className="mr-2" /> {existingBrand.phone}</p>
                </div>
              </div>
              
              {/* Right column for additional info and actions */}
              <div className="md:w-2/3 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Brand Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-cyan-700">Social Links</h3>
                      <a href={existingBrand.website} className="flex items-center text-gray-600 hover:text-cyan-600 mb-2" target="_blank" rel="noopener noreferrer">
                        <FaGlobe className="mr-2" /> Website
                      </a>
                      <a href={existingBrand.twitter} className="flex items-center text-gray-600 hover:text-cyan-600 mb-2" target="_blank" rel="noopener noreferrer">
                        <FaTwitter className="mr-2" /> Twitter
                      </a>
                      <p className="flex items-center text-gray-600">
                        <FaLink className="mr-2" /> {existingBrand.social_links}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-cyan-700">Shipping Address</h3>
                      <p className="text-gray-600">{existingBrand.shipping_address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Brand Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: brandStats.totalProducts },
              { label: 'Total Sales', value: brandStats.totalSales },
              { label: 'Active Listings', value: brandStats.activeListings },
              { label: 'Revenue', value: `$${brandStats.revenue.toFixed(2)}` }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-4xl font-bold text-cyan-600">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
                <div className="flex justify-center">
                  <button 
                    onClick={() => router.push('/create-product')} 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    Create New Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (isSubmitted) {
    return (
      <div className="bg-white text-black min-h-screen p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">Congratulations!</h1>
        <p className="text-xl mb-8">Your brand has been successfully created.</p>
        <button 
          onClick={() => router.push('/create-product')} 
          className="bg-cyan-400 text-white px-6 py-2 rounded text-lg hover:bg-cyan-500 transition"
        >
          Create Products
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white text-black min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CREATE YOUR BRAND</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="brandName" className="block mb-2">Brand Name*</label>
            <input type="text" id="brandName" name="brandName" className="w-full p-2 border rounded" required onChange={handleInputChange} />
          </div>
          
          <div className="mb-4">
            <label htmlFor="brandDescription" className="block mb-2">Brand Description*</label>
            <textarea id="brandDescription" name="brandDescription" className="w-full p-2 border rounded" rows={3} required onChange={handleInputChange}></textarea>
          </div>
          
          <div className="mb-6">
      <label className="block mb-2 font-semibold">Upload Logo Image*</label>
      <div className="flex space-x-4">
        <div className="w-2/3 border-2 border-dashed border-gray-300 p-4 text-center rounded-lg">
          <HiUpload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="mb-2">Drag file here to upload or</p>
          <input
            type="file"
            className="hidden"
            id="logoUpload"
            name="logoImage"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
          <label
            htmlFor="logoUpload"
            className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Choose File
          </label>
          <p className="text-sm text-gray-500 mt-2">Recommended size 512 x 512 px</p>
        </div>
        <div className="w-1/3 border border-gray-300 p-4 text-center rounded-lg">
          <p className="mb-2 font-semibold">Preview</p>
          {logoPreview ? (
            <img src={logoPreview} alt="Logo Preview" className="mx-auto max-h-32 object-contain" />
          ) : (
            <HiPhotograph className="h-32 w-32 mx-auto text-gray-300" />
          )}
        </div>
      </div>
    </div>

    <div className="mb-6">
      <label className="block mb-2 font-semibold">Upload Cover Image*</label>
      <div className="flex space-x-4">
        <div className="w-2/3 border-2 border-dashed border-gray-300 p-4 text-center rounded-lg">
          <HiUpload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="mb-2">Drag file here to upload or</p>
          <input
            type="file"
            className="hidden"
            id="coverUpload"
            name="coverImage"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
          <label
            htmlFor="coverUpload"
            className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Choose File
          </label>
          <p className="text-sm text-gray-500 mt-2">Recommended size 1920 x 972 px</p>
        </div>
        <div className="w-1/3 border border-gray-300 p-4 text-center rounded-lg">
          <p className="mb-2 font-semibold">Preview</p>
          {coverPreview ? (
            <img src={coverPreview} alt="Cover Preview" className="mx-auto max-h-32 object-contain" />
          ) : (
            <HiPhotograph className="h-32 w-32 mx-auto text-gray-300" />
          )}
        </div>
      </div>
    </div>

          <div className="mb-4">
            <label htmlFor="brandRepresentative" className="block mb-2">Name of Brand Representative *</label>
            <input type="text" id="brandRepresentative" name="brandRepresentative" className="w-full p-2 border rounded" required onChange={handleInputChange} />
          </div>
          
          <div className="mb-4">
            <label htmlFor="contactEmail" className="block mb-2">Contact Email*</label>
            <input type="email" id="contactEmail" name="contactEmail" className="w-full p-2 border rounded" required onChange={handleInputChange} />
          </div>
          
          <div className="mb-4">
            <label htmlFor="contactPhone" className="block mb-2">Contact Phone*</label>
            <input type="tel" id="contactPhone" name="contactPhone" className="w-full p-2 border rounded" placeholder="Include country code" required onChange={handleInputChange} />
          </div>
          
          <div className="mb-4">
            <label htmlFor="shippingAddress" className="block mb-2">Shipping address for NFC tags*</label>
            <textarea id="shippingAddress" name="shippingAddress" className="w-full p-2 border rounded" rows={3} placeholder="Include name, street address, city, postal code, and country" required onChange={handleInputChange}></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Social Links</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="website" className="block mb-2">Website</label>
                <input type="url" id="website" name="website" className="w-full p-2 border rounded" onChange={handleInputChange} />
              </div>
              <div>
                <label htmlFor="twitter" className="block mb-2">X (Twitter)</label>
                <input type="url" id="twitter" name="twitter" className="w-full p-2 border rounded" onChange={handleInputChange} />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="socialLinks" className="block mb-2">Social Links*</label>
            <input type="text" id="socialLinks" name="socialLinks" className="w-full p-2 border rounded" required onChange={handleInputChange} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="email" className="block mb-2">Email*</label>
              <input type="email" id="email" name="email" className="w-full p-2 border rounded" required onChange={handleInputChange} />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-2">Phone*</label>
              <input type="tel" id="phone" name="phone" className="w-full p-2 border rounded" required onChange={handleInputChange} />
            </div>
          </div>
          
          <div className="text-right">
            <button type="submit" className="bg-cyan-400 text-white px-6 py-2 rounded">
              Launch brand
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  )
}

export default CreateBrand