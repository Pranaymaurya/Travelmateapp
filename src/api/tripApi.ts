// api/tripApi.ts
// This is a mock API service. In a real app, you'd fetch from a backend.

const MOCK_ALL_TRIPS = [
  {
    id: "t1",
    title: "Bali Island Retreat",
    location: "Indonesia",
    price: 1200,
    image: "https://source.unsplash.com/random/800x600?bali,island,retreat",
    tag: "HOT DEAL",
    duration: "7 Days",
    description: "Experience the spiritual and natural beauty of Bali.",
  },
  {
    id: "t2",
    title: "Tokyo City Lights",
    location: "Japan",
    price: 1800,
    image: "https://source.unsplash.com/random/800x600?tokyo,city,lights",
    tag: "POPULAR",
    duration: "5 Days",
    description: "Dive into the vibrant culture and futuristic cityscape of Tokyo.",
  },
  {
    id: "t3",
    title: "Paris Romantic Getaway",
    location: "France",
    price: 1500,
    image: "https://source.unsplash.com/random/800x600?paris,romantic,getaway",
    tag: "HOT DEAL",
    duration: "4 Days",
    description: "Fall in love with the City of Lights.",
  },
  {
    id: "t4",
    title: "Serengeti Safari",
    location: "Tanzania",
    price: 3500,
    image: "https://source.unsplash.com/random/800x600?serengeti,safari,wildlife",
    tag: "ADVENTURE",
    duration: "6 Days",
    description: "Witness the Great Migration in the heart of Africa.",
  },
  {
    id: "t5",
    title: "Amsterdam Canals",
    location: "Netherlands",
    price: 950,
    image: "https://source.unsplash.com/random/800x600?amsterdam,canals,europe",
    tag: "EUROPEAN",
    duration: "3 Days",
    description: "Explore the charming canals and vibrant culture of Amsterdam.",
  },
  {
    id: "t6",
    title: "Rio de Janeiro Carnival",
    location: "Brazil",
    price: 2200,
    image: "https://source.unsplash.com/random/800x600?rio,carnival,brazil",
    tag: "PARTY",
    duration: "5 Days",
    description: "Experience the world's most famous carnival.",
  },
  {
    id: "t7",
    title: "Seoul Modern & Ancient",
    location: "South Korea",
    price: 1600,
    image: "https://source.unsplash.com/random/800x600?seoul,korea,city",
    tag: "ASIAN",
    duration: "6 Days",
    description: "Discover the blend of tradition and modernity in Seoul.",
  },
  {
    id: "t8",
    title: "Cape Town Coastal Drive",
    location: "South Africa",
    price: 2800,
    image: "https://source.unsplash.com/random/800x600?cape,town,coast",
    tag: "AFRICAN",
    duration: "8 Days",
    description: "Scenic drives and vibrant city life in Cape Town.",
  },
  {
    id: "t9",
    title: "New York City Break",
    location: "USA",
    price: 1300,
    image: "https://source.unsplash.com/random/800x600?new,york,city",
    tag: "AMERICAN",
    duration: "4 Days",
    description: "The city that never sleeps awaits.",
  },
  {
    id: "t10",
    title: "Marrakech Souks",
    location: "Morocco",
    price: 1100,
    image: "https://source.unsplash.com/random/800x600?marrakech,souks,morocco",
    tag: "AFRICAN",
    duration: "5 Days",
    description: "Immerse yourself in the vibrant markets of Marrakech.",
  },
  {
    id: "t11",
    title: "Historic Delhi Tour",
    location: "Delhi",
    price: 700,
    image: "https://source.unsplash.com/random/800x600?delhi,india,history",
    tag: "INDIA",
    duration: "3 Days",
    description: "Explore the rich history and culture of India's capital.",
  },
  {
    id: "t12",
    title: "Mumbai Bollywood & Beaches",
    location: "Mumbai",
    price: 850,
    image: "https://source.unsplash.com/random/800x600?mumbai,india,bollywood",
    tag: "INDIA",
    duration: "4 Days",
    description: "Experience the vibrant energy of Mumbai, from Bollywood to beaches.",
  },
  {
    id: "t13",
    title: "Goa Coastal Retreat",
    location: "Goa",
    price: 600,
    image: "https://source.unsplash.com/random/800x600?goa,india,beach",
    tag: "INDIA",
    duration: "3 Days",
    description: "Relax on the beautiful beaches of Goa.",
  },
  {
    id: "t14",
    title: "Kerala Backwaters",
    location: "Kerala",
    price: 900,
    image: "https://source.unsplash.com/random/800x600?kerala,india,backwaters",
    tag: "INDIA",
    duration: "5 Days",
    description: "Cruise through the serene backwaters of Kerala.",
  },
  {
    id: "t15",
    title: "Bangkok Street Food Tour",
    location: "Thailand",
    price: 500,
    image: "https://source.unsplash.com/random/800x600?bangkok,thailand,food",
    tag: "HOT DEAL",
    duration: "3 Days",
    description: "A culinary adventure through Bangkok's bustling streets.",
  },
]

export const tripApi = {
  getAllTrips: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    try {
      // Simulate success
      return { success: true, data: MOCK_ALL_TRIPS }
    } catch (error) {
      // Simulate error
      return { success: false, message: "Failed to fetch trips from mock API." }
    }
  },
}
