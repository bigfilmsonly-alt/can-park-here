"use client"

// Accessibility settings and utilities

export interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReaderMode: boolean
  dyslexiaFont: boolean
  language: string
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
  dyslexiaFont: false,
  language: "en",
}

const STORAGE_KEY = "park_accessibility_settings"

export function getAccessibilitySettings(): AccessibilitySettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore parse errors
  }
  
  // Check system preferences
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const prefersHighContrast = window.matchMedia("(prefers-contrast: more)").matches
  
  return {
    ...DEFAULT_SETTINGS,
    reducedMotion: prefersReducedMotion,
    highContrast: prefersHighContrast,
  }
}

export function updateAccessibilitySettings(updates: Partial<AccessibilitySettings>): AccessibilitySettings {
  const current = getAccessibilitySettings()
  const updated = { ...current, ...updates }
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    applyAccessibilityStyles(updated)
  }
  
  return updated
}

export function applyAccessibilityStyles(settings: AccessibilitySettings): void {
  if (typeof document === "undefined") return
  
  const root = document.documentElement
  
  // High contrast mode
  if (settings.highContrast) {
    root.classList.add("high-contrast")
  } else {
    root.classList.remove("high-contrast")
  }
  
  // Large text mode
  if (settings.largeText) {
    root.classList.add("large-text")
  } else {
    root.classList.remove("large-text")
  }
  
  // Reduced motion
  if (settings.reducedMotion) {
    root.classList.add("reduced-motion")
  } else {
    root.classList.remove("reduced-motion")
  }
  
  // Dyslexia font
  if (settings.dyslexiaFont) {
    root.classList.add("dyslexia-font")
  } else {
    root.classList.remove("dyslexia-font")
  }
  
  // Screen reader mode (adds extra ARIA labels)
  if (settings.screenReaderMode) {
    root.classList.add("screen-reader-mode")
  } else {
    root.classList.remove("screen-reader-mode")
  }
}

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
] as const

// Translation strings
type TranslationKey = 
  | "app_name"
  | "tagline"
  | "check_parking"
  | "scan_sign"
  | "set_timer"
  | "map"
  | "predict"
  | "rewards"
  | "home"
  | "community"
  | "history"
  | "settings"
  | "allowed"
  | "restricted"
  | "prohibited"
  | "time_remaining"
  | "protection_active"
  | "set_reminder"
  | "back"
  | "save"
  | "cancel"
  | "loading"
  | "error"
  | "retry"
  | "no_results"
  | "upgrade_to_pro"
  | "sign_in"
  | "sign_out"

