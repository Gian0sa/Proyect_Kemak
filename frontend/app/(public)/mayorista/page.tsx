'use client';
import { useEffect, useState } from 'react';
import { mayoristaService, ProductoMayoristaDTO } from '@/services';
import { 
  ShoppingBag, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Package, 
  MessageCircle 
} from 'lucide-react';

export default function UserMayoristaPage() {
  const [productos, setProductos] = useState<ProductoMayoristaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await mayoristaService.getAll();
        setProductos(data);
      } catch (error) {
        console.error("Error cargando catálogo", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Función para contactar por WhatsApp (Número: 902 488 881)
  const handleWhatsAppContact = (producto: ProductoMayoristaDTO) => {
    const message = `Hola Kemak Corporación, solicito información sobre el producto mayorista: ${producto.nombre} (${producto.marca}). ¿Qué precio me dejan por cajón o cantidad mayor?`;
    const whatsappUrl = `https://wa.me/51902488881?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* SECCIÓN HERO: TEXTO DE ENTRADA IMPACTANTE */}
      <div className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Zap size={14} /> Distribución hasta la puerta de tu Cerro
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Venta Mayorista <br /> <span className="text-orange-600">& Minorista</span>
          </h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Potencia tu negocio con nuestro catálogo mayorista. Precios competitivos, logística de alto nivel y stock garantizado para tu empresa o evento.
          </p>
          
          <div className="flex justify-center gap-8 pt-8 border-t border-slate-50 mt-10">
            <div className="flex flex-col items-center gap-1">
               <ShieldCheck className="text-orange-500" size={24} />
               <span className="text-[9px] font-black uppercase text-slate-400">Garantía Total</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <Truck className="text-orange-500" size={24} />
               <span className="text-[9px] font-black uppercase text-slate-400">Envíos Rápidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUERPO DEL CATÁLOGO */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Productos Destacados</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Nuestra selección para tu stock</p>
          </div>
          <div className="h-1 w-24 bg-orange-500 rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white h-96 rounded-[2.5rem] animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {productos.map((p) => (
              <div key={p.idProducto} className="group relative bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-50 transition-all duration-500 hover:-translate-y-2 hover:shadow-orange-200/40">
                
                {/* CONTENEDOR DE IMAGEN */}
                <div className="h-64 bg-slate-50 rounded-[2rem] flex items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* BADGE DE STOCK FLOTANTE */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm z-10">
                    <Package size={12} className="text-orange-500" />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${p.stock < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>

                  {p.imagenes && p.imagenes.length > 0 ? (
                    <img 
                      src={p.imagenes[0].url} 
                      className="h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" 
                      alt={p.nombre} 
                    />
                  ) : (
                    <ShoppingBag className="text-slate-200" size={80} />
                  )}

                  {p.stock < 10 && p.stock > 0 && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic animate-bounce">¡Se agota!</span>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Sin Stock</span>
                    </div>
                  )}
                </div>

                {/* INFO DEL PRODUCTO */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-orange-600 font-black text-[9px] uppercase tracking-[0.2em]">{p.marca}</p>
                      <h3 className="text-xl font-black text-slate-900 uppercase leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">{p.nombre}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-tighter">
                      {p.presentacion}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Precio Unitario</p>
                      <p className="text-3xl font-black text-slate-900 italic font-sans tracking-tighter">
                        S/ {p.precio.toFixed(2)}
                      </p>
                    </div>
                    
                    {/* BOTÓN WHATSAPP */}
                    <button 
                      onClick={() => handleWhatsAppContact(p)}
                      disabled={p.stock === 0}
                      className={`flex items-center gap-2 p-4 rounded-2xl transition-all shadow-lg active:scale-90 ${
                        p.stock === 0 
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                        : 'bg-slate-900 text-white hover:bg-green-600'
                      }`}
                      title="Pedir por WhatsApp"
                    >
                      <MessageCircle size={20} />
                      <span className="hidden group-hover:block text-[10px] font-black uppercase tracking-widest">Consultar</span>
                      <ChevronRight size={18} className="group-hover:hidden" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}