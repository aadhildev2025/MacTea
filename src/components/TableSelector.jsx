import React from 'react';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function TableSelector() {
  const { selectedTable, setSelectedTable } = useOrder();

  const tables = [
    { id: 'T1', label: 'Table 1', detail: '2 Seats • Indoor' },
    { id: 'T2', label: 'Table 2', detail: '2 Seats • Window' },
    { id: 'T3', label: 'Table 3', detail: '4 Seats • Garden' },
    { id: 'T4', label: 'Table 4', detail: '4 Seats • Lounge' },
    { id: 'T5', label: 'Table 5', detail: '6 Seats • Family' },
    { id: 'T6', label: 'Table 6', detail: '6 Seats • Terrace' }
  ];

  return (
    <section id="table-selector-section" className="py-8 bg-white border-b border-[#E2D2C0]">
      <div className="mactea-container">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C89445]" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#5C3E2E]">
                Select Your Table
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6E5B52] mt-0.5">
              Choose your table number so staff know where to bring your order.
            </p>
          </div>

          {!selectedTable && (
            <div className="inline-flex items-center gap-1.5 bg-[#C85A32]/10 border border-[#C85A32]/30 text-[#C85A32] text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>Table selection required before ordering</span>
            </div>
          )}
        </div>

        {/* 6 Large Touch-Friendly Buttons Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {tables.map((t) => {
            const isSelected = selectedTable === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTable(t.id)}
                className={`table-btn min-h-[110px] relative overflow-hidden transition-all ${
                  isSelected ? 'active ring-4 ring-[#C89445]/40' : 'hover:border-[#C89445]'
                }`}
              >
                <span className={`text-2xl font-black font-serif ${isSelected ? 'text-[#C89445]' : 'text-[#5C3E2E]'}`}>
                  {t.id}
                </span>

                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#6E5B52]'}`}>
                  {t.label}
                </span>

                {isSelected && (
                  <div className="absolute top-2 right-2 text-[#C89445]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
