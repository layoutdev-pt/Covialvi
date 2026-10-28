'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const options = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'price_asc', label: 'Preço: do menor ao maior' },
  { value: 'price_desc', label: 'Preço: do maior ao menor' },
  { value: 'area_desc', label: 'Maior área' },
  { value: 'area_asc', label: 'Menor área' },
];

export function SortSelect({ current }: { current?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'newest') params.delete('sort');
    else params.set('sort', value);
    params.delete('all');
    params.delete('page');
    const query = params.toString();
    router.push(`/imoveis${query ? `?${query}` : ''}`, { scroll: false });
  };

  return (
    <Select value={current || 'newest'} onValueChange={onChange}>
      <SelectTrigger aria-label="Ordenar imóveis" className="h-10 w-full rounded-full border-gray-200 bg-white px-4 text-sm sm:w-[230px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="rounded-xl border border-gray-200 bg-white shadow-xl">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="cursor-pointer text-gray-900 focus:bg-yellow-50 focus:text-gray-900">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
