(function () {
    const DEFAULT_SVG_SIZE = 600;
    const RANGE_MIN = 0;
    const RANGE_MAX = 100;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function toSvgX(x, svgSize = DEFAULT_SVG_SIZE) {
        return (x / 100) * svgSize;
    }

    function toSvgY(y, svgSize = DEFAULT_SVG_SIZE) {
        return svgSize - (y / 100) * svgSize;
    }

    function applyAxisYLabelPosition(labelY, graphCfg) {
        if (typeof graphCfg.axisYLeft === "number") {
            labelY.style.left = `${graphCfg.axisYLeft}px`;
            return;
        }
        if (typeof graphCfg.axisYLeft === "string") {
            labelY.style.left = graphCfg.axisYLeft;
            return;
        }

        const gap = Number.isFinite(graphCfg.axisYGap) ? Number(graphCfg.axisYGap) : 2;
        const apply = () => {
            const rect = labelY.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const left = -((rect.width + rect.height) / 2) - gap;
            labelY.style.left = `${left}px`;
        };

        requestAnimationFrame(apply);
        if (document.fonts?.ready && typeof document.fonts.ready.then === "function") {
            document.fonts.ready.then(() => {
                requestAnimationFrame(apply);
            }).catch(() => {});
        }
    }

    function makeEngravedDefs() {
        const defsSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        defsSvg.setAttribute("width", "0");
        defsSvg.setAttribute("height", "0");
        defsSvg.style.position = "absolute";
        defsSvg.style.pointerEvents = "none";
        defsSvg.innerHTML = `
            <defs>
                <filter id="engraved-paint" x="-10%" y="-10%" width="120%" height="120%">
                    <feFlood flood-color="#e0e0e0" result="paintColor"></feFlood>
                    <feComposite in="paintColor" in2="SourceAlpha" operator="in" result="paint"></feComposite>
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blurShadow"></feGaussianBlur>
                    <feOffset in="blurShadow" dx="2.25" dy="2.25" result="offsetShadow"></feOffset>
                    <feComposite in="SourceAlpha" in2="offsetShadow" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="shadowMask"></feComposite>
                    <feFlood flood-color="#000000" flood-opacity="0.8" result="shadowFill"></feFlood>
                    <feComposite in="shadowFill" in2="shadowMask" operator="in" result="innerShadow"></feComposite>
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1.05" result="blurHL"></feGaussianBlur>
                    <feOffset in="blurHL" dx="-1.5" dy="-1.5" result="offsetHL"></feOffset>
                    <feComposite in="SourceAlpha" in2="offsetHL" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="hlMask"></feComposite>
                    <feFlood flood-color="#ffffff" flood-opacity="0.2" result="hlFill"></feFlood>
                    <feComposite in="hlFill" in2="hlMask" operator="in" result="innerHighlight"></feComposite>
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.75" result="blurOuter"></feGaussianBlur>
                    <feOffset in="blurOuter" dx="1.5" dy="1.5" result="outerOffset"></feOffset>
                    <feComposite in="outerOffset" in2="SourceAlpha" operator="out" result="outerMask"></feComposite>
                    <feFlood flood-color="#ffffff" flood-opacity="0.3" result="outerFill"></feFlood>
                    <feComposite in="outerFill" in2="outerMask" operator="in" result="outerHighlight"></feComposite>
                    <feMerge>
                        <feMergeNode in="outerHighlight"></feMergeNode>
                        <feMergeNode in="paint"></feMergeNode>
                        <feMergeNode in="innerHighlight"></feMergeNode>
                        <feMergeNode in="innerShadow"></feMergeNode>
                    </feMerge>
                </filter>
            </defs>
        `;
        return defsSvg;
    }

    function createRangeInput(slider) {
        const input = document.createElement("input");
        input.type = "range";
        const min = String(slider.min ?? RANGE_MIN);
        const max = String(slider.max ?? RANGE_MAX);
        const value = String(slider.value ?? 50);
        const step = slider.step != null ? String(slider.step) : "any";
        input.min = min;
        input.max = max;
        input.value = value;
        input.step = step;
        input.setAttribute("min", min);
        input.setAttribute("max", max);
        input.setAttribute("value", value);
        input.setAttribute("step", step);
        if (slider.domId) {
            input.id = slider.domId;
        }
        input.dataset.sliderId = slider.id;
        return input;
    }

    function attachWheelToRange(rangeEl) {
        rangeEl.addEventListener("wheel", (event) => {
            event.preventDefault();
            const step = 5;
            const direction = Math.sign(event.deltaY);
            if (direction === 0) return;
            const min = Number(rangeEl.min);
            const max = Number(rangeEl.max);
            const next = clamp(Number(rangeEl.value) - direction * step, min, max);
            rangeEl.value = String(next);
            rangeEl.dispatchEvent(new Event("input"));
        }, { passive: false });
    }

    function parseCssColorToRgba(color) {
        if (typeof color !== "string") return null;
        const value = color.trim();
        if (!value) return null;

        if (value.startsWith("#")) {
            let hex = value.slice(1);
            if (hex.length === 3 || hex.length === 4) {
                hex = hex.split("").map((ch) => ch + ch).join("");
            }
            if (hex.length === 6 || hex.length === 8) {
                const r = Number.parseInt(hex.slice(0, 2), 16);
                const g = Number.parseInt(hex.slice(2, 4), 16);
                const b = Number.parseInt(hex.slice(4, 6), 16);
                const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
                if ([r, g, b, a].some((part) => Number.isNaN(part))) return null;
                return { r, g, b, a };
            }
            return null;
        }

        const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/i);
        if (!rgbMatch) return null;
        const parts = rgbMatch[1].split(",").map((part) => part.trim());
        if (parts.length < 3) return null;
        const r = Number.parseFloat(parts[0]);
        const g = Number.parseFloat(parts[1]);
        const b = Number.parseFloat(parts[2]);
        const a = parts.length >= 4 ? Number.parseFloat(parts[3]) : 1;
        if ([r, g, b, a].some((part) => Number.isNaN(part))) return null;
        return {
            r: clamp(Math.round(r), 0, 255),
            g: clamp(Math.round(g), 0, 255),
            b: clamp(Math.round(b), 0, 255),
            a: clamp(a, 0, 1)
        };
    }

    function darkenColor(color, factor = 0.42) {
        const rgba = parseCssColorToRgba(color);
        if (!rgba) return color;
        const scale = clamp(1 - factor, 0, 1);
        const r = Math.round(rgba.r * scale);
        const g = Math.round(rgba.g * scale);
        const b = Math.round(rgba.b * scale);
        return `rgba(${r}, ${g}, ${b}, ${rgba.a})`;
    }

    function applyPointLabelPosition(label, point) {
        const labelPosition = point.labelPosition || "top";
        label.removeAttribute("dominant-baseline");
        if (labelPosition === "left") {
            label.setAttribute("x", "-50");
            label.setAttribute("y", "0");
            label.setAttribute("text-anchor", "end");
            label.setAttribute("dominant-baseline", "middle");
            return;
        }
        if (labelPosition === "right") {
            label.setAttribute("x", "54");
            label.setAttribute("y", "0");
            label.setAttribute("text-anchor", "start");
            label.setAttribute("dominant-baseline", "middle");
            return;
        }
        if (labelPosition === "bottom") {
            label.setAttribute("x", "0");
            label.setAttribute("y", "32");
            label.setAttribute("text-anchor", "middle");
            return;
        }
        label.setAttribute("x", "0");
        label.setAttribute("y", "-21");
        label.setAttribute("text-anchor", "middle");
    }

    function createPointGroup(point) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.dataset.pointId = point.id;
        group.setAttribute("class", "indicator-group");
        if (point.groupId) {
            group.setAttribute("id", point.groupId);
        }

        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("r", "12");
        dot.setAttribute("cx", "0");
        dot.setAttribute("cy", "0");
        dot.setAttribute("class", "point-dot");
        if (point.circleId) {
            dot.setAttribute("id", point.circleId);
        }
        dot.setAttribute("fill", point.fill || "#ccffcc");
        dot.setAttribute("stroke", point.color || "#00ff00");
        dot.style.color = point.color || "#00ff00";

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("class", "point-label");
        applyPointLabelPosition(label, point);
        if (point.labelId) {
            label.setAttribute("id", point.labelId);
        }
        const labelColor = point.labelColor || point.color || "#88ff88";
        const labelStrokeColor = darkenColor(labelColor);
        label.setAttribute("fill", labelColor);
        label.style.color = labelColor;
        label.setAttribute("stroke", labelStrokeColor);
        label.style.stroke = labelStrokeColor;
        label.textContent = point.name || "";

        const pulseOrder = Number.isFinite(point.pulseOrder) ? Number(point.pulseOrder) : 0;
        const dotDelay = (pulseOrder % 4) * 0.18;
        const labelDelay = dotDelay + 0.08;
        dot.style.animationDelay = `${dotDelay}s`;
        label.style.animationDelay = `${labelDelay}s`;

        group.appendChild(dot);
        group.appendChild(label);
        return group;
    }

    function createEngine(options) {
        const root = options.root;
        const sceneConfig = options.sceneConfig;
        const timeline = options.timeline || [];
        const mode = sceneConfig.meta.mode;
        const graphCfg = sceneConfig.graph || {};
        const controlsCfg = sceneConfig.controls || {};
        const speedCfg = sceneConfig.speedPanel || {};

        const peopleCount = (sceneConfig.people || []).length;
        const state = {
            people: new Map(),
            points: new Map(),
            timelineRunning: false,
            timelineStop: false,
            initialSnapshot: null
        };

        const svgSize = Number.isFinite(graphCfg.size) ? Number(graphCfg.size) : DEFAULT_SVG_SIZE;

        root.className = `device demo-device mode-${mode}${peopleCount > 1 ? " multi-person" : ""}`;
        root.style.setProperty("--graph-size", `${svgSize}px`);
        root.style.setProperty("--label-width", `${controlsCfg.labelWidth || 230}px`);
        root.style.setProperty("--sliders-per-row", String(controlsCfg.slidersPerRow || 2));
        root.style.setProperty("--slider-gap", `${controlsCfg.sliderGap || 21}px`);
        root.style.setProperty("--slider-row-gap", `${controlsCfg.sliderRowGap || 30}px`);
        root.style.setProperty("--slider-height", `${controlsCfg.sliderHeight || 210}px`);
        root.style.setProperty("--slider-label-font-size", `${controlsCfg.sliderLabelFontSize || 30}px`);

        function renderGraphSection() {
            if (mode === "eqOnly") return null;

            const wrapper = document.createElement("div");
            wrapper.className = "monitor-wrapper";

            const labelY = document.createElement("div");
            labelY.className = "engraved-label label-y";
            labelY.textContent = graphCfg.axisYLabel || "Сила мышц";
            applyAxisYLabelPosition(labelY, graphCfg);
            wrapper.appendChild(labelY);

            const frame = document.createElement("div");
            frame.className = "screen-frame";
            const chartContainer = document.createElement("div");
            chartContainer.className = "chart-container";
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
            svg.setAttribute("preserveAspectRatio", "none");

            const gradId = graphCfg.gradientId || "cyberGradient";
            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            const gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
            gradient.setAttribute("id", gradId);
            gradient.setAttribute("cx", "100%");
            gradient.setAttribute("cy", "0%");
            gradient.setAttribute("r", "141.42%");

            const stop0 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop0.setAttribute("offset", "0%");
            stop0.setAttribute("style", `stop-color:${graphCfg.gradient?.start || "#00aa00"};stop-opacity:1`);
            const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop1.setAttribute("offset", "50%");
            stop1.setAttribute("style", `stop-color:${graphCfg.gradient?.middle || "#aaaa00"};stop-opacity:0.8`);
            const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop2.setAttribute("offset", "90%");
            stop2.setAttribute("style", `stop-color:${graphCfg.gradient?.end || "#4a004a"};stop-opacity:1`);
            gradient.append(stop0, stop1, stop2);
            defs.appendChild(gradient);
            svg.appendChild(defs);

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", "0");
            rect.setAttribute("y", "0");
            rect.setAttribute("width", String(svgSize));
            rect.setAttribute("height", String(svgSize));
            rect.setAttribute("fill", `url(#${gradId})`);
            svg.appendChild(rect);

            const watermark = document.createElementNS("http://www.w3.org/2000/svg", "text");
            watermark.setAttribute("x", String(svgSize * (40 / DEFAULT_SVG_SIZE)));
            watermark.setAttribute("y", String(svgSize * (560 / DEFAULT_SVG_SIZE)));
            watermark.setAttribute("class", "watermark-label");
            watermark.textContent = graphCfg.watermark ?? "";
            svg.appendChild(watermark);

            [0.25, 0.5, 0.75].forEach((xRatio) => {
                const x = svgSize * xRatio;
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", String(x));
                line.setAttribute("y1", "0");
                line.setAttribute("x2", String(x));
                line.setAttribute("y2", String(svgSize));
                line.setAttribute("class", "grid-line");
                svg.appendChild(line);
            });
            [0.25, 0.5, 0.75].forEach((yRatio) => {
                const y = svgSize * yRatio;
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", "0");
                line.setAttribute("y1", String(y));
                line.setAttribute("x2", String(svgSize));
                line.setAttribute("y2", String(y));
                line.setAttribute("class", "grid-line");
                svg.appendChild(line);
            });

            const arc = graphCfg.arc || {
                startX: svgSize * (75 / DEFAULT_SVG_SIZE),
                radius: svgSize * (525 / DEFAULT_SVG_SIZE),
                endY: svgSize * (525 / DEFAULT_SVG_SIZE)
            };
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M ${arc.startX},0 A ${arc.radius},${arc.radius} 0 0,0 ${svgSize},${arc.endY}`);
            path.setAttribute("fill", "none");
            path.setAttribute("class", "threshold-line");
            svg.appendChild(path);

            chartContainer.appendChild(svg);
            frame.appendChild(chartContainer);
            wrapper.appendChild(frame);

            const labelX = document.createElement("div");
            labelX.className = "engraved-label label-x";
            labelX.textContent = graphCfg.axisXLabel || "Длина ног";
            wrapper.appendChild(labelX);

            return { wrapper, svg };
        }

        function createControlsForPerson(person) {
            const block = document.createElement("div");
            block.className = "controls";
            if (peopleCount > 1 && mode === "graphEq") {
                block.classList.add("person-controls");
            }

            const showSpeedScreen = controlsCfg.showControlsScreen !== false;
            let speedScreen = null;
            if (showSpeedScreen) {
                const frame = document.createElement("div");
                frame.className = "screen-frame controls-screen";
                const digital = document.createElement("div");
                digital.className = "digital-screen";
                if (person.screenId) {
                    digital.id = person.screenId;
                }
                const speedValue = document.createElement("div");
                speedValue.className = "speed-value";
                if (person.speedDisplayId) {
                    speedValue.id = person.speedDisplayId;
                }
                speedValue.textContent = `${person.name}: ...`;
                digital.appendChild(speedValue);
                frame.appendChild(digital);
                block.appendChild(frame);
                speedScreen = { digital, speedValue };
            }

            const sliders = document.createElement("div");
            sliders.className = "controls-sliders";

            const sliderMap = new Map();
            person.sliders.forEach((slider) => {
                const channel = document.createElement("div");
                channel.className = "channel";

                const track = document.createElement("div");
                track.className = "fader-track";
                const slot = document.createElement("div");
                slot.className = "fader-slot";
                const input = createRangeInput(slider);
                attachWheelToRange(input);
                track.appendChild(slot);
                track.appendChild(input);

                const label = document.createElement("div");
                label.className = "label";
                if (slider.labelHtml) {
                    label.innerHTML = slider.labelHtml;
                } else {
                    label.textContent = slider.label;
                }

                channel.appendChild(track);
                channel.appendChild(label);
                sliders.appendChild(channel);
                sliderMap.set(slider.id, input);
            });

            block.appendChild(sliders);
            return { block, sliderMap, speedScreen };
        }

        function updatePoint(pointId, x, y) {
            const pointState = state.points.get(pointId);
            if (!pointState) return;
            const clampToRange = pointState.clampToRange !== false;
            pointState.x = clampToRange ? clamp(x, RANGE_MIN, RANGE_MAX) : Number(x);
            pointState.y = clampToRange ? clamp(y, RANGE_MIN, RANGE_MAX) : Number(y);
            const cx = toSvgX(pointState.x, svgSize);
            const cy = toSvgY(pointState.y, svgSize);
            const keepInsideTop = pointState.keepInsideTop !== false;
            const transform = `translate(${cx} ${keepInsideTop ? Math.max(cy, 30) : cy})`;
            if (pointState.lastTransform !== transform) {
                pointState.group.setAttribute("transform", transform);
                pointState.lastTransform = transform;
            }
        }

        function computeFormula2dSpeed(x, y) {
            const centerX = graphCfg.speedCenter?.x ?? 100;
            const centerY = graphCfg.speedCenter?.y ?? 100;
            const maxSpeed = speedCfg.maxSpeed ?? 11;
            const thresholdSpeed = speedCfg.thresholdSpeed ?? (100 / 13);
            const radius = graphCfg.speedRadiusEq ?? 87.5;
            const dropK = (maxSpeed - thresholdSpeed) / (radius * radius);
            const dx = centerX - x;
            const dy = centerY - y;
            return maxSpeed - dropK * ((dx * dx) + (dy * dy));
        }

        function computeWeightedSpeed(personState) {
            const order = speedCfg.order || Array.from(personState.sliderMap.keys());
            const weights = speedCfg.weights || order.map(() => 1);
            const baseSpeed = speedCfg.baseSpeed ?? 8;
            const maxSpeed = speedCfg.maxSpeed ?? 11;
            const midSliderValue = speedCfg.midSliderValue ?? 50;
            const sliderMax = speedCfg.sliderMax ?? 100;
            const invertSliderId = speedCfg.invertSliderId;

            let weightedTotal = 0;
            let weightsSum = 0;
            order.forEach((sliderId, index) => {
                const input = personState.sliderMap.get(sliderId);
                if (!input) return;
                const weight = Number(weights[index] ?? 1);
                const raw = Number(input.value);
                const effective = sliderId === invertSliderId ? (sliderMax - raw) : raw;
                weightedTotal += effective * weight;
                weightsSum += weight;
            });
            if (weightsSum <= 0) return baseSpeed;
            const weightedAverage = weightedTotal / weightsSum;
            const normalized = (weightedAverage - midSliderValue) / (sliderMax - midSliderValue);
            return baseSpeed + normalized * (maxSpeed - baseSpeed);
        }

        function getEffectiveXY(personState, rawX, rawY) {
            if (typeof speedCfg.inputTransform !== "function") {
                return { x: rawX, y: rawY };
            }
            const transformed = speedCfg.inputTransform({
                personId: personState.id,
                name: personState.name,
                x: rawX,
                y: rawY
            });
            if (!transformed || typeof transformed !== "object") {
                return { x: rawX, y: rawY };
            }
            const transformedX = Number(transformed.x);
            const transformedY = Number(transformed.y);
            return {
                x: Number.isFinite(transformedX) ? clamp(transformedX, RANGE_MIN, RANGE_MAX) : rawX,
                y: Number.isFinite(transformedY) ? clamp(transformedY, RANGE_MIN, RANGE_MAX) : rawY
            };
        }

        function updateScene() {
            state.people.forEach((personState) => {
                const rawX = Number(personState.sliderMap.get(personState.xSliderId).value);
                const rawY = Number(personState.sliderMap.get(personState.ySliderId).value);
                const { x, y } = getEffectiveXY(personState, rawX, rawY);
                updatePoint(personState.pointId, x, y);

                if (!personState.speedScreen) return;
                if (speedCfg.type === "fixed") {
                    const value = speedCfg.fixedText || `${personState.name}: 100 м за 12.0 с`;
                    const fixedText = value.replace("{name}", personState.name);
                    if (personState.lastSpeedText !== fixedText) {
                        personState.speedScreen.speedValue.textContent = fixedText;
                        personState.lastSpeedText = fixedText;
                    }
                    if (personState.lastAlert !== false) {
                        personState.speedScreen.digital.classList.remove("alert");
                        personState.lastAlert = false;
                    }
                    return;
                }

                const speed = speedCfg.type === "weighted"
                    ? computeWeightedSpeed(personState)
                    : computeFormula2dSpeed(x, y);
                const hundredM = 100 / speed;
                const thresholdSpeed = speedCfg.thresholdSpeed ?? (100 / 13);
                const prefix = speedCfg.prefix || `${personState.name}: `;
                const defaultText = `${prefix}100 м за ${hundredM.toFixed(1)} с`;
                let speedText = defaultText;
                if (typeof speedCfg.formatter === "function") {
                    const formatted = speedCfg.formatter({
                        name: personState.name,
                        x,
                        y,
                        rawX,
                        rawY,
                        speed,
                        hundredM,
                        thresholdSpeed
                    });
                    if (typeof formatted === "string" && formatted.length > 0) {
                        speedText = formatted;
                    }
                }
                if (personState.lastSpeedText !== speedText) {
                    personState.speedScreen.speedValue.textContent = speedText;
                    personState.lastSpeedText = speedText;
                }
                const isAlert = speed < thresholdSpeed;
                if (personState.lastAlert !== isAlert) {
                    personState.speedScreen.digital.classList.toggle("alert", isAlert);
                    personState.lastAlert = isAlert;
                }
            });
        }

        function build() {
            root.replaceChildren();
            root.appendChild(makeEngravedDefs());

            const graphSection = renderGraphSection();
            if (graphSection) {
                root.appendChild(graphSection.wrapper);
            }

            const panels = document.createElement("div");
            panels.className = "controls-panels";

            (sceneConfig.people || []).forEach((person) => {
                const controls = createControlsForPerson(person);
                panels.appendChild(controls.block);

                const pointId = person.pointId || person.id;
                const xSliderId = person.mapping?.xSliderId || person.sliders[0]?.id;
                const ySliderId = person.mapping?.ySliderId || person.sliders[1]?.id;
                state.people.set(person.id, {
                    id: person.id,
                    name: person.name,
                    pointId,
                    xSliderId,
                    ySliderId,
                    sliderMap: controls.sliderMap,
                    speedScreen: controls.speedScreen,
                    lastSpeedText: null,
                    lastAlert: null
                });

                controls.sliderMap.forEach((input) => {
                    input.addEventListener("input", updateScene);
                });
            });

            if ((sceneConfig.people || []).length > 0) {
                if ((mode === "eqOnly" || mode === "graphEq") && (sceneConfig.people || []).length === 1) {
                    root.appendChild(panels.firstElementChild);
                } else {
                    root.appendChild(panels);
                }
            }

            if (graphSection) {
                const svg = graphSection.svg;
                let pulseOrder = 0;
                const nextPulseOrder = () => {
                    const order = pulseOrder;
                    pulseOrder = (pulseOrder + 1) % 4;
                    return order;
                };

                (sceneConfig.points || []).forEach((point) => {
                    const group = createPointGroup({
                        ...point,
                        pulseOrder: nextPulseOrder()
                    });
                    svg.appendChild(group);
                    state.points.set(point.id, {
                        group,
                        x: point.x,
                        y: point.y,
                        lastTransform: null,
                        clampToRange: point.clampToRange !== false,
                        keepInsideTop: point.keepInsideTop !== false
                    });
                    updatePoint(point.id, point.x, point.y);
                });

                (sceneConfig.people || []).forEach((person) => {
                    const pointId = person.pointId || person.id;
                    const group = createPointGroup({
                        id: pointId,
                        name: person.name,
                        color: person.color || "#00ff00",
                        fill: person.fill || "#ccffcc",
                        labelColor: person.labelColor || "#88ff88",
                        labelPosition: person.labelPosition,
                        groupId: person.indicatorIds?.groupId,
                        circleId: person.indicatorIds?.circleId,
                        labelId: person.indicatorIds?.labelId,
                        pulseOrder: nextPulseOrder()
                    });
                    svg.appendChild(group);
                    state.points.set(pointId, {
                        group,
                        x: 50,
                        y: 50,
                        lastTransform: null,
                        clampToRange: true,
                        keepInsideTop: true
                    });
                });
            }

            updateScene();
            state.initialSnapshot = snapshotState();
        }

        function snapshotState() {
            const snapshot = { sliders: {}, points: {} };
            state.people.forEach((personState) => {
                snapshot.sliders[personState.id] = {};
                personState.sliderMap.forEach((input, sliderId) => {
                    snapshot.sliders[personState.id][sliderId] = Number(input.value);
                });
            });
            state.points.forEach((pointState, pointId) => {
                snapshot.points[pointId] = { x: pointState.x, y: pointState.y };
            });
            return snapshot;
        }

        function restoreSnapshot(snapshot) {
            if (!snapshot) return;
            Object.keys(snapshot.sliders).forEach((personId) => {
                const personState = state.people.get(personId);
                if (!personState) return;
                Object.keys(snapshot.sliders[personId]).forEach((sliderId) => {
                    const input = personState.sliderMap.get(sliderId);
                    if (input) input.value = String(snapshot.sliders[personId][sliderId]);
                });
            });
            Object.keys(snapshot.points).forEach((pointId) => {
                const p = snapshot.points[pointId];
                updatePoint(pointId, p.x, p.y);
            });
            updateScene();
        }

        function resolveMoveTarget(target) {
            const pointId = target.pointId;
            const personState = target.personId ? state.people.get(target.personId) : null;
            if (personState) {
                return {
                    kind: "person",
                    person: personState,
                    fromX: Number(personState.sliderMap.get(personState.xSliderId).value),
                    fromY: Number(personState.sliderMap.get(personState.ySliderId).value),
                    toX: target.to.x,
                    toY: target.to.y
                };
            }
            const pointState = state.points.get(pointId);
            if (pointState) {
                return {
                    kind: "point",
                    pointId,
                    fromX: pointState.x,
                    fromY: pointState.y,
                    toX: target.to.x,
                    toY: target.to.y
                };
            }
            return null;
        }

        function runMove(step) {
            const easingFn = step.easing === "linear" ? (t) => t : easeInOutQuad;
            const targets = (step.targets || [step.target]).map(resolveMoveTarget).filter(Boolean);
            const duration = Math.max(step.duration || 1, 1);
            const startTime = performance.now();

            return new Promise((resolve) => {
                function tick(now) {
                    if (state.timelineStop) return resolve();
                    const t = clamp((now - startTime) / duration, 0, 1);
                    const eased = easingFn(t);
                    targets.forEach((target) => {
                        const x = lerp(target.fromX, target.toX, eased);
                        const y = lerp(target.fromY, target.toY, eased);
                        if (target.kind === "person") {
                            target.person.sliderMap.get(target.person.xSliderId).value = String(x);
                            target.person.sliderMap.get(target.person.ySliderId).value = String(y);
                        } else {
                            updatePoint(target.pointId, x, y);
                        }
                    });
                    updateScene();
                    if (t < 1) requestAnimationFrame(tick);
                    else resolve();
                }
                requestAnimationFrame(tick);
            });
        }

        function waitMs(duration) {
            return new Promise((resolve) => {
                window.setTimeout(resolve, duration || 0);
            });
        }

        async function playTimeline() {
            if (state.timelineRunning) return;
            state.timelineRunning = true;
            state.timelineStop = false;
            for (const step of timeline) {
                if (state.timelineStop) break;
                if (step.action === "wait") {
                    await waitMs(step.duration);
                    continue;
                }
                if (step.action === "set") {
                    (step.targets || []).forEach((target) => {
                        const resolved = resolveMoveTarget({
                            personId: target.personId,
                            pointId: target.pointId,
                            to: target.to
                        });
                        if (!resolved) return;
                        if (resolved.kind === "person") {
                            resolved.person.sliderMap.get(resolved.person.xSliderId).value = String(target.to.x);
                            resolved.person.sliderMap.get(resolved.person.ySliderId).value = String(target.to.y);
                        } else {
                            updatePoint(resolved.pointId, target.to.x, target.to.y);
                        }
                    });
                    updateScene();
                    continue;
                }
                if (step.action === "move") {
                    await runMove(step);
                }
            }
            state.timelineRunning = false;
        }

        function stopTimeline() {
            state.timelineStop = true;
            state.timelineRunning = false;
        }

        function resetTimeline() {
            stopTimeline();
            restoreSnapshot(state.initialSnapshot);
        }

        build();

        return {
            playTimeline,
            stopTimeline,
            resetTimeline,
            setPoint(pointId, x, y) {
                updatePoint(pointId, x, y);
            },
            setSlider(personId, sliderId, value) {
                const personState = state.people.get(personId);
                if (!personState) return;
                const input = personState.sliderMap.get(sliderId);
                if (!input) return;
                input.value = String(value);
                updateScene();
            },
            updateScene
        };
    }

    function mount(options) {
        const container = document.getElementById(options.containerId || "app");
        if (!container) throw new Error("Container not found");
        const engine = createEngine({
            root: container,
            sceneConfig: options.sceneConfig,
            timeline: options.timeline || []
        });

        document.addEventListener("keydown", (event) => {
            if (event.code === "Space") {
                event.preventDefault();
                engine.playTimeline();
            }
            if (event.code === "KeyR") {
                event.preventDefault();
                engine.resetTimeline();
            }
        });

        if (options.autoPlayTimeline) {
            engine.playTimeline();
        }
        return engine;
    }

    window.DemoEngine = { mount };
})();
