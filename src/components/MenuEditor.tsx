"use client";

import type { MenuData, Dish } from "@/lib/menu-data";

interface Props {
  menu: MenuData;
  updateField: <K extends keyof MenuData>(field: K, value: MenuData[K]) => void;
  updateAppetizer: (index: number, dish: Dish) => void;
  updateMainCourse: (index: number, dish: Dish) => void;
  updateWine: (index: number, value: string) => void;
}

export default function MenuEditor({
  menu,
  updateField,
  updateAppetizer,
  updateMainCourse,
  updateWine,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#006747]">Create Your Menu</h2>

      {/* Honoree & Date */}
      <Section title="Details">
        <Input
          label="Served in Honor of"
          value={menu.honoree}
          onChange={(v) => updateField("honoree", v)}
        />
        <Input
          label="Date"
          value={menu.date}
          onChange={(v) => updateField("date", v)}
        />
      </Section>

      {/* Appetizers */}
      <Section title="Appetizers">
        {menu.appetizers.map((app, i) => (
          <DishInput
            key={i}
            label={`Appetizer ${i + 1}`}
            dish={app}
            onChange={(d) => updateAppetizer(i, d)}
          />
        ))}
      </Section>

      {/* First Course */}
      <Section title="First Course">
        <DishInput
          label="First Course"
          dish={menu.firstCourse}
          onChange={(d) => updateField("firstCourse", d)}
        />
      </Section>

      {/* Main Course */}
      <Section title="Main Course (Choice of)">
        {menu.mainCourses.map((mc, i) => (
          <DishInput
            key={i}
            label={`Option ${i + 1}`}
            dish={mc}
            onChange={(d) => updateMainCourse(i, d)}
          />
        ))}
      </Section>

      {/* Dessert */}
      <Section title="Dessert">
        <DishInput
          label="Dessert"
          dish={menu.dessert}
          onChange={(d) => updateField("dessert", d)}
        />
      </Section>

      {/* Wines */}
      <Section title="Beverage Pairings">
        {menu.wines.map((wine, i) => (
          <Input
            key={i}
            label={`Wine ${i + 1}`}
            value={wine}
            onChange={(v) => updateWine(i, v)}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#006747]/20 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-[#006747] uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#006747]/40 focus:border-[#006747]"
      />
    </div>
  );
}

function DishInput({
  label,
  dish,
  onChange,
}: {
  label: string;
  dish: { name: string; description: string };
  onChange: (d: { name: string; description: string }) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={dish.name}
        placeholder="Dish name"
        onChange={(e) => onChange({ ...dish, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#006747]/40 focus:border-[#006747]"
      />
      <input
        type="text"
        value={dish.description}
        placeholder="Description (ingredients, sides, etc.)"
        onChange={(e) => onChange({ ...dish, description: e.target.value })}
        className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#006747]/40 focus:border-[#006747]"
      />
    </div>
  );
}
