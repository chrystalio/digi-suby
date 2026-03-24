import { Box } from 'lucide-react';


interface Props {
    src: string | null;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
}

export function ServiceLogo({ src, alt, size = 'md', className }: Props) {
    if (!src) {
        return (
            <div className={`flex items-center justify-center rounded-lg bg-muted ${sizeClasses[size]} ${className}`}>
                <Box className="h-1/2 w-1/2 text-muted-foreground" />
            </div>
        )
    }

    return (
        <img src={src} alt={alt} loading="lazy" className={`rounded-lg object-contain ${sizeClasses[size]}`}
             onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
             }}
        />
    );
}
