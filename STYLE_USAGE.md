# Отчёт по использованию стилей из `styles.css`

## Методика
- Список селекторов извлечён из `styles.css`.
- Для каждого селектора выполнен поиск в всех HTML-файлах (`coin_histogram_animation.html`, `coin_histogram_multi.html`, `giraffe_neck_evolution.html`, `sum_histogram_multi.html`, `sum_histogram_weighted.html`) и в `sd.js`, чтобы учесть динамически добавляемые классы.

## Все селекторы из `styles.css`

### Глобальные селекторы
- `:root`, `*`, `body`, `h1`, `p.desc`, `button`, `button:hover`, `button:active`, `select`, `input[type="number"]`, `canvas`, медиа-запрос `@media (max-width: 600px)`.

### Классы
- Структурные и общие: `container`, `controls`, `canvas-frame`, `intrinsic-size`, `card`, `card-title`, `charts-layout`, `charts-column`, `footer`.
- Текст/метки: `desc`, `mut-label`, `slider-label`, `slider-value`, `value`, `value-strong`, `stats`, `note`.
- Выпадающие/детали: `instruction-summary`, `summary-label-open`, `summary-label-closed`.
- Формы/вероятности: `probability-list`, `prob-actions`, `probability-row`, `color-dot`.
- ДНК/алели: `allele-card`, `allele-canvas`, `allele-legend-swatch`, `allele-info`, `allele-info-title`, `allele-info-row`, `allele-info-row:last-child`, `genome-card`, `genome-list`, `genome-letter`, `genome-letter-A`, `genome-letter-C`, `genome-letter-G`, `genome-letter-T`.

## Стили, которые используются только в одном HTML-файле
- **`giraffe_neck_evolution.html`**: `allele-card`, `allele-canvas`, `allele-legend-swatch`, `allele-info`, `allele-info-title`, `allele-info-row`, `genome-card`, `genome-list`, `genome-letter`, `instruction-summary`, `summary-label-open`, `summary-label-closed`, `charts-layout`, `charts-column`, `card-title`, `note`, а также модификатор `intrinsic-size` для обёртки `canvas-frame`.

  Эти стили можно перенести внутрь `giraffe_neck_evolution.html`, так как они не применяются в других страницах.

## Стили, которые используются в нескольких файлах
- Базовые элементы, сетки и управление (`container`, `controls`, `canvas-frame`, `mut-label`, `slider-label`, `slider-value`, `value`, `stats`, `footer`, `desc`) используются практически во всех страницах.
- Элементы, общие для двух страниц: `probability-list`, `probability-row`, `prob-actions`, `color-dot` (используются в файлах монет и сумм); `card` (используется в `giraffe_neck_evolution.html` и `sum_histogram_weighted.html`). Эти стили остаются полезными в общем CSS.

## Неиспользуемые стили
- В репозитории не найдено упоминаний `genome-letter-A`, `genome-letter-C`, `genome-letter-G`, `genome-letter-T`. Если они не планируются к применению, их можно удалить либо держать рядом с кодом, где планируется вывод по символам генома.
