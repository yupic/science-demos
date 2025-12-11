# JavaScript functions by HTML page

## coin_histogram_animation.html
Functions defined inline:
- setRunningState
- defaultDisplayIndex
- updateSpeedLabel
- resetSimulation
- simulateOnce
- simulateMany
- formatCount
- generateSuperscript
- generateYTicks
- calculateRange
- draw
- formatProbability
- updateHoverInfo
- toggleRun
- loop
- handleMouseMove
- hideTooltip

## coin_histogram_multi.html
Functions defined inline:
- clampInt
- formatProbability
- formatHeadsTails
- createProbabilityRow
- refreshColorDots
- updateRemoveButtonState
- addDefaultRow
- binomialProbs
- generateYTicks
- calculateRange
- draw
- drawAxesOnly
- collectProbabilities
- updateHoverInfo
- handleMouseMove
- handleMouseLeave
- handleCreate

## sum_histogram_multi.html
Functions defined inline:
- clampInt
- uniformSumPmf
- generateYTicks
- calculateRange
- draw
- drawAxesOnly
- drawSigmaLines
- createSetRow
- refreshColorDots
- updateRemoveButtonState
- collectSets
- updateStatsDisplay
- updateHoverInfo
- handleMouseMove
- handleMouseLeave
- handleCreate

## sum_histogram_weighted.html
Functions defined inline:
- clampInt
- parseIntSafe
- generateSuperscript
- formatProbability
- clampValueInput
- randomInt
- generateYTicks
- drawAxesOnly
- computeDistribution
- drawHistogram
- updateStats
- getTriplesFromTable
- updateRowInfo
- updateDistribution
- createTripleRow
- randomizeRow
- randomizeAll
- ensureRowCount
- regenAllAndUpdate
- syncMinMax
- handleHover
- init

## giraffe_neck_evolution.html
Functions defined inline (invoked inside IIFE):
- randInt
- randomEffect
- shuffle
- initGenetics
- randomInitialGenome
- computeNeck
- createIndividual
- computeFitness
- recombineGenomes
- chooseParentIndex
- applyMutations
- makeNextGeneration
- computeStats
- recordStats
- drawHistogram
- drawTimeSeries
- ensureAlleleCanvasSize
- computeAlleleFrequencies
- drawAlleleFrequencies
- selectAllele
- ensureAlleleInfoElements
- showAlleleInfo
- updateSigmaFromSlider
- updateMutationFromSelect
- updateStatsUI
- colorizeGenome
- renderTopGenomes
- updateUI
- initSimulation
- stepSimulation
- startSimulation
- stopSimulation
- resizeCanvases

# Cross-file overlap and reuse opportunities
- **generateYTicks** appears in four demos (coin_histogram_animation, coin_histogram_multi, sum_histogram_multi, sum_histogram_weighted). Each version computes five evenly spaced ticks and returns ticks plus max value, making it a good candidate for a shared helper in `sd.js`.
- **clampInt** is implemented independently in coin_histogram_multi, sum_histogram_multi, and sum_histogram_weighted with identical logic (parse int with min/max/fallback). Centralizing this utility in `sd.js` would reduce duplication.
- **generateSuperscript** exists in coin_histogram_animation and sum_histogram_weighted with identical mapping logic; it could also move to `sd.js` for reuse by any demo needing compact exponential formatting.
- **drawAxesOnly** is conceptually shared between coin_histogram_multi, sum_histogram_multi, and sum_histogram_weighted. While parameter signatures vary slightly, the core axis drawing (tick generation, labels, probability formatting) is similar enough that extracting a configurable helper to `sd.js` would simplify maintenance, though minor refactoring would be needed to align arguments.

Other functions are largely domain-specific to their demos.
