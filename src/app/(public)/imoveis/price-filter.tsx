'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PriceFilterProps {
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
  defaultLocation?: string;
  defaultNature?: string;
  defaultBusinessType?: string;
  defaultConstructionStatus?: string;
  defaultBedrooms?: string;
  defaultShowSobConsulta?: string;
  availableLocations?: {
    districts: string[];
    municipalities: string[];
  };
}

const natures = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Moradia' },
  { value: 'land', label: 'Terreno' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'warehouse', label: 'Armazém' },
  { value: 'office', label: 'Escritório' },
  { value: 'garage', label: 'Garagem' },
  { value: 'shop', label: 'Loja' },
];

const businessTypes = [
  { value: 'sale', label: 'Venda' },
  { value: 'rent', label: 'Arrendamento' },
  { value: 'transfer', label: 'Trespasse' },
];

const constructionStatuses = [
  { value: 'new', label: 'Novo' },
  { value: 'used', label: 'Usado' },
  { value: 'under_construction', label: 'Em Construção' },
  { value: 'in_project', label: 'Em Projecto' },
  { value: 'to_recover', label: 'Para Recuperar' },
  { value: 'recovered', label: 'Recuperado' },
  { value: 'renovated', label: 'Renovado' },
  { value: 'sold', label: 'Vendido' },
];

const MAX_PRICE = 3150000;

