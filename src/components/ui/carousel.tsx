'use client'

import { useRef, useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CarouselProps {
  children: ReactNode
  title?: string
  showArrows?: boolean
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Carousel({ 
  children, 
  title, 
  showArrows = true, 
  gap = 'md',
  className 
}: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollability()
    container.addEventListener('scroll', checkScrollability)
    
    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollability)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', checkScrollability)
      resizeObserver.disconnect()
    }
  }, [children])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div 
      className={cn('relative w-full', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {title && (
        <h3 className="text-xl font-semibold mb-4 px-1">{title}</h3>
      )}
      
      <div className="relative">
        {showArrows && canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border hover:bg-background transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          className={cn(
            'flex overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory',
            gapClasses[gap],
            'px-1 py-4',
            '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
          )}
          style={{ overflowY: 'visible' }}
          onScroll={checkScrollability}
        >
          {children}
        </div>

        {showArrows && canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border hover:bg-background transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

interface CarouselCardProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

export function CarouselCard({ children, className, href, onClick }: CarouselCardProps) {
  const content = (
    <div
      className={cn(
        'flex-shrink-0 snap-start relative z-0',
        className
      )}
      style={{ willChange: 'transform' }}
      onClick={onClick}
    >
      {children}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}

