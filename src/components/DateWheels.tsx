import { WheelColumn, WheelItem, WheelPickerFrame, WheelSeparator } from './WheelPicker';

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export type DateValue = { day: number; month: number; year: number };

export function defaultDateValue(): DateValue {
  return { day: 1, month: 1, year: new Date().getFullYear() - 25 };
}

const dayItems: WheelItem<number>[] = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
const monthItems: WheelItem<number>[] = MOIS_LABELS.map((m, i) => ({ value: i + 1, label: m }));
const currentYear = new Date().getFullYear();
const yearItems: WheelItem<number>[] = Array.from({ length: 96 }, (_, i) => {
  const y = currentYear - 5 - i;
  return { value: y, label: String(y) };
});

export function DateWheelPicker({ value, onChange }: { value: DateValue; onChange: (v: DateValue) => void }) {
  return (
    <WheelPickerFrame wide>
      <WheelColumn items={dayItems} value={value.day} onChange={(day) => onChange({ ...value, day })} />
      <WheelColumn items={monthItems} value={value.month} onChange={(month) => onChange({ ...value, month })} />
      <WheelColumn items={yearItems} value={value.year} onChange={(year) => onChange({ ...value, year })} />
    </WheelPickerFrame>
  );
}

export type TimeValue = { hour: string; minute: string };

export function defaultTimeValue(): TimeValue {
  return { hour: '', minute: '' };
}

const hourItems: WheelItem<string>[] = [{ value: '', label: '—' }].concat(
  Array.from({ length: 24 }, (_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }))
);
const minuteItems: WheelItem<string>[] = [{ value: '', label: '—' }].concat(
  ['00', '15', '30', '45'].map((m) => ({ value: m, label: m }))
);

export function TimeWheelPicker({ value, onChange }: { value: TimeValue; onChange: (v: TimeValue) => void }) {
  return (
    <WheelPickerFrame>
      <WheelColumn items={hourItems} value={value.hour} onChange={(hour) => onChange({ ...value, hour })} />
      <WheelSeparator label=":" />
      <WheelColumn items={minuteItems} value={value.minute} onChange={(minute) => onChange({ ...value, minute })} />
    </WheelPickerFrame>
  );
}

export function dateValueToISO(v: DateValue): string {
  return `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`;
}

export function isoToDateValue(iso: string): DateValue {
  const [year, month, day] = iso.split('-').map(Number);
  return { day, month, year };
}
