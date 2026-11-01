# Equipment price review — 1 November 2026

Prices are observations, not checkout guarantees. Existing Amazon prices retain their original observation dates and `priceProvider: "Amazon.de"`; adding an alternative shop does not validate a price there.

| Entry       | Observed hardware price | Source and scope                                                                                                                                                                                            |
| ----------- | ----------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `solar1024` |                    €599 | [EcoFlow Germany](https://de.ecoflow.com/products/delta-3-classic-portable-power-station), standalone option, marked sold out. The €549 headline concerns a different zero-VAT microinverter bundle.        |
| `starlink`  |                    €199 | [MediaMarkt, article 2953441](https://www.mediamarkt.de/de/product/_starlink-mini-internet-kit-2953441.html), Mini kit, VAT included, free delivery listed. Subscription and activation costs are excluded. |

The replacement power station has its own `solar1024` ID so a saved ownership selection for the former RIVER 2 cannot automatically mark the replacement as owned. The image manifest points to the corresponding photograph on EcoFlow's official product page; the old RIVER 2 image entry is removed.

Starlink's [German official service page](https://starlink.com/de/roam) is included as an alternative. Its client-rendered pricing was unavailable to the text reader, so no official German subscription price is asserted. The retailer's matching Mini kit is the source of the hardware price. An active subscription is required; coverage, service terms and any activation charges must be checked separately.

The remaining unpriced entries describe household baskets or multi-item installations rather than an exact offer: food and hygiene. They retain `priceEur: null`, use `purchaseKind: "search"` and `priceKind: "category"`, and now link primarily to an eBay.de search. A search result is not a verified seller, price, model or availability claim. The solar-panel entry is never priced using a grid microinverter offer.

`alternatives` contains `{ "label": "…", "url": "https://…" }` objects. Exact existing products also have an eBay search alternative; their primary Amazon offer and observed prices remain intact. Newly priced entries expose `priceProvider` and `priceCheckedAt`; the station additionally exposes `capacityWh: 1024`, `ratedWatts: 1800` and `availability: "out-of-stock"`.

## Exact references added for formerly unpriced hardware

These prices cover one specified product, not every accessory or the entire category. All were checked on 1 November 2026. The card descriptions state what must be added separately. Generated illustrations remain category illustrations and do not depict these exact branded references.

| Entry           |   Price | Exact reference and primary source                                                                                                                                                                               |
| --------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powerbank`     |  €54.95 | [Xtorm Fuel Series 5 FS5200, Dusk White](https://www.xtorm.de/products/power-bank-35w-20-000-mah-fuel-series-5-dusk-white)                                                                                       |
| `firstaid`      |  €12.99 | [Decathlon First Aid 100, 41 pieces, 8581562](https://www.decathlon.de/p/erste-hilfe-set-100-41-teilig/324531/c354m8581562)                                                                                      |
| `warmth`        |  €89.99 | [SIMOND MT500 0°C, khaki, 8799901](https://www.decathlon.de/p/schlafsack-trekking-mt500-0-degc-polyester-khaki/346447/c405m8799901), select a size; mat separate                                                 |
| `navigation`    |  €12.99 | [GEONAUTE Explorer 500, orange, 8518776](https://www.decathlon.de/p/kompass-wandern-orientierungslauf-explorer-500-orange/303520/c50m8518776), map separate                                                      |
| `tools`         |  €27.00 | [Victorinox Spartan, translucent red, 1.3603.T](https://www.victorinox.com/de-DE/Produkte/Swiss-Army-Knife%E2%84%A2%C2%A0%C2%A0Tools/Essentials/Spartan/p/1.3603.T), protection supplies separate                |
| `documents`     |   €9.99 | [FORCLAZ Travel 500, 8871942](https://www.decathlon.de/p/umhangetasche-dokumententasche-flexible-trageoptionen-travel-500/352834/c34m8871942), waterproof liner separate                                         |
| `alarms`        |  €22.99 | [Conrad, Brennenstuhl CM A 3030, 1291480](https://www.conrad.de/de/p/brennenstuhl-cm-a-3030-kohlenmonoxid-melder-batteriebetrieben-2361270.html), calculated gross from €19.32 net × 1.19; smoke alarms separate |
| `balcony-solar` | €249.00 | [EcoFlow lightweight portable 160 W panel](https://de.ecoflow.com/products/160w-lightweight-portable-solar-panel), sold out, temporary use; no permanent mounting                                                |

The solar-panel entry now identifies a standalone portable panel rather than a complete balcony installation. Its price excludes a station and mounting equipment. The manufacturer advises against permanent installation of this folding model.
