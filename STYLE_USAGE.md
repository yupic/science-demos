# Отчёт по использованию стилей из `styles.css`

## Методика
- Список селекторов извлечён из `styles.css`.
- Для каждого селектора выполнен поиск в всех HTML-файлах (`coin_histogram_animation.html`, `coin_histogram_multi.html`, `giraffe_neck_evolution.html`, `sum_histogram_multi.html`, `sum_histogram_weighted.html`) и в `sd.js`, чтобы учесть динамически добавляемые классы.

## Все селекторы из `styles.css`

### Глобальные селекторы
- `:root`, `*`, `body`, `h1`, `p.desc`, `button`, `button:hover`, `button:active`, `select`, `input[type="number"]`, `canvas`, медиа-запрос `@media (max-width: 600px)`.

### Классы
- Структурные и общие: `container`, `controls`, `canvas-frame`, `card`, `card-title`, `footer`.
- Текст/метки: `desc`, `mut-label`, `slider-label`, `slider-value`, `value`, `value-strong`, `stats`, `note`.
- Формы/вероятности: `probability-list`, `prob-actions`, `probability-row`, `color-dot`.

## Стили, которые используются только в одном HTML-файле
- В `styles.css` больше нет селекторов, применяемых только на одной странице: все жирафовые стили перенесены внутрь `giraffe_neck_evolution.html`. Перенесённый список: `allele-card`, `allele-canvas`, `allele-legend-swatch`, `allele-info`, `allele-info-title`, `allele-info-row`, `allele-info-row:last-child`, `genome-card`, `genome-list`, `genome-letter`, `genome-letter-A/C/G/T`, `instruction-summary`, `summary-label-open`, `summary-label-closed`, `charts-layout`, `charts-column`, а также модификатор `canvas-frame.intrinsic-size`. Классы `card-title` и `note` остались в общем CSS, потому что теперь используются и на странице сумм.

## Стили, которые используются в нескольких файлах
- Базовые элементы, сетки и управление (`container`, `controls`, `canvas-frame`, `mut-label`, `slider-label`, `slider-value`, `value`, `stats`, `footer`, `desc`) используются практически во всех страницах.
- Элементы, общие для двух страниц: `probability-list`, `probability-row`, `prob-actions`, `color-dot` (используются в файлах монет и сумм); `card` (используется в `giraffe_neck_evolution.html` и `sum_histogram_weighted.html`). Эти стили остаются полезными в общем CSS.

## Уточнения по использованию
- Классы `genome-letter-A`, `genome-letter-C`, `genome-letter-G`, `genome-letter-T` используются динамически в `giraffe_neck_evolution.html`: функция `colorizeGenome(genome)` строит разметку с классами вида `genome-letter-${letter}` для каждой буквы генома. Сами определения теперь лежат в `<style>` этой страницы, потому что нигде больше эти классы не создаются.

## Сопоставление `triple-card` с `card-title`/`note`

В `sum_histogram_weighted.html` заголовок и подпояснение карточки теперь используют общие стили `card-title` и `note`, как на странице `giraffe_neck_evolution.html`. Локальные правила `.triple-card h2/p` были уникальны для этой страницы и удалены.
