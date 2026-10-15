/**
 * The words the components show or say to assistive tech, by component:
 * English (`en`) and French (`fr`) built in. LocaleProvider picks the list
 * for its locale ('fr-CA' → fr, anything else → en) and merges its `messages`
 * over it, so one word can change without restating the rest:
 *
 *   <LocaleProvider locale="fr-FR" messages={{ table: { empty: 'Aucun patient' } }}>
 *
 * Words given straight to a component (a `placeholder`, `label`,
 * EventCalendar's `translations`) win over these.
 *
 * Entries that take values are functions. The `zag` group passes on to Zag's
 * own `translations` (the screen-reader labels inside DatePicker, Select,
 * NumberInput, PasswordInput, PinInput, TagsInput, Pagination, FileUpload,
 * CopyButton, TreeView and Editable); English leaves them to Zag.
 */
import type { DatePicker } from '@ark-ui/react/date-picker'
import type { NumberInput } from '@ark-ui/react/number-input'
import type { PasswordInput } from '@ark-ui/react/password-input'
import type { TagsInput } from '@ark-ui/react/tags-input'
import type { Pagination } from '@ark-ui/react/pagination'
import type { FileUpload } from '@ark-ui/react/file-upload'
import type { Combobox } from '@ark-ui/react/combobox'
import type { Select } from '@ark-ui/react/select'
import type { Clipboard } from '@ark-ui/react/clipboard'
import type { TreeView } from '@ark-ui/react/tree-view'
import type { Editable } from '@ark-ui/react/editable'
import type { PinInput } from '@ark-ui/react/pin-input'

export type CalendarMessages = {
  today: string, previous: string, next: string, allDay: string, view: string, pickDate: string
  day: string, week: string, workweek: string, days: (count: number) => string
  more: (count: number) => string, less: string, unavailable: string, cancel: string
  placing: (name: string) => string, selected: (when: string) => string
  moved: (name: string, when: string) => string, resized: (name: string, time: string) => string
}

export type Messages = {
  common: {
    close: string, dismiss: string, cancel: string, confirm: string, save: string, edit: string
    loading: string, remove: (name: string) => string, more: (count: number) => string
  }
  confirm: { typeToConfirm: (word: string) => string, typePrefix: string, typeSuffix: string }
  copyButton: { copy: string, copied: string }
  button: { countLabel: string }
  avatar: { status: Record<'online' | 'away' | 'busy' | 'offline', string> }
  shell: {
    nav: string, openMenu: string, closeMenu: string, expandSidebar: string, collapseSidebar: string
    expandAll: string, collapseAll: string
  }
  breadcrumbs: { label: string }
  pagination: { label: string, noun: string, showing: (from: string, to: string, count: string, noun: string) => string }
  table: { empty: string, selectAll: string, selectRow: string }
  select: {
    placeholder: string, searchPlaceholder: string, empty: string, noMatches: string, loading: string
    create: (text: string) => string
  }
  tagsInput: { placeholder: string }
  datePicker: { format: (pattern: string) => string, min: (date: string) => string, max: (date: string) => string, unavailable: string }
  swatchPicker: { placeholder: string, colors: Record<string, string> }
  command: { label: string, placeholder: string, empty: string, loading: string, esc: string, toNavigate: string, toSelect: string }
  toaster: { label: string }
  actionBar: { label: string }
  chart: { label: string, total: string }
  stat: { up: string, down: string, same: string }
  themeToggle: { label: string, light: string, dark: string, system: string }
  appearance: {
    label: string, mode: string, accent: string, sidebar: string, lightOnly: string, custom: string, dev: string, reset: string
    accents: Record<string, string>, sidebars: Record<string, string>
  }
  sortableList: {
    handle: string, instructions: string, position: (index: number, count: number) => string
    pickedUp: (name: string, place: string) => string, movedTo: (name: string, place: string) => string
    dropped: (name: string, place: string | null) => string, cancelled: (name: string, place: string) => string
  }
  fileUpload: {
    prompt: (multiple: boolean) => string, browse: string
    reasons: Record<'FILE_INVALID_TYPE' | 'FILE_TOO_LARGE' | 'TOO_MANY_FILES' | 'FILE_TOO_SMALL', string>
  }
  attachments: {
    add: string, layout: string, grid: string, list: string, orDrop: string, dropToAdd: string, download: string
    open: (name: string) => string, downloadFile: (name: string) => string
    count: (count: number, max: number) => string, limit: (max: number) => string
    notType: string, over: (size: string) => string, notAdded: (name: string, reason: string) => string
  }
  editor: {
    toolbar: string, link: string, image: string, remove: string, apply: string, uploading: string, linkPlaceholder: string
    tools: Record<'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'h2' | 'h3' | 'bulletList' | 'orderedList' | 'blockquote' | 'undo' | 'redo', string>
  }
  calendar: CalendarMessages
  zag: {
    datePicker?: DatePicker.RootProps['translations']
    numberInput?: NumberInput.RootProps['translations']
    passwordInput?: PasswordInput.RootProps['translations']
    tagsInput?: TagsInput.RootProps['translations']
    pagination?: Pagination.RootProps['translations']
    fileUpload?: FileUpload.RootProps['translations']
    combobox?: Combobox.RootProps<never>['translations']
    select?: Select.RootProps<never>['translations']
    clipboard?: Clipboard.RootProps['translations']
    treeView?: TreeView.RootProps<never>['translations']
    editable?: Editable.RootProps['translations']
    pinInput?: PinInput.RootProps['translations']
  }
}

