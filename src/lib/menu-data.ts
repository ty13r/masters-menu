export interface Dish {
  name: string;
  description: string;
}

export interface MenuData {
  honoree: string;
  date: string;
  appetizers: Dish[];
  firstCourse: Dish;
  mainCourses: Dish[];
  dessert: Dish;
  wines: string[];
}

export const defaultMenu: MenuData = {
  honoree: "Your Name",
  date: "April 7, 2026",
  appetizers: [
    { name: "Peach & Ricotta Flatbread", description: "Balsamic, Hot Honey, Basil" },
    { name: "Rock Shrimp Tempura", description: "Creamy Spicy Sauce" },
    { name: "Bacon-Wrapped Dates", description: "Goat Cheese, Almonds" },
    { name: "Grilled Elk Sliders", description: "Caramelized Onion Jam, Roasted Garlic Aioli" },
  ],
  firstCourse: {
    name: "Yellowfin Tuna Carpaccio",
    description: "Foie Gras, Toasted Baguette, Chives",
  },
  mainCourses: [
    { name: "Wagyu Filet Mignon", description: "Traditional Irish Champ, Sautéed Brussels Sprouts" },
    { name: "Seared Salmon", description: "Glazed Carrots with Brown Butter, Crispy Vidalia Onion Rings" },
  ],
  dessert: {
    name: "Sticky Toffee Pudding",
    description: "Vanilla Ice Cream & Warm Toffee Sauce",
  },
  wines: [
    '2015 Salon "S", Brut, Le Mesnil-sur-Oger, Champagne',
    "2022 Domaine Leflaive, Batard-Montrachet, Puligny-Montrachet, Burgundy",
    "1990 Chateau Lafite Rothschild, Pauillac, Bordeaux",
    "1989 Chateau d'Yquem, Sauternes, Bordeaux",
  ],
};
