'use client'

import dynamic from 'next/dynamic'

const Mail = dynamic(() => import('./mail'), {
  ssr: false
})

export default Mail