const capital = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)
const swatchNames = ['slate', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue',
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']

export const en: Messages = {
  common: {
    close: 'Close', dismiss: 'Dismiss', cancel: 'Cancel', confirm: 'Confirm', save: 'Save', edit: 'Edit', loading: 'Loading',
    remove: (name) => `Remove ${name}`.trim(), more: (count) => `${count} more`,
  },
  confirm: { typeToConfirm: (word) => `Type ${word} to confirm`, typePrefix: 'Type', typeSuffix: 'to confirm' },
  copyButton: { copy: 'Copy', copied: 'Copied' },
  button: { countLabel: 'new' },
  avatar: { status: { online: 'Online', away: 'Away', busy: 'Busy', offline: 'Offline' } },
  shell: {
    nav: 'Main', openMenu: 'Open menu', closeMenu: 'Close menu', expandSidebar: 'Expand sidebar', collapseSidebar: 'Collapse sidebar',
    expandAll: 'Expand all', collapseAll: 'Collapse all',
  },
  breadcrumbs: { label: 'Breadcrumb' },
  pagination: { label: 'Pagination', noun: 'items', showing: (from, to, count, noun) => `Showing ${from}–${to} of ${count}${noun ? ` ${noun}` : ''}` },
  table: { empty: 'Nothing here yet', selectAll: 'Select all rows', selectRow: 'Select' },
  select: {
    placeholder: 'Select…', searchPlaceholder: 'Search…', empty: 'No options', noMatches: 'No matches', loading: 'Loading…',
    create: (text) => `Create “${text}”`,
  },
  tagsInput: { placeholder: 'Add…' },
  datePicker: {
    format: (pattern) => `Enter a date as ${pattern}`, min: (date) => `Pick a date from ${date}`, max: (date) => `Pick a date up to ${date}`,
    unavailable: 'That date isn’t available',
  },
  swatchPicker: { placeholder: 'Choose a colour', colors: Object.fromEntries(swatchNames.map((name) => [name, capital(name)])) },
  command: {
    label: 'Command menu', placeholder: 'Type a command or search…', empty: 'No results', loading: 'Searching…',
    esc: 'Esc', toNavigate: 'to navigate', toSelect: 'to select',
  },
  toaster: { label: 'Notifications' },
  actionBar: { label: 'Selection actions' },
  chart: { label: 'Chart', total: 'Total' },
  stat: { up: 'Up', down: 'Down', same: 'No change' },
  themeToggle: { label: 'Colour scheme', light: 'Light', dark: 'Dark', system: 'System' },
  appearance: {
    label: 'Appearance', mode: 'Mode', accent: 'Colour', sidebar: 'Sidebar', lightOnly: 'in light mode',
    custom: 'Any colour', dev: 'Dev mode', reset: 'Reset',
    accents: { slate: 'Slate', blue: 'Blue', indigo: 'Indigo', violet: 'Violet', teal: 'Teal', emerald: 'Emerald', rose: 'Rose' },
    sidebars: { default: 'Default', neutral: 'Neutral', soft: 'Soft', tint: 'Tint', accent: 'Accent', dark: 'Dark', deep: 'Deep' },
  },
  sortableList: {
    handle: 'Drag to reorder',
    instructions: 'Press Space to pick this up. While dragging, use the arrow keys to move it, Space to drop it, or Escape to cancel.',
    position: (index, count) => `position ${index} of ${count}`,
    pickedUp: (name, place) => `Picked up ${name}, at ${place}.`,
    movedTo: (name, place) => `${name} moved to ${place}.`,
    dropped: (name, place) => place ? `${name} dropped at ${place}.` : `${name} dropped.`,
    cancelled: (name, place) => `Reordering cancelled: ${name} is back at ${place}.`,
  },
  fileUpload: {
    prompt: (multiple) => `Drop ${multiple ? 'files' : 'a file'} here or`, browse: 'browse',
    reasons: { FILE_INVALID_TYPE: 'Not an allowed type', FILE_TOO_LARGE: 'Too large', TOO_MANY_FILES: 'Too many files', FILE_TOO_SMALL: 'Too small' },
  },
  attachments: {
    add: 'Add files', layout: 'Layout', grid: 'Grid', list: 'List', orDrop: 'or drop files here', dropToAdd: 'Drop to add', download: 'Download',
    open: (name) => `Open ${name}`, downloadFile: (name) => `Download ${name}`,
    count: (count, max) => `${count} of ${max}`, limit: (max) => `The limit is ${max} files`,
    notType: 'not an accepted type', over: (size) => `over ${size}`, notAdded: (name, reason) => `${name} wasn’t added: ${reason}.`,
  },
  editor: {
    toolbar: 'Formatting', link: 'Link', image: 'Image', remove: 'Remove', apply: 'Apply', uploading: 'Uploading…', linkPlaceholder: 'https://',
    tools: {
      bold: 'Bold', italic: 'Italic', underline: 'Underline', strike: 'Strikethrough', code: 'Code', h2: 'Heading', h3: 'Subheading',
      bulletList: 'Bulleted list', orderedList: 'Numbered list', blockquote: 'Quote', undo: 'Undo', redo: 'Redo',
    },
  },
  calendar: {
    today: 'Today', previous: 'Previous', next: 'Next', allDay: 'All day', view: 'View', pickDate: 'pick a date',
    day: 'Day', week: 'Week', workweek: 'Work week', days: (count) => `${count} days`,
    more: (count) => `+${count} more`, less: 'Show less', unavailable: 'Not available', cancel: 'Cancel',
    placing: (name) => `Placing ${name}: click a time, or press Escape to cancel.`,
    selected: (when) => `Selected ${when}.`, moved: (name, when) => `${name} moved to ${when}.`, resized: (name, time) => `${name} now ends at ${time}.`,
  },
  zag: {},
}

const frViews: Record<string, string> = { day: 'jours', month: 'mois', year: 'années' }

export const fr: Messages = {
  common: {
    close: 'Fermer', dismiss: 'Ignorer', cancel: 'Annuler', confirm: 'Confirmer', save: 'Enregistrer', edit: 'Modifier', loading: 'Chargement',
    remove: (name) => `Retirer ${name}`.trim(), more: (count) => `${count} de plus`,
  },
  confirm: { typeToConfirm: (word) => `Saisissez ${word} pour confirmer`, typePrefix: 'Saisissez', typeSuffix: 'pour confirmer' },
  copyButton: { copy: 'Copier', copied: 'Copié' },
  button: { countLabel: 'nouveaux' },
  avatar: { status: { online: 'En ligne', away: 'Absent', busy: 'Occupé', offline: 'Hors ligne' } },
  shell: {
    nav: 'Principal', openMenu: 'Ouvrir le menu', closeMenu: 'Fermer le menu', expandSidebar: 'Déplier la barre latérale',
    collapseSidebar: 'Replier la barre latérale', expandAll: 'Tout déplier', collapseAll: 'Tout replier',
  },
  breadcrumbs: { label: 'Fil d’Ariane' },
  pagination: { label: 'Pagination', noun: 'éléments', showing: (from, to, count, noun) => `${from}–${to} sur ${count}${noun ? ` ${noun}` : ''}` },
  table: { empty: 'Rien pour l’instant', selectAll: 'Sélectionner toutes les lignes', selectRow: 'Sélectionner' },
  select: {
    placeholder: 'Choisir…', searchPlaceholder: 'Rechercher…', empty: 'Aucune option', noMatches: 'Aucun résultat', loading: 'Chargement…',
    create: (text) => `Créer « ${text} »`,
  },
  tagsInput: { placeholder: 'Ajouter…' },
  datePicker: {
    format: (pattern) => `Saisissez une date au format ${pattern.replace(/d/g, 'j').replace(/y/g, 'a')}`,
    min: (date) => `Choisissez une date à partir du ${date}`, max: (date) => `Choisissez une date jusqu’au ${date}`,
    unavailable: 'Cette date n’est pas disponible',
  },
  swatchPicker: {
    placeholder: 'Choisir une couleur',
    colors: {
      slate: 'Ardoise', red: 'Rouge', orange: 'Orange', amber: 'Ambre', yellow: 'Jaune', lime: 'Citron vert', green: 'Vert',
      emerald: 'Émeraude', teal: 'Sarcelle', cyan: 'Cyan', sky: 'Ciel', blue: 'Bleu', indigo: 'Indigo', violet: 'Violet',
      purple: 'Pourpre', fuchsia: 'Fuchsia', pink: 'Rose', rose: 'Rose vif',
    },
  },
  command: {
    label: 'Menu de commandes', placeholder: 'Tapez une commande ou recherchez…', empty: 'Aucun résultat', loading: 'Recherche…',
    esc: 'Échap', toNavigate: 'pour naviguer', toSelect: 'pour choisir',
  },
  toaster: { label: 'Notifications' },
  actionBar: { label: 'Actions sur la sélection' },
  chart: { label: 'Graphique', total: 'Total' },
  stat: { up: 'Hausse', down: 'Baisse', same: 'Stable' },
  themeToggle: { label: 'Thème', light: 'Clair', dark: 'Sombre', system: 'Système' },
  appearance: {
    label: 'Apparence', mode: 'Mode', accent: 'Couleur', sidebar: 'Barre latérale', lightOnly: 'en mode clair',
    custom: 'Couleur libre', dev: 'Mode dev', reset: 'Réinitialiser',
    accents: { slate: 'Ardoise', blue: 'Bleu', indigo: 'Indigo', violet: 'Violet', teal: 'Teal', emerald: 'Émeraude', rose: 'Rose' },
    sidebars: { default: 'Par défaut', neutral: 'Neutre', soft: 'Doux', tint: 'Teinte', accent: 'Accent', dark: 'Foncé', deep: 'Très foncé' },
  },
  sortableList: {
    handle: 'Glisser pour réordonner',
    instructions: 'Appuyez sur Espace pour saisir cet élément. Déplacez-le ensuite avec les flèches, déposez-le avec Espace, ou appuyez sur Échap pour annuler.',
    position: (index, count) => `position ${index} sur ${count}`,
    pickedUp: (name, place) => `${name} saisi, en ${place}.`,
    movedTo: (name, place) => `${name} déplacé en ${place}.`,
    dropped: (name, place) => place ? `${name} déposé en ${place}.` : `${name} déposé.`,
    cancelled: (name, place) => `Déplacement annulé : ${name} est revenu en ${place}.`,
  },
  fileUpload: {
    prompt: (multiple) => `Déposez ${multiple ? 'des fichiers' : 'un fichier'} ici ou`, browse: 'parcourez',
    reasons: { FILE_INVALID_TYPE: 'Type non autorisé', FILE_TOO_LARGE: 'Trop volumineux', TOO_MANY_FILES: 'Trop de fichiers', FILE_TOO_SMALL: 'Trop petit' },
  },
  attachments: {
    add: 'Ajouter des fichiers', layout: 'Affichage', grid: 'Grille', list: 'Liste', orDrop: 'ou déposez des fichiers ici',
    dropToAdd: 'Déposez pour ajouter', download: 'Télécharger',
    open: (name) => `Ouvrir ${name}`, downloadFile: (name) => `Télécharger ${name}`,
    count: (count, max) => `${count} sur ${max}`, limit: (max) => `La limite est de ${max} fichiers`,
    notType: 'type non accepté', over: (size) => `plus de ${size}`, notAdded: (name, reason) => `${name} n’a pas été ajouté : ${reason}.`,
  },
  editor: {
    toolbar: 'Mise en forme', link: 'Lien', image: 'Image', remove: 'Retirer', apply: 'Appliquer', uploading: 'Envoi…', linkPlaceholder: 'https://',
    tools: {
      bold: 'Gras', italic: 'Italique', underline: 'Souligné', strike: 'Barré', code: 'Code', h2: 'Titre', h3: 'Sous-titre',
      bulletList: 'Liste à puces', orderedList: 'Liste numérotée', blockquote: 'Citation', undo: 'Annuler', redo: 'Rétablir',
    },
  },
  calendar: {
    today: 'Aujourd’hui', previous: 'Précédent', next: 'Suivant', allDay: 'Journée', view: 'Vue', pickDate: 'choisir une date',
    day: 'Jour', week: 'Semaine', workweek: 'Semaine de travail', days: (count) => `${count} jours`,
    more: (count) => `+${count} de plus`, less: 'Réduire', unavailable: 'Indisponible', cancel: 'Annuler',
    placing: (name) => `Placement de ${name} : cliquez sur un créneau, ou Échap pour annuler.`,
    selected: (when) => `${when} sélectionné.`, moved: (name, when) => `${name} déplacé au ${when}.`, resized: (name, time) => `${name} finit maintenant à ${time}.`,
  },
  zag: {
    datePicker: {
      dayCell: (state) => state.unavailable ? `Indisponible. ${state.valueText}` : state.selected ? `Date choisie. ${state.valueText}` : `Choisir ${state.valueText}`,
      trigger: (open) => open ? 'Fermer le calendrier' : 'Ouvrir le calendrier',
      viewTrigger: (view, next) => next ? `Passer à la vue ${frViews[next] ?? next}` : `Vue ${frViews[view] ?? view}`,
      prevTrigger: (view) => view === 'year' ? 'Décennie précédente' : view === 'month' ? 'Année précédente' : 'Mois précédent',
      nextTrigger: (view) => view === 'year' ? 'Décennie suivante' : view === 'month' ? 'Année suivante' : 'Mois suivant',
      presetTrigger: ([start = '', end = '']) => `choisir du ${start} au ${end}`,
      clearTrigger: 'Effacer les dates', content: 'calendrier', monthSelect: 'Choisir le mois', yearSelect: 'Choisir l’année',
    },
    numberInput: { incrementLabel: 'augmenter', decrementLabel: 'diminuer' },
    passwordInput: { visibilityTrigger: (visible) => visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe' },
    tagsInput: {
      clearTriggerLabel: 'Effacer toutes les étiquettes', deleteTagTriggerLabel: (value) => `Supprimer l’étiquette ${value}`,
      tagAdded: (value) => `Étiquette ${value} ajoutée`, tagsPasted: (values) => `${values.length} étiquettes collées`,
      tagEdited: (value) => `Modification de l’étiquette ${value}. Entrée pour enregistrer, Échap pour annuler.`,
      tagUpdated: (value) => `Étiquette modifiée en ${value}`, tagDeleted: (value) => `Étiquette ${value} supprimée`,
      tagSelected: (value) => `Étiquette ${value} sélectionnée. Entrée pour modifier, Suppr ou Retour arrière pour retirer.`,
      noTagsSelected: 'Aucune étiquette sélectionnée', inputLabel: (count) => count === 1 ? '1 étiquette' : `${count} étiquettes`,
    },
    pagination: {
      rootLabel: 'pagination', firstTriggerLabel: 'première page', prevTriggerLabel: 'page précédente',
      nextTriggerLabel: 'page suivante', lastTriggerLabel: 'dernière page',
      itemLabel: ({ page, totalPages }) => `${totalPages > 1 && page === totalPages ? 'dernière page, ' : ''}page ${page}`,
    },
    fileUpload: {
      dropzone: 'zone de dépôt', itemPreview: (file) => `aperçu de ${file.name}`, deleteFile: (file) => `supprimer le fichier ${file.name}`,
    },
    combobox: { triggerLabel: 'Afficher les suggestions', clearTriggerLabel: 'Effacer' },
    select: { clearTriggerLabel: 'Effacer' },
    clipboard: { triggerLabel: (copied) => copied ? 'Copié dans le presse-papiers' : 'Copier dans le presse-papiers' },
    treeView: { treeLabel: 'Arborescence', renameInputLabel: 'Renommer l’élément' },
    editable: { input: 'champ modifiable', edit: 'modifier', submit: 'valider', cancel: 'annuler' },
    pinInput: { inputLabel: (index, length) => `chiffre ${index + 1} sur ${length}` },
  },
}

export const builtIn: Record<string, Messages> = { en, fr }

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends (...args: never[]) => unknown ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K] }

// Merges plain objects; functions and everything else replace.
export function mergeMessages<T>(base: T, over: DeepPartial<T> | null | undefined): T {
  if (!over) return base
  const out = { ...base } as Record<string, unknown>
  for (const [key, value] of Object.entries(over)) {
    if (value === undefined) continue
    const current = out[key]
    out[key] = value && typeof value === 'object' && !Array.isArray(value) && current && typeof current === 'object'
      ? mergeMessages(current, value as DeepPartial<typeof current>) : value
  }
  return out as T
}
