
'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function SearchInput({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        
        if (pathname !== '/shop') {
             router.push(`/shop?${params.toString()}`);
        } else {
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, 300);

    return (
        <div className="relative w-full md:w-[200px] lg:w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={placeholder}
              className="w-full rounded-lg bg-background pl-8"
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.get('q')?.toString()}
            />
        </div>
    )
}
