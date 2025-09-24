import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between text-sm text-gray-600">
        <p>© {new Date().getFullYear()} BuyCex. All rights reserved.</p>
        <p className="hidden sm:block">Built with React + Vite</p>
      </div>
    </footer>
  )
}

export default Footer