const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    app_name: "Park",
    tagline: "Clear answers. No tickets. No confusion.",
    check_parking: "Check Parking",
    scan_sign: "Scan Sign",
    set_timer: "Set Timer",
    map: "Map",
    predict: "Predict",
    rewards: "Rewards",
    home: "Home",
    community: "Community",
    history: "History",
    settings: "Settings",
    allowed: "Parking Allowed",
    restricted: "Time Limited",
    prohibited: "No Parking",
    time_remaining: "Time Remaining",
    protection_active: "Protection Active",
    set_reminder: "Set Reminder",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try Again",
    no_results: "No results found",
    upgrade_to_pro: "Upgrade to Pro",
    sign_in: "Sign In",
    sign_out: "Sign Out",
  },
  es: {
    app_name: "Park",
    tagline: "Respuestas claras. Sin multas. Sin confusión.",
    check_parking: "Verificar Estacionamiento",
    scan_sign: "Escanear Señal",
    set_timer: "Configurar Temporizador",
    map: "Mapa",
    predict: "Predecir",
    rewards: "Recompensas",
    home: "Inicio",
    community: "Comunidad",
    history: "Historial",
    settings: "Ajustes",
    allowed: "Estacionamiento Permitido",
    restricted: "Tiempo Limitado",
    prohibited: "No Estacionar",
    time_remaining: "Tiempo Restante",
    protection_active: "Protección Activa",
    set_reminder: "Configurar Recordatorio",
    back: "Volver",
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando...",
    error: "Algo salió mal",
    retry: "Intentar de nuevo",
    no_results: "No se encontraron resultados",
    upgrade_to_pro: "Actualizar a Pro",
    sign_in: "Iniciar Sesión",
    sign_out: "Cerrar Sesión",
  },
  fr: {
    app_name: "Park",
    tagline: "Réponses claires. Pas de contraventions. Pas de confusion.",
    check_parking: "Vérifier le Stationnement",
    scan_sign: "Scanner le Panneau",
    set_timer: "Régler la Minuterie",
    map: "Carte",
    predict: "Prédire",
    rewards: "Récompenses",
    home: "Accueil",
    community: "Communauté",
    history: "Historique",
    settings: "Paramètres",
    allowed: "Stationnement Autorisé",
    restricted: "Temps Limité",
    prohibited: "Stationnement Interdit",
    time_remaining: "Temps Restant",
    protection_active: "Protection Active",
    set_reminder: "Définir un Rappel",
    back: "Retour",
    save: "Enregistrer",
    cancel: "Annuler",
    loading: "Chargement...",
    error: "Une erreur est survenue",
    retry: "Réessayer",
    no_results: "Aucun résultat trouvé",
    upgrade_to_pro: "Passer à Pro",
    sign_in: "Se Connecter",
    sign_out: "Se Déconnecter",
  },
  zh: {
    app_name: "Park",
    tagline: "清晰的答案。没有罚单。没有困惑。",
    check_parking: "检查停车",
    scan_sign: "扫描标志",
    set_timer: "设置计时器",
    map: "地图",
    predict: "预测",
    rewards: "奖励",
    home: "首页",
    community: "社区",
    history: "历史",
    settings: "设置",
    allowed: "允许停车",
    restricted: "限时停车",
    prohibited: "禁止停车",
    time_remaining: "剩余时间",
    protection_active: "保护已激活",
    set_reminder: "设置提醒",
    back: "返回",
    save: "保存",
    cancel: "取消",
    loading: "加载中...",
    error: "出了点问题",
    retry: "重试",
    no_results: "未找到结果",
    upgrade_to_pro: "升级到专业版",
    sign_in: "登录",
    sign_out: "退出",
  },
  ko: {
    app_name: "Park",
    tagline: "명확한 답변. 벌금 없음. 혼란 없음.",
    check_parking: "주차 확인",
    scan_sign: "표지판 스캔",
    set_timer: "타이머 설정",
    map: "지도",
    predict: "예측",
    rewards: "보상",
    home: "홈",
    community: "커뮤니티",
    history: "기록",
    settings: "설정",
    allowed: "주차 가능",
    restricted: "시간 제한",
    prohibited: "주차 금지",
    time_remaining: "남은 시간",
    protection_active: "보호 활성화",
    set_reminder: "알림 설정",
    back: "뒤로",
    save: "저장",
    cancel: "취소",
    loading: "로딩 중...",
    error: "문제가 발생했습니다",
    retry: "다시 시도",
    no_results: "결과 없음",
    upgrade_to_pro: "프로로 업그레이드",
    sign_in: "로그인",
    sign_out: "로그아웃",
  },
  ja: {
    app_name: "Park",
    tagline: "明確な回答。違反なし。混乱なし。",
    check_parking: "駐車を確認",
    scan_sign: "標識をスキャン",
    set_timer: "タイマーを設定",
    map: "マップ",
    predict: "予測",
    rewards: "報酬",
    home: "ホーム",
    community: "コミュニティ",
    history: "履歴",
    settings: "設定",
    allowed: "駐車可能",
    restricted: "時間制限あり",
    prohibited: "駐車禁止",
    time_remaining: "残り時間",
    protection_active: "保護が有効",
    set_reminder: "リマインダーを設定",
    back: "戻る",
    save: "保存",
    cancel: "キャンセル",
    loading: "読み込み中...",
    error: "問題が発生しました",
    retry: "再試行",
    no_results: "結果がありません",
    upgrade_to_pro: "Proにアップグレード",
    sign_in: "サインイン",
    sign_out: "サインアウト",
  },
  de: {
    app_name: "Park",
    tagline: "Klare Antworten. Keine Strafzettel. Keine Verwirrung.",
    check_parking: "Parken Prüfen",
    scan_sign: "Schild Scannen",
    set_timer: "Timer Einstellen",
    map: "Karte",
    predict: "Vorhersagen",
    rewards: "Belohnungen",
    home: "Start",
    community: "Gemeinschaft",
    history: "Verlauf",
    settings: "Einstellungen",
    allowed: "Parken Erlaubt",
    restricted: "Zeitlich Begrenzt",
    prohibited: "Parken Verboten",
    time_remaining: "Verbleibende Zeit",
    protection_active: "Schutz Aktiv",
    set_reminder: "Erinnerung Setzen",
    back: "Zurück",
    save: "Speichern",
    cancel: "Abbrechen",
    loading: "Laden...",
    error: "Etwas ist schiefgelaufen",
    retry: "Erneut Versuchen",
    no_results: "Keine Ergebnisse gefunden",
    upgrade_to_pro: "Auf Pro upgraden",
    sign_in: "Anmelden",
    sign_out: "Abmelden",
  },
  pt: {
    app_name: "Park",
    tagline: "Respostas claras. Sem multas. Sem confusão.",
    check_parking: "Verificar Estacionamento",
    scan_sign: "Escanear Placa",
    set_timer: "Definir Temporizador",
    map: "Mapa",
    predict: "Prever",
    rewards: "Recompensas",
    home: "Início",
    community: "Comunidade",
    history: "Histórico",
    settings: "Configurações",
    allowed: "Estacionamento Permitido",
    restricted: "Tempo Limitado",
    prohibited: "Proibido Estacionar",
    time_remaining: "Tempo Restante",
    protection_active: "Proteção Ativa",
    set_reminder: "Definir Lembrete",
    back: "Voltar",
    save: "Salvar",
    cancel: "Cancelar",
    loading: "Carregando...",
    error: "Algo deu errado",
    retry: "Tentar Novamente",
    no_results: "Nenhum resultado encontrado",
    upgrade_to_pro: "Atualizar para Pro",
    sign_in: "Entrar",
    sign_out: "Sair",
  },
}

