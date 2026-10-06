# Images

All store images live in ImageKit (URL endpoint `https://ik.imagekit.io/ADORN`). This file is the single list of every image address and its alt text.

- **Hero slides** are used directly by the frontend, from `src/config/heroSlides.js`.
- **Product images** come from the backend's API (`ProductImage` records). They're listed here for reference only; never hardcode product images in the frontend.
- Request smaller versions by adding a width setting (for example, `?tr=w-600` for product cards, `?tr=w-1200` for product pages and hero slides; check ImageKit's docs). Never show full-size originals, since some are several megabytes.
- `public/placeholder.jpg` (a neutral cream image, kept in the frontend project) is shown if an image fails to load.

## Hero Slides

| Slide | Image URL | Alt text | Headline | Sentence | Button | Link |
|---|---|---|---|---|---|---|
| 1 | `https://ik.imagekit.io/ADORN/ADORN/Products/Hero/hero-3.jpg` | Woman in sunglasses leaning out of a vintage green car with a handbag | Everyday luxury, delivered across Ghana. | Bags, beauty, jewellery and more, chosen for how you really live. | Shop new arrivals | `/` |
| 2 | `https://ik.imagekit.io/ADORN/ADORN/Products/Hero/hero-1.jpg` | Woman in a bathrobe applying face cream in front of a mirror | Glow starts with good skin. | Creams, serums and shea butter for skin that feels as good as it looks. | Shop skincare | `/category/skincare` |
| 3 | `https://ik.imagekit.io/ADORN/ADORN/Products/Hero/hero-2.jpg` | Perfume bottle on black sequins with a flower and a gold chain | A scent to remember. | Fragrances to carry you from morning to night. | Shop perfumes | `/category/perfumes` |

Each photo **fills the whole hero banner, with the text on top** (see **Hero Slider** in the frontend plan). Slide 1's photo is tall, so request it with ImageKit's face-focused cropping (check ImageKit's docs for the exact URL setting), so the model's face stays in view. Request a wide version (for example `?tr=w-1920`) for large screens and a smaller one for phones.

## Product Images (reference)

| Category | Product | Image URL | Alt text |
|---|---|---|---|
| Bags | Black Canvas Tote Bag | `https://ik.imagekit.io/ADORN/ADORN/Products/Bags/black-tote-bag-1.jpg` | Black canvas tote bag hanging on a wooden chair |
| Bags | Striped Mini Crossbody Bag | `https://ik.imagekit.io/ADORN/ADORN/Products/Bags/striped-crossbody-bag-1.jpg` | Black and white striped mini crossbody bag with a chain strap |
| Bags | Woven Straw Bucket Bag | `https://ik.imagekit.io/ADORN/ADORN/Products/Bags/straw-bucket-bag-1.jpg` | Woven straw bucket bag with a brown leather strap |
| Bags | Red Crochet Handbag | `https://ik.imagekit.io/ADORN/ADORN/Products/Bags/red-crochet-handbag-1.jpg` | Red crochet handbag on a red background |
| Bags | Cream Top-Handle Bag | `https://ik.imagekit.io/ADORN/ADORN/Products/Bags/cream-top-handle-bag-1.jpg` | Cream structured top-handle bag |
| Bags | Orange Rattan Handbag | `https://ik.imagekit.io/ADORN/ADORN/Products/Bags/orange-rattan-handbag-1.jpg` | Orange woven rattan handbag with a top handle |
| Bags | Black Leather Mini Duffle Bag | `https://ik.imagekit.io/ADORN/ADORN/Products/Bags/black-mini-duffle-bag-1.jpg` | Black leather mini duffle bag on a lime-green background |
| Bags | Nylon Makeup Pouch Set (4 colours) | `https://ik.imagekit.io/ADORN/ADORN/Products/Bags/makeup-pouch.jpg` | Four nylon makeup pouches in black, orange, pink and teal |
| Makeup | 12-Piece Makeup Brush Set | `https://ik.imagekit.io/ADORN/ADORN/Products/Makeup/makeup-brush-set-1.jpg` | Makeup brushes fanned out on a white background |
| Makeup | Tinted Lip Balm | `https://ik.imagekit.io/ADORN/ADORN/Products/Makeup/tinted-lip-balm-1.jpg` | Small pink pot of tinted lip balm |
| Makeup | Neutral Eyeshadow Palette | `https://ik.imagekit.io/ADORN/ADORN/Products/Makeup/eyeshadow-palette-1.jpg` | Neutral eyeshadow palette with a brush |
| Makeup | Liquid Eyeliner Pen | `https://ik.imagekit.io/ADORN/ADORN/Products/Makeup/liquid-eyeliner-1.jpg` | Black liquid eyeliner pen on a pink background |
| Makeup | Pink Lip Gloss | `https://ik.imagekit.io/ADORN/ADORN/Products/Makeup/pink-lip-gloss-1.jpg` | Pink lip gloss with a swatch on a pink background |
| Makeup | Black Volumising Mascara | `https://ik.imagekit.io/ADORN/ADORN/Products/Makeup/black-volumising-mascara-1.jpg` | Black mascara tube and wand on a pink background |
| Makeup | Makeup Setting Spray | `https://ik.imagekit.io/ADORN/ADORN/Products/Makeup/makeup-setting-spray-1.jpg` | Amber makeup setting spray bottle on a wooden table |
| Makeup | Red Liquid Lipstick | `https://ik.imagekit.io/ADORN/ADORN/Products/Makeup/red-liquid-lipstick-1.jpg` | Red liquid lipstick bottle |
| Skincare | Botanical Face Oil | `https://ik.imagekit.io/ADORN/ADORN/Products/Skincare/face-oil-1.jpg` | Two amber dropper bottles of face oil on a small wooden stool |
| Skincare | Vitamin C Serum (30 ml) | `https://ik.imagekit.io/ADORN/ADORN/Products/Skincare/vitamin-c-serum-1.jpg` | Clear glass serum bottle with a dropper |
| Skincare | Gel Facial Cleanser (150 ml) | `https://ik.imagekit.io/ADORN/ADORN/Products/Skincare/gel-facial-cleanser-1.jpg` | Tube of gel facial cleanser |
| Skincare | Hydrating Face Cream (50 ml) | `https://ik.imagekit.io/ADORN/ADORN/Products/Skincare/hydrating-face-cream-1.jpg` | Open jar of white face cream on a rock |
| Skincare | Raw Shea Butter (250 g) | `https://ik.imagekit.io/ADORN/ADORN/Products/Skincare/raw-shea-butter-1.jpg` | Raw shea butter in a wooden bowl with a spatula |
| Skincare | Hydrating Essence (50 ml) | `https://ik.imagekit.io/ADORN/ADORN/Products/Skincare/hydrating-essence-1.jpg` | Tube of hydrating essence on a pink background |
| Jewellery | Silver Gemstone Bracelet | `https://ik.imagekit.io/ADORN/ADORN/Products/Jewellery/silver-gemstone-bracelet-1.jpg` | Silver chain bracelet with small pink gemstones |
| Jewellery | Gold-Plated Hoop Earrings | `https://ik.imagekit.io/ADORN/ADORN/Products/Jewellery/gold-hoop-earrings-1.jpg` | Pair of chunky gold-plated hoop earrings |
| Jewellery | Silver Heart Pendant Necklace | `https://ik.imagekit.io/ADORN/ADORN/Products/Jewellery/heart-pendant-necklace-1.jpg` | Silver necklace with a crystal heart pendant |
| Jewellery | Green Drop Charm Necklace | `https://ik.imagekit.io/ADORN/ADORN/Products/Jewellery/green-drop-necklace-1.jpg` | Silver chain necklace with small green drop charms |
| Jewellery | Amethyst Beaded Bracelet | `https://ik.imagekit.io/ADORN/ADORN/Products/Jewellery/amethyst-bracelet-1.jpg` | Purple amethyst beaded bracelet |
| Jewellery | Crystal Wreath Earrings | `https://ik.imagekit.io/ADORN/ADORN/Products/Jewellery/crystal-wreath-earrings-1.jpg` | Crystal wreath earrings on black satin |
| Jewellery | Gold Flower Pendant Necklace | `https://ik.imagekit.io/ADORN/ADORN/Products/Jewellery/flower-pendant-necklace-1.jpg` | Gold necklace with a white flower pendant |
| Jewellery | Pearl Stud Earrings | `https://ik.imagekit.io/ADORN/ADORN/Products/Jewellery/pearl-stud-earrings-1.jpg` | Gold and pearl stud earrings on a beige background |
| Accessories | Silver Pocket Mirror | `https://ik.imagekit.io/ADORN/ADORN/Products/Accessories/pocket-mirror-1.jpg` | Silver compact pocket mirror |
| Accessories | Slim Leather Wallet | `https://ik.imagekit.io/ADORN/ADORN/Products/Accessories/slim-leather-wallet-1.jpg` | Slim black leather wallet on grey wood |
| Accessories | Tortoiseshell Claw Clip | `https://ik.imagekit.io/ADORN/ADORN/Products/Accessories/claw-clip-1.jpg` | Tortoiseshell claw hair clip |
| Accessories | Classic Black Sunglasses | `https://ik.imagekit.io/ADORN/ADORN/Products/Accessories/black-sunglasses-1.jpg` | Classic black sunglasses on a peach background |
| Accessories | Pink Satin Hair Bow | `https://ik.imagekit.io/ADORN/ADORN/Products/Accessories/pink-hair-bow-1.jpg` | Pink satin hair bow on a pink background |
| Accessories | Satin Scrunchie Set | `https://ik.imagekit.io/ADORN/ADORN/Products/Accessories/satin-scrunchie-set-1.jpg` | Four satin scrunchies in pink, teal, mint and lilac |
| Accessories | Printed Silk Hair Scarf | `https://ik.imagekit.io/ADORN/ADORN/Products/Accessories/silk-hair-scarf-1.jpg` | Printed silk hair scarf |
| Perfumes | Ocean Blue Eau de Parfum (50 ml) | `https://ik.imagekit.io/ADORN/ADORN/Products/Perfumes/ocean-blue-perfume-1.jpg` | Blue perfume bottle with a black cap among teal petals |
| Perfumes | Midnight Noir Eau de Parfum (50 ml) | `https://ik.imagekit.io/ADORN/ADORN/Products/Perfumes/midnight-noir-perfume-1.jpg` | Dark perfume bottle with a gold cap |
| Perfumes | Fresh Citrus Eau de Toilette (50 ml) | `https://ik.imagekit.io/ADORN/ADORN/Products/Perfumes/citrus-eau-de-toilette-1.jpg` | Clear square perfume bottle with a black cap |
| Perfumes | Mini Perfume Gift Set | `https://ik.imagekit.io/ADORN/ADORN/Products/Perfumes/mini-perfume-set-1.jpg` | Small perfume bottles on a golden background |

Unused in ImageKit: `Accessories/printed-scarf-1.jpg` (the many-scarves photo).