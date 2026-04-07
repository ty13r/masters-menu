export type StepGroupId =
  | "date"
  | "appetizer-0"
  | "appetizer-1"
  | "appetizer-2"
  | "appetizer-3"
  | "first-course"
  | "main-course-0"
  | "main-course-1"
  | "dessert"
  | "beverage-0"
  | "beverage-1"
  | "beverage-2"
  | "beverage-3"
  | "honoree";

export interface Step {
  id: StepGroupId;
  label: string;
}

export const STEPS: ReadonlyArray<Step> = [
  { id: "date", label: "Date" },
  { id: "appetizer-0", label: "Appetizer 1" },
  { id: "appetizer-1", label: "Appetizer 2" },
  { id: "appetizer-2", label: "Appetizer 3" },
  { id: "appetizer-3", label: "Appetizer 4" },
  { id: "first-course", label: "First Course" },
  { id: "main-course-0", label: "Main Course 1" },
  { id: "main-course-1", label: "Main Course 2" },
  { id: "dessert", label: "Dessert" },
  { id: "beverage-0", label: "Beverage 1" },
  { id: "beverage-1", label: "Beverage 2" },
  { id: "beverage-2", label: "Beverage 3" },
  { id: "beverage-3", label: "Beverage 4" },
  { id: "honoree", label: "Served in Honor of" },
];

export const TOTAL_STEPS = STEPS.length;
