export interface RoastableGolfer {
  name: string;
  slug: string;
  /** Shown in the picker UI only — never sent to the model. */
  hint: string;
}

export const ROASTABLE_GOLFERS: ReadonlyArray<RoastableGolfer> = [
  {
    name: "Tiger Woods",
    slug: "tiger-woods",
    hint: "the comeback king, the late-night DUI, the 1997 Masters jacket",
  },
  {
    name: "John Daly",
    slug: "john-daly",
    hint: "Diet Cokes, cigarettes, Hooters appearances, two PGA wins anyway",
  },
  {
    name: "Phil Mickelson",
    slug: "phil-mickelson",
    hint: "thumbs-up calf strains, casino math, LIV money",
  },
  {
    name: "Sergio García",
    slug: "sergio-garcia",
    hint: "the green-spitting tantrum, finally winning a major in his 70th try",
  },
  {
    name: "Bryson DeChambeau",
    slug: "bryson-dechambeau",
    hint: "mad scientist phase, the weight gain era, slow-play stopwatches",
  },
  {
    name: "Patrick Reed",
    slug: "patrick-reed",
    hint: "rules officials' favorite customer, Captain America at the Ryder Cup",
  },
  {
    name: "Rory McIlroy",
    slug: "rory-mcilroy",
    hint: "the 10th hole at Augusta, every almost-major, LIV opinions that aged like milk",
  },
  {
    name: "Jordan Spieth",
    slug: "jordan-spieth",
    hint: "the 12 on number 12 in 2016, talks to 'Michael' between every shot",
  },
  {
    name: "Jon Rahm",
    slug: "jon-rahm",
    hint: "'I'll never go to LIV' → Wednesday morning press conference",
  },
  {
    name: "Greg Norman",
    slug: "greg-norman",
    hint: "Saturday at the '96 Masters, then becoming LIV's CEO",
  },
];
