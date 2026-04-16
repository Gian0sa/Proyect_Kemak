'use client';
import { useEffect, useState } from 'react';
import { mayoristaService, ProductoMayoristaDTO } from '@/services';
import { 
  ShoppingBag, ChevronRight, Zap, ShieldCheck, 
  Truck, Package, MessageCircle, Boxes, 
  BarChart3, BadgeCheck, ArrowDownToLine 
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
        console.error("Error catálogo mayorista", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleWhatsAppContact = (producto: ProductoMayoristaDTO) => {
    const message = `¡Hola Kemak! 📦 Solicito cotización por volumen del producto: ${producto.nombre} (${producto.marca}). Presentación: ${producto.presentacion}. ¿Qué beneficios ofrecen por compras mayores?`;
    window.open(`https://wa.me/51902488881?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F8FAFC]">
      
      {/* --- INDUSTRIAL HERO SECTION --- */}
      <div className="bg-slate-900 py-24 px-6 relative overflow-hidden">
        {/* Decoración geométrica de fondo */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-orange-600/20">
              <Boxes size={14} /> Canal de Distribución Oficial
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
              Abastece tu <br /> <span className="text-orange-500">Negocio</span>
            </h2>
            
            <p className="text-slate-400 font-medium max-w-2xl mx-auto text-sm md:text-lg leading-relaxed uppercase tracking-tight">
              Precios de fábrica, logística integrada y stock permanente. Somos el aliado estratégico que tu empresa necesita para crecer.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-12">
               <HeroFeature icon={<ShieldCheck />} label="Calidad Certificada" />
               <HeroFeature icon={<Truck />} label="Logística Propia" />
               <HeroFeature icon={<BarChart3 />} label="Precios Escalamiento" />
            </div>
          </div>
        </div>
      </div>

      {/* --- CATÁLOGO MAYORISTA --- */}
      <div className="max-w-7xl mx-auto p-6 md:p-12 -mt-12 relative z-20">
        <div className="bg-white rounded-[3.5rem] p-8 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Lotes Disponibles</h3>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <BadgeCheck size={14} className="text-orange-500"/> Stock actualizado al 2026
              </p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors">
               Descargar Tarifario <ArrowDownToLine size={16}/>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-50 h-[400px] rounded-[3rem] animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {productos.map((p) => (
                <div key={p.idProducto} className="group flex flex-col bg-white rounded-[3rem] border border-transparent hover:border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 p-2">
                  
                  {/* IMAGEN DE PRODUCTO */}
                  <div className="h-72 bg-[#F1F5F9] rounded-[2.8rem] flex items-center justify-center p-12 relative overflow-hidden group-hover:bg-white transition-colors">
                    {/* Badge de Stock */}
                    <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                       <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                       <span className="text-[9px] font-black uppercase tracking-tighter text-slate-600">Stock: {p.stock}</span>
                    </div>

                    {p.imagenes && p.imagenes.length > 0 ? (
                      <img 
                        src={p.imagenes[0].url} 
                        className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" 
                        alt={p.nombre} 
                      />
                    ) : (
                      <Package className="text-slate-300" size={80} strokeWidth={1} />
                    )}

                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-slate-900 text-white text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-2xl">Sin Existencias</span>
                      </div>
                    )}
                  </div>

                  {/* INFO Y COTIZACIÓN */}
                  <div className="p-8 flex-1 flex flex-col space-y-6">
                    <div className="space-y-2">
                      <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.2em]">{p.marca}</p>
                      <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight group-hover:text-orange-600 transition-colors">
                        {p.nombre}
                      </h4>
                      <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                        {p.presentacion}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Precio Referencial</span>
                        <p className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">
                          S/ {p.precio.toFixed(2)}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleWhatsAppContact(p)}
                        className="p-5 bg-slate-100 hover:bg-green-500 text-slate-400 hover:text-white rounded-[2rem] transition-all group/btn active:scale-90"
                      >
                        <MessageCircle size={24} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- CALL TO ACTION INFERIOR --- */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
         <div className="bg-orange-600 rounded-[3.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-orange-600/30">
            <div className="text-center md:text-left space-y-2">
               <h4 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">¿Pedido Especial?</h4>
               <p className="text-orange-100 font-bold text-sm uppercase tracking-widest">Atención personalizada para compras por pallet o carga completa</p>
            </div>
            <button className="bg-slate-950 text-white px-10 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-slate-950 transition-all shadow-2xl">
               Contactar Mayorista
            </button>
         </div>
      </div>
    </div>
  );
}

// Sub-componentes para limpieza visual
function HeroFeature({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm group hover:bg-white/10 transition-all cursor-default">
       <div className="text-orange-500 group-hover:scale-110 transition-transform">{icon}</div>
       <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
    </div>
  );
}