export function PriceFilter({
  defaultMinPrice = '0',
  defaultMaxPrice = String(MAX_PRICE),
  defaultLocation = '',
  defaultNature = '',
  defaultBusinessType = '',
  defaultConstructionStatus = '',
  defaultBedrooms = '',
  defaultShowSobConsulta = 'true',
  availableLocations = { districts: [], municipalities: [] },
}: PriceFilterProps) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(parseInt(defaultMinPrice) || 0);
  const [maxPrice, setMaxPrice] = useState(parseInt(defaultMaxPrice) || MAX_PRICE);
  const [showSobConsulta, setShowSobConsulta] = useState(defaultShowSobConsulta !== 'false');
  const [location, setLocation] = useState(defaultLocation);
  const [nature, setNature] = useState(defaultNature);
  const [businessType, setBusinessType] = useState(defaultBusinessType);
  const [constructionStatus, setConstructionStatus] = useState(defaultConstructionStatus);
  const [bedrooms, setBedrooms] = useState(defaultBedrooms);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT').format(price) + '€';
  };

  // Apply filters automatically when any filter changes
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    if (location) {
      if (location.startsWith('municipality:')) {
        params.set('municipality', location.replace('municipality:', ''));
      } else if (location.startsWith('district:')) {
        params.set('district', location.replace('district:', ''));
      } else {
        params.set('location', location);
      }
    }
    if (nature) params.set('nature', nature);
    if (businessType) params.set('business_type', businessType);
    if (constructionStatus) params.set('construction_status', constructionStatus);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (minPrice > 0) params.set('min_price', minPrice.toString());
    if (maxPrice < MAX_PRICE) params.set('max_price', maxPrice.toString());
    if (!showSobConsulta) params.set('show_sob_consulta', 'false');
    
    const queryString = params.toString();
    router.push(`/imoveis${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router, location, nature, businessType, constructionStatus, bedrooms, minPrice, maxPrice, showSobConsulta]);

  // Auto-apply filters when select fields change (immediate)
  useEffect(() => {
    // Debounce for text input and price sliders
    const timeout = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timeout);
  }, [location, nature, businessType, constructionStatus, bedrooms, minPrice, maxPrice, showSobConsulta, applyFilters]);

  const minPercent = (minPrice / MAX_PRICE) * 100;
  const maxPercent = (maxPrice / MAX_PRICE) * 100;

  return (
    <div 
      className="bg-[#0f1419] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800/50"
    >
      {/* Filter Pills Row - All in one line */}
      <div className="flex items-center gap-2 mb-8 flex-wrap md:flex-nowrap">
        {/* Localização */}
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="flex-1 min-w-[100px] bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-0 focus:border-white transition-all [&>svg]:text-gray-400">
            <SelectValue placeholder="Localização" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl max-h-[300px]">
            {availableLocations.municipalities.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">Concelhos</div>
                {availableLocations.municipalities.map((municipality) => (
                  <SelectItem key={`municipality:${municipality}`} value={`municipality:${municipality}`} className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">
                    {municipality}
                  </SelectItem>
                ))}
              </>
            )}
            {availableLocations.districts.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">Distritos</div>
                {availableLocations.districts.map((district) => (
                  <SelectItem key={`district:${district}`} value={`district:${district}`} className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">
                    {district}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
        {/* Tipo */}
        <Select value={nature} onValueChange={setNature}>
          <SelectTrigger className="flex-1 min-w-[80px] bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-0 focus:border-white transition-all [&>svg]:text-gray-400">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
            {natures.map((n) => (
              <SelectItem key={n.value} value={n.value} className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">
                {n.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Negócio */}
        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger className="flex-1 min-w-[80px] bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-0 focus:border-white transition-all [&>svg]:text-gray-400">
            <SelectValue placeholder="Negócio" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
            {businessTypes.map((b) => (
              <SelectItem key={b.value} value={b.value} className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Estado */}
        <Select value={constructionStatus} onValueChange={setConstructionStatus}>
          <SelectTrigger className="flex-1 min-w-[80px] bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-0 focus:border-white transition-all [&>svg]:text-gray-400">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
            {constructionStatuses.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Tipologia */}
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger className="flex-1 min-w-[80px] bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-0 focus:border-white transition-all [&>svg]:text-gray-400">
            <SelectValue placeholder="Tipologia" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <SelectItem key={num} value={num.toString()} className="text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer">
                T{num}{num === 5 ? '+' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={() => {
            setLocation('');
            setNature('');
            setBusinessType('');
            setConstructionStatus('');
            setBedrooms('');
            setMinPrice(0);
            setMaxPrice(MAX_PRICE);
            setShowSobConsulta(true);
            router.push('/imoveis');
          }}
          className="px-4 py-2 rounded-full border border-gray-600 hover:border-white text-gray-400 hover:text-white text-sm transition-all flex-shrink-0"
        >
          Limpar
        </button>
      </div>

      {/* Price Range Slider */}
      <div className="relative">
        {/* Slider Track */}
        <div className="relative h-1 bg-gray-700 rounded-full">
          {/* Active Range */}
          <div
            className="absolute h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        {/* Min Slider */}
        <input
          type="range"
          min="0"
          max={MAX_PRICE}
          step="10000"
          value={minPrice}
          onChange={(e) => {
            const value = Math.min(parseInt(e.target.value), maxPrice - 10000);
            setMinPrice(value);
          }}
          className="absolute top-0 left-0 w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-yellow-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-yellow-500 [&::-moz-range-thumb]:cursor-pointer"
        />

        {/* Max Slider */}
        <input
          type="range"
          min="0"
          max={MAX_PRICE}
          step="10000"
          value={maxPrice}
          onChange={(e) => {
            const value = Math.max(parseInt(e.target.value), minPrice + 10000);
            setMaxPrice(value);
          }}
          className="absolute top-0 left-0 w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-yellow-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-yellow-500 [&::-moz-range-thumb]:cursor-pointer"
        />

      </div>

      {/* Price Labels and Toggle */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-white font-medium">{formatPrice(minPrice)}</span>
        
        {/* Sob Consulta Toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
            Sob Consulta
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showSobConsulta}
            onClick={() => setShowSobConsulta(!showSobConsulta)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
              showSobConsulta ? 'bg-yellow-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                showSobConsulta ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
        
        <span className="text-white font-medium">{formatPrice(maxPrice)}</span>
      </div>
    </div>
  );
}
