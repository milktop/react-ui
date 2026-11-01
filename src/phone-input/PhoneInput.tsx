/**
 * A phone number input: the number, and a flag that is also a country picker.
 *
 *   <PhoneInput label="Phone" country="FR" countries={['FR', 'BE', 'GB']} showType value={phone} onValueChange={setPhone} />
 *   <Field label="Phone" type="phone" countries={['FR', 'BE']} value={phone} onValueChange={setPhone} />
 *
 * - `value`, `defaultValue`: the number in E.164 ('+33612345678') once it's
 *   valid, else the text as typed, so a form can still reject it
 * - `onValueChange`: called as it's typed; `onValueCommit`: when it's left or
 *   a country is picked (the number then shows formatted)
 * - `country`: the country of numbers typed without a "+" (default: the
 *   locale's region, e.g. FR for 'fr-FR')
 * - `countries`: countries listed first in the picker, e.g. ['FR', 'BE', 'GB']
 * - `showType`: a mobile or landline icon after a valid number (its word as a
 *   tooltip and label)
 * - `picker`: 'search' (a list searched by name, code or dialling code) or
 *   'native' (the browser's own select); by default native on touch screens
 * - `label`: a label above it (skipped inside a Field); `locale`: for the
 *   countries' names (the LocaleProvider's by default)
 * - `name`, `placeholder`, `autoComplete` ('tel'), `required`, `disabled`: as
 *   on an input
 *
 * It shows a number in national format when it's in `country`, international
 * otherwise. The flag follows the number ("+44…" shows the UK's); picking one
 * reads a number typed without "+" as that country's; Backspace in the empty
 * input goes back to `country`. A number left invalid says why once the input
 * loses focus (too short, too long, not a number), in its Field when it has
 * one; an `error` given to the Field wins.
 */
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Field as ArkField, useFieldContext } from '@ark-ui/react/field'
import { Popover } from '@ark-ui/react/popover'
import {
  AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString, validatePhoneNumberLength,
  type CountryCode, type PhoneNumber,
} from 'libphonenumber-js/max'
import '../icons.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { useLocale, useMessages } from '../format/LocaleProvider.js'
import { useFieldReport } from '../field/report.js'
import '../theme.css'
import '../popover/popover.css'
import './phone-input.css'

export type PhoneInputProps = {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  onValueCommit?: (value: string) => void
  country?: string | null
  countries?: string[]
  showType?: boolean
  picker?: 'search' | 'native' | null
  label?: ReactNode
  locale?: string
  name?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  className?: string
  classes?: Classes<'root' | 'label' | 'control' | 'country' | 'flag' | 'picker' | 'input' | 'type' | 'countries' | 'search' | 'list' | 'option' | 'empty'>
}

type Country = { code: CountryCode, name: string, dial: string, words: string }

const types: Record<string, 'mobile' | 'landline'> = { MOBILE: 'mobile', FIXED_LINE: 'landline' }
const reasons: Record<string, 'tooShort' | 'tooLong'> = { TOO_SHORT: 'tooShort', TOO_LONG: 'tooLong' }

const flagOf = (country?: string | null) =>
  country ? String.fromCodePoint(...[...country].map((letter) => 127397 + letter.charCodeAt(0))) : '🌐'

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function regionOf(locale?: string) {
  try {
    return locale ? new Intl.Locale(locale).maximize().region ?? null : null
  } catch {
    return null
  }
}

const parse = (text: string, region: CountryCode) => parsePhoneNumberFromString(text, region)
const valid = (text: string, region: CountryCode): PhoneNumber | null => {
  const parsed = parse(text, region)
  return parsed?.isValid() ? parsed : null
}

// The number as shown: national in the home country, international elsewhere
function display(value: string | null | undefined, home: CountryCode) {
  const parsed = valid(value ?? '', home)
  if (!parsed) return value ?? ''
  return parsed.country === home ? parsed.formatNational() : parsed.formatInternational()
}

const touchScreen = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

function useCountries(locale: string, countries: string[]) {
  return useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: 'region' })
    const item = (code: CountryCode): Country => {
      const name = names.of(code) ?? code
      return { code, name, dial: getCountryCallingCode(code), words: fold(name) }
    }
    const all = getCountries().map(item).sort((a, b) => a.name.localeCompare(b.name))
    const known = new Set<string>(getCountries())
    const first = countries.map((code) => code.toUpperCase()).filter((code) => known.has(code)).map((code) => item(code as CountryCode))
    return { first, all }
  }, [locale, countries.join()]) // eslint-disable-line react-hooks/exhaustive-deps
}

