import { Team, Match, Group, Player, Stadium } from "@wc26/types";

export const TEAMS: Team[] = [
  {
    "id": "cze",
    "name": "Czechia",
    "code": "CZE",
    "flag": "cz",
    "confederation": "UEFA",
    "group": "A"
  },
  {
    "id": "kor",
    "name": "South Korea",
    "code": "KOR",
    "flag": "kr",
    "confederation": "AFC",
    "group": "A"
  },
  {
    "id": "mex",
    "name": "Mexico",
    "code": "MEX",
    "flag": "mx",
    "confederation": "CONCACAF",
    "group": "A"
  },
  {
    "id": "rsa",
    "name": "South Africa",
    "code": "RSA",
    "flag": "za",
    "confederation": "CAF",
    "group": "A"
  },
  {
    "id": "bih",
    "name": "Bosnia and Herzegovina",
    "code": "BIH",
    "flag": "ba",
    "confederation": "UEFA",
    "group": "B"
  },
  {
    "id": "can",
    "name": "Canada",
    "code": "CAN",
    "flag": "ca",
    "confederation": "CONCACAF",
    "group": "B"
  },
  {
    "id": "qat",
    "name": "Qatar",
    "code": "QAT",
    "flag": "qa",
    "confederation": "AFC",
    "group": "B"
  },
  {
    "id": "sui",
    "name": "Switzerland",
    "code": "SUI",
    "flag": "ch",
    "confederation": "UEFA",
    "group": "B"
  },
  {
    "id": "bra",
    "name": "Brazil",
    "code": "BRA",
    "flag": "br",
    "confederation": "CONMEBOL",
    "group": "C"
  },
  {
    "id": "hai",
    "name": "Haiti",
    "code": "HAI",
    "flag": "ht",
    "confederation": "CONCACAF",
    "group": "C"
  },
  {
    "id": "mar",
    "name": "Morocco",
    "code": "MAR",
    "flag": "ma",
    "confederation": "CAF",
    "group": "C"
  },
  {
    "id": "sco",
    "name": "Scotland",
    "code": "SCO",
    "flag": "sco",
    "confederation": "UEFA",
    "group": "C"
  },
  {
    "id": "aus",
    "name": "Australia",
    "code": "AUS",
    "flag": "au",
    "confederation": "AFC",
    "group": "D"
  },
  {
    "id": "par",
    "name": "Paraguay",
    "code": "PAR",
    "flag": "py",
    "confederation": "CONMEBOL",
    "group": "D"
  },
  {
    "id": "tur",
    "name": "Turkey",
    "code": "TUR",
    "flag": "tr",
    "confederation": "UEFA",
    "group": "D"
  },
  {
    "id": "usa",
    "name": "United States",
    "code": "USA",
    "flag": "us",
    "confederation": "CONCACAF",
    "group": "D"
  },
  {
    "id": "civ",
    "name": "Ivory Coast",
    "code": "CIV",
    "flag": "ci",
    "confederation": "CAF",
    "group": "E"
  },
  {
    "id": "cuw",
    "name": "Curaçao",
    "code": "CUW",
    "flag": "cw",
    "confederation": "CONCACAF",
    "group": "E"
  },
  {
    "id": "ecu",
    "name": "Ecuador",
    "code": "ECU",
    "flag": "ec",
    "confederation": "CONMEBOL",
    "group": "E"
  },
  {
    "id": "ger",
    "name": "Germany",
    "code": "GER",
    "flag": "de",
    "confederation": "UEFA",
    "group": "E"
  },
  {
    "id": "jpn",
    "name": "Japan",
    "code": "JPN",
    "flag": "jp",
    "confederation": "AFC",
    "group": "F"
  },
  {
    "id": "ned",
    "name": "Netherlands",
    "code": "NED",
    "flag": "nl",
    "confederation": "UEFA",
    "group": "F"
  },
  {
    "id": "swe",
    "name": "Sweden",
    "code": "SWE",
    "flag": "se",
    "confederation": "UEFA",
    "group": "F"
  },
  {
    "id": "tun",
    "name": "Tunisia",
    "code": "TUN",
    "flag": "tn",
    "confederation": "CAF",
    "group": "F"
  },
  {
    "id": "bel",
    "name": "Belgium",
    "code": "BEL",
    "flag": "be",
    "confederation": "UEFA",
    "group": "G"
  },
  {
    "id": "egy",
    "name": "Egypt",
    "code": "EGY",
    "flag": "eg",
    "confederation": "CAF",
    "group": "G"
  },
  {
    "id": "irn",
    "name": "Iran",
    "code": "IRN",
    "flag": "ir",
    "confederation": "AFC",
    "group": "G"
  },
  {
    "id": "nzl",
    "name": "New Zealand",
    "code": "NZL",
    "flag": "nz",
    "confederation": "OFC",
    "group": "G"
  },
  {
    "id": "cpv",
    "name": "Cape Verde",
    "code": "CPV",
    "flag": "cv",
    "confederation": "CAF",
    "group": "H"
  },
  {
    "id": "esp",
    "name": "Spain",
    "code": "ESP",
    "flag": "es",
    "confederation": "UEFA",
    "group": "H"
  },
  {
    "id": "ksa",
    "name": "Saudi Arabia",
    "code": "KSA",
    "flag": "sa",
    "confederation": "AFC",
    "group": "H"
  },
  {
    "id": "uru",
    "name": "Uruguay",
    "code": "URU",
    "flag": "uy",
    "confederation": "CONMEBOL",
    "group": "H"
  },
  {
    "id": "fra",
    "name": "France",
    "code": "FRA",
    "flag": "fr",
    "confederation": "UEFA",
    "group": "I"
  },
  {
    "id": "irq",
    "name": "Iraq",
    "code": "IRQ",
    "flag": "iq",
    "confederation": "AFC",
    "group": "I"
  },
  {
    "id": "nor",
    "name": "Norway",
    "code": "NOR",
    "flag": "no",
    "confederation": "UEFA",
    "group": "I"
  },
  {
    "id": "sen",
    "name": "Senegal",
    "code": "SEN",
    "flag": "sn",
    "confederation": "CAF",
    "group": "I"
  },
  {
    "id": "alg",
    "name": "Algeria",
    "code": "ALG",
    "flag": "dz",
    "confederation": "CAF",
    "group": "J"
  },
  {
    "id": "arg",
    "name": "Argentina",
    "code": "ARG",
    "flag": "ar",
    "confederation": "CONMEBOL",
    "group": "J"
  },
  {
    "id": "aut",
    "name": "Austria",
    "code": "AUT",
    "flag": "at",
    "confederation": "UEFA",
    "group": "J"
  },
  {
    "id": "jor",
    "name": "Jordan",
    "code": "JOR",
    "flag": "jo",
    "confederation": "AFC",
    "group": "J"
  },
  {
    "id": "cod",
    "name": "Democratic Republic of the Congo",
    "code": "COD",
    "flag": "cd",
    "confederation": "CAF",
    "group": "K"
  },
  {
    "id": "col",
    "name": "Colombia",
    "code": "COL",
    "flag": "co",
    "confederation": "CONMEBOL",
    "group": "K"
  },
  {
    "id": "por",
    "name": "Portugal",
    "code": "POR",
    "flag": "pt",
    "confederation": "UEFA",
    "group": "K"
  },
  {
    "id": "uzb",
    "name": "Uzbekistan",
    "code": "UZB",
    "flag": "uz",
    "confederation": "AFC",
    "group": "K"
  },
  {
    "id": "cro",
    "name": "Croatia",
    "code": "CRO",
    "flag": "hr",
    "confederation": "UEFA",
    "group": "L"
  },
  {
    "id": "eng",
    "name": "England",
    "code": "ENG",
    "flag": "eng",
    "confederation": "UEFA",
    "group": "L"
  },
  {
    "id": "gha",
    "name": "Ghana",
    "code": "GHA",
    "flag": "gh",
    "confederation": "CAF",
    "group": "L"
  },
  {
    "id": "pan",
    "name": "Panama",
    "code": "PAN",
    "flag": "pa",
    "confederation": "CONCACAF",
    "group": "L"
  }
];

