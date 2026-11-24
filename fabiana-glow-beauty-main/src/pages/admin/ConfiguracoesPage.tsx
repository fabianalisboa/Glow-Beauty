import { useState, useCallback, useRef, useEffect } from 'react'
import { useConfiguracoes, useSaveConfiguracoes, uploadLogoUrl } from '@/hooks/useConfiguracoes'
import {
  useTelegramConfig, useUltimoAviso, useSalvarTelegramChatId, useEnviarTesteTelegram,
  type UltimoAviso,
} from '@/hooks/useTelegram'
import { useUnidades, useCriarFilial } from '@/hooks/useUnidades'
import {
  Building2, Phone, MapPin, Share2, Clock, ImagePlus, X, Save, CheckCircle, Send,
} from 'lucide-react'

const FALLBACK_LOGO = '/Logo Glow Beauty.png'

interface SectionProps { title: string; icon: React.ReactNode; children: React.ReactNode }
function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/60">
        <span className="text-primary">{icon}</span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  prefix?: string
}
function Field({ label, value, onChange, placeholder, type = 'text', prefix }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      <div className="flex">
        {prefix && (
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-muted-foreground text-xs">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 h-9 px-3 text-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition ${
            prefix ? 'rounded-r-lg' : 'rounded-lg'
          }`}
        />
      </div>
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder }: Omit<FieldProps, 'type' | 'prefix'>) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
      />
    </div>
  )
}

const CHAT_ID_REGEX = /^-?\d+$/ // pessoa (número positivo) ou grupo (negativo)

function gerarSlug(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Só a dona vê. Cria filiais; cada uma nasce vazia (dados separados por unidade).
function UnidadesSection() {
  const { data: unidades, isLoading } = useUnidades()
  const criar = useCriarFilial()
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEditado, setSlugEditado] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  const handleNome = useCallback((v: string) => {
    setNome(v)
    if (!slugEditado) setSlug(gerarSlug(v))
  }, [slugEditado])

  const handleCriar = useCallback(async () => {
    setMsg(null)
    try {
      await criar.mutateAsync({ nome, slug })
      setMsg({ ok: true, texto: 'Filial criada. Escolha-a no seletor do topo para cadastrar serviços e profissionais.' })
      setNome(''); setSlug(''); setSlugEditado(false)
    } catch (err) {
      setMsg({ ok: false, texto: err instanceof Error ? err.message : String(err) })
    }
  }, [criar, nome, slug])

  if (isLoading) return null
  if (!unidades?.some((u) => u.ativa && u.papel === 'dona')) return null

  return (
    <Section title="Filiais" icon={<Building2 className="w-4 h-4" />}>
      <ul className="space-y-1.5">
        {unidades.map((u) => (
          <li key={u.clinica_id} className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium">{u.clinicas?.nome}{u.ativa ? ' (ativa)' : ''}</span>
            <span className="text-xs text-muted-foreground">/agendar/{u.clinicas?.slug}</span>
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-border/60 space-y-3">
        <Field label="Nome da nova filial" value={nome} onChange={handleNome} placeholder="Glow Beauty Centro" />
        <Field
          label="Endereço do agendamento online"
          value={slug}
          onChange={(v) => { setSlugEditado(true); setSlug(v) }}
          placeholder="glow-beauty-centro"
          prefix="/agendar/"
        />
        <button
          type="button"
          onClick={() => void handleCriar()}
          disabled={!nome.trim() || !slug || criar.isPending}
          className="flex items-center gap-1.5 bg-primary text-white px-4 h-9 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <Building2 className="w-3.5 h-3.5" /> {criar.isPending ? 'Criando...' : 'Criar filial'}
        </button>
        {msg && <p className={`text-xs ${msg.ok ? 'text-green-700' : 'text-destructive'}`}>{msg.texto}</p>}
      </div>
    </Section>
  )
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })
}

function descreverUltimoAviso(u: UltimoAviso | null): string {
  if (!u) return 'Nenhum aviso enviado ainda.'
  if (u.status === 'enviada') return `Último aviso enviado em ${formatarDataHora(u.enviada_em ?? u.created_at)}.`
  if (u.status === 'pendente') return 'Aviso na fila: sai em até 1 minuto.'
  const dica = u.ultimo_erro?.includes('403')
    ? ' Esse chat não aceita mensagens do bot: a pessoa precisa abrir o bot no Telegram e tocar em Iniciar.'
    : ''
  return `O último aviso falhou: ${u.ultimo_erro ?? 'erro desconhecido'}.${dica}`
}

function TelegramSection() {
  const { data: cfg, isLoading, error: erroCarregar } = useTelegramConfig()
  const { data: ultimo, error: erroUltimo } = useUltimoAviso(cfg?.clinica_id)
  const salvar = useSalvarTelegramChatId()
  const teste = useEnviarTesteTelegram()
  const [chatId, setChatId] = useState('')
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => {
    if (cfg) setChatId(cfg.telegram_chat_id ?? '')
  }, [cfg])

  const salvo = cfg?.telegram_chat_id ?? ''
  const valor = chatId.trim()
  const invalido = valor !== '' && !CHAT_ID_REGEX.test(valor)
  const alterado = valor !== salvo

  const handleSalvar = useCallback(async () => {
    if (!cfg || invalido || !alterado) return
    setAviso(null)
    try {
      await salvar.mutateAsync({ clinicaId: cfg.clinica_id, chatId: valor || null })
      setAviso({
        ok: true,
        texto: valor
          ? 'ID salvo. Os avisos pendentes também vão para o novo chat.'
          : 'ID removido. Os avisos ficam desligados.',
      })
    } catch (err) {
      setAviso({ ok: false, texto: `Erro ao salvar: ${err instanceof Error ? err.message : String(err)}` })
    }
  }, [cfg, invalido, alterado, valor, salvar])

  const handleTeste = useCallback(async () => {
    if (!cfg || !salvo) return
    setAviso(null)
    try {
      await teste.mutateAsync({ clinicaId: cfg.clinica_id, chatId: salvo })
      setAviso({ ok: true, texto: 'Teste na fila. A mensagem chega em até 1 minuto; o resultado aparece abaixo.' })
    } catch (err) {
      setAviso({ ok: false, texto: `Erro ao enviar o teste: ${err instanceof Error ? err.message : String(err)}` })
    }
  }, [cfg, salvo, teste])

  return (
    <Section title="Avisos no Telegram" icon={<Send className="w-4 h-4" />}>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : erroCarregar || !cfg ? (
        <p className="text-xs text-red-600">
          Não foi possível carregar o ID do Telegram: {erroCarregar instanceof Error ? erroCarregar.message : 'configuração não encontrada'}
        </p>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5" htmlFor="telegram-chat-id">
              ID do chat que recebe os avisos de novo agendamento
            </label>
            <input
              id="telegram-chat-id"
              type="text"
              inputMode="numeric"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); void handleSalvar() }
              }}
              placeholder="Ex.: 123456789"
              className="w-full h-9 px-3 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            {invalido && (
              <p className="text-xs text-red-600 mt-1">O ID tem só números (o de grupo começa com “-”).</p>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Quem vai receber precisa abrir o bot do Glow Beauty no Telegram e tocar em <b>Iniciar</b>.
            Para descobrir o ID, essa pessoa conversa com <b>@userinfobot</b> e toca em Iniciar: ele responde com o número.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleSalvar()}
              disabled={!alterado || invalido || salvar.isPending}
              className="flex items-center gap-1.5 bg-primary text-white px-4 h-9 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" /> {salvar.isPending ? 'Salvando...' : 'Salvar ID'}
            </button>
            <button
              type="button"
              onClick={() => void handleTeste()}
              disabled={!salvo || alterado || teste.isPending}
              className="flex items-center gap-1.5 border border-border text-foreground px-4 h-9 rounded-lg text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" /> {teste.isPending ? 'Enviando...' : 'Enviar teste'}
            </button>
          </div>

          {aviso && (
            <p className={`text-xs ${aviso.ok ? 'text-green-700' : 'text-red-600'}`}>{aviso.texto}</p>
          )}

          <p className="text-xs text-muted-foreground">
            {erroUltimo
              ? `Não foi possível ver o último aviso: ${erroUltimo instanceof Error ? erroUltimo.message : String(erroUltimo)}`
              : ultimo === undefined ? 'Carregando o último aviso...' : descreverUltimoAviso(ultimo)}
          </p>
        </>
      )}
    </Section>
  )
}

export default function ConfiguracoesPage() {
  const { data: config, isLoading } = useConfiguracoes()
  const save = useSaveConfiguracoes()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nome_clinica: '',
    logo_url: '',
    whatsapp: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    horario_funcionamento: '',
    sobre: '',
  })

  useEffect(() => {
    if (config) {
      setForm({
        nome_clinica: config.nome_clinica ?? '',
        logo_url: config.logo_url ?? '',
        whatsapp: config.whatsapp ?? '',
        telefone: config.telefone ?? '',
        email: config.email ?? '',
        endereco: config.endereco ?? '',
        cidade: config.cidade ?? '',
        instagram: config.instagram ?? '',
        facebook: config.facebook ?? '',
        tiktok: config.tiktok ?? '',
        horario_funcionamento: config.horario_funcionamento ?? '',
        sobre: config.sobre ?? '',
      })
    }
  }, [config])

  const field = useCallback((key: keyof typeof form) =>
    (v: string) => setForm((p) => ({ ...p, [key]: v })), [])

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      if (!config) return
      const url = await uploadLogoUrl(file, config.id)
      setForm((p) => ({ ...p, logo_url: url }))
    } finally {
      setUploading(false)
    }
  }, [config])

  const handleSave =useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    if (!config) return
    try {
    await save.mutateAsync({
      id: config.id,
      nome_clinica: form.nome_clinica,
      logo_url: form.logo_url || null,
      whatsapp: form.whatsapp || null,
      telefone: form.telefone || null,
      email: form.email || null,
      endereco: form.endereco || null,
      cidade: form.cidade || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      tiktok: form.tiktok || null,
      horario_funcionamento: form.horario_funcionamento || null,
      sobre: form.sobre || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSaveError(`Erro ao salvar: ${msg}`)
    }
  }, [form, save, config])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm">Dados e aparência do seu negócio</p>
        </div>
        <button
          type="submit"
          disabled={save.isPending}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saved ? (
            <><CheckCircle className="w-4 h-4" /> Salvo!</>
          ) : (
            <><Save className="w-4 h-4" /> {save.isPending ? 'Salvando...' : 'Salvar'}</>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Identidade */}
        <Section title="Identidade" icon={<Building2 className="w-4 h-4" />}>
          <Field
            label="Nome da Clínica"
            value={form.nome_clinica}
            onChange={field('nome_clinica')}
            placeholder="Glow Beauty"
          />

          {/* Logo */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 flex-shrink-0">
                <img
                  src={form.logo_url || FALLBACK_LOGO}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium disabled:opacity-60"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  {uploading ? 'Enviando...' : 'Enviar nova logo'}
                </button>
                {form.logo_url && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, logo_url: '' }))}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" /> Remover
                  </button>
                )}
                <p className="text-[10px] text-muted-foreground">PNG ou JPG recomendado</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>

          <TextArea
            label="Sobre a Clínica"
            value={form.sobre}
            onChange={field('sobre')}
            placeholder="Descreva sua clínica, diferenciais, história..."
          />
        </Section>

        {/* Contato */}
        <Section title="Contato" icon={<Phone className="w-4 h-4" />}>
          <Field
            label="WhatsApp"
            value={form.whatsapp}
            onChange={field('whatsapp')}
            placeholder="(53) 99999-9999"
            prefix="📱"
          />
          <Field
            label="Telefone"
            value={form.telefone}
            onChange={field('telefone')}
            placeholder="(53) 3333-4444"
            prefix="📞"
          />
          <Field
            label="E-mail"
            value={form.email}
            onChange={field('email')}
            placeholder="contato@glowbeauty.com.br"
            type="email"
            prefix="✉️"
          />
        </Section>

        {/* Endereço */}
        <Section title="Endereço" icon={<MapPin className="w-4 h-4" />}>
          <Field
            label="Endereço"
            value={form.endereco}
            onChange={field('endereco')}
            placeholder="Rua das Flores, 123"
          />
          <Field
            label="Cidade / Estado"
            value={form.cidade}
            onChange={field('cidade')}
            placeholder="Pelotas — RS"
          />
        </Section>

        {/* Redes Sociais */}
        <Section title="Redes Sociais" icon={<Share2 className="w-4 h-4" />}>
          <Field
            label="Instagram"
            value={form.instagram}
            onChange={field('instagram')}
            placeholder="glowbeauty"
            prefix="instagram.com/"
          />
          <Field
            label="Facebook"
            value={form.facebook}
            onChange={field('facebook')}
            placeholder="glowbeauty"
            prefix="facebook.com/"
          />
          <Field
            label="TikTok"
            value={form.tiktok}
            onChange={field('tiktok')}
            placeholder="@glowbeauty"
            prefix="tiktok.com/"
          />
        </Section>

        {/* Horário */}
        <Section title="Horário de Funcionamento" icon={<Clock className="w-4 h-4" />}>
          <TextArea
            label="Horários"
            value={form.horario_funcionamento}
            onChange={field('horario_funcionamento')}
            placeholder={`Seg a Sex: 9h às 18h\nSábado: 9h às 14h\nDomingo: Fechado`}
          />
        </Section>

        {/* Telegram */}
        <TelegramSection />

        {/* Filiais */}
        <UnidadesSection />
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium">Não foi possível salvar</p>
          <p className="text-xs text-red-600 mt-1">{saveError}</p>
          <p className="text-xs text-muted-foreground mt-2">Execute o SQL em <code className="bg-muted px-1 rounded">database/migration_rls_e_colunas.sql</code> no Supabase Dashboard e tente novamente.</p>
        </div>
      )}

      {/* Botão salvar mobile */}
      <div className="lg:hidden">
        <button
          type="submit"
          disabled={save.isPending}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white px-5 h-11 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> {save.isPending ? 'Salvando...' : 'Salvar Configurações'}</>}
        </button>
      </div>
    </form>
  )
}