// `countries` first. A search matches a name's words (accents ignored), the
// code, or the dialling code; names starting with it next.
function search({ first, all }: { first: Country[], all: Country[] }, query: string) {
  const text = fold(query.trim())
  const place = (item: Country) => first.findIndex((top) => top.code === item.code)
  const rank = (item: Country) => (place(item) >= 0 ? 0 : item.words.startsWith(text) ? 1 : 2)
  const hits = all.filter((item) => {
    if (!text) return true
    if (/^\+?[\d\s]+$/.test(text)) return item.dial.startsWith(text.replace(/\D/g, ''))
    return item.code.toLowerCase() === text || item.words.split(/[\s'’-]+/).some((word) => word.startsWith(text))
  })
  return hits.sort((a, b) => rank(a) - rank(b) || place(a) - place(b))
}

export function PhoneInput({
  value, defaultValue, onValueChange, onValueCommit, country = null, countries = [], showType = false, picker = null,
  label = null, locale: localeProp, name, placeholder = '', autoComplete = 'tel', required = false, disabled = false,
  className, classes,
}: PhoneInputProps) {
  const t = useMessages().phoneInput
  const field = useFieldContext()
  const report = useFieldReport()
  const part = partsOf('phone-input', classes)
  const ambient = useLocale()
  const locale = localeProp ?? ambient ?? 'en-GB'
  const ownId = useId()
  const listId = `${ownId}-countries`
  const input = useRef<HTMLInputElement>(null)

  const home = ((country ?? regionOf(locale) ?? 'FR').toUpperCase()) as CountryCode
  const [current, setCurrent] = useControllable<string | null>(value, defaultValue ?? null, undefined)
  const [entry, setEntry] = useState(() => display(current, home))
  // Numbers typed without "+" are read as this country's
  const [picked, setPicked] = useState<CountryCode | null>(null)
  const [touched, setTouched] = useState(false)
  const region = picked ?? home

  // A value changed from outside replaces what's shown
  const [shown, setShown] = useState(current)
  if (current !== shown) {
    setShown(current)
    setEntry(display(current, home))
    setPicked(null)
    setTouched(false)
  }

  const number = valid(entry, region)
  const type = number ? types[number.getType() ?? ''] ?? null : null
  const flagCountry = number?.country ?? (entry.trim().startsWith('+')
    ? (() => { const typing = new AsYouType(region); typing.input(entry); return typing.getCountry() })()
    : region)

  // Why the number isn't valid, once the input has lost focus
  const problem = touched && entry.trim() && !number ? t[reasons[validatePhoneNumberLength(entry, region) ?? ''] ?? 'invalid'] : null
  const invalid = !!(field?.invalid || problem)
  const locked = disabled || !!field?.disabled

  useEffect(() => {
    input.current?.setCustomValidity(problem ?? '')
    report?.(problem)
  }, [problem, report])
  useEffect(() => () => report?.(null), [report])

  function emit(text: string, from: CountryCode) {
    const next = valid(text, from)?.number ?? text.trim()
    setShown(next)
    setCurrent(next)
    onValueChange?.(next)
    return next
  }

  function settle(text: string, from: CountryCode, next: string) {
    const parsed = valid(text, from)
    if (parsed) setEntry(display(parsed.number, home))
    setTouched(true)
    onValueCommit?.(next)
  }

  function typed(text: string) {
    setEntry(text)
    emit(text, region)
  }

  // Backspace with nothing left to delete drops a picked country
  function erase(event: KeyboardEvent) {
    if (event.key === 'Backspace' && !entry && picked) setPicked(null)
  }

  function choose(code: CountryCode) {
    const parsed = parse(entry, region)
    const text = parsed && entry.trim().startsWith('+') ? parsed.nationalNumber : entry
    setPicked(code)
    setEntry(text)
    const next = emit(text, code)
    if (text.trim()) settle(text, code, next)
    // After the popover has handed focus back to its trigger
    setTimeout(() => input.current?.focus(), 0)
  }

  const searching = picker ? picker === 'search' : !touchScreen()
  const list = useCountries(locale, countries)

  return (
    <div {...part('root')} className={cx(className, classes?.root)} data-invalid={invalid || undefined} data-disabled={locked || undefined}>
      {label && !field && <label {...part('label')} htmlFor={`${ownId}-input`}>{label}</label>}
      <div {...part('control')}>
        {searching
          ? <CountrySearch list={list} flagCountry={flagCountry} listId={listId} disabled={locked} part={part} onChoose={choose} />
          : (
            <span {...part('country')}>
              <span {...part('flag')} aria-hidden="true">{flagOf(flagCountry)}</span>
              <select {...part('picker')} aria-label={t.country} disabled={locked} value={flagCountry ?? ''}
                onChange={(event) => choose(event.target.value as CountryCode)}>
                <option value="" disabled hidden>🌐</option>
                {list.first.map((item) => <option key={`first-${item.code}`} value={item.code}>{flagOf(item.code)} {item.name} +{item.dial}</option>)}
                {list.first.length > 0 && <option disabled>──────────</option>}
                {list.all.map((item) => <option key={item.code} value={item.code}>{flagOf(item.code)} {item.name} +{item.dial}</option>)}
              </select>
            </span>
          )}
        {/* Inside a Field, Field.Input takes the field's id and describes itself by its hint or error */}
        <ArkField.Input ref={input} {...part('input')} id={field ? undefined : `${ownId}-input`} type="tel" name={name}
          placeholder={placeholder} autoComplete={autoComplete} required={required} disabled={locked} value={entry}
          aria-invalid={invalid || undefined}
          onChange={(event) => typed(event.target.value)} onKeyDown={erase}
          onBlur={() => settle(entry, region, current ?? '')} />
        {showType && type && (
          <span {...part('type')} title={t[type]} aria-label={t[type]}>
            <iconify-icon icon={type === 'mobile' ? 'lucide:smartphone' : 'lucide:phone'} aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  )
}

type SearchProps = {
  list: { first: Country[], all: Country[] }
  flagCountry: CountryCode | undefined
  listId: string
  disabled: boolean
  part: ReturnType<typeof partsOf>
  onChoose: (code: CountryCode) => void
}

// The flag as a button opening a searchable list of countries
function CountrySearch({ list, flagCountry, listId, disabled, part, onChoose }: SearchProps) {
  const t = useMessages().phoneInput
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const matches = useMemo(() => search(list, query), [list, query])
  const highlighted = matches[active]

  // The highlighted country stays in view
  useEffect(() => {
    if (open) document.getElementById(`${listId}-${highlighted?.code}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, highlighted, listId])

  function toggle(next: boolean) {
    setOpen(next)
    if (!next) return
    setQuery('')
    setActive(Math.max(0, search(list, '').findIndex((item) => item.code === flagCountry)))
  }

  function choose(code: CountryCode) {
    setOpen(false)
    onChoose(code)
  }

  function navigate(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.min(matches.length - 1, Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1))))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (highlighted) choose(highlighted.code)
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={(details) => toggle(details.open)} positioning={{ placement: 'bottom-start', strategy: 'fixed' }}>
      <Popover.Trigger {...part('country')} type="button" disabled={disabled} aria-label={t.country}>
        <span {...part('flag')} aria-hidden="true">{flagOf(flagCountry)}</span>
      </Popover.Trigger>
      <Popover.Positioner data-scope="popover" data-part="positioner">
        <Popover.Content data-scope="popover" data-part="content" data-flush="">
          <div {...part('countries')}>
            <input {...part('search')} type="search" placeholder={t.search} aria-label={t.search} autoComplete="off"
              role="combobox" aria-expanded="true" aria-controls={listId}
              aria-activedescendant={highlighted ? `${listId}-${highlighted.code}` : undefined}
              value={query} onChange={(event) => { setQuery(event.target.value); setActive(0) }} onKeyDown={navigate} />
            <div {...part('list')} id={listId} role="listbox" aria-label={t.country}>
              {matches.map((item, index) => (
                <div key={item.code} {...part('option')} id={`${listId}-${item.code}`} role="option"
                  aria-selected={item.code === flagCountry} data-highlighted={index === active || undefined}
                  onPointerDown={(event) => event.preventDefault()} onClick={() => choose(item.code)}
                  onPointerMove={() => index !== active && setActive(index)}>
                  <span {...part('flag')} aria-hidden="true">{flagOf(item.code)}</span>
                  <span data-scope="phone-input" data-part="name">{item.name}</span>
                  <span data-scope="phone-input" data-part="dial">+{item.dial}</span>
                </div>
              ))}
              {!matches.length && <div {...part('empty')}>{t.noMatch}</div>}
            </div>
          </div>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