export const STADIUMS: Stadium[] = [
  {
    "id": "st-1",
    "name": "MetLife Stadium",
    "city": "East Rutherford (NY/NJ)",
    "country": "USA",
    "capacity": 82500,
    "matchesPlayed": []
  },
  {
    "id": "st-2",
    "name": "Estadio Azteca",
    "city": "Mexico City",
    "country": "Mexico",
    "capacity": 87523,
    "matchesPlayed": []
  },
  {
    "id": "st-3",
    "name": "BC Place",
    "city": "Vancouver",
    "country": "Canada",
    "capacity": 54500,
    "matchesPlayed": []
  },
  {
    "id": "st-4",
    "name": "SoFi Stadium",
    "city": "Inglewood (LA)",
    "country": "USA",
    "capacity": 70240,
    "matchesPlayed": []
  },
  {
    "id": "st-5",
    "name": "Mercedes-Benz Stadium",
    "city": "Atlanta",
    "country": "USA",
    "capacity": 71000,
    "matchesPlayed": []
  },
  {
    "id": "st-6",
    "name": "Hard Rock Stadium",
    "city": "Miami",
    "country": "USA",
    "capacity": 64767,
    "matchesPlayed": []
  },
  {
    "id": "st-7",
    "name": "BMO Field",
    "city": "Toronto",
    "country": "Canada",
    "capacity": 45736,
    "matchesPlayed": []
  },
  {
    "id": "st-8",
    "name": "Estadio BBVA",
    "city": "Monterrey",
    "country": "Mexico",
    "capacity": 53500,
    "matchesPlayed": []
  },
  {
    "id": "st-9",
    "name": "Estadio Akron",
    "city": "Guadalajara",
    "country": "Mexico",
    "capacity": 48071,
    "matchesPlayed": []
  },
  {
    "id": "st-10",
    "name": "Lumen Field",
    "city": "Seattle",
    "country": "USA",
    "capacity": 69000,
    "matchesPlayed": []
  },
  {
    "id": "st-11",
    "name": "Levi's Stadium",
    "city": "Santa Clara (SF)",
    "country": "USA",
    "capacity": 68500,
    "matchesPlayed": []
  },
  {
    "id": "st-12",
    "name": "Gillette Stadium",
    "city": "Foxborough (Boston)",
    "country": "USA",
    "capacity": 65878,
    "matchesPlayed": []
  },
  {
    "id": "st-13",
    "name": "Lincoln Financial Field",
    "city": "Philadelphia",
    "country": "USA",
    "capacity": 69796,
    "matchesPlayed": []
  },
  {
    "id": "st-14",
    "name": "NRG Stadium",
    "city": "Houston",
    "country": "USA",
    "capacity": 72220,
    "matchesPlayed": []
  },
  {
    "id": "st-15",
    "name": "AT&T Stadium",
    "city": "Arlington (Dallas)",
    "country": "USA",
    "capacity": 80000,
    "matchesPlayed": []
  },
  {
    "id": "st-16",
    "name": "Arrowhead Stadium",
    "city": "Kansas City",
    "country": "USA",
    "capacity": 76416,
    "matchesPlayed": []
  }
];