export function t(key: TranslationKey, language?: string): string {
  const lang = language || getAccessibilitySettings().language || "en"
  return translations[lang]?.[key] || translations.en[key] || key
}

export function getCurrentLanguage(): string {
  return getAccessibilitySettings().language || "en"
}

export function setLanguage(code: string): void {
  updateAccessibilitySettings({ language: code })
}

// ARIA live region announcer for screen readers
export function announce(message: string, priority: "polite" | "assertive" = "polite"): void {
  if (typeof document === "undefined") return
  
  let announcer = document.getElementById("aria-announcer")
  
  if (!announcer) {
    announcer = document.createElement("div")
    announcer.id = "aria-announcer"
    announcer.setAttribute("aria-live", priority)
    announcer.setAttribute("aria-atomic", "true")
    announcer.className = "sr-only"
    document.body.appendChild(announcer)
  }
  
  announcer.setAttribute("aria-live", priority)
  announcer.textContent = ""
  
  // Small delay to ensure screen reader picks up the change
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = message
    }
  }, 100)
}

// Focus management utilities
export function focusFirst(container: HTMLElement): void {
  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  if (focusable.length > 0) {
    focusable[0].focus()
  }
}

export function trapFocus(container: HTMLElement): () => void {
  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusable = focusable[0]
  const lastFocusable = focusable[focusable.length - 1]
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }
  
  container.addEventListener("keydown", handleKeyDown)
  
  return () => {
    container.removeEventListener("keydown", handleKeyDown)
  }
}
