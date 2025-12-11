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

## Уточнения по использованию
- Классы `genome-letter-A`, `genome-letter-C`, `genome-letter-G`, `genome-letter-T` используются динамически в `giraffe_neck_evolution.html`: функция `colorizeGenome(genome)` строит разметку с классами вида `genome-letter-${letter}` для каждой буквы генома. Эти стили нужны на странице жирафов и в другие страницы не подтягиваются.

## Сопоставление `triple-card` с `card-title`/`note`

В `sum_histogram_weighted.html` внутри `.triple-card` определены локальные стили для заголовка и абзаца (`.triple-card h2` и `.triple-card p`). Они очень близки по назначению к `card-title` и `note`, но есть отличия:

- `card-title` (`styles.css`): размер 15px, жирность 600, нижний отступ 6px.
- `.triple-card h2`: размер 15px, жирность берётся по умолчанию для h2 (жирный), отступ 0 0 8px.
- `note` (`styles.css`): размер 12px, цвет `var(--muted)`, верхний отступ 4px.
- `.triple-card p`: размер 13px, цвет `var(--muted)`, нижний отступ 8px, ограничение ширины 380px.

Замены возможны, но потребуют мелкой подгонки отступов и размера шрифта:

- Если заменить `.triple-card h2` на элемент с классом `card-title`, нужно либо скорректировать маргин на 8px, либо принять чуть меньший отступ (6px) и явную жирность 600 (аналогична h2).
- Если заменить `.triple-card p` на элемент с классом `note`, придётся поднять размер текста с 12px до 13px и поменять направление отступа (в `note` верхний, в текущем блоке — нижний). Альтернатива: вынести настройки `note` в общий стиль, чтобы разрешить вариант с нижним отступом и 13px.
