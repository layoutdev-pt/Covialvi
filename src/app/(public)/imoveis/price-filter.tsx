'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface PriceFilterProps {
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
  defaultLocation?: string;
  defaultNature?: string;
  defaultBusinessType?: string;
  defaultConstructionStatus?: string;
  defaultBedrooms?: string;
  defaultShowSobConsulta?: string;
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
  { value: 'to_recover', label: 'Para Recuperar' },
  { value: 'renovated', label: 'Renovado' },
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
}: PriceFilterProps) {
  const [minPrice, setMinPrice] = useState(parseInt(defaultMinPrice) || 0);
  const [maxPrice, setMaxPrice] = useState(parseInt(defaultMaxPrice) || MAX_PRICE);
  const [showSobConsulta, setShowSobConsulta] = useState(defaultShowSobConsulta !== 'false');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT').format(price) + '€';
  };

  const minPercent = (minPrice / MAX_PRICE) * 100;
  const maxPercent = (maxPrice / MAX_PRICE) * 100;

  const selectStyle = { 
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
    backgroundRepeat: 'no-repeat', 
    backgroundPosition: 'right 10px center', 
    backgroundSize: '14px' 
  };

  return (
    <form className="bg-[#0f1419] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800/50">
      {/* Filter Pills Row - All in one line */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-3 flex-1 overflow-x-auto pb-2 md:pb-0">
          {/* Localização */}
          <input
            type="text"
            name="location"
            placeholder="Localização"
            defaultValue={defaultLocation}
            className="bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-white transition-all w-[120px] flex-shrink-0"
          />
          {/* Natureza */}
          <select
            name="nature"
            defaultValue={defaultNature}
            className="bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white appearance-none cursor-pointer transition-all pr-8 flex-shrink-0"
            style={selectStyle}
          >
            <option value="" className="bg-[#0f1419]">Natureza</option>
            {natures.map((n) => (
              <option key={n.value} value={n.value} className="bg-[#0f1419]">{n.label}</option>
            ))}
          </select>
          {/* Negócio */}
          <select
            name="business_type"
            defaultValue={defaultBusinessType}
            className="bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white appearance-none cursor-pointer transition-all pr-8 flex-shrink-0"
            style={selectStyle}
          >
            <option value="" className="bg-[#0f1419]">Negócio</option>
            {businessTypes.map((b) => (
              <option key={b.value} value={b.value} className="bg-[#0f1419]">{b.label}</option>
            ))}
          </select>
          {/* Estado */}
          <select
            name="construction_status"
            defaultValue={defaultConstructionStatus}
            className="bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white appearance-none cursor-pointer transition-all pr-8 flex-shrink-0"
            style={selectStyle}
          >
            <option value="" className="bg-[#0f1419]">Estado</option>
            {constructionStatuses.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0f1419]">{s.label}</option>
            ))}
          </select>
          {/* Tipologia */}
          <select
            name="bedrooms"
            defaultValue={defaultBedrooms}
            className="bg-transparent border border-gray-600 hover:border-gray-500 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white appearance-none cursor-pointer transition-all pr-8 flex-shrink-0"
            style={selectStyle}
          >
            <option value="" className="bg-[#0f1419]">Tipologia</option>
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num.toString()} className="bg-[#0f1419]">
                T{num}{num === 5 ? '+' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button - Improved */}
        <button
          type="submit"
          className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center hover:bg-white hover:text-[#0f1419] transition-all duration-300 flex-shrink-0 group"
          aria-label="Pesquisar"
        >
          <Search className="w-7 h-7 text-white group-hover:text-[#0f1419] transition-colors" />
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

        {/* Hidden inputs for form submission */}
        <input type="hidden" name="min_price" value={minPrice} />
        <input type="hidden" name="max_price" value={maxPrice} />
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
          <input type="hidden" name="show_sob_consulta" value={showSobConsulta ? 'true' : 'false'} />
        </label>
        
        <span className="text-white font-medium">{formatPrice(maxPrice)}</span>
      </div>
    </form>
  );
}
