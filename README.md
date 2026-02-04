# City Budget Builder

Idea created during a group chat. Throwaway project for design ideas. 

A civic budget visualization tool that transforms abstract municipal budgets into human-scale, understandable narratives. The core insight: **translating annual tax contributions into daily costs** ($3,200/year = $8.77/day) makes civic finance feel like everyday spending rather than intimidating government numbers.

## Quick Start

```bash
npm install
npm run dev
```
Test Site available at https://budget-visualizer-two.vercel.app/ 
Open [http://localhost:3000](http://localhost:3000) to explore sample jurisdictions or create your own.

## Features

### 1. Personal Contribution Calculator
Answer questions about your household to see exactly how much you contribute to your community:
- Housing status (own/rent)
- Home value
- Household income
- Work location (local or outside jurisdiction)
- Household size

### 2. Calculation Transparency
Every number has an explanation. Click the **?** icon next to any revenue source to see:
- The exact formula used
- Your specific values plugged in
- Plain-language explanation of how the tax works

### 3. Budget Simulator
Explore trade-offs by adjusting budget priorities:
- See what's fixed (union contracts, debt service, mandates) vs. discretionary
- Understand why certain cuts aren't possible
- Watch tax impact change in real-time

### 4. Custom Jurisdiction Builder
Create visualizations for your own community:
- Enter basic info (name, population, median home value)
- Add revenue sources with rates
- Add budget categories with fixed percentages
- Generate shareable infographics

---

## How Calculations Work

### Revenue Sources

#### Property Tax

**Formula:**
```
Property Tax = Home Value × Assessment Ratio × Mill Rate
```

**Example (Liberty Township):**
- Home Value: $185,000
- Assessment Ratio: 35% (varies by state)
- Mill Rate: 8.9 mills (0.0089)

```
$185,000 × 0.35 × 0.0089 = $576.28/year
```

**What this means:** Your home's *assessed value* (not market value) is $64,750. At 8.9 mills, you pay $8.90 per $1,000 of assessed value.

**Renters:** Property tax isn't calculated directly, but a portion of your rent typically covers your landlord's property tax obligation.

---

#### Income Tax

**Formula:**
```
Income Tax = Household Income × Income Tax Rate
```

**Example (City of Riverside):**
- Household Income: $68,000
- Income Tax Rate: 1.5%

```
$68,000 × 0.015 = $1,020/year
```

**What this means:** All residents pay this rate regardless of where they work. This funds general city services.

---

#### Wage Tax (Work Location Impact)

**Formula:**
```
If works locally:
  Wage Tax = Household Income × Wage Tax Rate
Else:
  Wage Tax = $0
```

**Example (City of Riverside, works locally):**
- Household Income: $68,000
- Wage Tax Rate: 0.5%

```
$68,000 × 0.005 = $340/year
```

**Example (Same person, works outside city):**
```
$68,000 × 0% = $0/year
```

**What this means:** The wage tax is an *additional* tax on top of income tax, but only applies if you work within the jurisdiction. This is why the "Do you work locally?" toggle changes your total contribution.

**Why it exists:** Wage taxes capture revenue from people who use city services (roads, safety) during work hours but may live elsewhere. For residents who also work locally, it means higher contributions.

---

#### Utility Fees

**Formula:**
```
Utility Fees = Base Monthly Rate × Household Multiplier × 12
```

**Household Multiplier:**
```
Multiplier = 0.7 + (Household Size × 0.15)
```

| Household Size | Multiplier | Monthly (at $75 base) |
|----------------|------------|----------------------|
| 1 person       | 0.85x      | $63.75               |
| 2 people       | 1.00x      | $75.00               |
| 3 people       | 1.15x      | $86.25               |
| 4 people       | 1.30x      | $97.50               |
| 5+ people      | 1.45x      | $108.75              |

**Example (4-person household):**
```
$75 × 1.30 × 12 = $1,170/year
```

**What this means:** Larger households typically use more water, generate more wastewater, and produce more trash. The multiplier is an approximation—actual utility bills are usage-based.

---

#### Sales Tax (Estimated)

**Formula:**
```
Sales Tax = Estimated Taxable Spending × Sales Tax Rate
Estimated Taxable Spending = Household Income × 30%
```

**Example:**
- Household Income: $68,000
- Estimated Spending: $20,400
- Sales Tax Rate: 1%

```
$20,400 × 0.01 = $204/year
```

**What this means:** This is an estimate. The 30% spending ratio assumes that portion of income goes to taxable retail purchases (groceries are often exempt, services aren't taxed, etc.).

---

### Service Allocation

Your total contribution is allocated across services proportionally based on the jurisdiction's budget.

**Formula:**
```
Your Service Allocation = (Service Budget ÷ Total Budget) × Your Total Contribution
```

**Example:**
- Total Budget: $42,000,000
- Police Budget: $12,600,000 (30%)
- Your Total Contribution: $3,247/year

```
Police allocation: $12,600,000 ÷ $42,000,000 × $3,247 = $974/year
Daily: $974 ÷ 365 = $2.67/day
```

---

### Budget Simulator Constraints

Each budget category has a **fixed percentage** representing non-discretionary spending:

| Category | Fixed % | Why |
|----------|---------|-----|
| Police | 85% | Union contracts, minimum staffing, equipment |
| Fire/EMS | 80% | Union contracts, apparatus maintenance, training mandates |
| Administration | 75% | Salaries, insurance, audit requirements |
| Water/Sewer | 70% | EPA mandates, infrastructure bonds |
| Public Works | 55% | Equipment leases, fuel contracts |
| Parks | 35% | Facility maintenance |

**What this means:** If Police has 85% fixed, only 15% of its budget is discretionary. The simulator prevents you from cutting below the fixed amount.

**Tax Impact Calculation:**
```
Tax Impact Per Resident = Budget Change ÷ Population
```

If you reduce the total budget by $285,000 in a city of 28,500:
```
$285,000 ÷ 28,500 = $10/resident/year savings
$10 ÷ 365 = $0.03/day savings
```

---

## Architecture

```
src/
├── app/
│   ├── page.tsx          # Main page with tab navigation
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Tailwind + custom styles
├── components/
│   ├── JurisdictionSelector.tsx  # Sample selection + builder toggle
│   ├── JurisdictionBuilder.tsx   # Custom data entry wizard
│   ├── ResidentCalculator.tsx    # Household input form
│   ├── ContributionDashboard.tsx # Results with calculations
│   ├── BudgetSimulator.tsx       # Priority adjustment tool
│   ├── InfographicGenerator.tsx  # Export functionality
│   └── ui/
│       └── Icons.tsx     # Service icon components
├── lib/
│   └── calculations.ts   # All calculation logic
├── store/
│   └── budgetStore.ts    # Zustand state management
├── types/
│   └── index.ts          # TypeScript interfaces
└── data/
    └── sampleData.ts     # Township + City examples
```

### Key Files

**[calculations.ts](src/lib/calculations.ts)** - All revenue and allocation calculations:
- `calculateResidentContribution()` - Main entry point
- `calculateContributionBreakdown()` - Per-revenue-type logic
- `allocateToServices()` - Proportional allocation
- `validateBudgetChanges()` - Constraint checking

**[budgetStore.ts](src/store/budgetStore.ts)** - State management:
- Jurisdiction, revenue sources, budget categories
- Resident profile and calculated contribution
- Budget scenario adjustments
- Persisted to localStorage

**[sampleData.ts](src/data/sampleData.ts)** - Example jurisdictions:
- Liberty Township (small, ~3,200 population)
- City of Riverside (medium, ~28,500 population)

---

## Design Principles

### 1. Human Scale Translation
- Annual → Daily costs
- Percentages → Dollar amounts
- Abstract budgets → "Less than a latte"

### 2. Bars Over Pies
Horizontal bar charts are easier to compare and work better on mobile than pie charts.

### 3. Systems Over Departments (Small Jurisdictions)
Small townships need 4-5 "thick" categories (Safety Services) rather than 8-12 departments (Police, Fire, EMS separately).

### 4. Show the Math
Every calculation is explainable. Users can click to see formulas and understand why their numbers are what they are.

### 5. Non-Defensive Tone
Explain constraints (why budgets are tight) without advocacy. Let users draw their own conclusions.

---

## Sample Data

### Liberty Township (Small)
- Population: 3,200
- Budget: $2,850,000
- Median Home: $185,000
- Revenue: Property tax (8.9 mills), Wage tax (1%), State funding, Fees

### City of Riverside (Medium)
- Population: 28,500
- Budget: $42,000,000
- Median Home: $245,000
- Revenue: Property tax (12.5 mills), Income tax (1.5%), Wage tax (0.5%), Utilities, Grants

---

## Creating Your Own Jurisdiction

1. Click "Create Your Own" on the home page
2. Enter basic information:
   - Name, type (city/township/county)
   - State, population, median home value
3. Add revenue sources:
   - Select type (property tax, income tax, etc.)
   - Enter annual amount and rate
4. Add budget categories:
   - Name, amount, icon, color
   - Set fixed percentage (what can't be cut)
5. Review and create

Your jurisdiction is saved to localStorage and persists across sessions.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **State:** Zustand with persist middleware
- **Icons:** Lucide React
- **Export:** html2canvas + jsPDF

---

## Contributing

This is a community project aimed at making civic finance accessible. Contributions welcome:

- Additional sample jurisdictions
- Improved calculation accuracy
- Better explanatory content
- Accessibility improvements
- Mobile experience enhancements

---

## License

MIT - Use this to help your community understand their budget.
