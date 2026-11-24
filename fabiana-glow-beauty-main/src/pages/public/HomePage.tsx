import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  Sparkles, Clock, Star, Phone, Instagram, MapPin,
  ArrowRight, Shield, Award, Heart, X, CalendarCheck
} from 'lucide-react'
import type { Servico } from '@/types'
import { useConfiguracoes } from '@/hooks/useConfiguracoes'

const FALLBACK_IMG = '/Logo Glow Beauty.png'

function useServicosPublicos() {
  return useQuery({
    queryKey: ['servicos-publicos'],
    queryFn: async (): Promise<Servico[]> => {
      const { data, error } = await supabase
        .from('servicos')
        .select('id, nome, descricao, valor, duracao_minutos, status, image_url, created_at')
        .eq('status', 'ativo')
        .order('created_at', { ascending: true })
      if (error) {
        if (error.code === '42703') {
          const { data: fb, error: err2 } = await supabase
            .from('servicos')
            .select('id, nome, descricao, valor, duracao_minutos, status, created_at')
            .eq('status', 'ativo')
            .order('created_at', { ascending: true })
          if (err2) throw err2
          return (fb ?? []).map((s) => ({ ...s, image_url: null }))
        }
        throw error
      }
      return data ?? []
    },
  })
}

const DIFERENCIAIS = [
  { icon: Shield, title: 'Produtos Premium', desc: 'Apenas marcas certificadas e dermatologicamente testadas.' },
  { icon: Award, title: 'Especialistas Certificadas', desc: 'Profissionais com formação técnica e atualização constante.' },
  { icon: Heart, title: 'Cuidado Personalizado', desc: 'Cada atendimento é único, pensado especialmente para você.' },
  { icon: Star, title: 'Resultados Reais', desc: 'Técnicas modernas que entregam transformação visível.' },
]

const DEPOIMENTOS = [
  { nome: 'Ana Paula R.', texto: 'A Fabiana é incrível! Minha pele nunca esteve tão bonita. A limpeza de pele foi maravilhosa, saí renovada.', nota: 5 },
  { nome: 'Mariana S.', texto: 'Profissional super atenciosa, ambiente aconchegante e resultados que falam por si. Já virei cliente fiel!', nota: 5 },
  { nome: 'Fernanda L.', texto: 'Fiz extensão de cílios e amei o resultado. Trabalho impecável, muito caprichado. Super recomendo!', nota: 5 },
]

function waUrl(tel: string | null | undefined): string {
  if (!tel) return '#'
  const d = tel.replace(/\D/g, '')
  return `https://wa.me/${d.startsWith('55') ? d : `55${d}`}`
}

