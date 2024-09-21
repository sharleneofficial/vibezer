"use client"
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { HiUpload, HiPhotograph } from 'react-icons/hi'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'cookies-js'
import { FaSpinner } from 'react-icons/fa'


// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ImageBB API key
const IMAGEBB_API_KEY = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY!

interface FormData {
  name: string;
  categories: string[];
  description: string;
  price: string;
  quantity: string;
  royalty: string;
  image: File | null;
  additionalDetails: { [key: string]: string };
}
interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
}

const CreateProduct: React.FC = () => {
  const router = useRouter()
   const [additionalDetailsCount, setAdditionalDetailsCount] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    categories: [],
    description: '',
    price: '',
    quantity: '',
    royalty: '',
    image: null,
    additionalDetails: {}
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [existingProducts, setExistingProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchExistingProducts = async () => {
      const walletAddress = Cookies.get('wallet_address');
      if (walletAddress) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image_url, price')
          .eq('wallet_address', walletAddress)
        
        if (error) {
          console.error('Error fetching products:', error)
        } else {
          setExistingProducts(data || [])
          setShowForm(data.length === 0)
        }
      }
      setIsLoading(false)
    }

    fetchExistingProducts()
  }, [])


  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
  }
  

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prevState => ({ ...prevState, image: file }))
    
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

 const handleAdditionalDetailChange = (index: number, key: string, value: string) => {
    setFormData(prevState => ({
      ...prevState,
      additionalDetails: { ...prevState.additionalDetails, [`key${index}`]: key, [`value${index}`]: value }
    }));
  };

  const addAdditionalDetail = () => {
    setAdditionalDetailsCount(prevCount => prevCount + 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      // Upload image to ImageBB
      const imageUrl = await uploadFile(formData.image)
      const walletAddress = Cookies.get('wallet_address');

      // Insert data into Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            wallet_address: walletAddress,
            name: formData.name,
            categories: formData.categories,
            description: formData.description,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            royalty: parseFloat(formData.royalty),
            image_url: imageUrl,
            additional_details: formData.additionalDetails,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      toast.success('Product created successfully!')
      router.push('/explore') // Redirect to products page
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Error creating product. Please try again.')
    }
  }
  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      categories: checked
        ? [...prevState.categories, value]
        : prevState.categories.filter(cat => cat !== value)
    }));
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-cyan-500" />
      </div>
    )
  }

  if (!showForm && existingProducts.length > 0) {
    return (
      <div className="bg-white text-black min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Products</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {existingProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 flex items-center space-x-4">
                <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded" />
                <div>
                  <h2 className="font-semibold">{product.name}</h2>
                  <p className="text-gray-600">{product.price} ETH</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-cyan-400 text-white px-6 py-2 rounded hover:bg-cyan-500 transition"
          >
            Add More Product
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white text-black min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Product</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2">Product Name*</label>
            <input type="text" id="name" name="name" className="w-full p-2 border rounded" required onChange={handleInputChange} />
          </div>
          
        
          
          <div className="mb-4">
      <label className="block mb-2">Categories</label>
      <div className="grid grid-cols-3 gap-4">
        {['Fashion', 'Collectibles', 'Art & Photography', 'Home & Decor', 'Functional Items', 'Luxury goods', 'Sustainable goods', 'Tech enabled', 'Music lovers'].map((category) => (
          <div key={category} className="flex items-center">
            <input
              type="checkbox"
              id={category}
              name="categories"
              value={category}
              checked={formData.categories.includes(category)}
              onChange={handleCategoryChange}
              className="mr-2"
            />
            <label htmlFor={category}>{category}</label>
          </div>
        ))}
      </div>
    </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2">Description*</label>
            <textarea id="description" name="description" className="w-full p-2 border rounded" rows={3} required onChange={handleInputChange}></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="price" className="block mb-2">Price*</label>
            <input type="number" id="price" name="price" step="0.01" className="w-full p-2 border rounded" required onChange={handleInputChange} />
          </div>
          
          <div className="mb-4">
            <label htmlFor="quantity" className="block mb-2">Quantity*</label>
            <input type="number" id="quantity" name="quantity" className="w-full p-2 border rounded" required onChange={handleInputChange} />
          </div>
          
          <div className="mb-4">
            <label htmlFor="royalty" className="block mb-2">Royalty*</label>
            <input type="number" id="royalty" name="royalty" step="0.01" className="w-full p-2 border rounded" required onChange={handleInputChange} />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Product Image*</label>
            <div className="flex space-x-4">
              <div className="w-2/3 border-2 border-dashed border-gray-300 p-4 text-center rounded-lg">
                <HiUpload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="mb-2">Drag file here to upload or</p>
                <input
                  type="file"
                  className="hidden"
                  id="imageUpload"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Choose File
                </label>
              </div>
              <div className="w-1/3 border border-gray-300 p-4 text-center rounded-lg">
                <p className="mb-2 font-semibold">Preview</p>
                {imagePreview ? (
                  <img src={imagePreview} alt="Product Preview" className="mx-auto max-h-32 object-contain" />
                ) : (
                  <HiPhotograph className="h-32 w-32 mx-auto text-gray-300" />
                )}
              </div>
            </div>
          </div>
          
        <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2">Additional Details</h3>
      {Array.from({ length: additionalDetailsCount }, (_, index) => (
        <div key={index} className="grid grid-cols-2 gap-4 mb-2">
          <input
            type="text"
            placeholder={`Key${index + 1}`}
            className="p-2 border rounded"
            onChange={(e) => handleAdditionalDetailChange(index + 1, e.target.value, formData.additionalDetails[`value${index + 1}`] || '')}
            disabled={index > 0 && !formData.additionalDetails[`key${index}`]}
          />
          <input
            type="text"
            placeholder={`Value${index + 1}`}
            className="p-2 border rounded"
            onChange={(e) => handleAdditionalDetailChange(index + 1, formData.additionalDetails[`key${index + 1}`] || '', e.target.value)}
            disabled={index > 0 && !formData.additionalDetails[`key${index}`]}
          />
        </div>
      ))}
      {additionalDetailsCount < 9 && formData.additionalDetails[`key${additionalDetailsCount}`] && (
        <button
          type="button"
          onClick={addAdditionalDetail}
          className="mt-2 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition"
        >
          +
        </button>
      )}
    </div>
          
          <div className="text-right">
            <button type="submit" className="bg-cyan-400 text-white px-6 py-2 rounded">
              Create Product
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  )
}

export default CreateProduct