import NotFoundPage from '@/components/pages/notFound'
import React from 'react'

export default function NotFound() {
  return (
    <div className='w-screen h-screen fixed top-0 left-0 bg-background z-[999999] flex justify-center items-center '>
      <NotFoundPage/>
    </div>
  )
}