export default function HomePage() {
  const { data: servicos = [], isLoading } = useServicosPublicos()
  const { data: config } = useConfiguracoes()
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null)
  const closeModal = useCallback(() => setSelectedServico(null), [])

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-rose-100/60 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-pink-100/60 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-rose-200 rounded-full px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Clínica de Estética Premium · Pelotas–RS
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground leading-tight mb-4">
              Realce sua{' '}
              <span className="text-primary italic">beleza natural</span>{' '}
              com quem entende de você
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Tratamentos estéticos exclusivos, produtos premium e um ambiente pensado para o seu bem-estar.
              Aqui, cada detalhe é para você se sentir incrível.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/agendar"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              >
                Agendar Horário <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#servicos"
                className="inline-flex items-center justify-center gap-2 bg-white text-foreground border border-border px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-muted transition-all"
              >
                Ver Serviços
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="text-center">
                <p className="text-2xl font-serif font-semibold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground">Clientes atendidas</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-serif font-semibold text-foreground">5★</p>
                <p className="text-xs text-muted-foreground">Avaliação média</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-serif font-semibold text-foreground">3+</p>
                <p className="text-xs text-muted-foreground">Anos de experiência</p>
              </div>
            </div>
          </div>

          {/* Hero visual - Logo */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 opacity-30 blur-3xl" />
              <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shadow-xl shadow-primary/10 border border-rose-200/50">
                <img
                  src="/Logo Glow Beauty.png"
                  alt="Glow Beauty"
                  className="w-56 h-56 object-contain drop-shadow-md"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 border border-rose-100">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-serif font-bold text-foreground text-sm">5.0</span>
                </div>
                <p className="text-xs text-muted-foreground">+500 clientes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">O que oferecemos</p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3">
              Nossos Serviços
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Do simples ao especial, temos o tratamento certo para realçar o que você tem de mais bonito.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : servicos.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { nome: 'Limpeza de Pele', descricao: 'Limpeza profunda com extração e máscara hidratante', valor: 120, duracao_minutos: 60 },
                { nome: 'Design de Sobrancelhas', descricao: 'Modelagem com linha e coloração', valor: 50, duracao_minutos: 30 },
                { nome: 'Extensão de Cílios', descricao: 'Aplicação fio a fio em cílios naturais', valor: 180, duracao_minutos: 120 },
                { nome: 'Massagem Relaxante', descricao: 'Massagem corporal com óleos essenciais', valor: 150, duracao_minutos: 60 },
                { nome: 'Peeling Químico', descricao: 'Renovação celular com ácidos profissionais', valor: 200, duracao_minutos: 45 },
                { nome: 'Hidratação Capilar', descricao: 'Tratamento intensivo para cabelos ressecados', valor: 80, duracao_minutos: 40 },
              ].map((s, i) => (
                <ServicoCard key={i} servico={s as Servico} onOpen={setSelectedServico} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicos.map((s) => <ServicoCard key={s.id} servico={s} onOpen={setSelectedServico} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/agendar"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Agendar um serviço <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-20 px-4 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/fabiana.jpg"
                alt="Fabiana Pinheiro Lisboa - Especialista em Estética"
                className="w-64 h-80 md:w-80 md:h-96 object-cover object-top rounded-3xl shadow-xl shadow-primary/15"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 border border-rose-100">
                <p className="text-2xl font-serif font-bold text-primary">3+</p>
                <p className="text-xs text-muted-foreground">Anos de experiência</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Sobre mim</p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-5">
              Paixão pela estética,<br />comprometimento com você
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sou Fabiana Pinheiro Lisboa, esteticista especializada em cuidados faciais e corporais.
              Minha missão é ajudar cada cliente a se sentir mais confiante e bonita, com tratamentos
              que respeitam a individualidade de cada pessoa.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Formada em Estética e Cosmetologia, estou em constante atualização para oferecer as
              técnicas mais modernas do mercado, sempre com produtos de alta qualidade e segurança.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {DIFERENCIAIS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Depoimentos</p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground">
              O que nossas clientes dizem
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((d, i) => (
              <div key={i} className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: d.nota }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-4 italic">"{d.texto}"</p>
                <p className="text-sm font-semibold text-primary">{d.nome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTATO CTA */}
      <section id="contato" className="py-20 px-4 bg-gradient-to-br from-[#a0536a] to-[#7a3a50]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Pronta para se cuidar?
          </h2>
          <p className="text-white/75 text-lg mb-8">
            Agende seu horário agora e dê o primeiro passo para a versão mais radiante de você.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              to="/agendar"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/90 transition-all shadow-lg"
            >
              Agendar Online <ArrowRight className="w-4 h-4" />
            </Link>
            {(config?.whatsapp ?? config?.telefone) && (
              <a
                href={waUrl(config?.whatsapp ?? config?.telefone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
              >
                <Phone className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm">
            {config?.instagram && (
              <a
                href={`https://instagram.com/${config.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" /> {config.instagram.startsWith('@') ? config.instagram : `@${config.instagram}`}
              </a>
            )}
            {config?.cidade && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {config.cidade}
              </span>
            )}
            {config?.horario_funcionamento && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {config.horario_funcionamento.split('\n')[0]}
              </span>
            )}
          </div>
        </div>
      </section>

      {selectedServico && <ServicoModal servico={selectedServico} onClose={closeModal} />}
    </div>
  )
}

function ServicoCard({ servico, onOpen }: { servico: Servico; onOpen: (s: Servico) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(servico)}
      className="group bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-200 text-left w-full"
    >
      <div className="h-44 overflow-hidden bg-rose-50 relative">
        <img
          src={servico.image_url || FALLBACK_IMG}
          alt={servico.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-primary text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            Ver detalhes
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif font-semibold text-foreground text-lg mb-2">{servico.nome}</h3>
        {servico.descricao && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">{servico.descricao}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
          <span className="text-primary font-semibold text-lg">{formatCurrency(servico.valor)}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {servico.duracao_minutos} min
          </span>
        </div>
      </div>
    </button>
  )
}

function ServicoModal({ servico, onClose }: { servico: Servico; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Imagem hero */}
        <div className="relative h-56 bg-rose-50 flex-shrink-0">
          <img
            src={servico.image_url || FALLBACK_IMG}
            alt={servico.nome}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <h2 className="font-serif font-semibold text-2xl text-foreground mb-2">{servico.nome}</h2>
            {servico.descricao && (
              <p className="text-muted-foreground leading-relaxed">{servico.descricao}</p>
            )}
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-rose-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Valor</p>
              <p className="text-primary font-bold text-2xl font-serif">{formatCurrency(servico.valor)}</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Duração</p>
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-foreground font-bold text-2xl font-serif">{servico.duracao_minutos}</p>
                <p className="text-muted-foreground text-sm self-end pb-0.5">min</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            to={`/agendar?servico=${servico.id}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-primary text-white py-4 rounded-2xl font-semibold text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <CalendarCheck className="w-5 h-5" />
            Agendar este Serviço
          </Link>

          <p className="text-center text-xs text-muted-foreground">
            Agendamento gratuito e sem compromisso
          </p>
        </div>
      </div>
    </div>
  )
}
