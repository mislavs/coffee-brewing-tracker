# Coffee Brewing Tracker — Specification

## Features

### F1. Roaster Library

Maintain a catalog of roasters. Roasters are referenced when adding beans to the
Bean Library, so they only need to be entered once and can be reused across
multiple beans.

Users can:

- Add a new roaster.
- View and edit roaster details.
- Browse roasters and see which beans are from each roaster.

### F2. Bean Library

Maintain a catalog of all purchased coffee beans. Each bean entry references a
roaster from the Roaster Library and records origin details, processing, flavor
notes, and bag information. The remaining quantity in a bag is automatically
calculated as brews are logged (see F6).

Users can:

- Add a new bean to the library (selecting or creating a roaster in the process).
- View and edit bean details.
- See remaining quantity for each bean (auto-calculated).
- Browse and search their bean collection.

### F3. Brewing Equipment Registry

Keep a reference list of owned brewing equipment so it can be quickly selected
when logging a brew.

Equipment is split into three categories:

- **Brewers (methods)** — the primary brewing device (e.g., V60, Aeropress,
  Chemex, French Press).
- **Grinders** — the grinder used to grind the beans (e.g., Comandante C40,
  1Zpresso JX, Baratza Encore). Tracked separately because grind size settings
  are grinder-specific.
- **Accessories** — other supporting tools tied to a method (e.g., V60 02
  ceramic, Cafec Abaca filters, Fellow Stagg kettle).

Users can:

- Add, edit, and remove brewers, grinders, and accessories.
- Associate accessories with one or more brewers.

### F4. Recipe Library

Store named recipes, each associated with a specific brewing method.

Users can:

- Create a recipe linked to a brewer/method.
- Describe the recipe steps or process.
- Browse recipes filtered by method.
- Edit and remove recipes.

### F5. Brew Log

The core feature — log every brew session with all relevant parameters and a
personal evaluation.

Users can:

- Create a new brew log entry.
- Select a bean from the Bean Library.
- Select a brewer/method from the Equipment Registry.
- Select a recipe from the Recipe Library (filtered to the chosen method).
- Select a grinder from the Equipment Registry.
- Select accessories/tools used for this brew.
- Enter coffee dose, water amount, water temperature, and grind size.
- See the brew ratio auto-calculated from dose and water.
- Record total brew time.
- Rate the brew on a 5-level emoji scale.
- Write free-text tasting notes.
- Write free-text ideas/adjustments for the next brew.
- View, edit, and delete past brew log entries.
- Browse and search brew history.

### F6. Automatic Remaining Bean Quantity

When a brew is logged with a dose, that amount is subtracted from the
selected bean's bag weight to maintain a running remaining quantity.

- Remaining quantity is displayed on the bean detail view.
- Editing or deleting a brew log entry recalculates the remaining quantity.
- Optionally flag or notify the user when a bean is running low.

### F7. Repeat Brew

Start a new brew log pre-filled with all parameters from a previous brew.

- All fields are copied: bean, method, recipe, grinder, equipment, dose, water
  amount, water temperature, and grind size.
- The user adjusts whichever parameters they want to change.
- Brew time, rating, tasting notes, and adjustment ideas are left blank for the
  new session.
- Useful for iteratively dialing in a bean.

### F8. Brew Rating

Each brew can be rated on a 5-level scale represented by emoji faces:

| Level | Emoji        | Meaning                                |
| ----- | ------------ | -------------------------------------- |
| 1     | Sad face     | Bad — something went wrong             |
| 2     | Neutral face | Meh — drinkable but not enjoyable      |
| 3     | Slight smile | Decent — good but not quite there      |
| 4     | Happy face   | Great — a really enjoyable cup         |
| 5     | Wow face     | Exceptional — nailed it                |

---

## Entities

### Roaster

Represents a coffee roaster / roasting company.

| Property | Type | Description                                    | Required |
| -------- | ---- | ---------------------------------------------- | -------- |
| Name     | text | Name of the roaster                            | yes      |
| City     | text | City where the roaster is located              | no       |
| Country  | text | Country where the roaster is located           | no       |

### Flavor Note

Represents a reusable flavor/tasting descriptor (e.g., "Blueberry", "Chocolate",
"Citrus", "Caramel"). Shared across beans so they can be used for filtering and
comparison.

| Property | Type | Description                                            | Required |
| -------- | ---- | ------------------------------------------------------ | -------- |
| Name     | text | The flavor descriptor (e.g., "Blueberry", "Chocolate") | yes      |

### Bean

Represents a specific bag of coffee beans purchased by the user.

