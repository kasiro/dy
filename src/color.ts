/**
 * Конвертирует HEX (#rrggbb) в ближайший ANSI-256 цвет с учетом яркости и насыщенности.
 * @param hex - HEX-цвет в формате #rrggbb
 * @param useTrueColor - Если true, использует TrueColor (если терминал поддерживает)
 * @returns ANSI-цвет в формате `[38;5;Xm` (или `[38;2;r;g;bm` для TrueColor)
 */
export function termColor(hex: string, useTrueColor: boolean = false): string {
    // Проверка HEX
    if (!/^#[A-Fa-f0-9]{6}$/.test(hex)) {
        throw new Error("Некорректный HEX-формат. Используйте #rrggbb.");
    }

    // Разбираем HEX в RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Если терминал поддерживает TrueColor (24-битный цвет)
    if (useTrueColor) {
        return `\x1b[38;2;${r};${g};${b}m`; // Формат: \x1b[38;2;R;G;Bm
    }

    // Иначе конвертируем в ANSI-256
    const ansi = findClosestAnsi256(r, g, b);
    return `\x1b[38;5;${ansi}m`; // Формат: \x1b[38;5;Xm
}

/**
 * Находит ближайший ANSI-256 цвет к заданному RGB через расстояние в цветовом пространстве.
 */
function findClosestAnsi256(r: number, g: number, b: number): number {
    // ANSI-256 цвета (0-15: стандартные, 16-231: куб 6x6x6, 232-255: градиенты серого)
    let minDist = Infinity;
    let bestAnsi = 0;

    // Перебираем все 256 цветов и находим ближайший
    for (let ansi = 0; ansi < 256; ansi++) {
        const [ansiR, ansiG, ansiB] = ansiToRgb(ansi);
        const dist = colorDistance(r, g, b, ansiR, ansiG, ansiB);

        if (dist < minDist) {
            minDist = dist;
            bestAnsi = ansi;
        }
    }

    return bestAnsi;
}

/**
 * Конвертирует ANSI-код в RGB.
 */
function ansiToRgb(ansi: number): [number, number, number] {
    if (ansi < 16) {
        // Стандартные 16 цветов (0-15)
        const colors = [
            [0, 0, 0],       // 0: черный
            [128, 0, 0],     // 1: красный
            [0, 128, 0],     // 2: зеленый
            [128, 128, 0],   // 3: желтый
            [0, 0, 128],     // 4: синий
            [128, 0, 128],   // 5: пурпурный
            [0, 128, 128],   // 6: голубой
            [192, 192, 192],// 7: серый
            [128, 128, 128], // 8: яркий серый
            [255, 0, 0],     // 9: яркий красный
            [0, 255, 0],    // 10: яркий зеленый
            [255, 255, 0],  // 11: яркий желтый
            [0, 0, 255],    // 12: яркий синий
            [255, 0, 255],  // 13: яркий пурпурный
            [0, 255, 255],  // 14: яркий голубой
            [255, 255, 255] // 15: белый
        ];
        return colors[ansi] as [number, number, number];
    } else if (ansi < 232) {
        // Цветной куб 6x6x6 (16-231)
        const { floor } = Math;
        const color = ansi - 16;
        const r = floor(color / 36) * 51;
        const g = floor((color % 36) / 6) * 51;
        const b = (color % 6) * 51;
        return [r, g, b];
    } else {
        // Градиенты серого (232-255)
        const gray = 8 + (ansi - 232) * 10;
        return [gray, gray, gray];
    }
}

/**
 * Вычисляет "расстояние" между двумя цветами в пространстве RGB (упрощённая метрика).
 * Можно заменить на CIEDE2000 для большей точности.
 */
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
    // Простая евклидова метрика (можно улучшить через CIELAB)
    const { sqrt, pow } = Math;
    return sqrt(
        pow(r1 - r2, 2) +
        pow(g1 - g2, 2) +
        pow(b1 - b2, 2)
    );
}

/**
 * Конвертирует HEX (#rrggbb) в ANSI-256, используя цветовое пространство CIELAB.
 * @param hex - HEX-цвет в формате #rrggbb
 * @param useTrueColor - Если true, возвращает TrueColor (если терминал поддерживает)
 * @returns ANSI-цвет в формате `[38;5;Xm` (или `[38;2;r;g;bm` для TrueColor)
 */
export function termColorLab(hex: string, useTrueColor: boolean = false): string {
    if (!/^#[A-Fa-f0-9]{6}$/.test(hex)) {
        throw new Error("Некорректный HEX. Используйте #rrggbb.");
    }

    // HEX → RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Если поддерживается TrueColor (24-бит)
    if (useTrueColor) {
        return `\x1b[38;2;${r};${g};${b}m`;
    }

    // Иначе ищем ближайший ANSI-256 через CIELAB
    const ansi = findClosestAnsi256Lab(r, g, b);
    return `\x1b[38;5;${ansi}m`;
}

/**
 * Находит ближайший ANSI-256 цвет через расстояние в CIELAB.
 */
function findClosestAnsi256Lab(r: number, g: number, b: number): number {
    const [labR, labG, labB] = rgbToLab(r, g, b);
    let minDist = Infinity;
    let bestAnsi = 0;
    const { sqrt, pow } = Math;

    for (let ansi = 0; ansi < 256; ansi++) {
        const [ansiR, ansiG, ansiB] = ansiToRgbLab(ansi);
        const [ansiLabR, ansiLabG, ansiLabB] = rgbToLab(ansiR, ansiG, ansiB);

        // Вычисляем расстояние в CIELAB (ΔE*00 можно добавить для ещё большей точности)
        const dist = sqrt(
            pow(labR - ansiLabR, 2) +
            pow(labG - ansiLabG, 2) +
            pow(labB - ansiLabB, 2)
        );

        if (dist < minDist) {
            minDist = dist;
            bestAnsi = ansi;
        }
    }

    return bestAnsi;
}

/**
 * Конвертирует RGB в CIELAB (через XYZ).
 */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
    // Нормализация RGB → [0, 1]
    const [rN, gN, bN] = [r / 255, g / 255, b / 255];
    const { pow } = Math;

    // RGB → XYZ (D65 стандарт)
    const [x, y, z] = [
        0.4124564 * rN + 0.3575761 * gN + 0.1804375 * bN,
        0.2126729 * rN + 0.7151522 * gN + 0.0721750 * bN,
        0.0193339 * rN + 0.1191920 * gN + 0.9503041 * bN
    ];

    // XYZ → CIELAB
    const [xN, yN, zN] = [
        x / 0.95047,  // D65 white point
        y / 1.0,
        z / 1.08883
    ];

    const f = (t: number) => 
        t > 0.008856 ? pow(t, 1/3) : 7.787 * t + 16/116;

    const l = 116 * f(yN) - 16;
    const a = 500 * (f(xN) - f(yN));
    const bLab = 200 * (f(yN) - f(zN));

    return [l, a, bLab];
}

/**
 * Конвертирует ANSI-код в RGB (как в предыдущем примере).
 */
function ansiToRgbLab(ansi: number): [number, number, number] {
    const { floor } = Math;
    if (ansi < 16) {
        const colors = [
            [0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0],
            [0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192],
            [128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0],
            [0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255]
        ];
        return colors[ansi] as [number, number, number];
    } else if (ansi < 232) {
        const color = ansi - 16;
        return [
            floor(color / 36) * 51,
            floor((color % 36) / 6) * 51,
            (color % 6) * 51
        ];
    } else {
        const gray = 8 + (ansi - 232) * 10;
        return [gray, gray, gray];
    }
}
