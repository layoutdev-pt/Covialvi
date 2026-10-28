'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
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
  defaultSort?: string;
  total?: number;
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
  { value: 'shop', label: 'Loja' },
];

const businessTypes = [
  { value: 'sale', label: 'Venda' },
  { value: 'rent', label: 'Arrendamento' },
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
  { value: 'sold_100', label: '100% Vendido' },
];

const MAX_PRICE = 3150000;

const triggerClass =
  'h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 shadow-none hover:border-gray-300 focus:ring-2 focus:ring-yellow-500/60 focus:ring-offset-0 [&>svg]:text-gray-500 [&>svg]:opacity-100 [&>span]:truncate';
const contentClass = 'bg-white border border-gray-200 shadow-xl rounded-xl max-h-[300px]';
const itemClass = 'text-gray-900 focus:bg-yellow-50 focus:text-gray-900 cursor-pointer';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-gray-500">{label}</p>
      {children}
    </div>
  );
}

export function PriceFilter({
  defaultMinPrice = '0',
  defaultMaxPrice = String(MAX_PRICE),
  defaultLocation = '',
  defaultNature = '',
  defaultBusinessType = '',
  defaultConstructionStatus = '',
  defaultBedrooms = '',
  defaultShowSobConsulta = 'true',
  defaultSort = '',
  total = 0,
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
  const [open, setOpen] = useState(false); // mobile: filters panel expanded

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT').format(price) + ' €';
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
    if (defaultSort) params.set('sort', defaultSort);

    const queryString = params.toString();
    router.push(`/imoveis${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router, location, nature, businessType, constructionStatus, bedrooms, minPrice, maxPrice, showSobConsulta, defaultSort]);

  // Auto-apply filters when select fields change (debounced for the price sliders)
  useEffect(() => {
    const timeout = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timeout);
  }, [applyFilters]);

  const minPercent = (minPrice / MAX_PRICE) * 100;
  const maxPercent = (maxPrice / MAX_PRICE) * 100;

  const activeCount = [location, nature, businessType, constructionStatus, bedrooms].filter(Boolean).length
    + (minPrice > 0 || maxPrice < MAX_PRICE ? 1 : 0)
    + (!showSobConsulta ? 1 : 0);

  const clearAll = () => {
    setLocation('');
    setNature('');
    setBusinessType('');
    setConstructionStatus('');
    setBedrooms('');
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setShowSobConsulta(true);
    router.push('/imoveis', { scroll: false });
  };

  const thumbClass =
    'absolute top-3 left-0 w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-yellow-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.35)] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-yellow-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.35)]';

  return (
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.06)]">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 lg:hidden"
      >
        <span className="flex items-center gap-2 font-medium">
          <SlidersHorizontal className="h-4 w-4 text-yellow-500" />
          Filtros
          {activeCount > 0 && (
            <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">{activeCount}</span>
          )}
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`${open ? 'block' : 'hidden'} p-5 pt-1 lg:block lg:p-6`}>
        <div className="mb-5 hidden items-center justify-between lg:flex">
          <h2 className="text-lg font-medium">Filtros</h2>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-gray-300 px-3.5 py-1 text-xs text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900"
          >
            Limpar
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Localização">
            <Select value={location || 'all'} onValueChange={(v) => setLocation(v === 'all' ? '' : v)}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className={contentClass}>
                <SelectItem value="all" className={itemClass}>Todas</SelectItem>
                {availableLocations.districts.length > 0 && (
                  <>
                    <div className="bg-gray-50 px-2 py-1.5 text-xs font-semibold text-gray-500">Distritos</div>
                    {availableLocations.districts.map((district) => (
                      <SelectItem key={`district:${district}`} value={`district:${district}`} className={itemClass}>
                        {district}
                      </SelectItem>
                    ))}
                  </>
                )}
                {availableLocations.municipalities.length > 0 && (
                  <>
                    <div className="bg-gray-50 px-2 py-1.5 text-xs font-semibold text-gray-500">Concelhos</div>
                    {availableLocations.municipalities.map((municipality) => (
                      <SelectItem key={`municipality:${municipality}`} value={`municipality:${municipality}`} className={itemClass}>
                        {municipality}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Tipo">
            <Select value={nature || 'all'} onValueChange={(v) => setNature(v === 'all' ? '' : v)}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className={contentClass}>
                <SelectItem value="all" className={itemClass}>Todos</SelectItem>
                {natures.map((n) => (
                  <SelectItem key={n.value} value={n.value} className={itemClass}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Negócio">
            <Select value={businessType || 'all'} onValueChange={(v) => setBusinessType(v === 'all' ? '' : v)}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className={contentClass}>
                <SelectItem value="all" className={itemClass}>Todos</SelectItem>
                {businessTypes.map((b) => (
                  <SelectItem key={b.value} value={b.value} className={itemClass}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Estado">
            <Select value={constructionStatus || 'all'} onValueChange={(v) => setConstructionStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className={contentClass}>
                <SelectItem value="all" className={itemClass}>Todos</SelectItem>
                {constructionStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value} className={itemClass}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Tipologia">
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map((num) => {
                const value = num.toString();
                const selected = bedrooms === value;
                return (
                  <button
                    key={num}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setBedrooms(selected ? '' : value)}
                    className={`rounded-full border px-0 py-1.5 text-center text-xs font-medium transition-colors ${
                      selected
                        ? 'border-yellow-500 bg-yellow-500 text-white'
                        : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                    }`}
                  >
                    T{num}{num === 4 ? '+' : ''}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Preço">
            <div className="relative px-2.5 pt-3">
              <div className="relative h-1 rounded-full bg-gray-200">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                  style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                />
              </div>
              <input
                type="range"
                aria-label="Preço mínimo"
                min="0"
                max={MAX_PRICE}
                step="10000"
                value={minPrice}
                onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value), maxPrice - 10000))}
                className={thumbClass}
              />
              <input
                type="range"
                aria-label="Preço máximo"
                min="0"
                max={MAX_PRICE}
                step="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Math.max(parseInt(e.target.value), minPrice + 10000))}
                className={thumbClass}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs font-medium text-gray-600">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
          </Field>

          <label className="flex cursor-pointer items-center justify-between gap-3 pt-1">
            <span className="text-sm text-gray-700">Incluir &quot;Sob consulta&quot;</span>
            <button
              type="button"
              role="switch"
              aria-checked={showSobConsulta}
              onClick={() => setShowSobConsulta(!showSobConsulta)}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-300 ${
                showSobConsulta ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  showSobConsulta ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>

          <div className="flex gap-2 pt-1">
            <a
              href="#resultados"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full bg-yellow-500 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-yellow-600"
            >
              Ver {total} {total === 1 ? 'imóvel' : 'imóveis'}
            </a>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-gray-300 px-4 text-xs text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900 lg:hidden"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