| Property              | Type           | Description                                                                    | Required |
| --------------------- | -------------- | ------------------------------------------------------------------------------ | -------- |
| Name                  | text           | Name of the coffee                                                             | yes      |
| Roaster               | Roaster        | The roaster this bean is from (reference to Roaster)                           | yes      |
| Origin Type           | enum           | `Single Origin` or `Blend`                                                     | yes      |
| Origin Countries      | list of text   | Country or countries where the beans are grown                                 | no       |
| Variety               | text           | Coffee plant variety (e.g., Bourbon, Typica, Gesha, SL28)                     | no       |
| Processing Method     | text           | How the beans were processed (e.g., Washed, Natural, Honey, Anaerobic)        | no       |
| Roast Profile         | enum           | `Filter`, `Espresso`, `Omni`, or `Unknown`                                    | yes      |
| Roast Date            | date           | Date the beans were roasted                                                    | no       |
| Altitude              | integer (masl) | Elevation at which the beans were grown                                        | no       |
| Flavor Notes          | list of Flavor Note | Tasting/flavor notes as described by the roaster (references to Flavor Note)  | no       |
| Bag Weight            | decimal (g)    | Weight of the bag as purchased                                                 | yes      |
| Price                 | decimal        | Price paid for the bag                                                         | no       |
| Price per kg          | decimal        | Auto-calculated from price and bag weight                                      | derived  |
| Remaining Quantity    | decimal (g)    | Auto-calculated: bag weight minus sum of all brew doses using this bean        | derived  |

### Brewer

Represents a brewing device/method owned by the user.

| Property | Type | Description                                         | Required |
| -------- | ---- | --------------------------------------------------- | -------- |
| Name     | text | Name of the brewer or method (e.g., "V60", "Aeropress") | yes      |

### Grinder

Represents a coffee grinder owned by the user. Tracked as its own entity because
grind size settings are grinder-specific and meaningless without this context.

| Property                  | Type                  | Description                                                              | Required |
| ------------------------- | --------------------- | ------------------------------------------------------------------------ | -------- |
| Name                      | text                  | Name of the grinder (e.g., "Comandante C40", "1Zpresso JX")             | yes      |
| Total Brews               | integer               | Number of brew log entries using this grinder                            | derived  |
| Total Coffee Ground       | decimal (g)           | Sum of coffee dose across all brews using this grinder                   | derived  |
| Most Common Grind Setting | text                  | The grind setting used most frequently with this grinder                 | derived  |
| Grind Setting Range       | text                  | The coarsest and finest grind settings used with this grinder            | derived  |
| Best Rated Grind Setting  | text                  | The grind setting that produced the highest-rated brew(s)                | derived  |

### Accessory

Represents a supporting tool or piece of equipment.

| Property           | Type             | Description                                                        | Required |
| ------------------ | ---------------- | ------------------------------------------------------------------ | -------- |
| Name               | text             | Name of the accessory (e.g., "Cafec Abaca filter", "V60 02 ceramic") | yes      |
| Compatible Brewers | list of Brewer   | Which brewers this accessory can be used with                      | no       |

### Recipe

Represents a named brewing recipe tied to a specific method.

| Property    | Type   | Description                                                  | Required |
| ----------- | ------ | ------------------------------------------------------------ | -------- |
| Name        | text   | Name of the recipe (e.g., "Hoffmann V60", "4:6 Method")     | yes      |
| Brewer      | Brewer | The brewer/method this recipe is for                         | yes      |
| Description | text   | Free-text steps, instructions, or notes about the recipe     | no       |

### Brew Log Entry

Represents a single brew session.

| Property         | Type              | Description                                                         | Required |
| ---------------- | ----------------- | ------------------------------------------------------------------- | -------- |
| Date & Time      | datetime          | When the brew took place                                            | yes      |
| Bean             | Bean              | Which bean was used (reference to Bean Library)                     | yes      |
| Recipe           | Recipe            | Which recipe was followed (reference to Recipe Library)             | no       |
| Grinder          | Grinder           | Which grinder was used (reference to Equipment Registry)            | no       |
| Coffee Dose      | decimal (g)       | Amount of coffee used                                               | yes      |
| Water Amount     | decimal (g)       | Amount of water used                                                | yes      |
| Brew Ratio       | text              | Auto-calculated ratio of coffee to water (e.g., "1:16.5")          | derived  |
| Water Temperature| decimal (°C)      | Temperature of the water                                            | no       |
| Grind Size       | text              | Free-text grind setting (e.g., "14 clicks", "medium-fine")         | no       |
| Brew Time        | duration          | Total brew time                                                     | no       |
| Rating           | enum (1–5)        | Brew rating on the 5-level emoji scale                              | no       |
| Tasting Notes    | text              | Free-text subjective flavor experience                              | no       |
| Adjustment Ideas | text              | Free-text ideas on what to change next time                         | no       |
