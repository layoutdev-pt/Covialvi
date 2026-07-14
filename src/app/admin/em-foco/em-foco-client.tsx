'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Star, Building2, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  reference: string;
  price: number | null;
  price_on_request: boolean;
  property_images: Array<{ url: string; is_cover: boolean }> | null;
}

interface Highlight {
  id?: string;
  property_id: string;
  position: number;
}

interface EmFocoClientProps {
  properties: Property[];
  initialHighlights: Highlight[];
}

export function EmFocoClient({ properties, initialHighlights }: EmFocoClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize state with 3 slots
  const [slots, setSlots] = useState<Record<number, string | null>>({
    1: initialHighlights.find(h => h.position === 1)?.property_id || null,
    2: initialHighlights.find(h => h.position === 2)?.property_id || null,
    3: initialHighlights.find(h => h.position === 3)?.property_id || null,
  });

  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({
    1: '', 2: '', 3: ''
  });
  
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({
    1: false, 2: false, 3: false
  });

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    
    try {
      // Create updates array
      const upserts: Highlight[] = [];
      const positions = [1, 2, 3];
      
      for (const pos of positions) {
        if (slots[pos]) {
          upserts.push({
            property_id: slots[pos] as string,
            position: pos
          });
        }
      }

      // First, delete all existing highlights
      const { error: deleteError } = await supabase
        .from('premium_highlights')
        .delete()
        .in('position', [1, 2, 3]);

      if (deleteError) throw deleteError;

      // Insert new highlights if there are any
      if (upserts.length > 0) {
        const { error: insertError } = await supabase
          .from('premium_highlights')
          .insert(upserts);

        if (insertError) throw insertError;
      }

      toast.success('Destaques atualizados com sucesso!');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving highlights:', error);
      toast.error('Erro ao guardar os destaques. Verifique se o mesmo imóvel não foi selecionado em várias posições.');
    } finally {
      setIsSaving(false);
    }
  };

  const getPropertyInfo = (id: string | null) => {
    if (!id) return null;
    return properties.find(p => p.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-8">
          {[1, 2, 3].map((position) => {
            const currentProp = getPropertyInfo(slots[position]);
            
            // Filter properties based on search term
            const filteredProps = properties.filter(p => {
              // Exclude properties already selected in other slots
              const otherSlots = [1, 2, 3].filter(pos => pos !== position);
              if (otherSlots.some(pos => slots[pos] === p.id)) return false;
              
              if (!searchTerms[position]) return true;
              const term = searchTerms[position].toLowerCase();
              return p.title.toLowerCase().includes(term) || p.reference.toLowerCase().includes(term);
            });

            return (
              <div key={position} className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full font-bold text-2xl">
                  {position}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Posição {position}</h3>
                    {slots[position] && (
                      <button 
                        onClick={() => setSlots(prev => ({ ...prev, [position]: null }))}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  {currentProp ? (
                    <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative">
                        {currentProp.property_images?.[0] ? (
                          <Image 
                            src={currentProp.property_images.find(img => img.is_cover)?.url || currentProp.property_images[0].url}
                            alt={currentProp.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building2 className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate" title={currentProp.title}>
                          {currentProp.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Ref: {currentProp.reference}</p>
                        <p className="text-sm font-medium text-yellow-600 mt-1">
                          {currentProp.price_on_request ? 'Preço sob consulta' : (currentProp.price ? formatPrice(currentProp.price) : 'N/A')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Pesquisar por título ou referência..."
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                          value={searchTerms[position]}
                          onChange={(e) => setSearchTerms(prev => ({ ...prev, [position]: e.target.value }))}
                          onFocus={() => setOpenDropdowns(prev => ({ ...prev, [position]: true }))}
                          onBlur={() => setTimeout(() => setOpenDropdowns(prev => ({ ...prev, [position]: false })), 200)}
                        />
                      </div>
                      
                      {openDropdowns[position] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProps.length > 0 ? (
                            filteredProps.map(prop => (
                              <div
                                key={prop.id}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3"
                                onClick={() => {
                                  setSlots(prev => ({ ...prev, [position]: prop.id }));
                                  setSearchTerms(prev => ({ ...prev, [position]: '' }));
                                  setOpenDropdowns(prev => ({ ...prev, [position]: false }));
                                }}
                              >
                                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                  {prop.property_images?.[0] ? (
                                    <Image 
                                      src={prop.property_images.find(img => img.is_cover)?.url || prop.property_images[0].url}
                                      alt={prop.title}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Building2 className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{prop.title}</p>
                                  <p className="text-xs text-gray-500">Ref: {prop.reference}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Nenhum imóvel encontrado.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Guardar Destaques
          </button>
        </div>
      </div>
    </div>
  );
}
