import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePlaceholderProps {
  src?: string
  alt?: string
  className?: string
  fallbackText?: string
}

export function ImagePlaceholder({ src, alt, className, fallbackText }: ImagePlaceholderProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        onError={(e) => {
          // Replace with placeholder on error
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const placeholder = target.nextElementSibling as HTMLElement
          if (placeholder) {
            placeholder.style.display = 'flex'
          }
        }}
      />
    )
  }

  return (
    <div className={cn(
      "bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500",
      className
    )}>
      <div className="flex flex-col items-center space-y-1">
        <Package className="w-6 h-6" />
        {fallbackText && (
          <span className="text-xs text-center">{fallbackText}</span>
        )}
      </div>
    </div>
  )
}